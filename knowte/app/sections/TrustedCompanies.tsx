"use client";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Marquee from "react-fast-marquee";

import { companiesLogo } from "../data/companiesLogo";

export default function TrustedCompanies() {
  const doubled = [...companiesLogo, ...companiesLogo];

  return (
    <Box component="section" sx={{ mt: 12, pb: 6 }}>
      <Typography variant="body2" color="text.secondary" align="center" fontWeight={500} sx={{ mb: 6 }}>
        Trusted by leading brands, including
      </Typography>
      <Container maxWidth="md" disableGutters>
        <Marquee gradient speed={25}>
          <Stack direction="row" spacing={6} alignItems="center">
            {doubled.map((company, index) => (
              <Box
                key={`${company.name}-${index}`}
                component="img"
                src={company.logo}
                alt={company.name}
                sx={{ width: 100, height: "auto", opacity: 0.7 }}
              />
            ))}
          </Stack>
        </Marquee>
      </Container>
    </Box>
  );
}
