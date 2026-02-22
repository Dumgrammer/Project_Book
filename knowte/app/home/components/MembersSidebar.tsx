"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import { useCurrentUser } from "../../hooks/auth";

interface Member {
  name: string;
  status: "online" | "idle" | "offline";
  bot?: boolean;
}

const members: Member[] = [
  { name: "Knowte Bot", status: "online", bot: true },
];

const statusColor: Record<string, string> = {
  online: "#16a34a",
  idle: "#ca8a04",
  offline: "#94a3b8",
};

export default function MembersSidebar() {
  const { data: user } = useCurrentUser();
  const displayName = user?.full_name ?? user?.email ?? "User";

  const allMembers: Member[] = [
    ...members,
    { name: displayName, status: "online" },
  ];

  const online = allMembers.filter((m) => m.status !== "offline");
  const offline = allMembers.filter((m) => m.status === "offline");

  return (
    <Box
      sx={{
        width: 240,
        bgcolor: "#f8fafc",
        height: "100%",
        flexShrink: 0,
        overflowY: "auto",
        borderLeft: 1,
        borderColor: "divider",
        pt: 2,
        "&::-webkit-scrollbar": { width: 4 },
        "&::-webkit-scrollbar-thumb": { bgcolor: "#cbd5e1", borderRadius: 2 },
      }}
    >
      {online.length > 0 && (
        <>
          <Typography
            sx={{
              px: 2,
              fontSize: 11,
              fontWeight: 700,
              color: "text.secondary",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              mb: 0.5,
            }}
          >
            Online — {online.length}
          </Typography>
          <List disablePadding>
            {online.map((m) => (
              <ListItemButton
                key={m.name}
                sx={{
                  py: 0.5,
                  px: 2,
                  borderRadius: 1,
                  mx: 1,
                  "&:hover": { bgcolor: "#f1f5f9" },
                }}
              >
                <ListItemAvatar sx={{ minWidth: 40 }}>
                  <Box sx={{ position: "relative", width: 32, height: 32 }}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        fontSize: 14,
                        bgcolor: m.bot ? "primary.main" : "#94a3b8",
                      }}
                    >
                      {m.name.charAt(0)}
                    </Avatar>
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: -2,
                        right: -2,
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        bgcolor: statusColor[m.status],
                        border: "3px solid #f8fafc",
                      }}
                    />
                  </Box>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Typography sx={{ fontSize: 14, fontWeight: 500, color: m.bot ? "primary.main" : "text.secondary" }}>
                        {m.name}
                      </Typography>
                      {m.bot && (
                        <Box
                          sx={{
                            bgcolor: "primary.main",
                            color: "#fff",
                            fontSize: 9,
                            fontWeight: 700,
                            px: 0.5,
                            borderRadius: 0.5,
                            lineHeight: 1.4,
                          }}
                        >
                          BOT
                        </Box>
                      )}
                    </Box>
                  }
                />
              </ListItemButton>
            ))}
          </List>
        </>
      )}

      {offline.length > 0 && (
        <>
          <Typography
            sx={{
              px: 2,
              fontSize: 11,
              fontWeight: 700,
              color: "text.secondary",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              mt: 2,
              mb: 0.5,
            }}
          >
            Offline — {offline.length}
          </Typography>
          <List disablePadding>
            {offline.map((m) => (
              <ListItemButton
                key={m.name}
                sx={{ py: 0.5, px: 2, borderRadius: 1, mx: 1, opacity: 0.5 }}
              >
                <ListItemAvatar sx={{ minWidth: 40 }}>
                  <Avatar sx={{ width: 32, height: 32, fontSize: 14, bgcolor: "#94a3b8" }}>
                    {m.name.charAt(0)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={m.name}
                  primaryTypographyProps={{ fontSize: 14, color: "text.secondary" }}
                />
              </ListItemButton>
            ))}
          </List>
        </>
      )}
    </Box>
  );
}
