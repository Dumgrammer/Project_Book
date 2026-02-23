"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import AvatarGroup from "@mui/material/AvatarGroup";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import { useCurrentUser } from "../hooks/auth";

interface Room {
  id: string;
  name: string;
  subject: string;
  description: string;
  members: number;
  maxMembers: number;
  isPrivate: boolean;
  tags: string[];
  avatars: string[];
  active: boolean;
}

const rooms: Room[] = [
  {
    id: "r1",
    name: "Biology Study Group",
    subject: "Biology 101",
    description: "Weekly review sessions for Bio 101. We cover lectures, labs, and exam prep.",
    members: 8,
    maxMembers: 15,
    isPrivate: false,
    tags: ["Biology", "Exam Prep"],
    avatars: ["A", "B", "C", "D"],
    active: true,
  },
  {
    id: "r2",
    name: "Calculus Problem Solving",
    subject: "Math 201",
    description: "Work through calculus problem sets together. Bring your homework!",
    members: 5,
    maxMembers: 10,
    isPrivate: false,
    tags: ["Math", "Problem Sets"],
    avatars: ["E", "F", "G"],
    active: true,
  },
  {
    id: "r3",
    name: "History Essay Workshop",
    subject: "History 101",
    description: "Peer review and brainstorm essay topics for the midterm paper.",
    members: 4,
    maxMembers: 8,
    isPrivate: false,
    tags: ["History", "Writing"],
    avatars: ["H", "I"],
    active: false,
  },
  {
    id: "r4",
    name: "Organic Chemistry Lab",
    subject: "Chemistry 202",
    description: "Discuss lab reports, share molecule diagrams, and prep for practicals.",
    members: 12,
    maxMembers: 20,
    isPrivate: false,
    tags: ["Chemistry", "Lab"],
    avatars: ["J", "K", "L", "M"],
    active: true,
  },
  {
    id: "r5",
    name: "Private Thesis Group",
    subject: "Research",
    description: "Invite-only room for our thesis group. DM the owner for access.",
    members: 3,
    maxMembers: 5,
    isPrivate: true,
    tags: ["Thesis", "Research"],
    avatars: ["N", "O"],
    active: false,
  },
  {
    id: "r6",
    name: "AI & Machine Learning",
    subject: "CS 301",
    description: "Discuss neural networks, transformers, and coding assignments.",
    members: 15,
    maxMembers: 25,
    isPrivate: false,
    tags: ["CS", "AI", "ML"],
    avatars: ["P", "Q", "R", "S"],
    active: true,
  },
];

const avatarColors = [
  "#4f46e5", "#0891b2", "#d97706", "#7c3aed",
  "#16a34a", "#dc2626", "#0284c7", "#c026d3",
];

function RoomCard({ room }: { room: Room }) {
  const capacityPercent = (room.members / room.maxMembers) * 100;
  const isFull = room.members >= room.maxMembers;

  return (
    <Card
      variant="outlined"
      sx={{
        borderColor: "#e2e8f0",
        transition: "border-color 0.2s, box-shadow 0.2s",
        "&:hover": {
          borderColor: "primary.main",
          boxShadow: "0 4px 20px rgba(79,70,229,0.08)",
        },
      }}
    >
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {room.isPrivate ? (
              <LockRoundedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
            ) : (
              <PublicRoundedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
            )}
            <Typography sx={{ fontSize: 16, fontWeight: 700, color: "text.primary" }}>
              {room.name}
            </Typography>
          </Box>
          {room.active && (
            <Chip
              label="Active"
              size="small"
              sx={{
                height: 22,
                fontSize: 11,
                fontWeight: 600,
                bgcolor: "#dcfce7",
                color: "#16a34a",
              }}
            />
          )}
        </Box>

        <Chip
          label={room.subject}
          size="small"
          sx={{
            height: 22,
            fontSize: 11,
            fontWeight: 600,
            bgcolor: "#eef2ff",
            color: "primary.main",
            mb: 1,
          }}
        />

        <Typography sx={{ fontSize: 13, color: "text.secondary", lineHeight: 1.5, mb: 1.5 }}>
          {room.description}
        </Typography>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1.5 }}>
          {room.tags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              variant="outlined"
              sx={{
                height: 22,
                fontSize: 11,
                borderColor: "#e2e8f0",
                color: "text.secondary",
              }}
            />
          ))}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <AvatarGroup max={4} sx={{ "& .MuiAvatar-root": { width: 28, height: 28, fontSize: 12 } }}>
            {room.avatars.map((letter, i) => (
              <Avatar
                key={letter}
                sx={{ bgcolor: avatarColors[i % avatarColors.length] }}
              >
                {letter}
              </Avatar>
            ))}
          </AvatarGroup>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <GroupsRoundedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
            <Typography sx={{ fontSize: 12, color: "text.secondary", fontWeight: 600 }}>
              {room.members}/{room.maxMembers}
            </Typography>
          </Box>
        </Box>

        {/* Capacity bar */}
        <Box sx={{ mt: 1, height: 4, bgcolor: "#f1f5f9", borderRadius: 2, overflow: "hidden" }}>
          <Box
            sx={{
              height: "100%",
              width: `${capacityPercent}%`,
              bgcolor: isFull ? "#ef4444" : capacityPercent > 75 ? "#f59e0b" : "primary.main",
              borderRadius: 2,
              transition: "width 0.3s",
            }}
          />
        </Box>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button
          fullWidth
          variant={isFull ? "outlined" : "contained"}
          disabled={isFull}
          size="small"
          sx={{ fontSize: 13 }}
        >
          {isFull ? "Room Full" : room.isPrivate ? "Request Access" : "Join Room"}
        </Button>
      </CardActions>
    </Card>
  );
}

export default function RoomsPage() {
  const [search, setSearch] = useState("");
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const { data: user } = useCurrentUser();

  const filtered = rooms.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.subject.toLowerCase().includes(search.toLowerCase()) ||
      r.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", px: 4, py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "text.primary", mb: 0.5 }}>
          Study Rooms
        </Typography>
        <Typography sx={{ fontSize: 15, color: "text.secondary" }}>
          Join a room to collaborate with others in real time.
        </Typography>
      </Box>

      {/* Search + actions */}
      <Box sx={{ display: "flex", gap: 1.5, mb: 3, flexWrap: "wrap" }}>
        <TextField
          placeholder="Search rooms by name, subject, or tag..."
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
          sx={{ fontSize: 13, whiteSpace: "nowrap" }}
        >
          Create Room
        </Button>
      </Box>

      {/* Room grid */}
      {filtered.length > 0 ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" },
            gap: 2,
          }}
        >
          {filtered.map((room) => (
            <RoomCard key={room.id} room={room} />
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

      {/* Join with Code dialog */}
      <Dialog
        open={joinDialogOpen}
        onClose={() => setJoinDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Join with Room Code</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 14, color: "text.secondary", mb: 2 }}>
            Enter the invite code shared by the room owner.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            placeholder="e.g. ABC-1234"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            size="small"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setJoinDialogOpen(false)} sx={{ fontSize: 13 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={!roomCode.trim()}
            onClick={() => {
              setJoinDialogOpen(false);
              setRoomCode("");
            }}
            sx={{ fontSize: 13 }}
          >
            Join
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
