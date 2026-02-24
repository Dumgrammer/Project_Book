import { z } from "zod";

export const messageItemSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1),
});

export const chatRequestSchema = z.object({
  message: z.string().min(1).max(4096),
  conversation_id: z.string().nullable().optional(),
  history: z.array(messageItemSchema).optional().default([]),
  system_prompt: z.string().nullable().optional(),
});

export const chatResponseSchema = z.object({
  conversation_id: z.string(),
  reply: z.string(),
  model: z.string(),
});

export const streamChunkSchema = z.object({
  conversation_id: z.string(),
  delta: z.string(),
  done: z.boolean(),
});

export type MessageItem = z.infer<typeof messageItemSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type ChatResponse = z.infer<typeof chatResponseSchema>;
export type StreamChunk = z.infer<typeof streamChunkSchema>;
