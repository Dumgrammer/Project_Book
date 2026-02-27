import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

import SectionTitle from "../components/SectionTitle";
import { pricingData } from "../data/pricingData";

export default function Pricing() {
  return (
    <Box component="section" id="pricing">
      <Container maxWidth="lg">
        <SectionTitle
          text1="Pricing"
          text2="Plans for Every Learner"
          text3="Whether you're a student, educator, or institution — there's a plan for you."
        />

        <Grid container spacing={3} justifyContent="center" sx={{ mt: 6 }}>
          {pricingData.map((plan) => {
            const popular = plan.mostPopular;
            return (
              <Grid key={plan.title} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card
                  elevation={popular ? 6 : 1}
                  sx={{
                    height: "100%",
                    position: "relative",
                    ...(popular && {
                      background: "linear-gradient(to bottom, #4f46e5, #7c3aed)",
                      color: "#fff",
                    }),
                  }}
                >
                  <CardContent sx={{ p: 4, pt: popular ? 6 : 4 }}>
                    {popular && (
                      <Chip
                        icon={<AutoAwesomeIcon sx={{ fontSize: 14, color: "primary.main" }} />}
                        label="Most Popular"
                        size="small"
                        sx={{ position: "absolute", top: 16, right: 16, bgcolor: "#fff", color: "primary.main", fontWeight: 600 }}
                      />
                    )}

                    <Typography variant="body1" sx={{ color: popular ? "#fff" : "text.secondary" }}>
                      {plan.title}
                    </Typography>
                    <Typography variant="h3" sx={{ mt: 0.5, color: popular ? "#fff" : "text.primary" }}>
                      ${plan.price}
                      <Typography component="span" variant="body2" sx={{ color: popular ? "rgba(255,255,255,0.8)" : "text.secondary" }}>
                        /mo
                      </Typography>
                    </Typography>

                    <Divider sx={{ my: 3, borderColor: popular ? "rgba(255,255,255,0.3)" : "divider" }} />

                    <Stack spacing={1.5}>
                      {plan.features.map((feature) => (
                        <Stack key={feature.name} direction="row" spacing={1} alignItems="center">
                          <feature.icon style={{ fontSize: 18, color: popular ? "#fff" : "#4f46e5" }} />
                          <Typography variant="body2" sx={{ color: popular ? "#fff" : "text.secondary" }}>
                            {feature.name}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>

                    <Button
                      variant={popular ? "contained" : "contained"}
                      fullWidth
                      sx={{
                        mt: 4,
                        ...(popular
                          ? { bgcolor: "#fff", color: "primary.main", "&:hover": { bgcolor: "grey.100" } }
                          : {}),
                      }}
                    >
                      {plan.buttonText}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
}
