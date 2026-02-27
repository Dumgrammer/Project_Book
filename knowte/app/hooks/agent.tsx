"use client";

import { useCallback, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "../lib/api";
import { getCookie } from "../lib/cookies";
import { chatResponseSchema, streamChunkSchema } from "../schemas/agentschema";
import type { ChatRequest, ChatResponse, MessageItem } from "../models/agentmodel";

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
