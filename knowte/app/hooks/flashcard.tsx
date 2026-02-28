"use client";

import { useMutation } from "@tanstack/react-query";
import { api } from "../lib/api";
import {
  generateFlashcardsRequestSchema,
  generateFlashcardsResponseSchema,
} from "../schemas/flashcardschema";
import type {
  GenerateFlashcardsRequest,
  GenerateFlashcardsResponse,
} from "../models/flashcardmodel";

/**
 * Generate flashcards from an uploaded document.
 *
 * Backend endpoint:
 * - POST /api/v1/flashcard/generate
 *
 * Expected flow:
 * 1) Upload a PDF first (document_id required)
 * 2) Call this hook with { document_id, prompt, count }
 */
export function useGenerateFlashcards() {
  return useMutation<GenerateFlashcardsResponse, Error, GenerateFlashcardsRequest>({
    mutationFn: async (payload: GenerateFlashcardsRequest) => {
      // Validate request shape client-side before API call.
      const validated = generateFlashcardsRequestSchema.parse(payload);
      const { data } = await api.post("/flashcard/generate", validated);
      // Validate response shape to keep UI type-safe and predictable.
      return generateFlashcardsResponseSchema.parse(data);
    },
  });
}
