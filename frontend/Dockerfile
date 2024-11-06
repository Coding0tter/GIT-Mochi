FROM oven/bun
WORKDIR /app

# Copy only the package.json and bun.lockb first
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install

# Copy the rest of your application code
COPY . .

# Expose the application port
EXPOSE 3005

# Start the application
CMD ["bun", "start", "--host"]
