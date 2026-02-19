import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

export default function HeroSection() {
  return (
    <Box component="section" sx={{ bgcolor: "background.default", pt: 18, pb: 8, textAlign: "center" }}>
      <Container maxWidth="md">
        <Chip
          component="a"
          href="#pricing"
          clickable
          label={
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Chip label="NEW" size="small" sx={{ height: 22, fontSize: 11, transition: "all 0.2s", "&:hover": { bgcolor: "primary.main", color: "primary.contrastText" } }} />
              <Typography variant="body2" color="primary">Try 30 days free trial option</Typography>
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
          Build, launch and scale{" "}
          <Box component="span" sx={{ background: "linear-gradient(90deg, #4f46e5, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            your SaaS
          </Box>{" "}
          faster
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mt: 2.5, maxWidth: 520, mx: "auto" }}>
          Workflows that never miss. Automation that helps your team do more, effortlessly.
        </Typography>

        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 4 }}>
          <Button variant="contained" size="large">Get Started</Button>
          <Button variant="outlined" size="large" startIcon={<AutoAwesomeIcon />}>AI Features</Button>
        </Stack>

        <Box
          component="img"
          src="/assets/hero-section-card-image.svg"
          alt="Hero section card preview"
          sx={{ mt: 8, width: "100%", maxWidth: 560, mx: "auto", display: "block", filter: "drop-shadow(0 8px 24px rgba(79,70,229,0.15))" }}
        />
      </Container>
    </Box>
  );
}
