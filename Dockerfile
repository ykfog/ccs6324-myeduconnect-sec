FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./

# Force install all the required web dependencies
RUN npm install express mysql2 dotenv ejs express-session body-parser escape-html bcryptjs

COPY . .
EXPOSE 8080
CMD ["node", "app.js"]
