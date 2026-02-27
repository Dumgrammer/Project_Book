import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import Link from "next/link";

export default function HeroSection() {
  return (
    <Box component="section" sx={{ bgcolor: "background.default", pt: 18, pb: 8, textAlign: "center" }}>
      <Container maxWidth="md">
        <Chip
          component="a"
          href="#features"
          clickable
          label={
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Chip label="AI-POWERED" size="small" sx={{ height: 22, fontSize: 11, transition: "all 0.2s", "&:hover": { bgcolor: "primary.main", color: "primary.contrastText" } }} />
              <Typography variant="body2" color="primary">Document answering meets academic creation</Typography>
              <ChevronRightIcon fontSize="small" color="primary" />
            </Stack> 
          }
          variant="outlined"
          sx={{
            px: 1,
            height: 36,
            borderColor: "primary.light",
            bgcolor: "#eef2ff",
            transition: "all 0.25s",
            "&&:hover, &&.MuiChip-clickable:hover": {
              bgcolor: "#4f46e5",
              borderColor: "#4f46e5",
              "& .MuiTypography-root": { color: "#fff" },
              "& .MuiSvgIcon-root": { color: "#fff" },
              "& .MuiChip-root": { bgcolor: "#fff", color: "#4f46e5" },
            },
            "& .MuiChip-label": { px: 0.5 },
          }}
        />

        <Typography variant="h2" sx={{ mt: 4, fontSize: { xs: "2.5rem", md: "3.4rem" }, lineHeight: 1.2, fontWeight: 700 }}>
          Your AI-powered{" "}
          <Box component="span" sx={{ background: "linear-gradient(90deg, #4f46e5, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            academic companion
          </Box>{" "}
          for smarter learning
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mt: 2.5, maxWidth: 560, mx: "auto" }}>
          Upload your documents, ask questions, and generate quizzes, flashcards, and study materials instantly — all powered by AI.
        </Typography>

        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 4 }}>
          <Link href="/register">
            <Button variant="contained" size="large">Get Started Free</Button>
          </Link>
          <Button variant="outlined" size="large" href="#features" startIcon={<AutoAwesomeIcon />}>See How It Works</Button>
        </Stack>

        <Box
          component="img"
          src="/assets/hero-section-card-image.svg"
          alt="Knowte AI document answering preview"
          sx={{ mt: 8, width: "100%", maxWidth: 560, mx: "auto", display: "block", filter: "drop-shadow(0 8px 24px rgba(79,70,229,0.15))" }}
        />
      </Container>
    </Box>
  );
}
