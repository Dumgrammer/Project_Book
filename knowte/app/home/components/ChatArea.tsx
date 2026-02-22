"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import InputBase from "@mui/material/InputBase";
import IconButton from "@mui/material/IconButton";
import TagRoundedIcon from "@mui/icons-material/TagRounded";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import EmojiEmotionsRoundedIcon from "@mui/icons-material/EmojiEmotionsRounded";
import GifBoxRoundedIcon from "@mui/icons-material/GifBoxRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import PushPinRoundedIcon from "@mui/icons-material/PushPinRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { useCurrentUser } from "../../hooks/auth";

interface Message {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  bot?: boolean;
}

const sampleMessages: Message[] = [
  {
    id: "1",
    author: "Knowte Bot",
    avatar: "K",
    content: "Welcome to #general! This is where you can collaborate on study notes, share resources, and get AI-powered help. Try asking me anything!",
    timestamp: "Today at 9:00 AM",
    bot: true,
  },
  {
    id: "2",
    author: "Knowte Bot",
    avatar: "K",
    content: "Tip: Use the #ask-ai channel to get instant explanations, generate flashcards, or summarize your notes.",
    timestamp: "Today at 9:01 AM",
    bot: true,
  },
];

function MessageRow({ message }: { message: Message }) {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        px: 2,
        py: 0.5,
        "&:hover": { bgcolor: "#f8fafc" },
      }}
    >
      <Avatar
        sx={{
          width: 40,
          height: 40,
          mt: 0.5,
          bgcolor: message.bot ? "primary.main" : "#94a3b8",
          fontSize: 16,
          fontWeight: 700,
        }}
      >
        {message.avatar}
      </Avatar>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
          <Typography
            sx={{ fontSize: 14, fontWeight: 600, color: message.bot ? "primary.main" : "text.primary" }}
          >
            {message.author}
          </Typography>
          {message.bot && (
            <Box
              sx={{
                bgcolor: "primary.main",
                color: "#fff",
                fontSize: 10,
                fontWeight: 700,
                px: 0.5,
                py: 0.1,
                borderRadius: 0.5,
                lineHeight: 1.4,
              }}
            >
              BOT
            </Box>
          )}
          <Typography sx={{ fontSize: 11, color: "text.secondary" }}>{message.timestamp}</Typography>
        </Box>
        <Typography sx={{ fontSize: 14, color: "text.primary", lineHeight: 1.5, mt: 0.25 }}>
          {message.content}
        </Typography>
      </Box>
    </Box>
  );
}

export default function ChatArea() {
  const { data: user } = useCurrentUser();
  const displayName = user?.full_name ?? user?.email ?? "User";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Top bar */}
      <Box
        sx={{
          height: 48,
          display: "flex",
          alignItems: "center",
          px: 2,
          borderBottom: 1,
          borderColor: "divider",
          flexShrink: 0,
          gap: 1,
        }}
      >
        <TagRoundedIcon sx={{ fontSize: 22, color: "text.secondary" }} />
        <Typography sx={{ fontSize: 15, fontWeight: 700, color: "text.primary" }}>
          general
        </Typography>
        <Box sx={{ width: 1, height: 24, bgcolor: "divider", mx: 1 }} />
        <Typography sx={{ fontSize: 13, color: "text.secondary", flexGrow: 1 }}>
          General study discussion
        </Typography>
        <IconButton size="small" sx={{ color: "text.secondary" }}>
          <NotificationsRoundedIcon sx={{ fontSize: 20 }} />
        </IconButton>
        <IconButton size="small" sx={{ color: "text.secondary" }}>
          <PushPinRoundedIcon sx={{ fontSize: 20 }} />
        </IconButton>
        <IconButton size="small" sx={{ color: "text.secondary" }}>
          <PeopleAltRoundedIcon sx={{ fontSize: 20 }} />
        </IconButton>
        <Box
          sx={{
            bgcolor: "#f1f5f9",
            borderRadius: 1,
            display: "flex",
            alignItems: "center",
            px: 1,
            height: 28,
          }}
        >
          <InputBase
            placeholder="Search"
            sx={{
              fontSize: 13,
              color: "text.secondary",
              width: 120,
              "& input::placeholder": { color: "#94a3b8", opacity: 1 },
            }}
          />
          <SearchRoundedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
        </Box>
      </Box>

      {/* Messages */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          py: 2,
          "&::-webkit-scrollbar": { width: 6 },
          "&::-webkit-scrollbar-thumb": { bgcolor: "#cbd5e1", borderRadius: 3 },
        }}
      >
        {/* Welcome header */}
        <Box sx={{ px: 2, mb: 3 }}>
          <Avatar sx={{ width: 68, height: 68, bgcolor: "primary.main", fontSize: 32, fontWeight: 700, mb: 1 }}>
            #
          </Avatar>
          <Typography sx={{ fontSize: 28, fontWeight: 700, color: "text.primary" }}>
            Welcome to #general
          </Typography>
          <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
            This is the start of the #general channel.
          </Typography>
        </Box>

        {sampleMessages.map((msg) => (
          <MessageRow key={msg.id} message={msg} />
        ))}
      </Box>

      {/* Message input */}
      <Box sx={{ px: 2, pb: 2, flexShrink: 0 }}>
        <Box
          sx={{
            bgcolor: "#f1f5f9",
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            px: 1.5,
            minHeight: 44,
          }}
        >
          <IconButton size="small" sx={{ color: "text.secondary" }}>
            <AddCircleRoundedIcon sx={{ fontSize: 22 }} />
          </IconButton>
          <InputBase
            placeholder={`Message #general as ${displayName}`}
            fullWidth
            sx={{
              mx: 1,
              fontSize: 14,
              color: "text.primary",
              "& input::placeholder": { color: "#94a3b8", opacity: 1 },
            }}
          />
          <IconButton size="small" sx={{ color: "text.secondary" }}>
            <GifBoxRoundedIcon sx={{ fontSize: 22 }} />
          </IconButton>
          <IconButton size="small" sx={{ color: "text.secondary" }}>
            <EmojiEmotionsRoundedIcon sx={{ fontSize: 22 }} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}
