# ltd_nova_america_2025_1
Repositório contendo o projeto do período de 2025.1 do Laboratório de Transformação Digital campus Nova América UNESA.

Criação de um sistema para lista de presença on-line para o Curso de Alfabetização de Jovens e Adultos.

## Pastas

- documentation/images -> Imagens enviadas pelo stackholder
- frontend -> Projeto com o framework em Reactjs (Nextjs) 
- backend-api -> Projeto com o framework em Nestjs, para servir o frontend com dados em json
- backend-authentication -> Projeto com o framework em Nestjs, para servir de servidor de autenticacao

## Como rodar os projetos individualmente

### Para rodar o frontend individualmente 

Entrar na pasta: 

cd frontend

- Construir o container 

``` npm ci ```

``` docker build -t frontend . ```

- Rodar o container 

``` docker run -d -p 3000:3000 -v $(pwd):/usr/src/app frontend ```

- Para acessar

no navegador: localhost:3000

- Parar o container

``` docker ps ```

``` docker stop id-container ```

### Para rodar o backend-api individualmente 

Entrar na pasta: 

cd backend-api

- Construir o container 

``` docker build -t backend-api . ```

- Rodar o container 

``` docker run -d -p 3001:3000 -v $(pwd):/usr/src/app backend-api ```

ou caso queira que o container reinicie automaticamente caso falhe, adicione --restart unless-stopped:

```docker run -d --restart unless-stopped -p 3001:3000 -v $(pwd):/usr/src/app backend-api```

- Para acessar

no navegador: localhost:3001

- Parar o container

``` docker ps ```

``` docker stop id-container ```

### Para rodar o backend-authentication individualmente 

Entrar na pasta: 

cd backend-authentication

- Construir o container 

``` docker build -t backend-authentication . ```

- Rodar o container 

``` docker run -d  -p 3002:3000 -v $(pwd):/usr/src/app backend-authentication ```

ou caso queira que o container reinicie automaticamente caso falhe, adicione --restart unless-stopped:

```docker run -d --restart unless-stopped -p 3001:3000 -v $(pwd):/usr/src/app backend-api```

- Para acessar

no navegador: localhost:3002

- Parar o container

``` docker ps ```

``` docker stop id-container ```

# Para compilar e executar todos os containers individualmente

Na mesma pasta do arquivo docker-compose.yml

- Para compilar e subir os containers 

``` docker-compose up -d ```

- Para parar o container 

``` docker-compose down ```

## Para acessar todos os containers pelo navegador

localhost:3000 - frontend

localhost:3001 - backend-api

localhost:3002 - backend-authentication

