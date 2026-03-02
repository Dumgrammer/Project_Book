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
import {
  useRoomChat,
  useSendRoomChatMessage,
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

interface RoomChatViewProps {
  roomId: string;
}

export default function RoomChatView({ roomId }: RoomChatViewProps) {
  const { data: user } = useCurrentUser();
  const chatQuery = useRoomChat(roomId);
  const sendMessage = useSendRoomChatMessage();

  const [liveMessages, setLiveMessages] = useState<RoomChatMessageResponse[]>([]);
  const [input, setInput] = useState("");
  const [wsError, setWsError] = useState<string | null>(null);
  const [isWsConnected, setIsWsConnected] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const seenIds = useRef<Set<string>>(new Set());
  const reconnectTimerRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);

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
    setIsWsConnected(false);
    setWsError(null);
    connect();

    return () => {
      isMounted = false;
      clearReconnectTimer();
      wsRef.current?.close();
      wsRef.current = null;
      setIsWsConnected(false);
    };
  }, [roomId]);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [liveMessages, chatQuery.data?.items]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text) return;

    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      // Prefer WebSocket for real-time delivery
      ws.send(JSON.stringify({ message: text }));
      setInput("");
    } else {
      // Fallback to HTTP
      try {
        await sendMessage.mutateAsync({ roomId, payload: { message: text } });
        setInput("");
      } catch {
        // error surfaced via sendMessage.error
      }
    }
  }, [input, roomId, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  // Merge HTTP-fetched history + live WS messages, deduplicated
  const historyMessages = chatQuery.data?.items ?? [];
  const historyIds = new Set(historyMessages.map((m) => m.id));
  const merged = [
    ...historyMessages,
    ...liveMessages.filter((m) => !historyIds.has(m.id)),
  ];

  const currentUserId = user?.id;

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

        {merged.length === 0 && !chatQuery.isLoading && (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Typography sx={{ fontSize: 14, color: "text.disabled" }}>
              No messages yet. Say something!
            </Typography>
          </Box>
        )}

        {merged.map((msg) => {
          const isOwn = msg.user_id === currentUserId;
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
                    bgcolor: userColor(msg.user_id),
                  }}
                >
                  {msg.user_id.slice(0, 2).toUpperCase()}
                </Avatar>
              )}
              <Box
                sx={{
                  maxWidth: "70%",
                  px: 2,
                  py: 1,
                  borderRadius: isOwn ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  bgcolor: isOwn ? "#6366f1" : "#f1f5f9",
                  color: isOwn ? "#fff" : "text.primary",
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
                    {msg.user_id.slice(0, 8)}
                  </Typography>
                )}
                <Typography sx={{ fontSize: 14, lineHeight: 1.5, wordBreak: "break-word" }}>
                  {msg.message}
                </Typography>
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
          display: "flex",
          alignItems: "center",
          gap: 1,
          bgcolor: "background.paper",
        }}
      >
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
          disabled={!input.trim() || sendMessage.isPending}
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
      </Box>
    </Box>
  );
}
