"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import FlipRoundedIcon from "@mui/icons-material/FlipRounded";
import AutoStoriesRoundedIcon from "@mui/icons-material/AutoStoriesRounded";
import type { FlashcardItem } from "../models/flashcardmodel";
import { useGenerateFlashcards } from "../hooks/flashcard";

export default function FlashcardPage() {
  const params = useSearchParams();
  const documentId = params.get("documentId");
  const prompt = params.get("prompt");
  const countParam = params.get("count");
  const count = Number(countParam ?? "12");

  const generate = useGenerateFlashcards();
  const startedRef = useRef(false);
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!documentId || !prompt || startedRef.current) return;
    startedRef.current = true;
    void generate.mutateAsync({
      document_id: documentId,
      prompt,
      count: Number.isFinite(count) ? Math.min(Math.max(count, 3), 30) : 12,
    });
  }, [count, documentId, generate, prompt]);

  const cards: FlashcardItem[] = generate.data?.flashcards ?? [];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", px: { xs: 2, sm: 4 }, py: 4 }}>
      <Box sx={{ maxWidth: 980, mx: "auto" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            flexDirection: { xs: "column", sm: "row" },
            gap: 1.5,
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Flashcards
            </Typography>
            <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
              {prompt ?? "Generated from your document"}
            </Typography>
          </Box>
          {generate.data && (
            <Chip
              icon={<AutoStoriesRoundedIcon sx={{ fontSize: 18 }} />}
              label={`${cards.length} cards • ${generate.data.model}`}
              variant="outlined"
              sx={{ borderColor: "#cbd5e1" }}
            />
          )}
        </Box>

        {!documentId || !prompt ? (
          <Card variant="outlined" sx={{ borderColor: "#e2e8f0" }}>
            <CardContent>
              <Typography sx={{ fontWeight: 600, mb: 0.5 }}>Missing data</Typography>
              <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
                Open this page from ChatArea by clicking the Generate flashcards prompt.
              </Typography>
            </CardContent>
          </Card>
        ) : generate.isPending ? (
          <Card variant="outlined" sx={{ borderColor: "#e2e8f0" }}>
            <CardContent sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 3 }}>
              <CircularProgress size={20} />
              <Typography sx={{ color: "text.secondary" }}>
                Generating flashcards from your uploaded document...
              </Typography>
            </CardContent>
          </Card>
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
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 2,
            }}
          >
            {cards.map((card, index) => {
              const isFlipped = !!flipped[index];
              return (
                <Card key={`${index}-${card.question}`} variant="outlined" sx={{ borderColor: "#dbeafe" }}>
                  <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                    <Chip
                      size="small"
                      label={isFlipped ? "Answer" : "Question"}
                      sx={{
                        width: "fit-content",
                        bgcolor: isFlipped ? "#ecfdf5" : "#eff6ff",
                        color: isFlipped ? "#065f46" : "#1e3a8a",
                        fontWeight: 600,
                      }}
                    />
                    <Typography sx={{ fontSize: 16, fontWeight: 600, color: "text.primary" }}>
                      {isFlipped ? card.answer : card.question}
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<FlipRoundedIcon />}
                      onClick={() => setFlipped((prev) => ({ ...prev, [index]: !prev[index] }))}
                      sx={{ width: "fit-content", borderColor: "#cbd5e1", textTransform: "none" }}
                    >
                      {isFlipped ? "Show question" : "Show answer"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        )}
      </Box>
    </Box>
  );
}
