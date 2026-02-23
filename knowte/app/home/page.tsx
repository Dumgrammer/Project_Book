"use client";

import Box from "@mui/material/Box";
import ChatArea from "./components/ChatArea";

export default function HomePage() {
  return (
    <Box sx={{ height: "100%", overflow: "hidden" }}>
      <ChatArea />
    </Box>
  );
}
