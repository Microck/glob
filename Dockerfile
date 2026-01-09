FROM node:20-slim

RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./

RUN npm install

COPY api/ ./api/
COPY src/lib/ ./src/lib/

RUN npm run api:build

RUN mkdir -p tmp/uploads tmp/optimized && chmod -R 777 tmp

EXPOSE 3001
ENV PORT=3001

CMD ["npm", "run", "api:start"]
