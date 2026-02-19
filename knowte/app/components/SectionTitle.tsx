import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

type SectionTitleProps = {
  text1: string;
  text2: string;
  text3: string;
};

export default function SectionTitle({ text1, text2, text3 }: SectionTitleProps) {
  return (
    <Box sx={{ textAlign: "center", mt: 14 }}>
      <Typography variant="overline" color="primary" fontWeight={600} letterSpacing={2}>
        {text1}
      </Typography>
      <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
        {text2}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, maxWidth: 520, mx: "auto" }}>
        {text3}
      </Typography>
    </Box>
  );
}
