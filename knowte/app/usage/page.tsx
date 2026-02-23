"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import LinearProgress from "@mui/material/LinearProgress";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import TokenRoundedIcon from "@mui/icons-material/TokenRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import QuizRoundedIcon from "@mui/icons-material/QuizRounded";
import StyleRoundedIcon from "@mui/icons-material/StyleRounded";
import StorageRoundedIcon from "@mui/icons-material/StorageRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";

interface UsageStat {
  label: string;
  used: number;
  limit: number;
  unit: string;
  icon: React.ReactNode;
  color: string;
}

const stats: UsageStat[] = [
  { label: "AI Tokens", used: 34_250, limit: 50_000, unit: "tokens", icon: <TokenRoundedIcon />, color: "#4f46e5" },
  { label: "Documents Processed", used: 18, limit: 50, unit: "files", icon: <DescriptionRoundedIcon />, color: "#0891b2" },
  { label: "Quizzes Generated", used: 7, limit: 20, unit: "quizzes", icon: <QuizRoundedIcon />, color: "#d97706" },
  { label: "Flashcard Decks", used: 12, limit: 30, unit: "decks", icon: <StyleRoundedIcon />, color: "#16a34a" },
  { label: "Storage Used", used: 128, limit: 500, unit: "MB", icon: <StorageRoundedIcon />, color: "#7c3aed" },
];

interface DailyUsage {
  day: string;
  tokens: number;
}

const dailyUsage: DailyUsage[] = [
  { day: "Mon", tokens: 6200 },
  { day: "Tue", tokens: 4800 },
  { day: "Wed", tokens: 7100 },
  { day: "Thu", tokens: 3400 },
  { day: "Fri", tokens: 5900 },
  { day: "Sat", tokens: 2100 },
  { day: "Sun", tokens: 4750 },
];

const maxDaily = Math.max(...dailyUsage.map((d) => d.tokens));

interface ActivityItem {
  action: string;
  detail: string;
  tokens: number;
  time: string;
}

const recentActivity: ActivityItem[] = [
  { action: "Summarized", detail: "Chapter 5 — Cellular Biology.pdf", tokens: 2340, time: "2 min ago" },
  { action: "Generated quiz", detail: "Newton's Laws of Motion", tokens: 1820, time: "18 min ago" },
  { action: "Created flashcards", detail: "Organic Chemistry — Alkanes", tokens: 1450, time: "1 hr ago" },
  { action: "Summarized", detail: "World War II — Causes.docx", tokens: 3100, time: "3 hr ago" },
  { action: "Explained concept", detail: "Eigenvalues and Eigenvectors", tokens: 890, time: "5 hr ago" },
  { action: "Generated quiz", detail: "Philippine History — Rizal", tokens: 2010, time: "Yesterday" },
];

function formatNumber(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

function StatCard({ stat }: { stat: UsageStat }) {
  const percent = Math.min((stat.used / stat.limit) * 100, 100);
  const remaining = stat.limit - stat.used;
  const barColor = percent > 90 ? "#ef4444" : percent > 75 ? "#f59e0b" : stat.color;

  return (
    <Card variant="outlined" sx={{ borderColor: "#e2e8f0" }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: `${stat.color}14`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                "& .MuiSvgIcon-root": { fontSize: 22, color: stat.color },
              }}
            >
              {stat.icon}
            </Box>
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: "text.primary" }}>
              {stat.label}
            </Typography>
          </Box>
          <Chip
            label={`${remaining.toLocaleString()} ${stat.unit} left`}
            size="small"
            sx={{
              height: 24,
              fontSize: 11,
              fontWeight: 600,
              bgcolor: percent > 90 ? "#fef2f2" : "#f0fdf4",
              color: percent > 90 ? "#ef4444" : "#16a34a",
            }}
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5, mb: 1 }}>
          <Typography sx={{ fontSize: 28, fontWeight: 700, color: "text.primary" }}>
            {stat.used.toLocaleString()}
          </Typography>
          <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
            / {stat.limit.toLocaleString()} {stat.unit}
          </Typography>
        </Box>

        <LinearProgress
          variant="determinate"
          value={percent}
          sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: "#f1f5f9",
            "& .MuiLinearProgress-bar": { bgcolor: barColor, borderRadius: 4 },
          }}
        />
        <Typography sx={{ fontSize: 12, color: "text.secondary", mt: 0.75, textAlign: "right" }}>
          {percent.toFixed(0)}% used
        </Typography>
      </CardContent>
    </Card>
  );
}

