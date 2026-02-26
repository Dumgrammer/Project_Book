"use client";

import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import type { RoomResponse, UpdateRoomRequest } from "../../models/roommodel";

type RoomFormState = {
  r_name: string;
  r_description: string;
  r_tags: string;
  r_is_private: boolean;
  r_max_members: number;
};

function toFormState(room: RoomResponse): RoomFormState {
  return {
    r_name: room.r_name,
    r_description: room.r_description,
    r_tags: room.r_tags.join(", "),
    r_is_private: room.r_is_private,
    r_max_members: room.r_max_members,
  };
}

function toTagArray(raw: string): string[] {
  return raw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

interface EditRoomDialogProps {
  open: boolean;
  room: RoomResponse | null;
  onClose: () => void;
  onSubmit: (roomId: string, payload: UpdateRoomRequest) => Promise<void>;
  isPending: boolean;
}

export default function EditRoomDialog({
  open,
  room,
  onClose,
  onSubmit,
  isPending,
}: EditRoomDialogProps) {
  const [form, setForm] = useState<RoomFormState>({
    r_name: "",
    r_description: "",
    r_tags: "",
    r_is_private: false,
    r_max_members: 8,
  });

  // Sync form state when the room prop changes
  useEffect(() => {
    if (room) {
      setForm(toFormState(room));
    }
  }, [room]);

  async function handleUpdate() {
    if (!room) return;
    await onSubmit(room.id, {
      r_name: form.r_name.trim(),
      r_description: form.r_description.trim(),
      r_tags: toTagArray(form.r_tags),
      r_is_private: form.r_is_private,
      r_max_members: Number(form.r_max_members),
    });
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Edit Room</DialogTitle>
      <DialogContent sx={{ display: "grid", gap: 2, pt: "8px !important" }}>
        <TextField
          label="Room Name"
          value={form.r_name}
          onChange={(e) => setForm((prev) => ({ ...prev, r_name: e.target.value }))}
          size="small"
          required
        />
        <TextField
          label="Description"
          value={form.r_description}
          onChange={(e) => setForm((prev) => ({ ...prev, r_description: e.target.value }))}
          size="small"
          multiline
          minRows={3}
        />
        <TextField
          label="Tags (comma separated)"
          value={form.r_tags}
          onChange={(e) => setForm((prev) => ({ ...prev, r_tags: e.target.value }))}
          size="small"
        />
        <TextField
          label="Max Members"
          type="number"
          value={form.r_max_members}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, r_max_members: Number(e.target.value || 1) }))
          }
          size="small"
          inputProps={{ min: 1, max: 100 }}
        />
        <FormControlLabel
          control={
            <Switch
              checked={form.r_is_private}
              onChange={(e) => setForm((prev) => ({ ...prev, r_is_private: e.target.checked }))}
            />
          }
          label="Private room"
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleUpdate}
          disabled={!form.r_name.trim() || isPending}
        >
          {isPending ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
