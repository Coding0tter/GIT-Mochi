import React, { useEffect, useRef } from "react";

export function MochiBlob() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let time = 0;
    const color = "#FFC0CB"; // Light pink color

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = color;
      ctx.beginPath();

      const w = canvas.width;
      const h = canvas.height;
      const scale = Math.min(w, h) * 0.3;

      for (let i = 0; i < 360; i++) {
        const angle = (i * Math.PI) / 180;
        const x =
          w / 2 +
          Math.cos(angle) * scale * (1 + Math.sin(time + i * 0.05) * 0.1);
        const y =
          h / 2 +
          Math.sin(angle) * scale * (1 + Math.sin(time + i * 0.05) * 0.1);

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.closePath();
      ctx.fill();

      time += 0.01;
      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10 opacity-20"
    />
  );
}
