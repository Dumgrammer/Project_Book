import { z } from "zod";

// One generated quiz question item.
export const quizQuestionSchema = z.object({
  question: z.string().min(1).max(300),
  options: z.array(z.string().min(1).max(200)).length(4),
  answer: z.string().min(1).max(200),
  explanation: z.string().max(400).nullable().optional(),
});

// Payload sent to backend when requesting quiz generation.
export const generateQuizRequestSchema = z.object({
  document_id: z.string().min(1),
  prompt: z.string().min(1).max(4096),
  count: z.number().int().min(3).max(20).optional().default(10),
});

// Normalized response returned by /quiz/generate.
export const generateQuizResponseSchema = z.object({
  document_id: z.string(),
  prompt: z.string(),
  questions: z.array(quizQuestionSchema),
  model: z.string(),
});

export type QuizQuestion = z.infer<typeof quizQuestionSchema>;
export type GenerateQuizRequest = z.infer<typeof generateQuizRequestSchema>;
export type GenerateQuizResponse = z.infer<typeof generateQuizResponseSchema>;
