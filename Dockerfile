FROM node:18

WORKDIR /app

# 安裝特定版本的 pnpm
RUN npm install -g pnpm@7.18.2

COPY package.json pnpm-lock.yaml ./
RUN pnpm install

COPY . .

RUN pnpm build

CMD ["pnpm", "start"]