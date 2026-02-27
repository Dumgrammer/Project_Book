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

export function useGenerateFlashcards() {
  return useMutation<GenerateFlashcardsResponse, Error, GenerateFlashcardsRequest>({
    mutationFn: async (payload: GenerateFlashcardsRequest) => {
      const validated = generateFlashcardsRequestSchema.parse(payload);
      const { data } = await api.post("/flashcard/generate", validated);
      return generateFlashcardsResponseSchema.parse(data);
    },
  });
}
