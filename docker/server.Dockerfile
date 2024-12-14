FROM oven/bun:latest

WORKDIR /app
COPY . .
RUN bun install
WORKDIR /app/packages/server

CMD ["bun", "dev"]

EXPOSE 6499
EXPOSE 5000