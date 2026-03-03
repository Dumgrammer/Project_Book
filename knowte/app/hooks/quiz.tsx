"use client";

import { useMutation } from "@tanstack/react-query";
import { api } from "../lib/api";
import {
  generateQuizRequestSchema,
  generateQuizResponseSchema,
} from "../schemas/quizschema";
import type {
  GenerateQuizRequest,
  GenerateQuizResponse,
} from "../models/quizmodel";

/**
 * Generate multiple-choice quiz questions from an uploaded document.
 *
 * Backend endpoint:
 * - POST /api/v1/quiz/generate
 *
 * Expected flow:
 * 1) Upload a PDF first (document_id required)
 * 2) Call this hook with { document_id, prompt, count }
 */
export function useGenerateQuiz() {
  return useMutation<GenerateQuizResponse, Error, GenerateQuizRequest>({
    mutationFn: async (payload: GenerateQuizRequest) => {
      const validated = generateQuizRequestSchema.parse(payload);
      const { data } = await api.post("/quiz/generate", validated);
      return generateQuizResponseSchema.parse(data);
    },
  });
}
