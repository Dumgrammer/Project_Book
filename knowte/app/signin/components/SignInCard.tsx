"use client";

import * as React from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MuiCard from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import { AxiosError } from "axios";

import ForgotPassword from "./ForgotPassword";
import { GoogleIcon, SitemarkIcon } from "./CustomIcons";
import { useLogin } from "../../hooks/auth";
import { loginSchema } from "../../schemas/authschema";

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  [theme.breakpoints.up("sm")]: {
    width: "450px",
  },
  ...theme.applyStyles("dark", {
    boxShadow:
      "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
  }),
}));

export default function SignInCard() {
  const [emailError, setEmailError] = React.useState("");
  const [passwordError, setPasswordError] = React.useState("");
  const [forgotOpen, setForgotOpen] = React.useState(false);
  const login = useLogin();

  const validate = (email: string, password: string): boolean => {
    const result = loginSchema.safeParse({ email, password });
    if (result.success) {
      setEmailError("");
      setPasswordError("");
      return true;
    }

    const fieldErrors = result.error.flatten().fieldErrors;
    setEmailError(fieldErrors.email?.[0] ?? "");
    setPasswordError(fieldErrors.password?.[0] ?? "");
    return false;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = (form.get("email") as string) ?? "";
    const password = (form.get("password") as string) ?? "";

    if (!validate(email, password)) return;

    login.mutate({ email, password });
  };

  const serverError = React.useMemo(() => {
    if (!login.error) return "";
    if (login.error instanceof AxiosError) {
      const detail = login.error.response?.data?.detail;
      if (typeof detail === "string") return detail;
    }
    return "Something went wrong. Please try again.";
  }, [login.error]);

  return (
    <Card variant="outlined">
      <Box sx={{ display: { xs: "flex", md: "none" } }}>
        <SitemarkIcon />
      </Box>
      <Typography
        component="h1"
        variant="h4"
        sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
      >
        Sign in
      </Typography>

      {serverError && <Alert severity="error">{serverError}</Alert>}

      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        sx={{ display: "flex", flexDirection: "column", width: "100%", gap: 2 }}
      >
        <FormControl>
          <FormLabel htmlFor="email">Email</FormLabel>
          <TextField
            error={!!emailError}
            helperText={emailError}
            id="email"
            type="email"
            name="email"
            placeholder="your@email.com"
            autoComplete="email"
            autoFocus
            required
            fullWidth
            variant="outlined"
          />
        </FormControl>
        <FormControl>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <FormLabel htmlFor="password">Password</FormLabel>
            <Link
              component="button"
              type="button"
              onClick={() => setForgotOpen(true)}
              variant="body2"
              sx={{ alignSelf: "baseline" }}
            >
              Forgot your password?
            </Link>
          </Box>
          <TextField
            error={!!passwordError}
            helperText={passwordError}
            name="password"
            placeholder="••••••"
            type="password"
            id="password"
            autoComplete="current-password"
            required
            fullWidth
            variant="outlined"
          />
        </FormControl>
        <ForgotPassword open={forgotOpen} handleClose={() => setForgotOpen(false)} />
        <FormControlLabel
          control={<Checkbox value="remember" color="primary" />}
          label="Remember me"
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={login.isPending}
          startIcon={login.isPending ? <CircularProgress size={18} color="inherit" /> : undefined}
        >
          {login.isPending ? "Signing in..." : "Sign in"}
        </Button>
        <Typography sx={{ textAlign: "center" }}>
          Don&apos;t have an account?{" "}
          <Link href="/register" variant="body2">
            Sign up
          </Link>
        </Typography>
      </Box>
      <Divider>or</Divider>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={() => alert("Sign in with Google")}
          startIcon={<GoogleIcon />}
        >
          Sign in with Google
        </Button>
      </Box>
    </Card>
  );
}
