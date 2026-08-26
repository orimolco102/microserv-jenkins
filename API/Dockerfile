FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

ARG API_BUILDNUM=local
ARG API_COMMNUM=unknown
ENV API_BUILDNUM=$API_BUILDNUM
ENV API_COMMNUM=$API_COMMNUM

COPY . .

EXPOSE 3000

CMD [ "node", "api.js" ]