FROM node:24.16.0-alpine3.23

RUN corepack enable && corepack prepare pnpm@10.28.2 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install

COPY . .

EXPOSE 3000

CMD ["pnpm", "run", "dev"]
