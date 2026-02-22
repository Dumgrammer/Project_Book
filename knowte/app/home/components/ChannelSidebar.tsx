"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import TagRoundedIcon from "@mui/icons-material/TagRounded";
import VolumeUpRoundedIcon from "@mui/icons-material/VolumeUpRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import HeadsetRoundedIcon from "@mui/icons-material/HeadsetRounded";
import MicRoundedIcon from "@mui/icons-material/MicRounded";
import { useState } from "react";
import { useCurrentUser, useLogout } from "../../hooks/auth";

const SERVERBAR_WIDTH = 72;
const SIDEBAR_WIDTH = 240;

interface Channel {
  id: string;
  name: string;
  kind: "text" | "voice";
}

interface ChannelGroup {
  label: string;
  channels: Channel[];
}

const channelGroups: ChannelGroup[] = [
  {
    label: "Study Rooms",
    channels: [
      { id: "general", name: "general", kind: "text" },
      { id: "announcements", name: "announcements", kind: "text" },
      { id: "resources", name: "resources", kind: "text" },
    ],
  },
  {
    label: "AI Tools",
    channels: [
      { id: "ask-ai", name: "ask-ai", kind: "text" },
      { id: "flashcards", name: "flashcards", kind: "text" },
      { id: "summarizer", name: "summarizer", kind: "text" },
    ],
  },
  {
    label: "Voice Channels",
    channels: [
      { id: "study-lounge", name: "Study Lounge", kind: "voice" },
      { id: "group-review", name: "Group Review", kind: "voice" },
    ],
  },
];

function ChannelGroupSection({
  group,
  activeChannel,
  onSelect,
}: {
  group: ChannelGroup;
  activeChannel: string;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <>
      <ListItemButton
        onClick={() => setOpen(!open)}
        disableRipple
        sx={{
          px: 1,
          py: 0.25,
          minHeight: 0,
          "&:hover": { bgcolor: "transparent" },
        }}
      >
        <ExpandMoreRoundedIcon
          sx={{
            fontSize: 12,
            color: "text.secondary",
            mr: 0.5,
            transform: open ? "rotate(0deg)" : "rotate(-90deg)",
            transition: "transform 0.15s",
          }}
        />
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            fontWeight: 700,
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          {group.label}
        </Typography>
      </ListItemButton>
      <Collapse in={open}>
        {group.channels.map((ch) => (
          <ListItemButton
            key={ch.id}
            selected={activeChannel === ch.id}
            onClick={() => onSelect(ch.id)}
            sx={{
              mx: 1,
              px: 1,
              py: 0.5,
              borderRadius: 1,
              mb: 0.25,
              "&.Mui-selected": { bgcolor: "#e0e7ff", "&:hover": { bgcolor: "#e0e7ff" } },
              "&:hover": { bgcolor: "#f1f5f9" },
            }}
          >
            <ListItemIcon sx={{ minWidth: 28 }}>
              {ch.kind === "voice" ? (
                <VolumeUpRoundedIcon sx={{ fontSize: 20, color: "text.secondary" }} />
              ) : (
                <TagRoundedIcon sx={{ fontSize: 20, color: "text.secondary" }} />
              )}
            </ListItemIcon>
            <ListItemText
              primary={ch.name}
              primaryTypographyProps={{
                fontSize: 14,
                fontWeight: activeChannel === ch.id ? 600 : 400,
                color: activeChannel === ch.id ? "text.primary" : "text.secondary",
              }}
            />
          </ListItemButton>
        ))}
      </Collapse>
    </>
  );
}

export default function ChannelSidebar() {
  const [activeChannel, setActiveChannel] = useState("general");
  const { data: user } = useCurrentUser();
  const logout = useLogout();

  const displayName = user?.full_name ?? user?.email ?? "User";
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <Box
      sx={{
        position: "fixed",
        left: SERVERBAR_WIDTH,
        top: 0,
        width: SIDEBAR_WIDTH,
        height: "100vh",
        bgcolor: "#f1f5f9",
        borderRight: 1,
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
        zIndex: 1100,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          height: 48,
          display: "flex",
          alignItems: "center",
          px: 2,
          borderBottom: 1,
          borderColor: "divider",
          flexShrink: 0,
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{ color: "primary.main", fontWeight: 700, fontSize: 15 }}
        >
          Knowte
        </Typography>
      </Box>

      {/* Channel list */}
      <Box sx={{ flexGrow: 1, overflowY: "auto", pt: 1.5, "&::-webkit-scrollbar": { width: 4 }, "&::-webkit-scrollbar-thumb": { bgcolor: "#cbd5e1", borderRadius: 2 } }}>
        <List disablePadding>
          {channelGroups.map((group) => (
            <ChannelGroupSection
              key={group.label}
              group={group}
              activeChannel={activeChannel}
              onSelect={setActiveChannel}
            />
          ))}
        </List>
      </Box>

      {/* User panel */}
      <Box
        sx={{
          height: 52,
          bgcolor: "#e2e8f0",
          display: "flex",
          alignItems: "center",
          px: 1,
          gap: 0.5,
          flexShrink: 0,
        }}
      >
        <Avatar sx={{ width: 32, height: 32, fontSize: 14, bgcolor: "primary.main", color: "primary.contrastText" }}>
          {initials}
        </Avatar>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 600,
              color: "text.primary",
              lineHeight: 1.2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {displayName}
          </Typography>
          <Typography sx={{ fontSize: 11, color: "text.secondary", lineHeight: 1.2 }}>
            Online
          </Typography>
        </Box>
        <IconButton size="small" sx={{ color: "text.secondary" }}>
          <MicRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>
        <IconButton size="small" sx={{ color: "text.secondary" }}>
          <HeadsetRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>
        <IconButton size="small" onClick={logout} sx={{ color: "text.secondary" }}>
          <SettingsRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>
    </Box>
  );
}
