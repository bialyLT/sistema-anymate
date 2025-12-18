FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json* ./

RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY . .

EXPOSE 19000 19001 19002 19006

CMD ["npm", "start"]
