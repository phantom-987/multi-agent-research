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

    const stars = Array.from({ length: 180 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.2 + 0.2,
      speed: Math.random() * 0.003 + 0.001,
      phase: Math.random() * Math.PI * 2,
    }));

    const lineStars = stars.slice(0, 30);
    let t = 0;

    const draw = () => {
      t += 0.008;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

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

      stars.forEach((s) => {
        const alpha = 0.3 + 0.7 * ((Math.sin(t * s.speed * 200 + s.phase) + 1) / 2);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
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
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          display: "block",
        }}
      />
      {/* Planet orb */}
      <div
        style={{
          position: "absolute",
          top: -80,
          right: -80,
          width: 420,
          height: 420,
          borderRadius: "50%",
          background: "radial-gradient(circle at 35% 35%, #1e3a6e 0%, #0f1f4a 30%, #060d1f 65%, transparent 100%)",
          boxShadow: "0 0 80px rgba(56,100,220,0.25), 0 0 160px rgba(30,60,150,0.12)",
          animation: "planetFloat 8s ease-in-out infinite",
        }}
      />
    </div>
  );
}