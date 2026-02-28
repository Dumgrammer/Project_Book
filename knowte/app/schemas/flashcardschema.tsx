import { z } from "zod";

// One Q/A card in a generated flashcard deck.
export const flashcardItemSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
});

// Payload sent to backend when requesting flashcard generation.
export const generateFlashcardsRequestSchema = z.object({
  document_id: z.string().min(1),
  prompt: z.string().min(1).max(4096),
  count: z.number().int().min(3).max(30).optional().default(12),
});

// Normalized response returned by /flashcard/generate.
export const generateFlashcardsResponseSchema = z.object({
  document_id: z.string(),
  prompt: z.string(),
  flashcards: z.array(flashcardItemSchema),
  model: z.string(),
});

export type FlashcardItem = z.infer<typeof flashcardItemSchema>;
export type GenerateFlashcardsRequest = z.infer<typeof generateFlashcardsRequestSchema>;
export type GenerateFlashcardsResponse = z.infer<typeof generateFlashcardsResponseSchema>;
