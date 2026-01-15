'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Check, X, Trophy, ArrowRight, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Slide, useSlideStore } from '@/store/useSlideStore'; // Import Store
import { cn } from '@/lib/utils';
import api from '@/lib/api';

interface MemorizationModeProps {
    slide: Slide;
}

export default function MemorizationMode({ slide }: MemorizationModeProps) {
    const [activeTab, setActiveTab] = useState<'flashcard' | 'quiz'>('flashcard');
    const [aiContent, setAiContent] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Access global store for navigation
    const { currentSlideIndex, slides, setCurrentSlideIndex } = useSlideStore();

    // Fetch AI content on key change (slide change)
    useEffect(() => {
        const fetchAiContent = async () => {
            // Basic cache check (if we already fetched for this slide in a real app, we'd check a cache)
            // Here we just fetch fresh
            setLoading(true);
            try {
                const res = await api.post(`/mcp/memorize/${slide.slide_no}`, {
                    raw_text: slide.raw_text,
                    category: slide.category,
                    session_id: "default"
                });
                if (res.data?.output) {
                    setAiContent(res.data.output);
                } else {
                    setAiContent(null);
                }
            } catch (e) {
                console.error("Failed to fetch AI memorization", e);
                setAiContent(null);
            } finally {
                setLoading(false);
            }
        };
        fetchAiContent();
    }, [slide]);


    const handlePrev = () => {
        if (currentSlideIndex > 0) setCurrentSlideIndex(currentSlideIndex - 1);
    };

    const handleNext = () => {
        if (currentSlideIndex < slides.length - 1) setCurrentSlideIndex(currentSlideIndex + 1);
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6 relative pb-20"> {/* pb-20 for nav bar */}
            {/* Mode Switcher */}
            <div className="flex justify-center p-1 bg-secondary/50 rounded-full w-fit mx-auto backdrop-blur-sm border border-border">
                <button
                    onClick={() => setActiveTab('flashcard')}
                    className={cn(
                        "px-6 py-2 rounded-full text-sm font-medium transition-all",
                        activeTab === 'flashcard' ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    Flashcards
                </button>
                <button
                    onClick={() => setActiveTab('quiz')}
                    className={cn(
                        "px-6 py-2 rounded-full text-sm font-medium transition-all",
                        activeTab === 'quiz' ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    AI Quiz
                </button>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'flashcard' ? (
                    <FlashcardView key={`flash-${slide.slide_no}`} slide={slide} aiContent={aiContent} loading={loading} />
                ) : (
                    <QuizView key={`quiz-${slide.slide_no}`} slide={slide} aiContent={aiContent} />
                )}
            </AnimatePresence>

            {/* Navigation Bar - Moved to Bottom Right to avoid dock overlap */}
            <div className="fixed bottom-8 right-12 flex items-center gap-4 z-50">
                <button
                    onClick={handlePrev}
                    disabled={currentSlideIndex === 0}
                    className="p-3 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                    title="Previous Slide"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                <span className="text-sm font-medium text-muted-foreground bg-zinc-900/80 backdrop-blur px-3 py-1 rounded-full border border-zinc-800">
                    {currentSlideIndex + 1} / {slides.length}
                </span>

                <button
                    onClick={handleNext}
                    disabled={currentSlideIndex === slides.length - 1}
                    className="p-3 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                    title="Next Slide"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}

// Sub-component: Flashcard
function FlashcardView({ slide, aiContent, loading }: { slide: Slide, aiContent: string | null, loading: boolean }) {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
        >
            <div className="text-center space-y-1">
                <h2 className="text-2xl font-bold tracking-tight">Concept Review</h2>
                <p className="text-sm text-muted-foreground">Tap card to flip</p>
            </div>

            <div
                className="perspective-1000 h-[450px] w-full relative group cursor-pointer"
                onClick={() => setIsFlipped(!isFlipped)}
            >
                <motion.div
                    className="w-full h-full relative preserve-3d transition-all duration-500"
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    {/* Front */}
                    <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-[2rem] p-10 flex flex-col items-center justify-center text-center shadow-2xl hover:border-indigo-500/50 transition-colors">
                        {/* Removed fixed height icon container for better flex layout */}
                        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 border border-indigo-500/20">
                            <Brain className="w-7 h-7 text-indigo-400" />
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-4 leading-snug">
                            {slide.title}
                        </h3>
                        <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold flex items-center gap-2 mt-auto">
                            Front Side <ArrowRight className="w-3 h-3" />
                        </p>
                    </div>

                    {/* Back */}
                    <div
                        className="absolute inset-0 backface-hidden bg-indigo-950/20 border border-indigo-500/30 rounded-[2rem] p-8 flex flex-col items-start justify-start shadow-[0_0_50px_-12px_rgba(99,102,241,0.15)] overflow-y-auto"
                        style={{ transform: 'rotateY(180deg)', background: 'linear-gradient(145deg, #18181b 0%, #09090b 100%)' }}
                    >
                        {loading ? (
                            <div className="w-full h-full flex flex-col items-center justify-center text-indigo-400 gap-3 animate-pulse">
                                <Brain className="w-8 h-8" />
                                <span className="text-sm">Analysing Slide...</span>
                            </div>
                        ) : (
                            <div className="space-y-5 text-left w-full h-full overflow-y-auto pr-2 custom-scrollbar">
                                <div>
                                    <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3 border-b border-indigo-500/20 pb-1">Core Concepts</h4>
                                    <ul className="space-y-2.5">
                                        {slide.points.slice(0, 4).map((p, i) => (
                                            <li key={i} className="flex gap-3 text-zinc-300 text-sm leading-relaxed">
                                                <span className="text-indigo-500 mt-0.5">•</span>
                                                <span>{p}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                {aiContent && (
                                    <div className="p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/10">
                                        <h4 className="text-xs font-bold text-indigo-300 mb-2 flex items-center gap-2">
                                            <HelpCircle className="w-3 h-3" /> AI Summary
                                        </h4>
                                        <div className="text-sm text-zinc-400 leading-relaxed whitespace-pre-line">
                                            {/* Basic cleanup to show just the summary part if structured */}
                                            {aiContent.length > 300 ? aiContent.substring(0, 300) + "..." : aiContent}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}

// Sub-component: Quiz
function QuizView({ slide, aiContent }: { slide: Slide, aiContent: string | null }) {
    const [currentQ, setCurrentQ] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [selected, setSelected] = useState<number | null>(null);
    const [history, setHistory] = useState<Record<number, number | null>>({}); // Track selected answer index per question

    // Generate questions
    // Generate questions
    const questions = React.useMemo(() => {
        // 1. Try parsing AI content first
        if (aiContent) {
            const aiQuestions = [];
            // Robust regex to split questions. 
            // Handles "Question:", "**Question:**", "1. Question:", etc.
            // (?:^|\n) = start of string or new line
            // (?:\d+[).]\s*)? = optional numbering like "1)" or "1."
            // (?:\*\*|#+\s*)? = optional markdown like "**" or "### "
            // Question: = literal text
            const questionBlocks = aiContent.split(/(?:^|\n)(?:\d+[).]\s*)?(?:\*\*|#+\s*)?Question:/gi).slice(1);

            for (const block of questionBlocks) {
                try {
                    // Regex for Options (A, B, C) and Correct Answer
                    // Matches "A)", "A.", "A " etc.
                    const qSep = /\s+A[).]\s+/;
                    const aSep = /\s+B[).]\s+/;
                    const bSep = /\s+C[).]\s+/;
                    const cSep = /\s+Correct Answer:\s*/i;

                    const qParts = block.split(qSep);
                    const qText = qParts[0].trim();
                    const afterQ = qParts[1] || "";

                    const aParts = afterQ.split(aSep);
                    const optionA = aParts[0].trim();
                    const afterA = aParts[1] || "";

                    const bParts = afterA.split(bSep);
                    const optionB = bParts[0].trim();
                    const afterB = bParts[1] || "";

                    const cParts = afterB.split(cSep);
                    const optionC = cParts[0].trim();
                    const correctRaw = cParts[1]?.trim().split('\n')[0] || "";

                    if (qText && optionA && optionB && optionC) {
                        // Determine correct option text based on "Correct Answer" string
                        let correctOpt = optionA;
                        const cr = correctRaw.toLowerCase();
                        if (cr.includes("b)") || cr.includes("b.") || correctRaw.includes(optionB)) correctOpt = optionB;
                        if (cr.includes("c)") || cr.includes("c.") || correctRaw.includes(optionC)) correctOpt = optionC;

                        aiQuestions.push({
                            q: qText,
                            options: [optionA, optionB, optionC],
                            correct: correctOpt
                        });
                    }
                } catch (e) {
                    // console.error("Parse error for block:", block, e);
                }
            }

            if (aiQuestions.length > 0) return aiQuestions;
        }

        // 2. Fallback to simplistic slide-based generation
        if (!slide.points.length) return [];
        return [
            {
                q: `What is the main topic of "${slide.title}"?`,
                options: [
                    slide.points[0] || "Concept A",
                    "Random unrelated fact",
                    "Another wrong answer",
                    "Something else"
                ].sort(() => Math.random() - 0.5),
                correct: slide.points[0] || "Concept A"
            },
            {
                q: "Which statement is accurate regarding this slide?",
                options: [
                    "It is purely fictional",
                    slide.points[1] || "It is a key concept",
                    slide.points[Math.min(2, slide.points.length - 1)] || "It involves specific steps",
                    "None of the above"
                ].sort(() => Math.random() - 0.5),
                correct: slide.points[1] || "It is a key concept"
            },
            {
                q: "True or False: This topic relates to " + (slide.category || "general knowledge") + "?",
                options: ["True", "False"],
                correct: "True"
            }
        ];
    }, [slide, aiContent]);

    const handleAnswer = (option: string, correct: string, idx: number) => {
        if (selected !== null) return; // Prevent change once answered
        setSelected(idx);

        // Save history
        setHistory(prev => ({ ...prev, [currentQ]: idx }));

        if (option === correct) {
            // Only increment score if first attempt (simplified logic here)
            if (history[currentQ] === undefined) setScore(s => s + 1);
        }

        // Auto-advance disabled - user must click Next
    };

    const nextQuestion = () => {
        if (currentQ < questions.length - 1) {
            setCurrentQ(c => c + 1);
            // Restore selection if previously answered
            const prevAns = history[currentQ + 1];
            setSelected(prevAns !== undefined && prevAns !== null ? prevAns : null);
        } else {
            setShowResult(true);
        }
    };

    const prevQuestion = () => {
        if (currentQ > 0) {
            setCurrentQ(c => c - 1);
            // Restore selection
            const prevAns = history[currentQ - 1];
            setSelected(prevAns !== undefined && prevAns !== null ? prevAns : null);
        }
    };

    if (!questions.length) return <div className="text-center p-10 text-muted-foreground">Not enough content to generate a quiz.</div>;

    if (showResult) {
        return (
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-20 bg-card border border-border rounded-3xl h-[450px] flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-yellow-500/20">
                    <Trophy className="w-10 h-10 text-yellow-500" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-white">Quiz Complete!</h3>
                <p className="text-muted-foreground mb-8">You scored {score} out of {questions.length}</p>
                <button
                    onClick={() => { setShowResult(false); setCurrentQ(0); setScore(0); setSelected(null); setHistory({}); }}
                    className="px-8 py-2.5 bg-primary text-primary-foreground rounded-full font-medium hover:opacity-90 transition-opacity"
                >
                    Retry Quiz
                </button>
            </motion.div>
        );
    }

    const q = questions[currentQ];

    return (
        <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-xl mx-auto py-6"
        >
            <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Question {currentQ + 1} / {questions.length}</span>
                <span className="text-xs font-bold text-indigo-400 bg-indigo-950/50 px-2 py-1 rounded">Score: {score}</span>
            </div>

            <h3 className="text-xl font-semibold mb-6 leading-relaxed min-h-[60px]">{q.q}</h3>

            <div className="space-y-3 mb-8">
                {q.options.map((opt, idx) => {
                    const isSelected = selected === idx;
                    const isCorrect = opt === q.correct;
                    const showStatus = selected !== null;

                    let bg = "bg-secondary/30 hover:bg-secondary/60";
                    let border = "border-transparent";

                    if (showStatus) {
                        if (isCorrect) {
                            bg = "bg-emerald-500/10";
                            border = "border-emerald-500/50";
                        } else if (isSelected) {
                            bg = "bg-red-500/10";
                            border = "border-red-500/50";
                        }
                    }

                    return (
                        <button
                            key={idx}
                            onClick={() => handleAnswer(opt, q.correct, idx)}
                            disabled={selected !== null}
                            className={cn(
                                "w-full text-left p-4 rounded-xl border transition-all duration-200 flex justify-between items-center",
                                bg, border
                            )}
                        >
                            <span className="text-sm font-medium text-zinc-300">{opt}</span>
                            {showStatus && isCorrect && <Check className="w-4 h-4 text-emerald-500" />}
                            {showStatus && isSelected && !isCorrect && <X className="w-4 h-4 text-red-500" />}
                        </button>
                    );
                })}
            </div>

            {/* Quiz Navigation Controls */}
            <div className="flex justify-between items-center pt-4 border-t border-white/5">
                <button
                    onClick={prevQuestion}
                    disabled={currentQ === 0}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors px-4 py-2 hover:bg-white/5 rounded-lg"
                >
                    <ChevronLeft className="w-4 h-4" /> Previous
                </button>

                <button
                    onClick={nextQuestion}
                    className="flex items-center gap-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
                >
                    {currentQ === questions.length - 1 ? "Finish Quiz" : "Next Question"} <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    );
}
