document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("mochiBlob");
  const ctx = canvas.getContext("2d");

  let time = 0;
  const color = "rgba(255, 159, 243, 0.3)";

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function animate() {
    time += 0.05;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Create blob shape
    ctx.beginPath();
    const points = 6;
    const radius = Math.min(canvas.width, canvas.height) * 0.2;
    for (let i = 0; i < points * 2; i++) {
      const angle = (i / points) * Math.PI;
      const x =
        canvas.width / 2 +
        Math.cos(angle) * radius * (1 + Math.sin(time + i) * 0.1);
      const y =
        canvas.height / 2 +
        Math.sin(angle) * radius * (1 + Math.cos(time + i) * 0.1);
      ctx.lineTo(x, y);
    }
    ctx.closePath();

    // Fill blob
    ctx.fillStyle = color;
    ctx.fill();

    requestAnimationFrame(animate);
  }

  window.addEventListener("resize", resize);
  resize();
  animate();
});
