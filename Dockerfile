#FROM node:16.14-alpine
#WORKDIR /usr/src/app
#COPY package*.json ./
#RUN npm install glob rimraf
#RUN npm install 

#ADD . /usr/src/app
#EXPOSE 3000
#CMD ["npm", "run", "start"]

### STAGE 1: Build ###
FROM node AS build
ARG MAX_OLD_SPACE_SIZE=10240
ARG NPM_TOKEN
ENV NODE_OPTIONS=--max-old-space-size=${MAX_OLD_SPACE_SIZE}
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --force
ADD . /usr/src/app
#RUN export NODE_OPTIONS=--max-old-space-size=8192 
RUN npm run build
#RUN node --max_old_space_size=8192 

### STAGE 2: Run ###
FROM nginx:1.17.1-alpine
RUN rm -rf /usr/share/nginx/html/*
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /usr/src/app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]