function DailyChart() {
  return (
    <Card variant="outlined" sx={{ borderColor: "#e2e8f0" }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: "text.primary" }}>
            Daily Token Usage
          </Typography>
          <Chip
            icon={<CalendarMonthRoundedIcon sx={{ fontSize: 16 }} />}
            label="This Week"
            size="small"
            variant="outlined"
            sx={{ height: 28, fontSize: 12, borderColor: "#e2e8f0" }}
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1.5, height: 160 }}>
          {dailyUsage.map((d) => {
            const heightPercent = (d.tokens / maxDaily) * 100;
            const isToday = d.day === "Thu";
            return (
              <Box
                key={d.day}
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 0.75,
                  height: "100%",
                  justifyContent: "flex-end",
                }}
              >
                <Typography sx={{ fontSize: 11, color: "text.secondary", fontWeight: 600 }}>
                  {formatNumber(d.tokens)}
                </Typography>
                <Box
                  sx={{
                    width: "100%",
                    maxWidth: 48,
                    height: `${heightPercent}%`,
                    bgcolor: isToday ? "#4f46e5" : "#e0e7ff",
                    borderRadius: "6px 6px 2px 2px",
                    transition: "height 0.4s ease",
                    minHeight: 8,
                    "&:hover": { bgcolor: "#4f46e5", opacity: isToday ? 1 : 0.8 },
                  }}
                />
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: isToday ? 700 : 500,
                    color: isToday ? "primary.main" : "text.secondary",
                  }}
                >
                  {d.day}
                </Typography>
              </Box>
            );
          })}
        </Box>

        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box>
            <Typography sx={{ fontSize: 12, color: "text.secondary" }}>Week total</Typography>
            <Typography sx={{ fontSize: 18, fontWeight: 700, color: "text.primary" }}>
              {dailyUsage.reduce((sum, d) => sum + d.tokens, 0).toLocaleString()} tokens
            </Typography>
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography sx={{ fontSize: 12, color: "text.secondary" }}>Daily average</Typography>
            <Typography sx={{ fontSize: 18, fontWeight: 700, color: "text.primary" }}>
              {formatNumber(Math.round(dailyUsage.reduce((sum, d) => sum + d.tokens, 0) / 7))} tokens
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function RecentActivity() {
  return (
    <Card variant="outlined" sx={{ borderColor: "#e2e8f0" }}>
      <CardContent>
        <Typography sx={{ fontSize: 16, fontWeight: 700, color: "text.primary", mb: 2 }}>
          Recent Activity
        </Typography>
        {recentActivity.map((item, i) => (
          <Box key={i}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                py: 1.25,
              }}
            >
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: "text.primary" }}>
                    {item.action}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 13,
                      color: "text.secondary",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.detail}
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: 11, color: "text.disabled", mt: 0.25 }}>
                  {item.time}
                </Typography>
              </Box>
              <Chip
                label={`${item.tokens.toLocaleString()} tokens`}
                size="small"
                sx={{
                  height: 24,
                  fontSize: 11,
                  fontWeight: 600,
                  bgcolor: "#f1f5f9",
                  color: "text.secondary",
                  ml: 1,
                  flexShrink: 0,
                }}
              />
            </Box>
            {i < recentActivity.length - 1 && <Divider />}
          </Box>
        ))}
      </CardContent>
    </Card>
  );
}

export default function UsagePage() {
  const totalTokens = 50_000;
  const usedTokens = 34_250;
  const resetDate = "March 1, 2026";

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", px: 4, py: 4 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "text.primary", mb: 0.5 }}>
            Usage
          </Typography>
          <Typography sx={{ fontSize: 15, color: "text.secondary" }}>
            Track your token consumption, file limits, and activity.
          </Typography>
        </Box>
        <Chip
          icon={<CalendarMonthRoundedIcon sx={{ fontSize: 16 }} />}
          label={`Resets ${resetDate}`}
          variant="outlined"
          sx={{ height: 32, fontSize: 12, fontWeight: 600, borderColor: "#e2e8f0" }}
        />
      </Box>

      {/* Token overview banner */}
      <Card
        sx={{
          mb: 3,
          background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
          color: "#fff",
        }}
      >
        <CardContent sx={{ py: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
            <Box>
              <Typography sx={{ fontSize: 14, fontWeight: 500, opacity: 0.85, mb: 0.5 }}>
                AI Tokens Remaining
              </Typography>
              <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                <Typography sx={{ fontSize: 42, fontWeight: 800, lineHeight: 1 }}>
                  {(totalTokens - usedTokens).toLocaleString()}
                </Typography>
                <Typography sx={{ fontSize: 16, opacity: 0.7 }}>
                  / {totalTokens.toLocaleString()}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography sx={{ fontSize: 14, fontWeight: 500, opacity: 0.85 }}>
                {((usedTokens / totalTokens) * 100).toFixed(0)}% used this month
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(usedTokens / totalTokens) * 100}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  mt: 1,
                  width: 200,
                  bgcolor: "rgba(255,255,255,0.2)",
                  "& .MuiLinearProgress-bar": { bgcolor: "#fff", borderRadius: 5 },
                }}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Stats grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" },
          gap: 2,
          mb: 3,
        }}
      >
        {stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </Box>

      {/* Charts row */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
          gap: 2,
        }}
      >
        <DailyChart />
        <RecentActivity />
      </Box>
    </Box>
  );
}
