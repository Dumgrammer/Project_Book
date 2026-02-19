import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import type { Testimonial } from "../data/testimonialsData";

type TestimonialCardProps = {
  testimonial: Testimonial;
};

export default function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        mx: 1.5,
        width: 288,
        flexShrink: 0,
        transition: "box-shadow 0.2s",
        "&:hover": { boxShadow: 4 },
      }}
    >
      <CardContent>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar src={testimonial.image} alt={testimonial.name} sx={{ width: 40, height: 40 }} />
          <div>
            <Typography variant="subtitle2">{testimonial.name}</Typography>
            <Typography variant="caption" color="text.secondary">{testimonial.handle}</Typography>
          </div>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          {testimonial.quote}
        </Typography>
      </CardContent>
    </Card>
  );
}
