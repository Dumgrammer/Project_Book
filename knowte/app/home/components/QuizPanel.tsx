"use client";

import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Drawer from "@mui/material/Drawer";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import QuizRoundedIcon from "@mui/icons-material/QuizRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import NavigateBeforeRoundedIcon from "@mui/icons-material/NavigateBeforeRounded";
import NavigateNextRoundedIcon from "@mui/icons-material/NavigateNextRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import type { QuizQuestion } from "../../models/quizmodel";
import { useGenerateQuiz } from "../../hooks/quiz";

interface QuizPanelProps {
	open: boolean;
	onClose: () => void;
	documentId: string | null;
	prompt: string | null;
	count?: number;
}

const PANEL_WIDTH = 520;

export default function QuizPanel({
	open,
	onClose,
	documentId,
	prompt,
	count = 10,
}: QuizPanelProps) {
	const generate = useGenerateQuiz();
	const startedRef = useRef(false);
	const prevKeyRef = useRef<string>("");
	const panelKey = `${documentId}-${prompt}-${count}`;

	const [activeIndex, setActiveIndex] = useState(0);
	const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
	const [showResult, setShowResult] = useState(false);

	useEffect(() => {
		if (!open || !documentId || !prompt) return;
		if (panelKey === prevKeyRef.current) return;
		prevKeyRef.current = panelKey;
		startedRef.current = false;
		setActiveIndex(0);
		setSelectedAnswers({});
		setShowResult(false);
	}, [open, documentId, prompt, panelKey]);

	useEffect(() => {
		if (!open || !documentId || !prompt || startedRef.current) return;
		startedRef.current = true;
		void generate.mutateAsync({
			document_id: documentId,
			prompt,
			count: Number.isFinite(count) ? Math.min(Math.max(count, 3), 20) : 10,
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open, documentId, prompt, count]);

	const questions: QuizQuestion[] = generate.data?.questions ?? [];
	const current = questions[activeIndex];

	const answeredCount = Object.keys(selectedAnswers).length;
	const correctCount = questions.reduce((total, question, index) => {
		return selectedAnswers[index] === question.answer ? total + 1 : total;
	}, 0);

	const handleClose = () => {
		onClose();
		startedRef.current = false;
		prevKeyRef.current = "";
		generate.reset();
		setActiveIndex(0);
		setSelectedAnswers({});
		setShowResult(false);
	};

	const handleChooseOption = (option: string) => {
		setSelectedAnswers((prev) => ({ ...prev, [activeIndex]: option }));
	};

	const optionStyle = (option: string) => {
		const selected = selectedAnswers[activeIndex] === option;
		const isCorrect = current?.answer === option;

		if (showResult && isCorrect) {
			return {
				borderColor: "success.main",
				bgcolor: "rgba(16,185,129,0.12)",
			};
		}

		if (showResult && selected && !isCorrect) {
			return {
				borderColor: "error.main",
				bgcolor: "rgba(239,68,68,0.12)",
			};
		}

		if (selected) {
			return {
				borderColor: "primary.main",
				bgcolor: "rgba(79,70,229,0.10)",
			};
		}

		return {
			borderColor: "#e2e8f0",
			bgcolor: "#fff",
		};
	};

	return (
		<Drawer
			anchor="right"
			open={open}
			onClose={handleClose}
			variant="persistent"
			sx={{
				"& .MuiDrawer-paper": {
					width: PANEL_WIDTH,
					maxWidth: "100vw",
					borderLeft: "1px solid #e2e8f0",
					boxShadow: "-4px 0 24px rgba(0,0,0,0.06)",
				},
			}}
		>
			<Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: "#f8fafc" }}>
				<Box
					sx={{
						borderBottom: "1px solid #e2e8f0",
						px: 2.5,
						py: 2,
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
					}}
				>
					<Box sx={{ minWidth: 0, flex: 1 }}>
						<Typography sx={{ fontWeight: 700, fontSize: 18 }}>Quiz</Typography>
						{generate.data && (
							<Chip
								icon={<QuizRoundedIcon sx={{ fontSize: 14 }} />}
								label={`${questions.length} questions`}
								size="small"
								sx={{
									mt: 0.5,
									bgcolor: "rgba(99,102,241,0.08)",
									color: "#4f46e5",
									fontWeight: 600,
									fontSize: 12,
									border: "none",
								}}
							/>
						)}
					</Box>
					<IconButton size="small" onClick={handleClose} sx={{ color: "text.secondary" }}>
						<CloseRoundedIcon sx={{ fontSize: 20 }} />
					</IconButton>
				</Box>

				<Box sx={{ flex: 1, overflow: "auto", px: 2.5, py: 2.5 }}>
					{!documentId || !prompt ? (
						<Card variant="outlined" sx={{ borderColor: "#e2e8f0" }}>
							<CardContent>
								<Typography sx={{ fontWeight: 600, mb: 0.5 }}>Missing data</Typography>
								<Typography sx={{ color: "text.secondary", fontSize: 14 }}>
									Upload a document and use the quiz action.
								</Typography>
							</CardContent>
						</Card>
					) : generate.isPending ? (
						<Box
							sx={{
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								gap: 2,
								py: 8,
							}}
						>
							<CircularProgress size={28} sx={{ color: "#6366f1" }} />
							<Typography sx={{ color: "text.secondary", fontSize: 14 }}>
								Generating quiz...
							</Typography>
						</Box>
					) : generate.isError ? (
						<Card variant="outlined" sx={{ borderColor: "#fecaca", bgcolor: "#fef2f2" }}>
							<CardContent>
								<Typography sx={{ color: "#991b1b", fontWeight: 600, mb: 0.5 }}>
									Failed to generate quiz
								</Typography>
								<Typography sx={{ color: "#7f1d1d", fontSize: 14 }}>{generate.error.message}</Typography>
							</CardContent>
						</Card>
					) : questions.length === 0 ? (
						<Card variant="outlined" sx={{ borderColor: "#e2e8f0" }}>
							<CardContent>
								<Typography sx={{ fontWeight: 600, mb: 0.5 }}>No questions</Typography>
								<Typography sx={{ color: "text.secondary", fontSize: 14 }}>
									The model did not return valid quiz questions.
								</Typography>
							</CardContent>
						</Card>
					) : (
						<Stack spacing={2}>
							<Card variant="outlined" sx={{ borderColor: "#e2e8f0", borderRadius: 3 }}>
								<CardContent>
									<Typography sx={{ fontSize: 13, color: "text.secondary", mb: 1 }}>
										Question {activeIndex + 1} of {questions.length}
									</Typography>
									<Typography sx={{ fontWeight: 700, fontSize: 17, lineHeight: 1.5 }}>{current.question}</Typography>
								</CardContent>
							</Card>

							<Stack spacing={1}>
								{current.options.map((option, index) => (
									<Button
										key={`${option}-${index}`}
										variant="outlined"
										onClick={() => handleChooseOption(option)}
										disabled={showResult}
										sx={{
											justifyContent: "flex-start",
											textAlign: "left",
											textTransform: "none",
											py: 1.25,
											px: 1.5,
											borderRadius: 2,
											color: "text.primary",
											...optionStyle(option),
										}}
									>
										{option}
									</Button>
								))}
							</Stack>

							{showResult && (
								<Card variant="outlined" sx={{ borderColor: "#d1fae5", bgcolor: "#f0fdf4" }}>
									<CardContent>
										<Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
											<CheckCircleRoundedIcon sx={{ color: "success.main", fontSize: 20 }} />
											<Typography sx={{ color: "#065f46", fontWeight: 700 }}>Correct answer</Typography>
										</Box>
										<Typography sx={{ color: "#065f46", fontSize: 14 }}>{current.answer}</Typography>
										{current.explanation && (
											<Typography sx={{ mt: 1, color: "#047857", fontSize: 13 }}>
												{current.explanation}
											</Typography>
										)}
									</CardContent>
								</Card>
							)}

							<Box
								sx={{
									display: "flex",
									alignItems: "center",
									justifyContent: "space-between",
									gap: 1,
									pt: 0.5,
								}}
							>
								<IconButton
									size="small"
									disabled={activeIndex === 0}
									onClick={() => setActiveIndex((i) => i - 1)}
									sx={{
										bgcolor: "#e2e8f0",
										"&:hover": { bgcolor: "#cbd5e1" },
										"&.Mui-disabled": { bgcolor: "#f1f5f9" },
									}}
								>
									<NavigateBeforeRoundedIcon />
								</IconButton>

								<Typography sx={{ fontSize: 13, color: "text.secondary", fontWeight: 600 }}>
									Answered {answeredCount}/{questions.length}
								</Typography>

								<IconButton
									size="small"
									disabled={activeIndex === questions.length - 1}
									onClick={() => setActiveIndex((i) => i + 1)}
									sx={{
										bgcolor: "#e2e8f0",
										"&:hover": { bgcolor: "#cbd5e1" },
										"&.Mui-disabled": { bgcolor: "#f1f5f9" },
									}}
								>
									<NavigateNextRoundedIcon />
								</IconButton>
							</Box>

							<Box sx={{ display: "flex", gap: 1 }}>
								<Button
									fullWidth
									variant="contained"
									onClick={() => setShowResult(true)}
									disabled={!selectedAnswers[activeIndex]}
								>
									Check answer
								</Button>
								<Button
									fullWidth
									variant="outlined"
									onClick={() => {
										setShowResult(true);
										setActiveIndex(0);
									}}
									disabled={answeredCount === 0}
								>
									Finish quiz
								</Button>
							</Box>

							{showResult && (
								<Card variant="outlined" sx={{ borderColor: "#e2e8f0", bgcolor: "#ffffff" }}>
									<CardContent>
										<Typography sx={{ fontWeight: 700, mb: 0.5 }}>Score</Typography>
										<Typography sx={{ color: "text.secondary", fontSize: 14 }}>
											{correctCount} correct out of {questions.length}
										</Typography>
									</CardContent>
								</Card>
							)}
						</Stack>
					)}
				</Box>
			</Box>
		</Drawer>
	);
}

