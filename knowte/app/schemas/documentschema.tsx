import { z } from "zod";

export const documentUploadResponseSchema = z.object({
  document_id: z.string(),
  filename: z.string(),
  page_count: z.number(),
});

export const documentQuestionRequestSchema = z.object({
  question: z.string().min(1).max(1024),
  page: z.number().min(1).optional().default(1),
});

export const documentQuestionResponseSchema = z.object({
  document_id: z.string(),
  question: z.string(),
  answer: z.string(),
  confidence: z.number(),
  model: z.string(),
});

export const documentTextResponseSchema = z.object({
  document_id: z.string(),
  text: z.string(),
});

export type DocumentUploadResponse = z.infer<typeof documentUploadResponseSchema>;
export type DocumentQuestionRequest = z.infer<typeof documentQuestionRequestSchema>;
export type DocumentQuestionResponse = z.infer<typeof documentQuestionResponseSchema>;
export type DocumentTextResponse = z.infer<typeof documentTextResponseSchema>;
