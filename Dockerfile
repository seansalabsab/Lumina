FROM docker.arvancloud.ir/node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx vite build

EXPOSE 4173

CMD ["npx", "vite", "preview", "--host"]



