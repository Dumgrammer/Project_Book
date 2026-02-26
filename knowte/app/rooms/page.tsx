"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import {
  useCreateRoom,
  useDeleteRoom,
  useRooms,
  useUpdateRoom,
} from "../hooks/rooms";
import type { RoomResponse, UpdateRoomRequest } from "../models/roommodel";
import RoomCard from "./components/RoomCard";
import CreateRoomDialog from "./components/CreateRoomDialog";
import EditRoomDialog from "./components/EditRoomDialog";
import JoinRoomDialog from "./components/JoinRoomDialog";

export default function RoomsPage() {
  const [search, setSearch] = useState("");
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomResponse | null>(null);

  const roomsQuery = useRooms();
  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();
  const deleteRoom = useDeleteRoom();

  const filtered = useMemo(() => {
    const rooms = roomsQuery.data?.items ?? [];
    return rooms.filter((room: RoomResponse) => {
      const q = search.toLowerCase();
      return (
        room.r_name.toLowerCase().includes(q) ||
        room.r_description.toLowerCase().includes(q) ||
        room.r_tags.some((tag) => tag.toLowerCase().includes(q))
      );
    });
  }, [roomsQuery.data?.items, search]);

  async function handleCreate(payload: Parameters<typeof createRoom.mutateAsync>[0]) {
    await createRoom.mutateAsync(payload);
    setCreateDialogOpen(false);
  }

  async function handleUpdate(roomId: string, payload: UpdateRoomRequest) {
    await updateRoom.mutateAsync({ roomId, payload });
    setEditingRoom(null);
    setEditDialogOpen(false);
  }

  async function handleDelete(room: RoomResponse) {
    const confirmed = window.confirm(`Delete room "${room.r_name}"?`);
    if (!confirmed) return;
    await deleteRoom.mutateAsync(room.id);
  }

  function openEdit(room: RoomResponse) {
    setEditingRoom(room);
    setEditDialogOpen(true);
  }

  const actionError =
    createRoom.error?.message || updateRoom.error?.message || deleteRoom.error?.message || null;

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", px: 4, py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "text.primary", mb: 0.5 }}>
          Study Rooms
        </Typography>
        <Typography sx={{ fontSize: 15, color: "text.secondary" }}>
          Join a room to collaborate with others in real time.
        </Typography>
      </Box>

      {roomsQuery.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load rooms: {roomsQuery.error.message}
        </Alert>
      )}
      {actionError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {actionError}
        </Alert>
      )}

      {/* Search + actions */}
      <Box sx={{ display: "flex", gap: 1.5, mb: 3, flexWrap: "wrap" }}>
        <TextField
          placeholder="Search rooms by name, description, or tag..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flexGrow: 1, minWidth: 240 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                </InputAdornment>
              ),
            },
          }}
        />
        <Button
          variant="outlined"
          startIcon={<GroupsRoundedIcon />}
          onClick={() => setJoinDialogOpen(true)}
          sx={{ fontSize: 13, whiteSpace: "nowrap" }}
        >
          Join with Code
        </Button>
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={() => setCreateDialogOpen(true)}
          sx={{ fontSize: 13, whiteSpace: "nowrap" }}
        >
          Create Room
        </Button>
      </Box>

      {/* Room grid */}
      {roomsQuery.isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress size={28} />
        </Box>
      ) : filtered.length > 0 ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 2.5,
          }}
        >
          {filtered.map((room: RoomResponse) => (
            <RoomCard key={room.id} room={room} onEdit={openEdit} onDelete={handleDelete} />
          ))}
        </Box>
      ) : (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <GroupsRoundedIcon sx={{ fontSize: 64, color: "#e2e8f0", mb: 2 }} />
          <Typography sx={{ fontSize: 16, fontWeight: 600, color: "text.secondary" }}>
            No rooms found
          </Typography>
          <Typography sx={{ fontSize: 14, color: "text.disabled", mt: 0.5 }}>
            Try a different search or create a new room.
          </Typography>
        </Box>
      )}

      {/* Dialogs */}
      <CreateRoomDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreate}
        isPending={createRoom.isPending}
      />
      <EditRoomDialog
        open={editDialogOpen}
        room={editingRoom}
        onClose={() => setEditDialogOpen(false)}
        onSubmit={handleUpdate}
        isPending={updateRoom.isPending}
      />
      <JoinRoomDialog
        open={joinDialogOpen}
        onClose={() => setJoinDialogOpen(false)}
      />
    </Box>
  );
}
