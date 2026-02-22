"use client";

import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

const WIDTH = 72;

interface ServerIconProps {
  label: string;
  children: React.ReactNode;
  active?: boolean;
  color?: string;
}

function ServerIcon({ label, children, active, color = "#4f46e5" }: ServerIconProps) {
  return (
    <Tooltip title={label} placement="right" arrow>
      <Box sx={{ position: "relative", display: "flex", justifyContent: "center", mb: 1 }}>
        <Avatar
          variant="rounded"
          sx={{
            width: 48,
            height: 48,
            bgcolor: active ? color : "#e2e8f0",
            borderRadius: active ? "16px" : "24px",
            transition: "border-radius 0.2s, background-color 0.2s",
            cursor: "pointer",
            "&:hover": {
              borderRadius: "16px",
              bgcolor: color,
              "& .MuiSvgIcon-root": { color: "#fff" },
            },
          }}
        >
          {children}
        </Avatar>
      </Box>
    </Tooltip>
  );
}

export default function ServerBar() {
  return (
    <Box
      sx={{
        position: "fixed",
        left: 0,
        top: 0,
        width: WIDTH,
        height: "100vh",
        bgcolor: "#f8fafc",
        borderRight: 1,
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 1.5,
        overflowY: "auto",
        overflowX: "hidden",
        zIndex: 1200,
        "&::-webkit-scrollbar": { width: 0 },
      }}
    >
      <ServerIcon label="Home" active color="#4f46e5">
        <HomeRoundedIcon sx={{ color: "#fff", fontSize: 28 }} />
      </ServerIcon>

      <ServerIcon label="Rooms" color="#0891b2">
        <GroupsRoundedIcon sx={{ color: "#0891b2", fontSize: 24 }} />
      </ServerIcon>

      <ServerIcon label="Resources" color="#d97706">
        <FolderRoundedIcon sx={{ color: "#d97706", fontSize: 24 }} />
      </ServerIcon>

      <ServerIcon label="Usage" color="#7c3aed">
        <BarChartRoundedIcon sx={{ color: "#7c3aed", fontSize: 24 }} />
      </ServerIcon>

      <Divider sx={{ width: 32, borderColor: "divider", my: 0.5 }} />

      <ServerIcon label="Add" color="#16a34a">
        <AddRoundedIcon sx={{ color: "#16a34a", fontSize: 28 }} />
      </ServerIcon>
    </Box>
  );
}
