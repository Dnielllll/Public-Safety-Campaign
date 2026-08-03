# Use an official Node.js runtime as base image
FROM node:18

# Set working directory inside container
WORKDIR /app

# Copy package files first (for caching)
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your backend code
COPY backend/ .

# Expose the port your app runs on
EXPOSE 3000

# Command to start the app
CMD ["npm", "start"]
