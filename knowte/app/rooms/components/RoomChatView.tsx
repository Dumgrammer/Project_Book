"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import AttachFileRoundedIcon from "@mui/icons-material/AttachFileRounded";
import InsertDriveFileRoundedIcon from "@mui/icons-material/InsertDriveFileRounded";
import Chip from "@mui/material/Chip";
import Link from "@mui/material/Link";
import {
  useRoomChat,
  useSendRoomChatMessage,
  useAskRoomAI,
  useUploadRoomChatFile,
  createRoomChatStream,
  parseRoomChatStreamEvent,
} from "../../hooks/rooms";
import { useCurrentUser } from "../../hooks/auth";
import type { RoomChatMessageResponse } from "../../models/roommodel";

const AVATAR_COLORS = [
  "#6366f1",
  "#06b6d4",
  "#f59e0b",
  "#8b5cf6",
  "#22c55e",
  "#ef4444",
  "#0ea5e9",
  "#d946ef",
];
const ROOM_AI_USER_ID = "knowte-ai";

function userColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function resolveDisplayName(
  userId: string,
  currentUserId?: string,
  currentUserFullName?: string | null,
  currentUserEmail?: string,
): string {
  if (userId === ROOM_AI_USER_ID) {
    return "Knowte AI";
  }
  if (currentUserId && userId === currentUserId) {
    const fullName = currentUserFullName?.trim();
    if (fullName) return fullName;
    if (currentUserEmail) return currentUserEmail.split("@")[0] || "You";
    return "You";
  }
  return "Member";
}

function initialsFromName(value: string): string {
  const parts = value
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length === 0) return "M";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

interface RoomChatViewProps {
  roomId: string;
}

