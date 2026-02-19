import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

import SectionTitle from "../components/SectionTitle";

const features = [
  {
    title: "Feedback analyzer",
    description: "Track product sentiment and prioritize changes with confidence.",
    image: "https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/features/image-1.png",
  },
  {
    title: "User management",
    description: "Manage account roles and access from one clean dashboard.",
    image: "https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/features/image-2.png",
  },
  {
    title: "Better invoicing",
    description: "Keep billing simple with automated invoices and clear reporting.",
    image: "https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/features/image-3.png",
  },
];

export default function FeaturesSection() {
  return (
    <Box component="section" id="features">
      <Container maxWidth="lg">
        <SectionTitle
          text1="Features"
          text2="Features Overview"
          text3="A curated set of product capabilities designed for fast delivery."
        />

        <Grid container spacing={4} justifyContent="center" sx={{ mt: 6 }}>
          {features.map((feature) => (
            <Grid key={feature.title} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                elevation={0}
                sx={{ transition: "transform 0.3s", "&:hover": { transform: "translateY(-4px)" } }}
              >
                <CardMedia
                  component="img"
                  image={feature.image}
                  alt={feature.title}
                  sx={{ borderRadius: 2 }}
                />
                <CardContent sx={{ px: 0 }}>
                  <Typography variant="subtitle1" fontWeight={600}>{feature.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
