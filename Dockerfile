# Development Dockerfile for hot reloading
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first
# This helps Docker cache dependencies if only source code changes
COPY package.json package-lock.json ./

# Install project dependencies
RUN npm install

# Expose port 5173 for Vite development server
EXPOSE 5173

# Start the development server with hot reloading
# The source code will be mounted as a volume from docker-compose
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
