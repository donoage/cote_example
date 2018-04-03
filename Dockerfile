FROM node:8

WORKDIR /src
RUN npm install -g nodemon
#ADD package.json .
RUN npm install
ENV NODE_ENV development

ADD . .

