"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "../lib/api";
import { authResponseSchema, userResponseSchema } from "../schemas/authschema";
import type {
  AuthResponse,
  LoginInput,
  RegisterInput,
  OAuthLoginInput,
  UserResponse,
} from "../models/authmodel";

function persistToken(token: AuthResponse["token"]) {
  localStorage.setItem("access_token", token.access_token);
  localStorage.setItem("token_type", token.token_type);
}

function clearToken() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("token_type");
}

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, Error, LoginInput>({
    mutationFn: async (credentials: LoginInput) => {
      const { data } = await api.post("/auth/login", credentials);
      return authResponseSchema.parse(data);
    },
    onSuccess: (data: AuthResponse) => {
      persistToken(data.token);
      queryClient.setQueryData(["auth", "me"], data.user);
      router.push("/dashboard");
    },
  });
}

export function useRegister() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, Error, RegisterInput>({
    mutationFn: async (payload: RegisterInput) => {
      const { data } = await api.post("/auth/register", payload);
      return authResponseSchema.parse(data);
    },
    onSuccess: (data: AuthResponse) => {
      persistToken(data.token);
      queryClient.setQueryData(["auth", "me"], data.user);
      router.push("/dashboard");
    },
  });
}

export function useOAuthFirebase() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, Error, OAuthLoginInput>({
    mutationFn: async (payload: OAuthLoginInput) => {
      const { data } = await api.post("/auth/oauth2/firebase", payload);
      return authResponseSchema.parse(data);
    },
    onSuccess: (data: AuthResponse) => {
      persistToken(data.token);
      queryClient.setQueryData(["auth", "me"], data.user);
      router.push("/dashboard");
    },
  });
}

export function useCurrentUser() {
  return useQuery<UserResponse>({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const { data } = await api.get("/auth/me");
      return userResponseSchema.parse(data);
    },
    enabled: typeof window !== "undefined" && !!localStorage.getItem("access_token"),
    retry: false,
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return () => {
    clearToken();
    queryClient.removeQueries({ queryKey: ["auth"] });
    router.push("/signin");
  };
}
