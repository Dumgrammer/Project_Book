"use client";

import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import ServerBar from "../home/components/ServerBar";

const SERVERBAR_WIDTH = 72;

export default function RoomsLayout({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <ServerBar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          bgcolor: "background.default",
          ml: `${SERVERBAR_WIDTH}px`,
          height: "100vh",
          overflowY: "auto",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
