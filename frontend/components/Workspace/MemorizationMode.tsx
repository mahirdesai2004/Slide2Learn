'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Brain, ChevronLeft, ChevronRight, RefreshCw, FileText, Gamepad2, List, Network, CircleHelp, Check, X, Trophy } from 'lucide-react';
import { Slide, useSlideStore } from '@/store/useSlideStore';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import VisualizationMode from './VisualizationMode';
import ReactMarkdown from 'react-markdown';

interface MemorizationModeProps {
    slide: Slide;
}

type Mode = 'memorize' | 'quiz' | 'revise' | 'visualize' | 'game';

const MODES: { id: Mode; label: string; icon: any }[] = [
    { id: 'memorize', label: 'Memorize', icon: Brain },
    { id: 'quiz', label: 'Quiz', icon: CircleHelp },
    { id: 'revise', label: 'Revise', icon: List },
    { id: 'visualize', label: 'Visualize', icon: Network },
    { id: 'game', label: 'Game', icon: Gamepad2 },
];

// Helper to parse the Markdown Quiz
const parseQuizFromMarkdown = (text: string) => {
    try {
        const parts = text.split('ANSWERS:');
        const qBlock = parts[0];
        const aBlock = parts.length > 1 ? parts[1] : '';

        // Extract Answers map (e.g., "1. A", "2. B")
        const answerMap: Record<string, string> = {};
        const ansLines = aBlock.match(/\d+[\.:]\s*[A-D]/gi) || [];
        ansLines.forEach(l => {
            const [num, opt] = l.split(/[\.:]\s*/);
            answerMap[num.trim()] = opt.trim().toUpperCase();
        });

        // Split Questions by "**1." marker
        const chunks = qBlock.split(/\*\*\d+\./g).slice(1);

        return chunks.map((chunk, i) => {
            const lines = chunk.split('\n').map(l => l.trim()).filter(l => l);
            const questionText = lines[0].replace(/\*\*/g, '').trim(); // Remove trailing bold

            // Find options (starting with "- A)" or "A)")
            const options: string[] = [];
            const optionLetters: string[] = [];

            lines.slice(1).forEach(l => {
                const match = l.match(/^[\-\*]?\s*([A-D])[\)\.]\s*(.+)/);
                if (match) {
                    optionLetters.push(match[1].toUpperCase());
                    options.push(match[2]);
                }
            });

            if (options.length < 2) return null;

            const correctLetter = answerMap[(i + 1).toString()];
            const correctIdx = optionLetters.indexOf(correctLetter);

            return {
                id: i,
                question: questionText,
                options,
                correctIndex: correctIdx !== -1 ? correctIdx : 0 // Fallback
            };
        }).filter(q => q !== null);

    } catch (e) {
        return [];
    }
};

