"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import MuiLink from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { navLinks } from "../data/navLinks";

export default function Footer() {
  return (
    <Box component="footer" sx={{ mt: 16, width: "100%" }}>
      <Container maxWidth="lg">
        <Divider />
        <Grid container spacing={4} sx={{ py: 6 }}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Typography component={Link} href="/" variant="h6" color="primary" sx={{ fontWeight: 700, textDecoration: "none" }}>
              Knowte
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, maxWidth: 360 }}>
              Your AI-powered academic companion. Upload documents, ask questions,
              and create study materials — all in one place.
            </Typography>
          </Grid>

          <Grid size={{ xs: 6, md: 3 }}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>Company</Typography>
            <Stack spacing={1}>
              {navLinks.map((link) => (
                <MuiLink key={link.name} href={link.href} underline="hover" color="text.secondary" variant="body2">
                  {link.name}
                </MuiLink>
              ))}
            </Stack>
          </Grid>

          <Grid size={{ xs: 6, md: 4 }}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>Get in touch</Typography>
            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary">+1-212-456-7890</Typography>
              <Typography variant="body2" color="text.secondary">contact@example.com</Typography>
            </Stack>
          </Grid>
        </Grid>
        <Divider />
        <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
          Copyright 2026 &copy; Knowte. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}
