"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useMutation, useQueries, useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { getCookie } from "../lib/cookies";
import {
  chatResponseSchema,
  conversationMessagesResponseSchema,
  conversationHistoryResponseSchema,
  streamChunkSchema,
} from "../schemas/agentschema";
import type {
  ChatRequest,
  ChatResponse,
  ConversationMessagesResponse,
  ConversationHistoryResponse,
  MessageItem,
} from "../models/agentmodel";

/**
 * Send a message to phi3 and get the full reply.
 */
export function useAgentChat() {
  return useMutation<ChatResponse, Error, ChatRequest>({
    mutationFn: async (payload: ChatRequest) => {
      const { data } = await api.post("/agent/chat", payload);
      return chatResponseSchema.parse(data);
    },
  });
}

export function useAgentConversations(userId: string | null | undefined) {
  return useQuery<ConversationHistoryResponse>({
    queryKey: ["agent", "conversations", userId],
    queryFn: async () => {
      const { data } = await api.get(`/agent/conversations/${userId}`);
      return conversationHistoryResponseSchema.parse(data);
    },
    enabled: !!userId,
    retry: false,
  });
}

export interface SidebarChatEntry {
  id: string;
  title: string;
  updatedAt: string;
}

export interface SidebarHistoryGroup {
  label: string;
  chats: SidebarChatEntry[];
}

function toDate(value: string): Date | null {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function makeChatTitle(conversationId: string, firstContent?: string | null): string {
  const candidate = (firstContent ?? "").trim();
  if (candidate.length > 0) return candidate;
  return `Conversation ${conversationId.slice(0, 8)}`;
}

function groupConversations(items: ConversationHistoryResponse["conversations"]): SidebarHistoryGroup[] {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(todayStart.getDate() - 1);
  const weekStart = new Date(todayStart);
  weekStart.setDate(todayStart.getDate() - 7);

  const groups: Record<string, SidebarChatEntry[]> = {
    Today: [],
    Yesterday: [],
    "Previous 7 Days": [],
    Older: [],
  };

  for (const item of items) {
    const updated = toDate(item.updated_at) ?? toDate(item.created_at) ?? new Date(0);
    const entry: SidebarChatEntry = {
      id: item.conversation_id,
      title: makeChatTitle(item.conversation_id, item.first_content),
      updatedAt: updated.toISOString(),
    };

    if (updated >= todayStart) {
      groups.Today.push(entry);
    } else if (updated >= yesterdayStart) {
      groups.Yesterday.push(entry);
    } else if (updated >= weekStart) {
      groups["Previous 7 Days"].push(entry);
    } else {
      groups.Older.push(entry);
    }
  }

  return Object.entries(groups)
    .filter(([, chats]) => chats.length > 0)
    .map(([label, chats]) => ({ label, chats }));
}

export function useAgentSidebarHistory(userId: string | null | undefined) {
  const { data: conversationData, isLoading } = useAgentConversations(userId);
  const conversations = useMemo(
    () => conversationData?.conversations ?? [],
    [conversationData]
  );

  const fallbackTitleQueries = useQueries({
    queries: conversations.map((item) => ({
      queryKey: ["agent", "conversation-title-fallback", userId, item.conversation_id],
      queryFn: async () => {
        const { data } = await api.get(`/agent/conversations/${userId}/${item.conversation_id}`);
        const parsed = conversationMessagesResponseSchema.parse(data);
        const first = parsed.messages.find((m) => m.role === "user" || m.role === "assistant");
        return first?.content?.trim() || null;
      },
      enabled: !!userId && !(item.first_content ?? "").trim(),
      staleTime: 60_000,
      retry: false,
    })),
  });

  const historyGroups = useMemo(() => {
    const fallbackTitleByConversationId = new Map<string, string | null>();
    conversations.forEach((item, index) => {
      fallbackTitleByConversationId.set(item.conversation_id, fallbackTitleQueries[index]?.data ?? null);
    });

    return groupConversations(
      conversations.map((item) => ({
        ...item,
        first_content:
          (item.first_content ?? "").trim() || fallbackTitleByConversationId.get(item.conversation_id) || null,
      }))
    );
  }, [conversations, fallbackTitleQueries]);

  return { historyGroups, isLoading };
}

export function useAgentConversationMessages(
  userId: string | null | undefined,
  conversationId: string | null | undefined
) {
  return useQuery<ConversationMessagesResponse>({
    queryKey: ["agent", "conversation-messages", userId, conversationId],
    queryFn: async () => {
      const { data } = await api.get(`/agent/conversations/${userId}/${conversationId}`);
      return conversationMessagesResponseSchema.parse(data);
    },
    enabled: !!userId && !!conversationId,
    retry: false,
  });
}

/**
 * Stream the reply from phi3 — real-time, piece by piece.
 * Good for chat UI that displays the AI's reply as it types.
 */
export function useAgentStream() {
  const [streamedReply, setStreamedReply] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(async (payload: ChatRequest): Promise<string> => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStreamedReply("");
    setIsStreaming(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api/v1";
      const token = getCookie("access_token");
      const response = await fetch(`${baseUrl}/agent/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`Stream failed: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      let finalReply = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (!json) continue;

          try {
            const chunk = streamChunkSchema.parse(JSON.parse(json));
            setConversationId(chunk.conversation_id);
            setStreamedReply((prev) => prev + chunk.delta);
            finalReply += chunk.delta;

            if (chunk.done) {
              setIsStreaming(false);
              return finalReply;
            }
          } catch {
            // skip malformed chunks
          }
        }
      }
      return finalReply;
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return "";
      throw err;
    } finally {
      setIsStreaming(false);
    }
  }, []);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
    setStreamedReply("");
    setConversationId(null);
  }, []);

  return { send, stop, reset, streamedReply, conversationId, isStreaming };
}

/**
 * Helper to build the history array from chat messages.
 * Can be used to convert the local chat state → ChatRequest.history
 */
export function buildHistory(
  messages: { role: "user" | "assistant"; content: string }[]
): MessageItem[] {
  return messages.map((m) => ({ role: m.role, content: m.content }));
}
