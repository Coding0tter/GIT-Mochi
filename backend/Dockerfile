FROM oven/bun
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install
COPY . .
EXPOSE 5000
CMD ["bun", "run", "--watch", "index.ts"]
