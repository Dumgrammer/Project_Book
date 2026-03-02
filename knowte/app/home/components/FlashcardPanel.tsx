"use client";

import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Drawer from "@mui/material/Drawer";
import AutoStoriesRoundedIcon from "@mui/icons-material/AutoStoriesRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import NavigateBeforeRoundedIcon from "@mui/icons-material/NavigateBeforeRounded";
import NavigateNextRoundedIcon from "@mui/icons-material/NavigateNextRounded";
import ViewListRoundedIcon from "@mui/icons-material/ViewListRounded";
import ViewCarouselRoundedIcon from "@mui/icons-material/ViewCarouselRounded";
import type { FlashcardItem } from "../../models/flashcardmodel";
import { useGenerateFlashcards } from "../../hooks/flashcard";

interface FlashcardPanelProps {
  open: boolean;
  onClose: () => void;
  documentId: string | null;
  prompt: string | null;
  count?: number;
}

const PANEL_WIDTH = 520;

/** Rotating gradient palette for cards */
const CARD_GRADIENTS = [
  "linear-gradient(135deg, #f97316 0%, #ec4899 100%)",
  "linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #3b82f6 100%)",
  "linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)",
  "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
  "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
  "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)",
];

export default function FlashcardPanel({
  open,
  onClose,
  documentId,
  prompt,
  count = 12,
}: FlashcardPanelProps) {
  const generate = useGenerateFlashcards();
  const startedRef = useRef(false);
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"single" | "list">("single");

  const prevKeyRef = useRef<string>("");
  const panelKey = `${documentId}-${prompt}-${count}`;

  useEffect(() => {
    if (!open || !documentId || !prompt) return;
    if (panelKey === prevKeyRef.current) return;
    prevKeyRef.current = panelKey;
    startedRef.current = false;
    setFlipped({});
    setActiveIndex(0);
  }, [open, documentId, prompt, panelKey]);

  useEffect(() => {
    if (!open || !documentId || !prompt || startedRef.current) return;
    startedRef.current = true;
    void generate.mutateAsync({
      document_id: documentId,
      prompt,
      count: Number.isFinite(count) ? Math.min(Math.max(count, 3), 30) : 12,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, documentId, prompt, count]);

  const cards: FlashcardItem[] = generate.data?.flashcards ?? [];

  const handleClose = () => {
    onClose();
    startedRef.current = false;
    prevKeyRef.current = "";
    generate.reset();
    setFlipped({});
    setActiveIndex(0);
  };

  const gradient = (i: number) => CARD_GRADIENTS[i % CARD_GRADIENTS.length];

  /* ---- Render a single gradient card ---- */
  const renderCard = (card: FlashcardItem, index: number, large?: boolean) => {
    const isFlipped = !!flipped[index];
    return (
      <Box
        key={`${index}-${card.question}`}
        onClick={() => setFlipped((p) => ({ ...p, [index]: !p[index] }))}
        sx={{
          cursor: "pointer",
          borderRadius: 4,
          background: gradient(index),
          color: "#fff",
          p: large ? 4 : 2.5,
          minHeight: large ? 260 : 140,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          overflow: "hidden",
          transition: "transform 0.2s, box-shadow 0.2s",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 8px 30px rgba(0,0,0,0.18)",
          },
        }}
      >
        {/* Decorative paper icons in top-right */}
        <Box
          sx={{
            position: "absolute",
            top: large ? -10 : -6,
            right: large ? -10 : -6,
            opacity: 0.15,
            transform: "rotate(12deg)",
            fontSize: large ? 120 : 64,
            pointerEvents: "none",
          }}
        >
          <AutoStoriesRoundedIcon sx={{ fontSize: "inherit" }} />
        </Box>

        {/* Label */}
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: large ? 20 : 15,
            letterSpacing: 0.5,
            textTransform: "uppercase",
            mb: 1,
            opacity: 0.9,
          }}
        >
          {isFlipped ? "Answer" : "Question"}
        </Typography>

        {/* Content */}
        <Typography
          sx={{
            fontSize: large ? 17 : 14,
            fontWeight: 500,
            lineHeight: 1.55,
            flexGrow: 1,
            display: "flex",
            alignItems: large ? "center" : "flex-start",
          }}
        >
          {isFlipped ? card.answer : card.question}
        </Typography>

        {/* Footer hint */}
        <Typography
          sx={{
            fontSize: 11,
            opacity: 0.6,
            mt: 1.5,
            textAlign: "right",
            fontStyle: "italic",
          }}
        >
          Tap to {isFlipped ? "see question" : "reveal answer"}
        </Typography>
      </Box>
    );
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      variant="persistent"
      sx={{
        "& .MuiDrawer-paper": {
          width: PANEL_WIDTH,
          maxWidth: "100vw",
          borderLeft: "1px solid #e2e8f0",
          boxShadow: "-4px 0 24px rgba(0,0,0,0.06)",
        },
      }}
    >
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: "#f8fafc" }}>
        {/* Header */}
        <Box
          sx={{
            borderBottom: "1px solid #e2e8f0",
            px: 2.5,
            py: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 18 }}>Flashcards</Typography>
            {generate.data && (
              <Chip
                icon={<AutoStoriesRoundedIcon sx={{ fontSize: 14 }} />}
                label={`${cards.length} cards`}
                size="small"
                sx={{
                  mt: 0.5,
                  bgcolor: "rgba(99,102,241,0.08)",
                  color: "#4f46e5",
                  fontWeight: 600,
                  fontSize: 12,
                  border: "none",
                }}
              />
            )}
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {cards.length > 0 && (
              <IconButton
                size="small"
                onClick={() => setViewMode((v) => (v === "single" ? "list" : "single"))}
                sx={{ color: "text.secondary" }}
              >
                {viewMode === "single" ? (
                  <ViewListRoundedIcon sx={{ fontSize: 20 }} />
                ) : (
                  <ViewCarouselRoundedIcon sx={{ fontSize: 20 }} />
                )}
              </IconButton>
            )}
            <IconButton size="small" onClick={handleClose} sx={{ color: "text.secondary" }}>
              <CloseRoundedIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: "auto", px: 2.5, py: 2.5 }}>
          {!documentId || !prompt ? (
            <Card variant="outlined" sx={{ borderColor: "#e2e8f0" }}>
              <CardContent>
                <Typography sx={{ fontWeight: 600, mb: 0.5 }}>Missing data</Typography>
                <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
                  Upload a document and use the Generate flashcards action.
                </Typography>
              </CardContent>
            </Card>
          ) : generate.isPending ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                py: 8,
              }}
            >
              <CircularProgress size={28} sx={{ color: "#6366f1" }} />
              <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
                Generating flashcards...
              </Typography>
            </Box>
          ) : generate.isError ? (
            <Card variant="outlined" sx={{ borderColor: "#fecaca", bgcolor: "#fef2f2" }}>
              <CardContent>
                <Typography sx={{ color: "#991b1b", fontWeight: 600, mb: 0.5 }}>
                  Failed to generate flashcards
                </Typography>
                <Typography sx={{ color: "#7f1d1d", fontSize: 14 }}>
                  {generate.error.message}
                </Typography>
              </CardContent>
            </Card>
          ) : viewMode === "single" && cards.length > 0 ? (
            /* ---- Single card view ---- */
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {renderCard(cards[activeIndex], activeIndex, true)}

              {/* Navigation */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                }}
              >
                <IconButton
                  size="small"
                  disabled={activeIndex === 0}
                  onClick={() => setActiveIndex((i) => i - 1)}
                  sx={{
                    bgcolor: "#e2e8f0",
                    "&:hover": { bgcolor: "#cbd5e1" },
                    "&.Mui-disabled": { bgcolor: "#f1f5f9" },
                  }}
                >
                  <NavigateBeforeRoundedIcon />
                </IconButton>
                <Typography sx={{ fontWeight: 600, fontSize: 14, color: "text.secondary" }}>
                  {activeIndex + 1} / {cards.length}
                </Typography>
                <IconButton
                  size="small"
                  disabled={activeIndex === cards.length - 1}
                  onClick={() => setActiveIndex((i) => i + 1)}
                  sx={{
                    bgcolor: "#e2e8f0",
                    "&:hover": { bgcolor: "#cbd5e1" },
                    "&.Mui-disabled": { bgcolor: "#f1f5f9" },
                  }}
                >
                  <NavigateNextRoundedIcon />
                </IconButton>
              </Box>

              {/* Dot indicators */}
              <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5, flexWrap: "wrap" }}>
                {cards.map((_, i) => (
                  <Box
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    sx={{
                      width: i === activeIndex ? 18 : 8,
                      height: 8,
                      borderRadius: 4,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      background: i === activeIndex ? gradient(i) : "#cbd5e1",
                    }}
                  />
                ))}
              </Box>
            </Box>
          ) : (
            /* ---- List view ---- */
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {cards.map((card, index) => renderCard(card, index))}
            </Box>
          )}
        </Box>
      </Box>
    </Drawer>
  );
}