// Helper to parse Text Adventure
const parseAdventureFromMarkdown = (text: string) => {
    try {
        const parts = text.split(/ANSWERS:?/i);
        const mainPart = parts[0];
        const answerPart = parts.length > 1 ? parts.slice(1).join('ANSWERS:') : '';

        // Extract Scenario (everything before "What do you do?")
        // Looser match: "What do you do" followed by ? or : or newline
        const scenarioMatch = mainPart.split(/(?:\*\*|#|\s)*What do you do[\?:]*(?:\*\*|\s)*/i);
        const scenario = scenarioMatch[0].trim();

        // Extract Options
        const optionsBlock = scenarioMatch[1] || "";
        const options: { id: string; text: string }[] = [];
        const optLines = optionsBlock.split('\n').filter(l => l.trim());

        optLines.forEach(l => {
            // Match "Option A:", "A)", "**A**", etc.
            const match = l.match(/(?:Option\s+|^\s*)([A-C])[:\)\.]\s*(.+)/i);
            if (match) {
                options.push({ id: match[1].toUpperCase(), text: match[2].replace(/\**/g, '').trim() });
            }
        });

        // Extract Outcomes
        const outcomes: Record<string, string> = {};
        // Split outcomes
        const outcomeRegex = /(?:\*\*|#|\s)*Outcome\s*([A-C])[:\s](?:\*\*|\s)*/i;
        const outcomeParts = answerPart.split(outcomeRegex).slice(1);

        for (let i = 0; i < outcomeParts.length; i += 2) {
            const id = outcomeParts[i].toUpperCase();
            const text = outcomeParts[i + 1]?.trim() || "";
            outcomes[id] = text;
        }

        if (options.length < 2) return null;

        return { scenario, options, outcomes };

    } catch (e) {
        return null;
    }
};

export default function MemorizationMode({ slide }: MemorizationModeProps) {
    const [mode, setMode] = useState<Mode>('memorize');
    const [aiContent, setAiContent] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [contentCache, setContentCache] = useState<Record<string, string>>({});

    const { currentSlideIndex, slides, setCurrentSlideIndex } = useSlideStore();

    const fetchAiContent = useCallback(async (selectedMode: Mode, force: boolean = false) => {
        const cacheKey = `${slide.slide_no}-${selectedMode}`;

        // cache hit
        if (!force && contentCache[cacheKey]) {
            setAiContent(contentCache[cacheKey]);
            return;
        }

        setLoading(true);
        // Clear current content if regenerating/fetching new to show loading state cleanly
        // But if just switching modes and fetching, maybe keep old or show spinner?
        // Let's clear to avoid confusion.
        if (force || !contentCache[cacheKey]) {
            setAiContent(null);
        }

        try {
            const res = await api.post(`/mcp/${selectedMode}/${slide.slide_no}`, {
                raw_text: slide.raw_text,
                category: slide.category,
                session_id: 'demo-user'
            });
            // MCP Spec: Output is ALWAYS formatted TEXT.
            const output = res.data.output || "No content generated.";

            setAiContent(output);
            setContentCache(prev => ({ ...prev, [cacheKey]: output }));

        } catch (e) {
            console.error("MCP Fetch Error", e);
            setAiContent("Failed to generate content. Please ensure backend is running.");
        } finally {
            setLoading(false);
        }
    }, [slide, contentCache]);

    // Fetch on Mode Change OR Slide Change
    useEffect(() => {
        fetchAiContent(mode);
    }, [mode, slide.slide_no, fetchAiContent]); // Only depend on slide_no to avoid object ref issues

    const handleRegenerate = () => {
        fetchAiContent(mode, true);
    };

    const handlePrev = () => {
        if (currentSlideIndex > 0) setCurrentSlideIndex(currentSlideIndex - 1);
    };

    const handleNext = () => {
        if (currentSlideIndex < slides.length - 1) setCurrentSlideIndex(currentSlideIndex + 1);
    };

    // Derived State for Quiz
    const quizQuestions = (mode === 'quiz' && aiContent) ? parseQuizFromMarkdown(aiContent) : [];
    const showInteractiveQuiz = quizQuestions.length > 0;

    const adventureData = (mode === 'game' && aiContent) ? parseAdventureFromMarkdown(aiContent) : null;
    const showAdventure = !!adventureData;

    return (
        <div className="w-full max-w-6xl mx-auto space-y-6 relative pb-24 px-4">

            {/* Mode Selectors */}
            <div className="flex flex-wrap justify-center gap-2 p-1.5 bg-zinc-900/80 backdrop-blur-md rounded-2xl border border-zinc-800 w-fit mx-auto shadow-xl sticky top-4 z-40">
                {MODES.map((m) => {
                    const Icon = m.icon;
                    const isActive = mode === m.id;
                    return (
                        <button
                            key={m.id}
                            onClick={() => setMode(m.id)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                                    : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                            )}
                        >
                            <Icon className="w-4 h-4" />
                            {m.label}
                        </button>
                    );
                })}
            </div>

            {/* Main Content Area */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 min-h-[600px] shadow-2xl relative overflow-hidden">

                {/* Visualizer Handling - Only in Visualize Mode */}
                {mode === 'visualize' && (
                    <div className="mb-8 w-full h-[600px] rounded-2xl overflow-hidden border border-zinc-800">
                        <VisualizationMode slide={slide} />
                    </div>
                )}

                {/* Text Output Header */}
                <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
                    <h2 className="text-xl font-bold text-indigo-400 flex items-center gap-2">
                        {MODES.find(m => m.id === mode)?.label} Mode
                    </h2>
                    <button
                        onClick={handleRegenerate}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors border border-zinc-700 disabled:opacity-50"
                    >
                        <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
                        Regenerate
                    </button>
                </div>

                {/* AI Content Display */}
                <div className="relative min-h-[200px]">
                    {loading ? (
                        <div className="absolute inset-0 flex items-center justify-center space-y-4 flex-col pt-10">
                            <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                            <p className="text-sm text-zinc-500 animate-pulse">Analyzing...</p>
                        </div>
                    ) : showInteractiveQuiz ? (
                        <InteractiveQuiz questions={quizQuestions} />
                    ) : showAdventure ? (
                        <InteractiveAdventure data={adventureData} />
                    ) : (
                        // Fallback Text / Standard View
                        <div className="space-y-6">
                            {(() => {
                                const parts = (aiContent || "Select a mode.").split('ANSWERS:');
                                const mainContent = parts[0];
                                const answersContent = parts.length > 1 ? 'ANSWERS:' + parts.slice(1).join('ANSWERS:') : null;

                                return (
                                    <>
                                        <div className="prose prose-invert max-w-none text-zinc-300 leading-relaxed text-base font-light space-y-4">
                                            <ReactMarkdown>{mainContent}</ReactMarkdown>
                                        </div>

                                        {answersContent && (
                                            <div className="mt-8 border-t border-zinc-800 pt-6">
                                                <details className="group cursor-pointer">
                                                    <summary className="flex items-center gap-2 text-indigo-400 font-medium list-none select-none hover:text-indigo-300 transition-colors">
                                                        <span className="bg-indigo-500/10 p-2 rounded-lg group-open:bg-indigo-500/20 transition-colors">
                                                            Reveal Answers 🕵️‍♂️
                                                        </span>
                                                    </summary>
                                                    <div className="mt-4 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800 prose prose-invert max-w-none text-zinc-400">
                                                        <ReactMarkdown>{answersContent}</ReactMarkdown>
                                                    </div>
                                                </details>
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                        </div>
                    )}
                </div>

            </div>

            {/* Navigation Bar */}
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

// Interactive Adventure Component
function InteractiveAdventure({ data }: { data: any }) {
    const [selected, setSelected] = useState<string | null>(null);

    // Helper to determine sentiment based on text content (Basic keyword check)
    const getVariant = (text: string) => {
        const lower = text.toLowerCase();
        if (lower.includes("fail") || lower.includes("risk") || lower.includes("missed") || lower.includes("wrong")) return "danger";
        if (lower.includes("success") || lower.includes("great") || lower.includes("optimal") || lower.includes("win")) return "success";
        return "neutral";
    };

    const outcomeText = selected ? (data.outcomes[selected] || data.outcomes[selected.toLowerCase()] || "Result not found.") : "";
    const variant = getVariant(outcomeText);

    return (
        <div className="max-w-4xl mx-auto py-6">
            {/* Mission Card */}
            <div className="bg-zinc-900/40 backdrop-blur-md rounded-3xl p-8 border border-zinc-800 shadow-xl mb-10 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500 opacity-50"></div>
                <div className="flex items-center gap-2 mb-4 text-indigo-400 font-bold uppercase tracking-widest text-xs">
                    <Gamepad2 className="w-4 h-4" /> Current Scenario
                </div>
                <div className="prose prose-invert max-w-none text-lg leading-relaxed text-zinc-200">
                    <ReactMarkdown>{data.scenario}</ReactMarkdown>
                </div>
            </div>

            <h3 className="text-center text-xl font-bold text-white mb-8 flex items-center justify-center gap-3">
                <span className="h-px w-12 bg-zinc-800"></span>
                Choose Your Action
                <span className="h-px w-12 bg-zinc-800"></span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data.options.map((opt: any) => {
                    const isSelected = selected === opt.id;
                    return (
                        <button
                            key={opt.id}
                            onClick={() => setSelected(opt.id)}
                            className={cn(
                                "flex flex-col items-center p-6 rounded-2xl border transition-all duration-300 text-center h-full gap-4 group relative overflow-hidden",
                                isSelected
                                    ? "bg-zinc-800 border-indigo-500 ring-2 ring-indigo-500/20"
                                    : "bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 hover:-translate-y-1"
                            )}
                        >
                            <div className={cn(
                                "text-3xl font-black w-12 h-12 flex items-center justify-center rounded-full transition-colors",
                                isSelected ? "bg-indigo-600 text-white" : "bg-zinc-800 text-zinc-600 group-hover:bg-zinc-700 group-hover:text-zinc-400"
                            )}>
                                {opt.id}
                            </div>
                            <span className="font-medium text-sm text-zinc-300 group-hover:text-white leading-snug">{opt.text}</span>
                        </button>
                    );
                })}
            </div>

            {selected && (
                <div className="mt-10 animate-in fade-in zoom-in-95 duration-500">
                    <div className={cn(
                        "p-8 rounded-3xl border shadow-2xl relative overflow-hidden flex flex-col gap-4",
                        variant === 'success' ? "bg-emerald-950/20 border-emerald-500/30" :
                            variant === 'danger' ? "bg-red-950/20 border-red-500/30" :
                                "bg-zinc-900 border-zinc-700"
                    )}>
                        <div className={cn(
                            "absolute top-0 left-0 w-1.5 h-full",
                            variant === 'success' ? "bg-emerald-500" :
                                variant === 'danger' ? "bg-red-500" :
                                    "bg-zinc-500"
                        )}></div>

                        <h4 className={cn(
                            "font-bold text-lg flex items-center gap-2 uppercase tracking-wide",
                            variant === 'success' ? "text-emerald-400" :
                                variant === 'danger' ? "text-red-400" :
                                    "text-zinc-400"
                        )}>
                            {variant === 'success' ? <Check className="w-5 h-5" /> :
                                variant === 'danger' ? <X className="w-5 h-5" /> :
                                    <Gamepad2 className="w-5 h-5" />}
                            Outcome {selected}
                        </h4>

                        <div className="prose prose-invert max-w-none text-zinc-300">
                            <ReactMarkdown>{outcomeText}</ReactMarkdown>
                        </div>

                        <button
                            onClick={() => setSelected(null)}
                            className="mt-4 self-start text-xs font-medium text-zinc-500 hover:text-white flex items-center gap-1 transition-colors px-3 py-1.5 rounded-full bg-black/20 hover:bg-black/40"
                        >
                            <RefreshCw className="w-3 h-3" /> Replay Choice
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// Interactive Quiz Component
function InteractiveQuiz({ questions }: { questions: any[] }) {
    const [currentQ, setCurrentQ] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [selected, setSelected] = useState<number | null>(null);
    const [history, setHistory] = useState<Record<number, number | null>>({});

    const handleAnswer = (idx: number) => {
        if (selected !== null) return;
        setSelected(idx);
        setHistory(prev => ({ ...prev, [currentQ]: idx }));
        if (idx === questions[currentQ].correctIndex) {
            if (history[currentQ] === undefined) setScore(s => s + 1);
        }
    };

    const nextQuestion = () => {
        if (currentQ < questions.length - 1) {
            setCurrentQ(c => c + 1);
            const prev = history[currentQ + 1];
            setSelected(prev !== undefined ? prev : null);
        } else setShowResult(true);
    };

    const prevQuestion = () => {
        if (currentQ > 0) {
            setCurrentQ(c => c - 1);
            const prev = history[currentQ - 1];
            setSelected(prev !== undefined ? prev : null);
        }
    };

    if (showResult) {
        return (
            <div className="text-center py-20 bg-zinc-900/30 rounded-3xl flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
                <Trophy className="w-16 h-16 text-yellow-500 mb-6 drop-shadow-lg" />
                <h3 className="text-3xl font-bold mb-4 text-white">Quiz Complete!</h3>
                <p className="text-zinc-400 mb-8 text-lg">You scored <span className="text-indigo-400 font-bold">{score}</span> out of <span className="text-white">{questions.length}</span></p>
                <button
                    onClick={() => { setShowResult(false); setCurrentQ(0); setScore(0); setSelected(null); setHistory({}); }}
                    className="px-8 py-3 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/25"
                >
                    Retry Quiz
                </button>
            </div>
        );
    }

    const q = questions[currentQ];

    return (
        <div className="max-w-2xl mx-auto py-8">
            <div className="flex justify-between items-center mb-8">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Question {currentQ + 1} / {questions.length}</span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/30 px-3 py-1.5 rounded-full border border-emerald-500/20">Score: {score}</span>
            </div>

            <h3 className="text-xl md:text-2xl font-semibold mb-8 text-white leading-relaxed">{q.question}</h3>

            <div className="space-y-3 mb-10">
                {q.options.map((opt: string, idx: number) => {
                    const isSelected = selected === idx;
                    const isCorrect = idx === q.correctIndex;
                    const showStatus = selected !== null;

                    let classes = "w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 flex justify-between items-center group relative overflow-hidden ";

                    if (showStatus) {
                        if (isCorrect) classes += "bg-emerald-500/10 border-emerald-500/50 text-emerald-100";
                        else if (isSelected) classes += "bg-red-500/10 border-red-500/50 text-red-100";
                        else classes += "bg-zinc-900/40 border-transparent opacity-50";
                    } else {
                        classes += "bg-zinc-900/40 border-transparent hover:bg-zinc-800 hover:border-zinc-700 text-zinc-300";
                    }

                    return (
                        <button
                            key={idx}
                            onClick={() => handleAnswer(idx)}
                            disabled={selected !== null}
                            className={classes}
                        >
                            <span className="text-base font-medium z-10">{opt}</span>
                            {showStatus && isCorrect && <Check className="w-5 h-5 text-emerald-400" />}
                            {showStatus && isSelected && !isCorrect && <X className="w-5 h-5 text-red-400" />}
                        </button>
                    );
                })}
            </div>

            <div className="flex justify-between items-center">
                <button onClick={prevQuestion} disabled={currentQ === 0} className="flex items-center gap-2 text-sm text-zinc-500 hover:text-white disabled:opacity-30 transition-colors px-4 py-2">
                    <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <button onClick={nextQuestion} className="flex items-center gap-2 text-sm font-medium bg-white text-black px-6 py-2.5 rounded-full hover:bg-zinc-200 transition-colors shadow-lg">
                    {currentQ === questions.length - 1 ? "Finish" : "Next"} <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
