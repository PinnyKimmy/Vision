#build stage
FROM node:20.10.0-alpine AS build
WORKDIR /app
COPY ./package*.json ./
RUN npm install --silent --production=false
COPY . .
RUN npm run build

#production stage
FROM node:20.10.0-alpine
COPY --from=build /app/package*.json ./
RUN npm install --silent --production
COPY --from=build /app/dist /dist
EXPOSE 8000
CMD ["npm", "start"]
