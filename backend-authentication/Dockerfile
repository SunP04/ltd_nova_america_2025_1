
FROM node:20

WORKDIR /usr/src/app

RUN apt-get update \
  && apt-get install -y --no-install-recommends postgresql-client \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

COPY . .

RUN chmod +x docker/entrypoint.sh

CMD ["./docker/entrypoint.sh"]
