FROM oven/bun
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --production=false
COPY . .
EXPOSE 3005
CMD ["bun", "start", "--host"]
