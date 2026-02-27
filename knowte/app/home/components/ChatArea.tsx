"use client";

import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import InputBase from "@mui/material/InputBase";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import CircularProgress from "@mui/material/CircularProgress";
import AttachFileRoundedIcon from "@mui/icons-material/AttachFileRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import QuizRoundedIcon from "@mui/icons-material/QuizRounded";
import SummarizeRoundedIcon from "@mui/icons-material/SummarizeRounded";
import StyleRoundedIcon from "@mui/icons-material/StyleRounded";
import FindInPageRoundedIcon from "@mui/icons-material/FindInPageRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import StopCircleRoundedIcon from "@mui/icons-material/StopCircleRounded";
import { useCurrentUser } from "../../hooks/auth";
import { useAgentStream } from "../../hooks/agent";
import { useDocumentText, useDocumentUpload } from "../../hooks/document";
import { api } from "../../lib/api";
import { documentTextResponseSchema } from "../../schemas/documentschema";

interface Suggestion {
  label: string;
  icon: React.ReactElement;
}

const suggestions: Suggestion[] = [
  { label: "Create a quiz from my notes", icon: <QuizRoundedIcon sx={{ fontSize: 18 }} /> },
  { label: "Summarize my file contents", icon: <SummarizeRoundedIcon sx={{ fontSize: 18 }} /> },
  { label: "Generate flashcards", icon: <StyleRoundedIcon sx={{ fontSize: 18 }} /> },
  { label: "Find key topics in document", icon: <FindInPageRoundedIcon sx={{ fontSize: 18 }} /> },
  { label: "Explain concepts in document", icon: <SchoolRoundedIcon sx={{ fontSize: 18 }} /> },
  { label: "Create study outline", icon: <DescriptionRoundedIcon sx={{ fontSize: 18 }} /> },
];

const FLASHCARD_LABEL = "Generate flashcards";

