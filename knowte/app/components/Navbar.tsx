"use client";

import { useState } from "react";
import Link from "next/link";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Drawer from "@mui/material/Drawer";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

import { navLinks } from "../data/navLinks";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AppBar position="fixed" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: "divider" }}>
      <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, md: 6, lg: 10 } }}>
        <Typography component={Link} href="/" variant="h6" color="primary" sx={{ fontWeight: 700, textDecoration: "none" }}>
          Knowte
        </Typography>

        <Stack direction="row" spacing={3} sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}>
          {navLinks.map((link) => (
            <Button key={link.name} href={link.href} color="inherit" sx={{ color: "text.secondary", "&:hover": { color: "primary.main" } }}>
              {link.name}
            </Button>
          ))}
        </Stack>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <Link href="/signin">
            <Button variant="outlined" color="primary" sx={{ display: { xs: "none", md: "inline-flex" } }}>
              Sign in
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="contained" color="primary" sx={{ display: { xs: "none", md: "inline-flex" } }}>
              Get started
            </Button>
          </Link>
          <IconButton onClick={() => setMobileOpen(true)} sx={{ display: { md: "none" } }}>
            <MenuIcon />
          </IconButton>
        </Stack>
      </Toolbar>

      <Drawer anchor="top" open={mobileOpen} onClose={() => setMobileOpen(false)} sx={{ display: { md: "none" } }}>
        <Box sx={{ p: 3, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <IconButton onClick={() => setMobileOpen(false)} sx={{ alignSelf: "flex-end" }}>
            <CloseIcon />
          </IconButton>
          {navLinks.map((link) => (
            <Button key={link.name} href={link.href} onClick={() => setMobileOpen(false)} color="inherit" fullWidth>
              {link.name}
            </Button>
          ))}
          <Button variant="outlined" color="primary" fullWidth>Sign in</Button>
          <Button variant="contained" color="primary" fullWidth>Get started</Button>
        </Box>
      </Drawer>
    </AppBar>
  );
}