export default function RoomChatView({ roomId }: RoomChatViewProps) {
  const { data: user } = useCurrentUser();
  const chatQuery = useRoomChat(roomId);
  const sendMessage = useSendRoomChatMessage();
  const askRoomAI = useAskRoomAI();
  const uploadFile = useUploadRoomChatFile();

  const [liveMessages, setLiveMessages] = useState<RoomChatMessageResponse[]>([]);
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [wsError, setWsError] = useState<string | null>(null);
  const [isWsConnected, setIsWsConnected] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const seenIds = useRef<Set<string>>(new Set());
  const reconnectTimerRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Seed seen-ids from HTTP history so WS doesn't duplicate
  useEffect(() => {
    if (chatQuery.data?.items) {
      for (const msg of chatQuery.data.items) {
        seenIds.current.add(msg.id);
      }
    }
  }, [chatQuery.data?.items]);

  // WebSocket lifecycle
  useEffect(() => {
    let isMounted = true;
    const MAX_RECONNECT_ATTEMPTS = 3;
    const RECONNECT_DELAY_MS = 1200;

    const clearReconnectTimer = () => {
      if (reconnectTimerRef.current !== null) {
        window.clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };

    const connect = () => {
      if (!isMounted) return;

      let ws: WebSocket;
      try {
        ws = createRoomChatStream(roomId);
      } catch (err) {
        const canRetry = reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS;
        if (canRetry) {
          reconnectAttemptsRef.current += 1;
          clearReconnectTimer();
          reconnectTimerRef.current = window.setTimeout(connect, RECONNECT_DELAY_MS);
          return;
        }
        setWsError(err instanceof Error ? err.message : "Failed to open chat stream.");
        setIsWsConnected(false);
        return;
      }

      wsRef.current = ws;

      ws.onopen = () => {
        if (!isMounted) return;
        setWsError(null);
        setIsWsConnected(true);
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const parsed = parseRoomChatStreamEvent(JSON.parse(event.data));
          if (parsed.type === "chat_message") {
            if (!seenIds.current.has(parsed.data.id)) {
              seenIds.current.add(parsed.data.id);
              setLiveMessages((prev) => [...prev, parsed.data]);
            }
          }
        } catch {
          // ignore malformed frames
        }
      };

      ws.onerror = () => {
        // Avoid surfacing a premature error while the socket is still negotiating.
      };

      ws.onclose = (event) => {
        if (wsRef.current === ws) {
          wsRef.current = null;
        }
        if (!isMounted) return;

        setIsWsConnected(false);

        const canRetry = reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS;
        if (canRetry) {
          reconnectAttemptsRef.current += 1;
          clearReconnectTimer();
          reconnectTimerRef.current = window.setTimeout(connect, RECONNECT_DELAY_MS);
          return;
        }

        setWsError(event.reason || "Chat stream connection error.");
      };
    };

    reconnectAttemptsRef.current = 0;
    connect();

    return () => {
      isMounted = false;
      clearReconnectTimer();
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [roomId]);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [liveMessages, chatQuery.data?.items]);

  const handleSend = useCallback(async (mode: "member" | "ai" = "member") => {
    const text = input.trim();
    const file = selectedFile;
    if (!text && !file) return;

    if (file) {
      try {
        await uploadFile.mutateAsync({ roomId, file, message: text || undefined });
        setInput("");
        setSelectedFile(null);
      } catch {
        // error surfaced via uploadFile.error
      }
      return;
    }

    if (mode === "ai") {
      try {
        await askRoomAI.mutateAsync({ roomId, payload: { message: text } });
        setInput("");
      } catch {
        // error surfaced via askRoomAI.error
      }
      return;
    }

    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ message: text }));
      setInput("");
    } else {
      try {
        await sendMessage.mutateAsync({ roomId, payload: { message: text } });
        setInput("");
      } catch {
        // error surfaced via sendMessage.error
      }
    }
  }, [askRoomAI, input, roomId, sendMessage, selectedFile, uploadFile]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const handlePickFile = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
    e.target.value = "";
  };

  // Merge HTTP-fetched history + live WS messages, deduplicated
  const historyMessages = chatQuery.data?.items ?? [];
  const historyIds = new Set(historyMessages.map((m) => m.id));
  const merged = [
    ...historyMessages,
    ...liveMessages.filter((m) => !historyIds.has(m.id)),
  ];

  const currentUserId = user?.id;
  const currentUserName = user?.full_name ?? null;
  const currentUserEmail = user?.email;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
      }}
    >
      {/* Messages area */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          px: 3,
          py: 2,
          display: "flex",
          flexDirection: "column",
          gap: 0.5,
        }}
      >
        {chatQuery.isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {chatQuery.isError && (
          <Alert severity="error" sx={{ mb: 1 }}>
            {chatQuery.error.message}
          </Alert>
        )}

        {wsError && !isWsConnected && (
          <Alert severity="warning" sx={{ mb: 1 }}>
            {wsError}
          </Alert>
        )}

        {askRoomAI.isError && (
          <Alert severity="error" sx={{ mb: 1 }}>
            {askRoomAI.error.message}
          </Alert>
        )}

        {merged.length === 0 && !chatQuery.isLoading && (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Typography sx={{ fontSize: 14, color: "text.disabled" }}>
              No messages yet. Say something!
            </Typography>
          </Box>
        )}

        {merged.map((msg) => {
          const isOwn = msg.user_id === currentUserId;
          const isAi = msg.user_id === ROOM_AI_USER_ID;
          const displayName = resolveDisplayName(
            msg.user_id,
            currentUserId,
            currentUserName,
            currentUserEmail,
          );
          return (
            <Box
              key={msg.id}
              sx={{
                display: "flex",
                flexDirection: isOwn ? "row-reverse" : "row",
                alignItems: "flex-end",
                gap: 1,
                mb: 0.5,
              }}
            >
              {!isOwn && (
                <Avatar
                  sx={{
                    width: 28,
                    height: 28,
                    fontSize: 12,
                    fontWeight: 700,
                    bgcolor: isAi ? "#0f766e" : userColor(msg.user_id),
                  }}
                >
                  {isAi ? "AI" : initialsFromName(displayName)}
                </Avatar>
              )}
              <Box
                sx={{
                  maxWidth: "70%",
                  px: 2,
                  py: 1,
                  borderRadius: isOwn ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  bgcolor: isOwn ? "#6366f1" : isAi ? "#ecfeff" : "#f1f5f9",
                  color: isOwn ? "#fff" : "text.primary",
                  border: isAi ? "1px solid #99f6e4" : "none",
                }}
              >
                {!isOwn && (
                  <Typography
                    sx={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: userColor(msg.user_id),
                      mb: 0.25,
                    }}
                  >
                    {displayName}
                  </Typography>
                )}
                <Typography sx={{ fontSize: 14, lineHeight: 1.5, wordBreak: "break-word" }}>
                  {msg.message}
                </Typography>
                {msg.file_url && (
                  <Link
                    href={`${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000"}${msg.file_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="hover"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      mt: 0.5,
                      fontSize: 13,
                      color: isOwn ? "#c7d2fe" : "primary.main",
                    }}
                  >
                    <InsertDriveFileRoundedIcon sx={{ fontSize: 16 }} />
                    {msg.file_name || "Download file"}
                  </Link>
                )}
                <Typography
                  sx={{
                    fontSize: 10,
                    opacity: 0.6,
                    mt: 0.25,
                    textAlign: isOwn ? "left" : "right",
                  }}
                >
                  {formatTime(msg.created_at)}
                </Typography>
              </Box>
            </Box>
          );
        })}
        <div ref={bottomRef} />
      </Box>

      {/* Input bar */}
      <Box
        sx={{
          px: 3,
          py: 1.5,
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        {selectedFile && (
          <Box sx={{ mb: 1 }}>
            <Chip
              icon={<InsertDriveFileRoundedIcon sx={{ fontSize: 16 }} />}
              label={selectedFile.name}
              size="small"
              onDelete={() => setSelectedFile(null)}
              sx={{ maxWidth: "100%" }}
            />
          </Box>
        )}
        <input
          ref={fileInputRef}
          type="file"
          hidden
          onChange={handleFileChange}
        />
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <TextField
          fullWidth
          placeholder="Type a message…"
          size="small"
          multiline
          maxRows={4}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 3,
              fontSize: 14,
            },
          }}
        />
        <IconButton
          onClick={() => void handleSend()}
          disabled={(!input.trim() && !selectedFile) || sendMessage.isPending || askRoomAI.isPending || uploadFile.isPending}
          sx={{
            bgcolor: "#6366f1",
            color: "#fff",
            "&:hover": { bgcolor: "#4f46e5" },
            "&.Mui-disabled": { bgcolor: "#e2e8f0", color: "#94a3b8" },
          }}
        >
          {sendMessage.isPending ? (
            <CircularProgress size={18} sx={{ color: "#fff" }} />
          ) : (
            <SendRoundedIcon sx={{ fontSize: 20 }} />
          )}
        </IconButton>
        <IconButton
          onClick={handlePickFile}
          disabled={uploadFile.isPending}
          sx={{
            color: "text.secondary",
            "&:hover": { color: "primary.main" },
          }}
        >
          <AttachFileRoundedIcon sx={{ fontSize: 20 }} />
        </IconButton>
        <IconButton
          onClick={() => void handleSend("ai")}
          disabled={!input.trim() || sendMessage.isPending || askRoomAI.isPending || uploadFile.isPending}
          sx={{
            bgcolor: "#0f766e",
            color: "#fff",
            "&:hover": { bgcolor: "#0d5f59" },
            "&.Mui-disabled": { bgcolor: "#e2e8f0", color: "#94a3b8" },
          }}
        >
          {askRoomAI.isPending ? (
            <CircularProgress size={18} sx={{ color: "#fff" }} />
          ) : (
            <SmartToyRoundedIcon sx={{ fontSize: 20 }} />
          )}
        </IconButton>
        </Box>
      </Box>
    </Box>
  );
}
