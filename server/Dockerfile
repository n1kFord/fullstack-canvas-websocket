FROM node:16-alpine

WORKDIR /app

COPY . .

RUN npm ci

ENV NODE_ENV production

EXPOSE 4000

CMD [ "npm", "run", "dev" ]