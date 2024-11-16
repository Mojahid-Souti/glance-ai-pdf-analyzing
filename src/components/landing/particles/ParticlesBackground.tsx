'use client';

import React, { useEffect, useRef } from 'react';

const ParticlesBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    class Particle {
      x: number;
      y: number;
      radius: number;
      speedX: number;
      speedY: number;
      
      constructor(canvasWidth: number, canvasHeight: number) {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.radius = Math.random() * 2 + 1; // Increased base radius
        this.speedX = (Math.random() - 0.5) * 0.8; // Slightly faster movement
        this.speedY = (Math.random() - 0.5) * 0.8;
      }

      draw(context: CanvasRenderingContext2D) {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        // Darker gray color with higher opacity
        context.fillStyle = 'rgba(120, 120, 120, 0.5)';
        context.fill();
      }

      update(canvasWidth: number, canvasHeight: number) {
        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap around screen edges
        if (this.x < 0) this.x = canvasWidth;
        if (this.x > canvasWidth) this.x = 0;
        if (this.y < 0) this.y = canvasHeight;
        if (this.y > canvasHeight) this.y = 0;
      }
    }

    // Increased number of particles
    const particles = Array.from({ length: 200 }, () => 
      new Particle(canvas.width, canvas.height)
    );

    let animationFrameId: number;

    const animate = () => {
      if (!ctx || !canvas) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.update(canvas.width, canvas.height);
        particle.draw(ctx);

        // Check for connections with other particles
        particles.forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Increased connection distance and line opacity
          if (distance < 150) { // Increased connection distance
            ctx.beginPath();
            // Darker lines with higher opacity
            ctx.strokeStyle = `rgba(120, 120, 120, ${0.25 * (1 - distance/150)})`;
            ctx.lineWidth = 1;
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
          }
        });
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  );
};

export default ParticlesBackground;