import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import GitHubIcon from "@mui/icons-material/GitHub";

export default function BottomBanner() {
  return (
    <Box sx={{ mt: 14 }}>
      <Container maxWidth="md">
        <Stack
          direction={{ xs: "column", md: "row" }}
          alignItems="center"
          justifyContent="space-between"
          spacing={3}
          sx={{ borderTop: 1, borderBottom: 1, borderColor: "divider", borderStyle: "dashed", py: 8, textAlign: { xs: "center", md: "left" } }}
        >
          <Typography variant="h6" fontWeight={600} sx={{ maxWidth: 360 }}>
            Join hundreds of developers building better SaaS products.
          </Typography>
          <Button variant="contained" startIcon={<GitHubIcon />} size="large">
            Star on Github
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
