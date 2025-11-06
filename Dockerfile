FROM node:22.14.0-alpine3.20

WORKDIR /app
RUN chown -R node:node /app
USER node

COPY --chown=node:node ./package.json ./package.json
COPY --chown=node:node ./package-lock.json ./package-lock.json
RUN npm install
COPY --chown=node:node . .

ENV NODE_ENV=production
RUN npm run build
RUN rm -rf src

CMD ["node", "dist/main.js"]
EXPOSE 8000
