FROM oven/bun
WORKDIR /app
COPY package.json ./
RUN bun install
COPY . .
EXPOSE 5000
CMD ["bun", "run", "--watch", "index.ts"]
