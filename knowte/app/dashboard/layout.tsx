"use client";

import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import ServerBar from "./components/ServerBar";
import ChannelSidebar from "./components/ChannelSidebar";

const SERVERBAR_WIDTH = 72;
const SIDEBAR_WIDTH = 240;

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <ServerBar />
      <ChannelSidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          bgcolor: "#313338",
          ml: `${SERVERBAR_WIDTH + SIDEBAR_WIDTH}px`,
          height: "100vh",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
