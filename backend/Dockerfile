# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package configuration files if they exist
COPY package*.json ./

# Force install express and mysql2 so the server has its core requirements
RUN npm install express mysql2 dotenv ejs express-session body-parser escape-html bcryptjs

# Copy the rest of your backend application code
COPY . .

# Expose the backend port
EXPOSE 8080

# Command to run the application
CMD ["node", "server.js"]
