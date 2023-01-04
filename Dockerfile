FROM node:lts-bullseye as bot
COPY package*.json ./
RUN npm i
COPY . .
ARG PORT
CMD ["npm", "start"]
