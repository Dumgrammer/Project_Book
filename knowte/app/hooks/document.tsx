"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import {
  documentUploadResponseSchema,
  documentQuestionResponseSchema,
  documentTextResponseSchema,
} from "../schemas/documentschema";
import type {
  DocumentUploadResponse,
  DocumentQuestionRequest,
  DocumentQuestionResponse,
  DocumentTextResponse,
} from "../models/documentmodel";

/**
 * Upload a PDF file to the backend.
 * Uses Donut to read the document.
 */
export function useDocumentUpload() {
  return useMutation<DocumentUploadResponse, Error, File>({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      // Let the browser set multipart boundary automatically.
      const { data } = await api.post("/document/upload", formData);
      return documentUploadResponseSchema.parse(data);
    },
  });
}

/**
 * Uses Donut to answer the question based on the page image.
 */
export function useDocumentAsk(documentId: string) {
  return useMutation<DocumentQuestionResponse, Error, DocumentQuestionRequest>({
    mutationFn: async (payload: DocumentQuestionRequest) => {
      const { data } = await api.post(`/document/${documentId}/ask`, payload);
      return documentQuestionResponseSchema.parse(data);
    },
  });
}

/**
 * Get the extracted plain text of the document.
 * Can be passed to phi3 agent for chat about the content.
 */
export function useDocumentText(documentId: string | null) {
  return useQuery<DocumentTextResponse>({
    queryKey: ["document", "text", documentId],
    queryFn: async () => {
      const { data } = await api.get(`/document/${documentId}/text`);
      return documentTextResponseSchema.parse(data);
    },
    enabled: !!documentId,
  });
}
