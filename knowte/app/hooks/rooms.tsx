"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { getCookie } from "../lib/cookies";
import {
  createRoomRequestSchema,
  deleteRoomResponseSchema,
  joinRoomResponseSchema,
  roomFetchResponseSchema,
  roomChatListResponseSchema,
  roomChatMessageResponseSchema,
  roomAiChatResponseSchema,
  roomChatStreamEventSchema,
  roomListResponseSchema,
  roomResponseSchema,
  sendRoomChatMessageRequestSchema,
  updateRoomRequestSchema,
} from "../schemas/roomschema";
import type {
  CreateRoomRequest,
  DeleteRoomResponse,
  JoinRoomResponse,
  RoomFetchResponse,
  RoomChatListResponse,
  RoomChatMessageResponse,
  RoomAiChatResponse,
  RoomChatStreamEvent,
  RoomListResponse,
  RoomResponse,
  SendRoomChatMessageRequest,
  UpdateRoomRequest,
} from "../models/roommodel";

type ListRoomsParams = {
  limit?: number;
  cursor?: string;
  owner_id?: string;
};

type ListRoomChatParams = {
  limit?: number;
};

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value.trim()
  );
}

function buildRoomChatStreamUrl(roomId: string, token: string): string {
  const baseUrl = String(api.defaults.baseURL ?? "http://127.0.0.1:8000/api/v1").replace(/\/$/, "");
  const wsBase = baseUrl.replace(/^http/, "ws");
  return `${wsBase}/rooms/${roomId}/chat/stream?token=${encodeURIComponent(token)}`;
}

export function useRooms(params?: ListRoomsParams) {
  return useQuery<RoomListResponse>({
    queryKey: ["rooms", params],
    queryFn: async () => {
      const { data } = await api.get("/rooms", { params });
      return roomListResponseSchema.parse(data);
    },
  });
}

export function useRoom(roomId: string | null) {
  return useQuery<RoomFetchResponse>({
    queryKey: ["rooms", roomId],
    queryFn: async () => {
      const { data } = await api.get(`/rooms/${roomId}`);
      return roomFetchResponseSchema.parse(data);
    },
    enabled: !!roomId,
  });
}

export function useCreateRoom() {
  const queryClient = useQueryClient();

  return useMutation<RoomResponse, Error, CreateRoomRequest>({
    mutationFn: async (payload: CreateRoomRequest) => {
      const validated = createRoomRequestSchema.parse(payload);
      const { data } = await api.post("/rooms", validated);
      return roomResponseSchema.parse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });
}

export function useUpdateRoom() {
  const queryClient = useQueryClient();

  return useMutation<
    RoomResponse,
    Error,
    { roomId: string; payload: UpdateRoomRequest }
  >({
    mutationFn: async ({ roomId, payload }) => {
      const validated = updateRoomRequestSchema.parse(payload);
      const { data } = await api.patch(`/rooms/${roomId}`, validated);
      return roomResponseSchema.parse(data);
    },
    onSuccess: (updatedRoom: RoomResponse) => {
      queryClient.setQueryData(["rooms", updatedRoom.id], updatedRoom);
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });
}

export function useDeleteRoom() {
  const queryClient = useQueryClient();

  return useMutation<DeleteRoomResponse, Error, string>({
    mutationFn: async (roomId: string) => {
      const { data } = await api.delete(`/rooms/${roomId}`);
      return deleteRoomResponseSchema.parse(data);
    },
    onSuccess: (_response: DeleteRoomResponse, roomId: string) => {
      queryClient.removeQueries({ queryKey: ["rooms", roomId] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });
}

export function useJoinRoom() {
  const queryClient = useQueryClient();

  return useMutation<JoinRoomResponse, Error, string>({
    mutationFn: async (roomIdOrCode: string) => {
      const candidate = roomIdOrCode.trim();
      const { data } = isUuid(candidate)
        ? await api.post(`/rooms/${candidate}/join`)
        : await api.post("/rooms/join", { r_code: candidate });
      return joinRoomResponseSchema.parse(data);
    },
    onSuccess: (response: JoinRoomResponse) => {
      if (response.status === "joined" || response.status === "already_member") {
        queryClient.invalidateQueries({ queryKey: ["rooms", response.room_id, "chat"] });
      }
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });
}

export function useApproveJoinRequest() {
  const queryClient = useQueryClient();

  return useMutation<
    JoinRoomResponse,
    Error,
    { roomId: string; targetUserId: string }
  >({
    mutationFn: async ({ roomId, targetUserId }) => {
      const { data } = await api.post(`/rooms/${roomId}/join-requests/${targetUserId}/approve`);
      return joinRoomResponseSchema.parse(data);
    },
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: ["rooms", variables.roomId] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });
}

export function useRoomChat(roomId: string | null, params?: ListRoomChatParams) {
  return useQuery<RoomChatListResponse>({
    queryKey: ["rooms", roomId, "chat", params],
    queryFn: async () => {
      const { data } = await api.get(`/rooms/${roomId}/chat`, { params });
      return roomChatListResponseSchema.parse(data);
    },
    enabled: !!roomId,
  });
}

export function useSendRoomChatMessage() {
  const queryClient = useQueryClient();

  return useMutation<
    RoomChatMessageResponse,
    Error,
    { roomId: string; payload: SendRoomChatMessageRequest }
  >({
    mutationFn: async ({ roomId, payload }) => {
      const validated = sendRoomChatMessageRequestSchema.parse(payload);
      const { data } = await api.post(`/rooms/${roomId}/chat`, validated);
      return roomChatMessageResponseSchema.parse(data);
    },
    onSuccess: (_response: RoomChatMessageResponse, variables) => {
      queryClient.invalidateQueries({ queryKey: ["rooms", variables.roomId, "chat"] });
    },
  });
}

export function useAskRoomAI() {
  const queryClient = useQueryClient();

  return useMutation<
    RoomAiChatResponse,
    Error,
    { roomId: string; payload: SendRoomChatMessageRequest }
  >({
    mutationFn: async ({ roomId, payload }) => {
      const validated = sendRoomChatMessageRequestSchema.parse(payload);
      const { data } = await api.post(`/rooms/${roomId}/chat/ai`, validated);
      return roomAiChatResponseSchema.parse(data);
    },
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: ["rooms", variables.roomId, "chat"] });
    },
  });
}

export function useUploadRoomChatFile() {
  const queryClient = useQueryClient();

  return useMutation<
    RoomChatMessageResponse,
    Error,
    { roomId: string; file: File; message?: string }
  >({
    mutationFn: async ({ roomId, file, message }) => {
      const formData = new FormData();
      formData.append("file", file);
      if (message) formData.append("message", message);
      const { data } = await api.post(`/rooms/${roomId}/chat/upload`, formData);
      return roomChatMessageResponseSchema.parse(data);
    },
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: ["rooms", variables.roomId, "chat"] });
    },
  });
}

export function createRoomChatStream(roomId: string, token?: string): WebSocket {
  if (typeof window === "undefined") {
    throw new Error("WebSocket stream can only be created in the browser.");
  }
  const accessToken = token ?? getCookie("access_token");
  if (!accessToken) {
    throw new Error("Missing access token for room chat stream.");
  }
  return new WebSocket(buildRoomChatStreamUrl(roomId, accessToken));
}

export function parseRoomChatStreamEvent(payload: unknown): RoomChatStreamEvent {
  return roomChatStreamEventSchema.parse(payload);
}
