"use client";

import Box from "@mui/material/Box";
import ChatArea from "./components/ChatArea";
import MembersSidebar from "./components/MembersSidebar";

export default function DashboardPage() {
  return (
    <Box sx={{ display: "flex", height: "100%", overflow: "hidden" }}>
      <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
        <ChatArea />
      </Box>
      <MembersSidebar />
    </Box>
  );
}
