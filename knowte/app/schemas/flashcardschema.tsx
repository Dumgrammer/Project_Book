import { z } from "zod";

export const flashcardItemSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
});

export const generateFlashcardsRequestSchema = z.object({
  document_id: z.string().min(1),
  prompt: z.string().min(1).max(4096),
  count: z.number().int().min(3).max(30).optional().default(12),
});

export const generateFlashcardsResponseSchema = z.object({
  document_id: z.string(),
  prompt: z.string(),
  flashcards: z.array(flashcardItemSchema),
  model: z.string(),
});

export type FlashcardItem = z.infer<typeof flashcardItemSchema>;
export type GenerateFlashcardsRequest = z.infer<typeof generateFlashcardsRequestSchema>;
export type GenerateFlashcardsResponse = z.infer<typeof generateFlashcardsResponseSchema>;
