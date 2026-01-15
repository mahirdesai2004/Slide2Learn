'use client';

import React, { useEffect, useRef } from 'react';

/**
 * InteractiveBackground
 * Renders a canvas with a grid of dots that react to mouse movement.
 * Gives a premium, modern feel without overwhelming the content.
 */
export default function InteractiveBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        let mouseX = -1000;
        let mouseY = -1000;

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            initDots();
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);

        // Dot configuration
        const dots: Dot[] = [];
        const spacing = 20; // Very dense for "dotted background" texture
        const rows = Math.ceil(height / spacing);
        const cols = Math.ceil(width / spacing);

        class Dot {
            x: number;
            y: number;
            baseX: number;
            baseY: number;
            size: number;
            color: string;
            // Ambient motion properties
            angle: number;
            speed: number;
            offset: number;

            constructor(x: number, y: number) {
                this.x = x;
                this.y = y;
                this.baseX = x;
                this.baseY = y;
                this.size = 1.2; // Small, crisp dots
                this.color = 'rgba(56, 189, 248, 0.4)'; // Sky-400, vivid blue

                // Randomize ambient motion (subtle wave)
                this.angle = (x * 0.02) + (y * 0.02); // Wave pattern based on position
                this.speed = 0.005;
                this.offset = 3; // Slight float
            }

            update() {
                // 1. Ambient Motion (Gentle Wave)
                this.angle += this.speed;
                const ambientX = this.baseX + Math.sin(this.angle) * this.offset;
                const ambientY = this.baseY + Math.cos(this.angle) * this.offset;

                // 2. Mouse Interaction (Repulsion)
                const dx = mouseX - ambientX;
                const dy = mouseY - ambientY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const maxDist = 100;

                if (distance < maxDist) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (maxDist - distance) / maxDist;
                    const repulsionStrength = 20;

                    this.x = ambientX - forceDirectionX * force * repulsionStrength;
                    this.y = ambientY - forceDirectionY * force * repulsionStrength;

                    this.color = `rgba(147, 197, 253, ${0.4 + force * 0.6})`; // Bright Blue-300 on hover
                    this.size = 1.5 + force * 1.5;
                } else {
                    this.x = ambientX;
                    this.y = ambientY;
                    this.color = 'rgba(56, 189, 248, 0.4)'; // Return to Sky Blue
                    this.size = 1.2;
                }
            }

            draw() {
                if (!ctx) return;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
        }

        function initDots() {
            dots.length = 0;
            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    dots.push(new Dot(x * spacing, y * spacing));
                }
            }
        }

        initDots();

        function animate() {
            if (!ctx) return;
            // Clear but keep dark blue-tinted background (Slate-950)
            ctx.fillStyle = '#0f172a'; // Slate-900 background
            ctx.fillRect(0, 0, width, height);

            dots.forEach(dot => {
                dot.update();
                dot.draw();
            });

            requestAnimationFrame(animate);
        }

        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-[-1] pointer-events-none"
        />
    );
}
