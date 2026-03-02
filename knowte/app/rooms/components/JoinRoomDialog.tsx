"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import { useJoinRoom } from "../../hooks/rooms";

interface JoinRoomDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function JoinRoomDialog({ open, onClose }: JoinRoomDialogProps) {
  const [roomCode, setRoomCode] = useState("");
  const joinRoom = useJoinRoom();
  const router = useRouter();

  function handleClose() {
    setRoomCode("");
    joinRoom.reset();
    onClose();
  }

  async function handleJoin() {
    const code = roomCode.trim();
    if (!code) return;
    try {
      const result = await joinRoom.mutateAsync(code);
      handleClose();
      router.push(`/rooms/${result.room_id}`);
    } catch {
      // error is surfaced via joinRoom.error
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Join with Room Code</DialogTitle>
      <DialogContent>
        <Typography sx={{ fontSize: 14, color: "text.secondary", mb: 2 }}>
          Enter the room ID or invite code shared by the room owner.
        </Typography>
        {joinRoom.isError && (
          <Alert severity="error" sx={{ mb: 2, fontSize: 13 }}>
            {joinRoom.error.message}
          </Alert>
        )}
        <TextField
          autoFocus
          fullWidth
          placeholder="e.g. 3fa85f64-5717-4562-b3fc-2c963f66afa6"
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
          disabled={!roomCode.trim() || joinRoom.isPending}
          onClick={handleJoin}
          sx={{ fontSize: 13 }}
        >
          {joinRoom.isPending ? "Joining..." : "Join"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
