"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { useCurrentUser, useLogout } from "../../hooks/auth";

const SERVERBAR_WIDTH = 72;
const SIDEBAR_WIDTH = 240;

interface ChatEntry {
  id: string;
  title: string;
}

interface HistoryGroup {
  label: string;
  chats: ChatEntry[];
}

const chatHistory: HistoryGroup[] = [
  {
    label: "Today",
    chats: [
      { id: "c1", title: "Summarize Chapter 5 Biology" },
      { id: "c2", title: "Quiz: Cellular Respiration" },
    ],
  },
  {
    label: "Yesterday",
    chats: [
      { id: "c3", title: "Explain Newton's 3rd Law" },
      { id: "c4", title: "Flashcards: Organic Chemistry" },
      { id: "c5", title: "Essay outline: World War II" },
    ],
  },
  {
    label: "Previous 7 Days",
    chats: [
      { id: "c6", title: "Math 201 Problem Set Help" },
      { id: "c7", title: "Summarize uploaded PDF" },
      { id: "c8", title: "Quiz: Philippine History" },
      { id: "c9", title: "Compare: Mitosis vs Meiosis" },
    ],
  },
];

export default function ChannelSidebar() {
  const [activeChat, setActiveChat] = useState("c1");
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
        bgcolor: "#f8fafc",
        borderRight: 1,
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
        zIndex: 1100,
      }}
    >
      {/* New chat button */}
      <Box sx={{ p: 1.5, flexShrink: 0 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<EditNoteRoundedIcon />}
          sx={{
            justifyContent: "flex-start",
            borderColor: "#e2e8f0",
            color: "text.primary",
            fontWeight: 600,
            fontSize: 13,
            textTransform: "none",
            borderRadius: 2,
            py: 1,
            "&:hover": { bgcolor: "#f1f5f9", borderColor: "#cbd5e1" },
          }}
        >
          New chat
        </Button>
      </Box>

      {/* Chat history */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          px: 0.5,
          "&::-webkit-scrollbar": { width: 4 },
          "&::-webkit-scrollbar-thumb": { bgcolor: "#cbd5e1", borderRadius: 2 },
        }}
      >
        {chatHistory.map((group) => (
          <Box key={group.label} sx={{ mb: 1 }}>
            <Typography
              sx={{
                px: 1.5,
                pt: 1.5,
                pb: 0.5,
                fontSize: 11,
                fontWeight: 700,
                color: "text.secondary",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              {group.label}
            </Typography>
            <List disablePadding>
              {group.chats.map((chat) => (
                <ListItemButton
                  key={chat.id}
                  selected={activeChat === chat.id}
                  onClick={() => setActiveChat(chat.id)}
                  sx={{
                    mx: 0.5,
                    px: 1.5,
                    py: 0.75,
                    borderRadius: 2,
                    mb: 0.25,
                    group: "chatItem",
                    "&.Mui-selected": {
                      bgcolor: "#e0e7ff",
                      "&:hover": { bgcolor: "#e0e7ff" },
                    },
                    "&:hover": { bgcolor: "#f1f5f9" },
                    "&:hover .chat-actions": { opacity: 1 },
                  }}
                >
                  <ListItemText
                    primary={chat.title}
                    primaryTypographyProps={{
                      fontSize: 13,
                      fontWeight: activeChat === chat.id ? 600 : 400,
                      color: activeChat === chat.id ? "text.primary" : "text.secondary",
                      noWrap: true,
                    }}
                  />
                  <Box
                    className="chat-actions"
                    sx={{ opacity: 0, transition: "opacity 0.15s", ml: 0.5, flexShrink: 0 }}
                  >
                    <IconButton size="small" sx={{ p: 0.25 }}>
                      <MoreHorizRoundedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                    </IconButton>
                  </Box>
                </ListItemButton>
              ))}
            </List>
          </Box>
        ))}
      </Box>

      {/* User panel */}
      <Box
        sx={{
          borderTop: 1,
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          px: 1.5,
          py: 1,
          gap: 1,
          flexShrink: 0,
        }}
      >
        <Avatar sx={{ width: 32, height: 32, fontSize: 14, bgcolor: "primary.main", color: "#fff" }}>
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
        </Box>
        <IconButton size="small" sx={{ color: "text.secondary" }}>
          <SettingsRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>
        <IconButton size="small" onClick={logout} sx={{ color: "text.secondary" }}>
          <LogoutRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>
    </Box>
  );
}
