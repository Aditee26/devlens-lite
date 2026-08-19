FROM node:20-alpine

RUN apk add --no-cache git

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY src ./src

RUN mkdir -p /tmp/repos && chmod 777 /tmp/repos

EXPOSE 4000

CMD ["node", "src/server.js"]
