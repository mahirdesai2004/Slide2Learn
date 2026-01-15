'use client';

import React from 'react';
import { useSlideStore } from '@/store/useSlideStore';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ChevronRight, FileText } from 'lucide-react';

export default function Sidebar() {
    const { slides, currentSlideIndex, setCurrentSlideIndex } = useSlideStore();

    return (
        <aside className="w-[300px] h-screen border-r border-border bg-card/50 backdrop-blur-xl flex flex-col fixed left-0 top-0 overflow-hidden z-10">
            <div className="p-6 border-b border-border/50">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Slides
                </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-hide">
                {slides.map((slide, idx) => {
                    const isActive = currentSlideIndex === idx;
                    return (
                        <motion.button
                            key={idx}
                            onClick={() => setCurrentSlideIndex(idx)}
                            initial={false}
                            animate={{
                                backgroundColor: isActive ? "var(--accent)" : "transparent",
                                color: isActive ? "var(--foreground)" : "var(--muted-foreground)",
                            }}
                            whileHover={{
                                backgroundColor: isActive ? "var(--accent)" : "rgba(39, 39, 42, 0.5)",
                                x: 4
                            }}
                            className={cn(
                                "w-full text-left px-4 py-3 rounded-lg text-sm transition-all duration-200 group relative overflow-hidden flex items-start gap-3"
                            )}
                        >
                            <span className={cn(
                                "font-mono text-xs mt-0.5 min-w-[1.5rem]",
                                isActive ? "text-primary" : "text-muted-foreground/50"
                            )}>
                                {String(slide.slide_no).padStart(2, '0')}
                            </span>
                            <span className="line-clamp-2 leading-relaxed">
                                {slide.title || 'Untitled Slide'}
                            </span>

                            {isActive && (
                                <motion.div
                                    layoutId="active-indicator"
                                    className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full"
                                />
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </aside>
    );
}
