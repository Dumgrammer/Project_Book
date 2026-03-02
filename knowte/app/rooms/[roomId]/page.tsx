"use client";

import { useParams, useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import { useRoom } from "../../hooks/rooms";
import RoomChatView from "../components/RoomChatView";

export default function RoomDetailPage() {
  const params = useParams<{ roomId: string }>();
  const roomId = params.roomId;
  const router = useRouter();
  const roomQuery = useRoom(roomId ?? null);
  const room = roomQuery.data;

  if (!roomId) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">Missing room ID.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Room header */}
      <Box
        sx={{
          px: 3,
          py: 1.5,
          borderBottom: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          bgcolor: "background.paper",
          flexShrink: 0,
        }}
      >
        <IconButton size="small" onClick={() => router.push("/rooms")}>
          <ArrowBackRoundedIcon sx={{ fontSize: 20 }} />
        </IconButton>

        {roomQuery.isLoading ? (
          <CircularProgress size={18} />
        ) : roomQuery.isError ? (
          <Typography sx={{ fontSize: 14, color: "error.main" }}>
            Failed to load room
          </Typography>
        ) : room ? (
          <>
            {room.r_is_private ? (
              <LockRoundedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
            ) : (
              <PublicRoundedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
            )}
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                sx={{
                  fontSize: 16,
                  fontWeight: 700,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {room.r_name}
              </Typography>
              {room.r_description && (
                <Typography
                  sx={{
                    fontSize: 12,
                    color: "text.secondary",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {room.r_description}
                </Typography>
              )}
            </Box>

            {/* Tags */}
            {room.r_tags.length > 0 && (
              <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
                {room.r_tags.slice(0, 3).map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: 11,
                      fontWeight: 600,
                      borderRadius: 1.5,
                      bgcolor: "rgba(99,102,241,0.08)",
                      color: "#6366f1",
                    }}
                  />
                ))}
              </Box>
            )}

            {/* Capacity badge */}
            <Chip
              icon={<PersonRoundedIcon sx={{ fontSize: 14 }} />}
              label={`Max ${room.r_max_members}`}
              size="small"
              sx={{
                height: 22,
                fontSize: 11,
                fontWeight: 600,
                borderRadius: 1.5,
                bgcolor: "rgba(0,0,0,0.04)",
                color: "text.secondary",
                flexShrink: 0,
              }}
            />
          </>
        ) : null}
      </Box>

      {/* Chat body */}
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <RoomChatView roomId={roomId} />
      </Box>
    </Box>
  );
}
