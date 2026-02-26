"use client";

import { useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import type { CreateRoomRequest } from "../../models/roommodel";

type RoomFormState = {
  r_name: string;
  r_description: string;
  r_tags: string;
  r_is_private: boolean;
  r_max_members: number;
};

const initialFormState: RoomFormState = {
  r_name: "",
  r_description: "",
  r_tags: "",
  r_is_private: false,
  r_max_members: 8,
};

function toTagArray(raw: string): string[] {
  return raw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

interface CreateRoomDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateRoomRequest) => Promise<void>;
  isPending: boolean;
}

export default function CreateRoomDialog({
  open,
  onClose,
  onSubmit,
  isPending,
}: CreateRoomDialogProps) {
  const [form, setForm] = useState<RoomFormState>(initialFormState);

  async function handleCreate() {
    await onSubmit({
      r_name: form.r_name.trim(),
      r_description: form.r_description.trim(),
      r_tags: toTagArray(form.r_tags),
      r_is_private: form.r_is_private,
      r_max_members: Number(form.r_max_members),
    });
    setForm(initialFormState);
  }

  function handleClose() {
    setForm(initialFormState);
    onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Create Room</DialogTitle>
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
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleCreate}
          disabled={!form.r_name.trim() || isPending}
        >
          {isPending ? "Creating..." : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
