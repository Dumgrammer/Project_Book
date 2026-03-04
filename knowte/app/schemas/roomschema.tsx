import { z } from "zod";

export const roomFetchResponseSchema = z.object({
  id: z.string().uuid(),
  r_name: z.string(),
  r_tags: z.array(z.string()),
  r_description: z.string(),
  r_is_private: z.boolean(),
  r_max_members: z.number().int().min(1).max(100),
  r_owner_id: z.string(),
  r_co_admin_ids: z.array(z.string()),
  r_members: z.array(z.string()),
  r_pending_member_ids: z.array(z.string()),
  created_at: z.string(),
  updated_at: z.string(),
});

export const roomResponseSchema = z.object({
  id: z.string().uuid(),
  r_code: z.string(),
  r_name: z.string(),
  r_tags: z.array(z.string()),
  r_description: z.string(),
  r_is_private: z.boolean(),
  r_max_members: z.number().int().min(1).max(100),
  r_owner_id: z.string(),
  r_co_admin_ids: z.array(z.string()),
  r_members: z.array(z.string()),
  r_pending_member_ids: z.array(z.string()),
  created_at: z.string(),
  updated_at: z.string(),
});

export const createRoomRequestSchema = z.object({
  r_name: z.string().min(1).max(150),
  r_tags: z.array(z.string()).default([]),
  r_description: z.string().default(""),
  r_is_private: z.boolean().default(false),
  r_max_members: z.number().int().min(1).max(100).default(8),
});

export const updateRoomRequestSchema = z.object({
  r_name: z.string().min(1).max(150).optional(),
  r_tags: z.array(z.string()).optional(),
  r_description: z.string().optional(),
  r_is_private: z.boolean().optional(),
  r_max_members: z.number().int().min(1).max(100).optional(),
});

export const roomListResponseSchema = z.object({
  items: z.array(roomFetchResponseSchema),
  next_cursor: z.string().nullable().optional(),
});

export const deleteRoomResponseSchema = z.object({
  id: z.string().uuid(),
  deleted: z.boolean(),
});

export const joinRoomResponseSchema = z.object({
  status: z.enum(["joined", "already_member", "pending_approval"]),
  room_id: z.string().uuid(),
  user_id: z.string(),
  joined_at: z.string().nullable().optional(),
  requested_at: z.string().nullable().optional(),
  approval_required: z.boolean().default(false),
});

export const sendRoomChatMessageRequestSchema = z.object({
  message: z.string().min(1).max(4000),
});

export const roomChatMessageResponseSchema = z.object({
  id: z.string().uuid(),
  room_id: z.string().uuid(),
  user_id: z.string(),
  message: z.string(),
  created_at: z.string(),
});

export const roomChatListResponseSchema = z.object({
  items: z.array(roomChatMessageResponseSchema),
});

export const roomChatStreamEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("chat_message"),
    data: roomChatMessageResponseSchema,
  }),
  z.object({
    type: z.literal("error"),
    detail: z.string(),
  }),
]);

export type RoomFetchResponse = z.infer<typeof roomFetchResponseSchema>;
export type RoomResponse = z.infer<typeof roomResponseSchema>;
export type CreateRoomRequest = z.infer<typeof createRoomRequestSchema>;
export type UpdateRoomRequest = z.infer<typeof updateRoomRequestSchema>;
export type RoomListResponse = z.infer<typeof roomListResponseSchema>;
export type DeleteRoomResponse = z.infer<typeof deleteRoomResponseSchema>;
export type JoinRoomResponse = z.infer<typeof joinRoomResponseSchema>;
export type SendRoomChatMessageRequest = z.infer<typeof sendRoomChatMessageRequestSchema>;
export type RoomChatMessageResponse = z.infer<typeof roomChatMessageResponseSchema>;
export type RoomChatListResponse = z.infer<typeof roomChatListResponseSchema>;
export type RoomChatStreamEvent = z.infer<typeof roomChatStreamEventSchema>;
