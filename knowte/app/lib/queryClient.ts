"use client";

import { QueryClient } from "@tanstack/react-query";

let client: QueryClient | undefined;

export function getQueryClient() {
  if (typeof window === "undefined") {
    return new QueryClient();
  }

  if (!client) {
    client = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60_000,
          retry: 1,
        },
      },
    });
  }

  return client;
}
