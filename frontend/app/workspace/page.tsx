'use client';

import React, { useState } from 'react';
import { useSlideStore } from '@/store/useSlideStore';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/Workspace/Sidebar';
import { BookOpen, Brain, Network, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import MemorizationMode from '@/components/Workspace/MemorizationMode';
import VisualizationMode from '@/components/Workspace/VisualizationMode';

export default function WorkspacePage() {
    const { slides, currentSlideIndex } = useSlideStore();
    const [mode, setMode] = useState<'read' | 'memorize' | 'visualize'>('read');
    const router = useRouter();

    // Redirect if no slides
    React.useEffect(() => {
        if (slides.length === 0) {
            router.push('/');
        }
    }, [slides, router]);

    if (slides.length === 0) return null;

    const currentSlide = slides[currentSlideIndex];

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
            <Sidebar />

            <main className="flex-1 ml-[300px] relative h-full flex flex-col">
                {/* Top Bar */}
                <header className="h-16 flex items-center justify-between px-8 border-b border-border/20 backdrop-blur-sm z-10">
                    <div className="text-sm text-muted-foreground breadcrumbs">
                        <span className="opacity-50">Workspace</span>
                        <span className="mx-2">/</span>
                        <span className="font-medium text-foreground">{currentSlide?.category || 'General'}</span>
                    </div>
                    <button className="p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground hover:text-foreground">
                        <Share2 className="w-4 h-4" />
                    </button>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto w-full relative">
                    <div className="max-w-5xl mx-auto px-12 py-12 min-h-full flex flex-col">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`${currentSlideIndex}-${mode}`}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.02 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className="w-full h-full flex flex-col justify-center"
                            >
                                {mode === 'read' && (
                                    <div className="space-y-8 max-w-4xl mx-auto w-full">
                                        <h1 className="text-5xl font-bold tracking-tight leading-tight bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
                                            {currentSlide?.title}
                                        </h1>

                                        <div className="space-y-6">
                                            {currentSlide?.points?.map((point, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.1 }}
                                                    className="flex gap-4 items-start group p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5"
                                                >
                                                    <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-indigo-500/50 group-hover:bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.5)] transition-all duration-300" />
                                                    <p className="text-xl text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300 font-light">
                                                        {point}
                                                    </p>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {mode === 'memorize' && (
                                    <MemorizationMode slide={currentSlide} />
                                )}

                                {mode === 'visualize' && (
                                    <div className="h-[600px] w-full">
                                        <VisualizationMode slide={currentSlide} />
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Floating Dock */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
                    <div className="bg-card/80 backdrop-blur-xl border border-white/10 rounded-full p-1.5 flex items-center gap-1 shadow-2xl shadow-black/50">
                        <DockItem
                            active={mode === 'read'}
                            onClick={() => setMode('read')}
                            icon={BookOpen}
                            label="Read"
                        />
                        <DockItem
                            active={mode === 'memorize'}
                            onClick={() => setMode('memorize')}
                            icon={Brain}
                            label="Memorize"
                        />
                        <DockItem
                            active={mode === 'visualize'}
                            onClick={() => setMode('visualize')}
                            icon={Network}
                            label="Visualize"
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}

function DockItem({ active, onClick, icon: Icon, label }: any) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "relative px-6 py-2.5 rounded-full flex items-center gap-2 transition-all duration-300",
                active ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white hover:bg-white/5"
            )}
        >
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">{label}</span>
            {active && (
                <motion.div
                    layoutId="dock-active"
                    className="absolute inset-0 border border-white/20 rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
            )}
        </button>
    );
}
