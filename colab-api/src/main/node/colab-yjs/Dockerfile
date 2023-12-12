FROM node:18

ENV PORT="4321"
ENV HOST="localhost"
ENV AUTHHOST="http://host.docker.internal:8080/"
ENV DBHOST="mongodb://host.docker.internal:27019/colablexical"

WORKDIR /app

COPY package.json ./
COPY yarn.lock ./
COPY dist ./dist
COPY start.sh ./start.sh

RUN yarn install --frozen-lockfile --network-timeout 1000000 --production && yarn cache clean

EXPOSE 4321

CMD ["bash", "start.sh"]