function buildSuggestionPrompt(label: string): string {
  switch (label) {
    case "Create a quiz from my notes":
      return "Create a quiz from the uploaded document. Include 10 questions with an answer key at the end.";
    case "Summarize my file contents":
      return "Summarize the uploaded document. Provide: 1) short summary, 2) section-by-section summary, 3) key takeaways.";
    case "Generate flashcards":
      return "Generate 15 flashcards from the uploaded document in Q/A format. Focus on important facts and definitions.";
    case "Find key topics in document":
      return "Find the key topics in the uploaded document. For each topic, include why it matters and related subtopics.";
    case "Explain concepts in document":
      return "Explain the main concepts from the uploaded document in simple terms, with one clear example per concept.";
    case "Create study outline":
      return "Create a study outline based on the uploaded document with sections, priorities, and a suggested study order.";
    default:
      return label;
  }
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function ChatArea() {
  const { data: user } = useCurrentUser();
  const firstName = (user?.full_name ?? user?.email ?? "there").split(" ")[0];
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFilename, setUploadedFilename] = useState<string | null>(null);
  const [uiError, setUiError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const listEndRef = useRef<HTMLDivElement>(null);

  const upload = useDocumentUpload();
  const { data: docText } = useDocumentText(documentId);
  const { send, stop, reset, streamedReply, conversationId, isStreaming } = useAgentStream();
  const hasMessages = messages.length > 0;

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const handleSend = async (seed?: string) => {
    const rawText = (seed ?? input).trim();
    const text = seed ? buildSuggestionPrompt(rawText) : rawText;
    const isFlashcardAction = !!seed && rawText === FLASHCARD_LABEL;
    if (!text || isStreaming) return;
    const popup = isFlashcardAction ? window.open("/flashcard", "_blank") : null;
    if (isFlashcardAction && !popup) {
      setUiError("Please allow pop-ups to open the flashcard tab.");
      return;
    }
    if (seed && !selectedFile && !documentId) {
      if (popup) popup.close();
      setUiError("Upload a PDF first so I can use your document for this task.");
      return;
    }

    setUiError(null);
    const history = messages.map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, { role: "user", content: text }, { role: "assistant", content: "" }]);
    setInput("");

    try {
      let nextDocumentId = documentId;
      let documentContextText = docText?.text;

      // Upload/process only when user clicks Send, not when selecting the file.
      if (selectedFile && !nextDocumentId) {
        const uploadResult = await upload.mutateAsync(selectedFile);
        nextDocumentId = uploadResult.document_id;
        setDocumentId(nextDocumentId);

        const { data } = await api.get(`/document/${nextDocumentId}/text`);
        const parsed = documentTextResponseSchema.parse(data);
        documentContextText = parsed.text;
        setSelectedFile(null);
      }

      const systemPrompt = documentContextText
        ? `You are Knowte AI, a study assistant. Use this document content as context:\n\n${documentContextText.slice(0, 8000)}`
        : undefined;

      if (isFlashcardAction) {
        if (!nextDocumentId) {
          throw new Error("No uploaded document available for flashcard generation.");
        }
        const flashcardUrl =
          `/flashcard?documentId=${encodeURIComponent(nextDocumentId)}` +
          `&prompt=${encodeURIComponent(text)}&count=12`;

        if (popup) {
          popup.location.href = flashcardUrl;
        }
        setMessages((prev) => {
          if (prev.length === 0) return prev;
          const next = [...prev];
          const last = next[next.length - 1];
          if (last.role === "assistant" && !last.content) {
            next[next.length - 1] = {
              role: "assistant",
              content: "Opened flashcards in a new tab.",
            };
          }
          return next;
        });
        return;
      }

      const finalReply = await send({
        message: text,
        conversation_id: conversationId ?? undefined,
        history,
        system_prompt: systemPrompt,
      });

      setMessages((prev) => {
        if (prev.length === 0) return prev;
        const next = [...prev];
        const last = next[next.length - 1];
        if (last.role === "assistant" && !last.content) {
          next[next.length - 1] = { ...last, content: finalReply || streamedReply };
        }
        return next;
      });
    } catch (err) {
      if (popup) popup.close();
      setUiError(err instanceof Error ? err.message : "Failed to send message.");
      setMessages((prev) => {
        if (prev.length === 0) return prev;
        const next = [...prev];
        const last = next[next.length - 1];
        if (last.role === "assistant" && !last.content) {
          next[next.length - 1] = {
            role: "assistant",
            content: "I couldn't generate a response right now.",
          };
        }
        return next;
      });
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  };

  const handlePickFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUiError(null);
    reset();
    setMessages([]);
    setSelectedFile(file);
    setUploadedFilename(file.name);
    setDocumentId(null);

    event.target.value = "";
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          maxWidth: 860,
          mx: "auto",
          px: 3,
          py: 2,
          gap: 1,
        }}
      >
        {!hasMessages && (
          <>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 0.5 }}>
              <AutoAwesomeRoundedIcon sx={{ fontSize: 28, color: "primary.main" }} />
              <Typography
                sx={{
                  fontSize: 20,
                  fontWeight: 600,
                  background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #06b6d4 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Hi {firstName}
              </Typography>
            </Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: "text.primary",
                textAlign: "center",
                mb: 4,
                fontSize: { xs: 24, sm: 32 },
              }}
            >
              Where should we start?
            </Typography>
          </>
        )}

        {hasMessages && (
          <Box
            sx={{
              maxHeight: "42vh",
              overflowY: "auto",
              px: { xs: 0.5, sm: 1.5 },
              py: 1,
              "&::-webkit-scrollbar": { width: 6 },
              "&::-webkit-scrollbar-thumb": { bgcolor: "#cbd5e1", borderRadius: 3 },
            }}
          >
            {messages.map((message, index) => (
              <Box
                key={`${index}-${message.role}`}
                sx={{
                  display: "flex",
                  justifyContent: message.role === "user" ? "flex-end" : "flex-start",
                  mb: 1.25,
                }}
              >
                <Box
                  sx={{
                    maxWidth: "78%",
                    display: "flex",
                    gap: 1,
                    alignItems: "flex-start",
                    flexDirection: message.role === "assistant" ? "row" : "row-reverse",
                  }}
                >
                  {message.role === "assistant" && (
                    <Avatar sx={{ width: 28, height: 28, bgcolor: "primary.main", fontSize: 12 }}>
                      K
                    </Avatar>
                  )}
                  <Box
                    sx={{
                      px: 1.5,
                      py: 1,
                      borderRadius: 2,
                      bgcolor: message.role === "user" ? "primary.main" : "#f1f5f9",
                      color: message.role === "user" ? "#fff" : "text.primary",
                      fontSize: 14,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {message.content ||
                      (message.role === "assistant" && index === messages.length - 1 ? (
                        streamedReply || (isStreaming ? <CircularProgress size={14} /> : "")
                      ) : (
                        ""
                      ))}
                  </Box>
                </Box>
              </Box>
            ))}
            <div ref={listEndRef} />
          </Box>
        )}

        <Box
          sx={{
            width: "100%",
            bgcolor: "#f1f5f9",
            borderRadius: 3,
            border: "1px solid #e2e8f0",
            transition: "border-color 0.2s, box-shadow 0.2s",
            "&:focus-within": {
              borderColor: "primary.main",
              boxShadow: "0 0 0 3px rgba(79,70,229,0.1)",
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", px: 2, pt: 1.5, pb: 0.5 }}>
            <InputBase
              placeholder="Ask Knowte anything about your documents..."
              fullWidth
              multiline
              maxRows={4}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              sx={{
                fontSize: 15,
                color: "text.primary",
                "& textarea::placeholder": { color: "#94a3b8", opacity: 1 },
              }}
            />
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: 1.5,
              pb: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <IconButton size="small" sx={{ color: "text.secondary" }} onClick={handlePickFile} disabled={upload.isPending}>
                {upload.isPending ? <CircularProgress size={18} /> : <AttachFileRoundedIcon sx={{ fontSize: 20 }} />}
              </IconButton>
              <Typography sx={{ fontSize: 12, color: "text.disabled" }}>
                {uploadedFilename ?? "Upload a file to get started"}
              </Typography>
            </Box>
            {isStreaming ? (
              <IconButton
                size="small"
                onClick={stop}
                sx={{
                  bgcolor: "error.main",
                  color: "#fff",
                  width: 32,
                  height: 32,
                  "&:hover": { bgcolor: "error.dark" },
                }}
              >
                <StopCircleRoundedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            ) : (
              <IconButton
                size="small"
                onClick={() => void handleSend()}
                disabled={!input.trim()}
                sx={{
                  bgcolor: input.trim() ? "primary.main" : "#cbd5e1",
                  color: "#fff",
                  width: 32,
                  height: 32,
                  "&:hover": { bgcolor: "primary.dark" },
                  "&.Mui-disabled": { bgcolor: "#cbd5e1", color: "#fff" },
                }}
              >
                <SendRoundedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            )}
          </Box>
        </Box>

        {!hasMessages && (
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 1,
              mt: 2,
            }}
          >
            {suggestions.map((s) => (
              <Chip
                key={s.label}
                icon={s.icon}
                label={s.label}
                clickable
                onClick={() => void handleSend(s.label)}
                variant="outlined"
                sx={{
                  borderColor: "#e2e8f0",
                  color: "text.secondary",
                  fontWeight: 500,
                  fontSize: 13,
                  height: 36,
                  borderRadius: 6,
                  px: 0.5,
                  transition: "all 0.2s",
                  "& .MuiChip-icon": { color: "text.secondary" },
                  "&:hover": {
                    bgcolor: "primary.main",
                    borderColor: "primary.main",
                    color: "#fff",
                    "& .MuiChip-icon": { color: "#fff" },
                  },
                }}
              />
            ))}
          </Box>
        )}

        {uiError && (
          <Typography sx={{ mt: 1, fontSize: 13, color: "error.main", textAlign: "center" }}>
            {uiError}
          </Typography>
        )}
      </Box>

      <input
        ref={fileInputRef}
        hidden
        type="file"
        accept="application/pdf,.pdf"
        onChange={handleFileChange}
      />
    </Box>
  );
}
