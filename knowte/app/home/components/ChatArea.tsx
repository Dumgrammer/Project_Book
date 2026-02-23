"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import InputBase from "@mui/material/InputBase";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import AttachFileRoundedIcon from "@mui/icons-material/AttachFileRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import QuizRoundedIcon from "@mui/icons-material/QuizRounded";
import SummarizeRoundedIcon from "@mui/icons-material/SummarizeRounded";
import StyleRoundedIcon from "@mui/icons-material/StyleRounded";
import FindInPageRoundedIcon from "@mui/icons-material/FindInPageRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import { useCurrentUser } from "../../hooks/auth";

interface Suggestion {
  label: string;
  icon: React.ReactNode;
}

const suggestions: Suggestion[] = [
  { label: "Create a quiz from my notes", icon: <QuizRoundedIcon sx={{ fontSize: 18 }} /> },
  { label: "Summarize my file contents", icon: <SummarizeRoundedIcon sx={{ fontSize: 18 }} /> },
  { label: "Generate flashcards", icon: <StyleRoundedIcon sx={{ fontSize: 18 }} /> },
  { label: "Find key topics in document", icon: <FindInPageRoundedIcon sx={{ fontSize: 18 }} /> },
  { label: "Explain this concept", icon: <SchoolRoundedIcon sx={{ fontSize: 18 }} /> },
  { label: "Create study outline", icon: <DescriptionRoundedIcon sx={{ fontSize: 18 }} /> },
];

export default function ChatArea() {
  const { data: user } = useCurrentUser();
  const firstName = (user?.full_name ?? user?.email ?? "there").split(" ")[0];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Main content — vertically centered */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          maxWidth: 680,
          px: 3,
          gap: 1,
        }}
      >
        {/* Greeting */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
          <AutoAwesomeRoundedIcon sx={{ fontSize: 28, color: "primary.main" }} />
          <Typography
            sx={{
              fontSize: 20,
              fontWeight: 600,
              background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #06b6d4 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Hi {firstName}
          </Typography>
        </Box>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: "text.primary",
            textAlign: "center",
            mb: 4,
            fontSize: { xs: 24, sm: 32 },
          }}
        >
          Where should we start?
        </Typography>

        {/* Input box */}
        <Box
          sx={{
            width: "100%",
            bgcolor: "#f1f5f9",
            borderRadius: 3,
            border: "1px solid #e2e8f0",
            transition: "border-color 0.2s, box-shadow 0.2s",
            "&:focus-within": {
              borderColor: "primary.main",
              boxShadow: "0 0 0 3px rgba(79,70,229,0.1)",
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", px: 2, pt: 1.5, pb: 0.5 }}>
            <InputBase
              placeholder="Ask Knowte anything about your documents..."
              fullWidth
              multiline
              maxRows={4}
              sx={{
                fontSize: 15,
                color: "text.primary",
                "& textarea::placeholder": { color: "#94a3b8", opacity: 1 },
              }}
            />
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: 1.5,
              pb: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <IconButton size="small" sx={{ color: "text.secondary" }}>
                <AttachFileRoundedIcon sx={{ fontSize: 20 }} />
              </IconButton>
              <Typography sx={{ fontSize: 12, color: "text.disabled" }}>
                Upload a file to get started
              </Typography>
            </Box>
            <IconButton
              size="small"
              sx={{
                bgcolor: "primary.main",
                color: "#fff",
                width: 32,
                height: 32,
                "&:hover": { bgcolor: "primary.dark" },
              }}
            >
              <SendRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Box>

        {/* Suggestion chips */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 1,
            mt: 2,
          }}
        >
          {suggestions.map((s) => (
            <Chip
              key={s.label}
              icon={s.icon}
              label={s.label}
              clickable
              variant="outlined"
              sx={{
                borderColor: "#e2e8f0",
                color: "text.secondary",
                fontWeight: 500,
                fontSize: 13,
                height: 36,
                borderRadius: 6,
                px: 0.5,
                transition: "all 0.2s",
                "& .MuiChip-icon": { color: "text.secondary" },
                "&:hover": {
                  bgcolor: "primary.main",
                  borderColor: "primary.main",
                  color: "#fff",
                  "& .MuiChip-icon": { color: "#fff" },
                },
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}
