"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "../lib/api";
import { authResponseSchema, userResponseSchema } from "../schemas/authschema";
import { getCookie, setCookie, removeCookie } from "../lib/cookies";
import type {
  AuthResponse,
  LoginInput,
  RegisterInput,
  OAuthLoginInput,
  UserResponse,
} from "../models/authmodel";

function persistToken(token: AuthResponse["token"]) {
  setCookie("access_token", token.access_token, token.expires_in);
  setCookie("token_type", token.token_type, token.expires_in);
}

function clearToken() {
  removeCookie("access_token");
  removeCookie("token_type");
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
      router.push("/home");
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
      router.push("/home");
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
      router.push("/home");
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
    enabled: typeof window !== "undefined" && !!getCookie("access_token"),
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
