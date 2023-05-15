FROM node:18.16.0-alpine3.16

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8079

CMD ["node", "index.js"]