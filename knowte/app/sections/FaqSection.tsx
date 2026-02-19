"use client";

import { useState } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import SectionTitle from "../components/SectionTitle";
import { faqsData } from "../data/faqsData";

export const FaqSection = () => {
  const [expanded, setExpanded] = useState<number | false>(false);

  const handleChange = (index: number) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? index : false);
  };

  return (
    <Box component="section" id="faq">
      <Container maxWidth="sm">
        <SectionTitle
          text1="FAQ"
          text2="Frequently asked questions"
          text3="Ship beautiful frontends without the overhead."
        />

        <Box sx={{ mt: 4 }}>
          {faqsData.map((faq, index) => (
            <Accordion
              key={faq.question}
              expanded={expanded === index}
              onChange={handleChange(index)}
              elevation={0}
              disableGutters
              sx={{ "&::before": { display: "none" }, borderBottom: 1, borderColor: "divider" }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2">{faq.question}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary">{faq.answer}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Container>
    </Box>
  );
};
