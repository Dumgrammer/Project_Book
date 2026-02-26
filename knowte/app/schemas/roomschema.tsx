import { z } from "zod";

export const roomResponseSchema = z.object({
  id: z.string().uuid(),
  r_name: z.string(),
  r_tags: z.array(z.string()),
  r_description: z.string(),
  r_is_private: z.boolean(),
  r_max_members: z.number().int().min(1).max(100),
  r_owner_id: z.string(),
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
  items: z.array(roomResponseSchema),
  next_cursor: z.string().nullable().optional(),
});

export const deleteRoomResponseSchema = z.object({
  id: z.string().uuid(),
  deleted: z.boolean(),
});

export type RoomResponse = z.infer<typeof roomResponseSchema>;
export type CreateRoomRequest = z.infer<typeof createRoomRequestSchema>;
export type UpdateRoomRequest = z.infer<typeof updateRoomRequestSchema>;
export type RoomListResponse = z.infer<typeof roomListResponseSchema>;
export type DeleteRoomResponse = z.infer<typeof deleteRoomResponseSchema>;
