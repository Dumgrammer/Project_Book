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
  online: "#23a55a",
  idle: "#f0b232",
  offline: "#80848e",
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
        bgcolor: "#2b2d31",
        height: "100%",
        flexShrink: 0,
        overflowY: "auto",
        borderLeft: "1px solid #1e1f22",
        pt: 2,
        "&::-webkit-scrollbar": { width: 4 },
        "&::-webkit-scrollbar-thumb": { bgcolor: "#1e1f22", borderRadius: 2 },
      }}
    >
      {online.length > 0 && (
        <>
          <Typography
            sx={{
              px: 2,
              fontSize: 11,
              fontWeight: 700,
              color: "#949ba4",
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
                  "&:hover": { bgcolor: "#35373c" },
                }}
              >
                <ListItemAvatar sx={{ minWidth: 40 }}>
                  <Box sx={{ position: "relative", width: 32, height: 32 }}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        fontSize: 14,
                        bgcolor: m.bot ? "#5865f2" : "#747f8d",
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
                        border: "3px solid #2b2d31",
                      }}
                    />
                  </Box>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Typography sx={{ fontSize: 14, fontWeight: 500, color: m.bot ? "#5865f2" : "#949ba4" }}>
                        {m.name}
                      </Typography>
                      {m.bot && (
                        <Box
                          sx={{
                            bgcolor: "#5865f2",
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
              color: "#949ba4",
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
                  <Avatar sx={{ width: 32, height: 32, fontSize: 14, bgcolor: "#747f8d" }}>
                    {m.name.charAt(0)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={m.name}
                  primaryTypographyProps={{ fontSize: 14, color: "#949ba4" }}
                />
              </ListItemButton>
            ))}
          </List>
        </>
      )}
    </Box>
  );
}
