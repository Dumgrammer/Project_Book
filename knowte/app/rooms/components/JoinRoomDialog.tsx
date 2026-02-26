"use client";

import { useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

interface JoinRoomDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function JoinRoomDialog({ open, onClose }: JoinRoomDialogProps) {
  const [roomCode, setRoomCode] = useState("");

  function handleClose() {
    setRoomCode("");
    onClose();
  }

  function handleJoin() {
    // TODO: call join-room API with roomCode
    handleClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Join with Room Code</DialogTitle>
      <DialogContent>
        <Typography sx={{ fontSize: 14, color: "text.secondary", mb: 2 }}>
          Enter the invite code shared by the room owner.
        </Typography>
        <TextField
          autoFocus
          fullWidth
          placeholder="e.g. ABC-1234"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
          size="small"
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} sx={{ fontSize: 13 }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={!roomCode.trim()}
          onClick={handleJoin}
          sx={{ fontSize: 13 }}
        >
          Join
        </Button>
      </DialogActions>
    </Dialog>
  );
}
