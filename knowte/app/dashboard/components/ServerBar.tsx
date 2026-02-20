"use client";

import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ExploreRoundedIcon from "@mui/icons-material/ExploreRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import ScienceRoundedIcon from "@mui/icons-material/ScienceRounded";

const WIDTH = 72;

interface ServerIconProps {
  label: string;
  children: React.ReactNode;
  active?: boolean;
  color?: string;
}

function ServerIcon({ label, children, active, color = "#5865f2" }: ServerIconProps) {
  return (
    <Tooltip title={label} placement="right" arrow>
      <Box sx={{ position: "relative", display: "flex", justifyContent: "center", mb: 1 }}>
        {active && (
          <Box
            sx={{
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              width: 4,
              height: 40,
              borderRadius: "0 4px 4px 0",
              bgcolor: "#fff",
            }}
          />
        )}
        <Avatar
          variant="rounded"
          sx={{
            width: 48,
            height: 48,
            bgcolor: active ? color : "#313338",
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
        bgcolor: "#1e1f22",
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
      <ServerIcon label="Home" active color="#5865f2">
        <HomeRoundedIcon sx={{ color: "#fff", fontSize: 28 }} />
      </ServerIcon>

      <Divider sx={{ width: 32, borderColor: "#35363c", my: 0.5 }} />

      <ServerIcon label="Biology 101" color="#57f287">
        <ScienceRoundedIcon sx={{ color: "#57f287", fontSize: 24 }} />
      </ServerIcon>
      <ServerIcon label="Math 201" color="#fee75c">
        <SchoolRoundedIcon sx={{ color: "#fee75c", fontSize: 24 }} />
      </ServerIcon>

      <Divider sx={{ width: 32, borderColor: "#35363c", my: 0.5 }} />

      <ServerIcon label="Add a Subject" color="#57f287">
        <AddRoundedIcon sx={{ color: "#57f287", fontSize: 28 }} />
      </ServerIcon>
      <ServerIcon label="Explore Public Notes" color="#57f287">
        <ExploreRoundedIcon sx={{ color: "#57f287", fontSize: 24 }} />
      </ServerIcon>
    </Box>
  );
}
