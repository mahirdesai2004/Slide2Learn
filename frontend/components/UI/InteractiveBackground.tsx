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

        const handleMouseLeave = () => {
            mouseX = -1000;
            mouseY = -1000;
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseout', handleMouseLeave);

        // Dot configuration
        const dots: Dot[] = [];
        const spacing = 25;
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
                this.size = 1.2;
                this.color = 'rgba(56, 189, 248, 0.4)'; // Sky Blue

                this.angle = (x * 0.02) + (y * 0.02);
                this.speed = 0.005;
                this.offset = 3;
            }

            update() {
                // 1. Calculate Target Position (Base + Ambient Wave)
                this.angle += this.speed;
                const waveX = Math.cos(this.angle) * this.offset;
                const waveY = Math.sin(this.angle) * this.offset;
                const targetX = this.baseX + waveX;
                const targetY = this.baseY + waveY;

                // 2. Calculate Mouse Interaction
                const dx = mouseX - this.x;
                const dy = mouseY - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const maxDist = 120;

                let finalTargetX = targetX;
                let finalTargetY = targetY;
                let targetSize = 1.2;
                let targetColor = 'rgba(56, 189, 248, 0.4)';

                if (distance < maxDist) {
                    const force = (maxDist - distance) / maxDist;
                    const repulsionStrength = 40; // Stronger push
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;

                    // Push away
                    finalTargetX = targetX - forceDirectionX * force * repulsionStrength;
                    finalTargetY = targetY - forceDirectionY * force * repulsionStrength;

                    targetColor = `rgba(147, 197, 253, ${0.4 + force * 0.6})`;
                    targetSize = 1.5 + force * 1.5;
                }

                // 3. Apply "Ripple" Easing (Lerp)
                this.x += (finalTargetX - this.x) * 0.1;
                this.y += (finalTargetY - this.y) * 0.1;
                this.size = targetSize;
                this.color = targetColor;
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
            // Clear but keep dark background
            ctx.fillStyle = '#000000'; // Black background
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
            window.removeEventListener('mouseout', handleMouseLeave);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-[-1] pointer-events-none"
        />
    );
}
