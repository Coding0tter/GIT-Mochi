FROM oven/bun:latest 

WORKDIR /app
COPY . .
RUN bun install
WORKDIR /app/packages/client

CMD ["bunx", "vite"]
EXPOSE 3005