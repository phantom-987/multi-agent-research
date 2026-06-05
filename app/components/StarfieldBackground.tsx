"use client";

import { useEffect, useRef } from "react";

export default function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Create stars
    const stars = Array.from({ length: 180 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.2 + 0.2,
      alpha: Math.random(),
      speed: Math.random() * 0.003 + 0.001,
      phase: Math.random() * Math.PI * 2,
    }));

    // Create subtle lines (constellation effect)
    const lineStars = stars.slice(0, 30);

    let t = 0;
    const draw = () => {
      t += 0.008;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw faint connection lines
      ctx.strokeStyle = "rgba(59, 130, 246, 0.06)";
      ctx.lineWidth = 0.5;
      for (let i = 0; i < lineStars.length; i++) {
        for (let j = i + 1; j < lineStars.length; j++) {
          const dx = lineStars[i].x - lineStars[j].x;
          const dy = lineStars[i].y - lineStars[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 160) {
            ctx.beginPath();
            ctx.moveTo(lineStars[i].x, lineStars[i].y);
            ctx.lineTo(lineStars[j].x, lineStars[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw stars
      stars.forEach((s) => {
        const alpha = 0.3 + 0.7 * ((Math.sin(t * s.speed * 200 + s.phase) + 1) / 2);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
      });

      // A few bright "sparkle" stars
      const sparkles = [
        { x: 80, y: 60 },
        { x: 1200, y: 120 },
        { x: 400, y: 40 },
        { x: 950, y: 280 },
      ];
      sparkles.forEach((sp) => {
        if (sp.x > canvas.width) return;
        const alpha = 0.5 + 0.5 * Math.sin(t * 1.5 + sp.x);
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
        // Cross sparkle
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.6})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(sp.x - 6, sp.y);
        ctx.lineTo(sp.x + 6, sp.y);
        ctx.moveTo(sp.x, sp.y - 6);
        ctx.lineTo(sp.x, sp.y + 6);
        ctx.stroke();
      });

      animationId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <>
      {/* Canvas starfield */}
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      {/* Planet orb */}
      <div className="planet-orb" />
    </>
  );
}