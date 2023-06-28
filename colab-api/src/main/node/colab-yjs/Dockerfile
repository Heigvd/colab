FROM node:18

ENV PORT="4321"
ENV HOST="localhost"
ENV AUTHHOST="http://host.docker.internal:8080/"
ENV DBHOST="mongodb://host.docker.internal:27019/colablexical"

WORKDIR /app

COPY package.json ./

COPY . .

RUN yarn install --network-timeout 1000000 && yarn build && yarn install --production && yarn cache clean

EXPOSE 4321

CMD ["bash", "start.sh"]