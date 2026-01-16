'use client';

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileType, Loader2, Sparkles } from 'lucide-react';
import { useSlideStore } from '@/store/useSlideStore';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import InteractiveBackground from '../UI/InteractiveBackground';

export default function FileUploader() {
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { setSlides, setIsLoading, isLoading } = useSlideStore();
    const router = useRouter();

    const handleFile = async (file: File) => {
        if (!file.name.endsWith('.pptx')) {
            alert('Please upload a .pptx file');
            return;
        }

        setIsLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            // Simulate "rich" processing delay for effect if needed, but actual API is fast
            const response = await api.post('/upload-ppt', formData);
            setSlides(response.data.slides, response.data.filename);
            router.push('/workspace');
        } catch (error) {
            console.error('Upload failed', error);
            alert('Upload failed. Please ensure the backend is running and reachable.');
        } finally {
            setIsLoading(false);
        }
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files?.[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center min-h-[60vh] relative z-10">
            <InteractiveBackground />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-center mb-10"
            >


                <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-b from-foreground to-muted-foreground bg-clip-text text-transparent mb-4">
                    Slide2Learn
                </h1>
                <p className="text-muted-foreground text-lg max-w-md mx-auto">
                    Transform your presentations into interactive learning experiences.
                </p>
            </motion.div>

            <motion.div
                layout
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={onDrop}
                whileHover={{ scale: 1.01, borderColor: "var(--foreground)" }}
                whileTap={{ scale: 0.98 }}
                animate={{
                    borderColor: isDragOver ? "var(--foreground)" : "var(--border)",
                    backgroundColor: isDragOver ? "var(--secondary)" : "var(--card)",
                }}
                className={cn(
                    "relative w-full aspect-[2/1] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-colors duration-300",
                    isLoading && "pointer-events-none opacity-50"
                )}
            >
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div
                            key="loader"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center gap-4"
                        >
                            <Loader2 className="w-10 h-10 text-primary animate-spin" />
                            <p className="text-sm text-muted-foreground font-medium">Processing Slides...</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="content"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center gap-4 p-8"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-2 shadow-inner">
                                <Upload className="w-8 h-8 text-foreground" />
                            </div>
                            <div className="space-y-1 text-center">
                                <p className="text-lg font-medium text-foreground">
                                    Drop your PPTX here
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    or click to browse
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Background Grid Pattern for texture */}
                <div className="absolute inset-0 z-[-1] opacity-[0.03]"
                    style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                />

                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".pptx"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 flex items-center gap-6 text-sm text-muted-foreground"
            >
                <div className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-zinc-500" />
                    <span>Smart Parsing</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-zinc-500" />
                    <span>Interactive Modes</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-zinc-500" />
                    <span>Visual Learning</span>
                </div>
            </motion.div>
        </div>
    );
}
