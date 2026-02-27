import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

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
            Join thousands of students and educators transforming how they learn with AI.
          </Typography>
          <Button variant="contained" size="large" href="/register">
            Start Learning Smarter
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
