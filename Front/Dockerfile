FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

ARG WEB_BUILDNUM=local
ARG WEB_COMMNUM=unknown
ENV WEB_BUILDNUM=$WEB_BUILDNUM
ENV WEB_COMMNUM=$WEB_COMMNUM

COPY . .

EXPOSE 8000

CMD [ "node", "server.js" ]
