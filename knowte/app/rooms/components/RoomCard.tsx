"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import AvatarGroup from "@mui/material/AvatarGroup";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import LinearProgress from "@mui/material/LinearProgress";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";

import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import type { RoomResponse } from "../../models/roommodel";

const avatarColors = [
  "#6366f1",
  "#06b6d4",
  "#f59e0b",
  "#8b5cf6",
  "#22c55e",
  "#ef4444",
  "#0ea5e9",
  "#d946ef",
];



function getInitials(name: string): string[] {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase());
}

interface RoomCardProps {
  room: RoomResponse;
  onEdit: (room: RoomResponse) => void;
  onDelete: (room: RoomResponse) => void;
}

export default function RoomCard({ room, onEdit, onDelete }: RoomCardProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const memberCount = 1;
  const capacityPercent = (memberCount / room.r_max_members) * 100;
  const isFull = memberCount >= room.r_max_members;
  const avatarLetters = getInitials(room.r_name);

  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "rgba(0,0,0,0.06)",
        borderRadius: 3,
        overflow: "hidden",
        transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
        display: "flex",
        flexDirection: "column",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 12px 40px rgba(99,102,241,0.12)",
          borderColor: "rgba(99,102,241,0.3)",
        },
      }}
    >

      <Box sx={{ p: 2.5, pb: 0, flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {/* Header: icon + title + menu */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0, flex: 1 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {room.r_is_private ? (
                <LockRoundedIcon sx={{ fontSize: 18, color: "#fff" }} />
              ) : (
                <PublicRoundedIcon sx={{ fontSize: 18, color: "#fff" }} />
              )}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "text.primary",
                  lineHeight: 1.3,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {room.r_name}
              </Typography>
              <Typography sx={{ fontSize: 12, color: "text.disabled", lineHeight: 1.2 }}>
                {room.r_is_private ? "Private room" : "Public room"}
              </Typography>
            </Box>
          </Box>

          <IconButton
            size="small"
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{
              color: "text.secondary",
              bgcolor: "transparent",
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            <MoreHorizRoundedIcon sx={{ fontSize: 20 }} />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            slotProps={{
              paper: {
                sx: {
                  minWidth: 150,
                  borderRadius: 2,
                  boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                  border: "1px solid rgba(0,0,0,0.06)",
                  mt: 0.5,
                },
              },
            }}
          >
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                onEdit(room);
              }}
              sx={{ py: 1 }}
            >
              <ListItemIcon>
                <EditRoundedIcon sx={{ fontSize: 18 }} />
              </ListItemIcon>
              <ListItemText primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}>
                Edit
              </ListItemText>
            </MenuItem>
            <Divider sx={{ my: 0.5 }} />
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                onDelete(room);
              }}
              sx={{ color: "error.main", py: 1 }}
            >
              <ListItemIcon>
                <DeleteRoundedIcon sx={{ fontSize: 18, color: "error.main" }} />
              </ListItemIcon>
              <ListItemText primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}>
                Delete
              </ListItemText>
            </MenuItem>
          </Menu>
        </Box>

        {/* Description */}
        <Typography
          sx={{
            fontSize: 13.5,
            color: "text.secondary",
            lineHeight: 1.65,
            mb: 2,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: 44,
          }}
        >
          {room.r_description || "No description provided."}
        </Typography>

        {/* Tags */}
        {room.r_tags.length > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 2 }}>
            {room.r_tags.map((tag) => (
              <Chip
                key={`${room.id}-${tag}`}
                label={tag}
                size="small"
                sx={{
                  height: 24,
                  fontSize: 11.5,
                  fontWeight: 600,
                  borderRadius: 1.5,
                  bgcolor: "rgba(99,102,241,0.08)",
                  color: "#6366f1",
                  border: "none",
                }}
              />
            ))}
          </Box>
        )}

        {/* Spacer */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Capacity section */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.75 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <PersonRoundedIcon sx={{ fontSize: 15, color: "text.disabled" }} />
              <Typography sx={{ fontSize: 12, color: "text.secondary", fontWeight: 500 }}>
                {memberCount} of {room.r_max_members} members
              </Typography>
            </Box>
            <Typography sx={{ fontSize: 11, color: "text.disabled", fontWeight: 600 }}>
              {Math.round(capacityPercent)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={capacityPercent}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: "rgba(0,0,0,0.04)",
              "& .MuiLinearProgress-bar": {
                borderRadius: 3,
                bgcolor: isFull
                  ? "#ef4444"
                  : capacityPercent > 75
                    ? "#f59e0b"
                    : "#6366f1",
              },
            }}
          />
        </Box>

        <Divider sx={{ mx: -2.5, borderColor: "rgba(0,0,0,0.05)" }} />

        {/* Footer: avatars + join */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 2 }}>
          <AvatarGroup
            max={4}
            sx={{
              "& .MuiAvatar-root": {
                width: 32,
                height: 32,
                fontSize: 13,
                fontWeight: 600,
                border: "2px solid #fff",
              },
            }}
          >
            {avatarLetters.map((letter, i) => (
              <Avatar key={letter} sx={{ bgcolor: avatarColors[i % avatarColors.length] }}>
                {letter}
              </Avatar>
            ))}
          </AvatarGroup>

          <Button
            variant={isFull ? "outlined" : "contained"}
            disabled={isFull}
            size="small"
            disableElevation
            sx={{
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 2,
              px: 2.5,
              textTransform: "none",
              ...(isFull
                ? {}
                : {
                    bgcolor: "#6366f1",
                    "&:hover": { bgcolor: "#4f46e5" },
                  }),
            }}
          >
            {isFull ? "Full" : room.r_is_private ? "Request Access" : "Join Room"}
          </Button>
        </Box>
      </Box>
    </Card>
  );
}
