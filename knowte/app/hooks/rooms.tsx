"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import {
  createRoomRequestSchema,
  deleteRoomResponseSchema,
  roomListResponseSchema,
  roomResponseSchema,
  updateRoomRequestSchema,
} from "../schemas/roomschema";
import type {
  CreateRoomRequest,
  DeleteRoomResponse,
  RoomListResponse,
  RoomResponse,
  UpdateRoomRequest,
} from "../models/roommodel";

type ListRoomsParams = {
  limit?: number;
  cursor?: string;
  owner_id?: string;
};

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
  return useQuery<RoomResponse>({
    queryKey: ["rooms", roomId],
    queryFn: async () => {
      const { data } = await api.get(`/rooms/${roomId}`);
      return roomResponseSchema.parse(data);
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
