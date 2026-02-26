import { useMutation, useQuery, useQuery, useQueryClient, useQueryClientClient } from "@tanstack/react-query";
import {useRouter} from "next/navigation";
import { api } from "../lib/api";
import { createRoomRequestSchema, roomResponseSchema } from "../schemas/roomschema";
import type { CreateRoomRequest, RoomResponse } from "../models/roommodel";


export function useCreateRoom() {
  
  const queryClient = useQueryClient();

    return useMutation<RoomResponse, Error, CreateRoomRequest>({
        mutationFn: async (payload: CreateRoomRequest) => {
            const { data } = await api.post("/rooms", payload);
            return roomResponseSchema.parse(data);
        },
        onSuccess: (data: RoomResponse) => {
            queryClient.setQueryData(["rooms"], (oldData: any) => {
                if (oldData && "items" in oldData) {
                    return {
                        ...oldData,
                        items: [data, ...oldData.items],
                    };
                }
                return [data];
            });
        },
    });