"use client";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Marquee from "react-fast-marquee";

import SectionTitle from "../components/SectionTitle";
import TestimonialCard from "../components/TestimonialCard";
import { testimonialsData } from "../data/testimonialsData";

export default function Testimonials() {
  const doubled = [...testimonialsData, ...testimonialsData];

  return (
    <Box component="section" id="testimonials">
      <Container maxWidth="lg" disableGutters>
        <SectionTitle
          text1="Testimonials"
          text2="Our Social Proof"
          text3="Trusted by teams shipping quickly with confidence."
        />

        <Box sx={{ mt: 5 }}>
          <Marquee gradient speed={25}>
            <Stack direction="row" sx={{ py: 2 }}>
              {doubled.map((t, i) => (
                <TestimonialCard key={`${t.handle}-${i}`} testimonial={t} />
              ))}
            </Stack>
          </Marquee>

          <Marquee gradient speed={25} direction="right">
            <Stack direction="row" sx={{ py: 2 }}>
              {doubled.map((t, i) => (
                <TestimonialCard key={`${t.handle}-rev-${i}`} testimonial={t} />
              ))}
            </Stack>
          </Marquee>
        </Box>
      </Container>
    </Box>
  );
}
