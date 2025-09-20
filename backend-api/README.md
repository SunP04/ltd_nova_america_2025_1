<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
-


create table instituicao (
id serial primary key,
nome varchar(500)
);
create table papel (
id serial primary key,
nome varchar(500)
);
create table pessoa (
id serial primary key,
nome varchar(500),
matricula varchar(500),
email varchar(500),
senha varchar(2000),
papel_id integer,
foreign key(papel_id) references papel(id)
);
insert into papel(nome) values ('Admin'), ('Professor'), ('Aluno') ;
insert into papel(nome) values ('Monitor(a)');
select * from papel;
insert into pessoa (matricula, nome, email, senha, papel_id)
values ('1033', 'André', 'andre@estacio', '123',1),
('10399', 'Antonio', 'antonio@estacio', '123',2),
('1089', 'Laura', 'laura@estacio', '123',2),
('10889', 'Gabriel', 'gabriel@estacio', '123',3),
('10897', 'Rodrigo', 'rodrigo@estacio', '123',3);
select * from papel;
select * from pessoa;
--- atualizar usuraio
begin;
-- atualiza na tabela pessao papel_id = 4 onde id = 3
update pessoa set papel_id=4 where id = 3;
select * from pessoa;
rollback;
commit;
select pe.id, pe.nome as nome_pessoa, pa.nome as papel 
from pessoa pe, papel pa
where pe.papel_id=pa.id;
create table unidade(
id serial primary key,
nome varchar(500),
instituicao_id integer,
foreign key(instituicao_id) references instituicao (id)
);
insert into instituicao(nome) values('Estacio');
insert into unidade(nome, instituicao_id) values('Nova America',1);
 
 
select * from pessoa;
select * from instituicao; 
select * from unidade; 
-- exercicio exiba: as  unidades com o nome das respectivas instituicoes
select * 
from unidade u, instituicao i
where u.instituicao_id = i.id
;
 
select * from instituicao, unidade;
------------
create table disciplina(
id serial primary key,
nome varchar(500)
);
insert into disciplina(nome) values('Banco de dados'), ('Tec Web');
select * from disciplina;
create table turma (
id serial primary key,
numero varchar(50),
periodo varchar(50),
horario_inicial time,
horario_final time,
data_inicio timestamp,
data_fim timestamp,
unidade_id integer,
disciplina_id integer,
foreign key(unidade_id) references unidade(id),
foreign key(disciplina_id) references disciplina(id)
);
 
create table professor_turma (
professor_id integer,
turma_id integer,
foreign key(professor_id) references pessoa(id),
foreign key(turma_id) references turma(id),
primary key(professor_id,turma_id )
);
 
 
select * from papel;
select * from pessoa;
select * from turma ;
--exibe todos os professores
select pe.id, pe.nome, pa.nome 
from pessoa pe, papel pa
where pe.papel_id= pa.id and pa.id = 2
;
 
insert into turma (
numero, 
periodo, 
horario_inicial, 
horario_final,
data_inicio, 
data_fim,
unidade_id,
disciplina_id 
)
values
('3001', '2025.2', '19:00', '21:40', '2025-08-01', '2025-12-15', 1,2);
 
--- exibe turma a dicplina e unidade
select * 
from turma t, disciplina d, unidade u
where 
t.unidade_id=u.id and 
t.disciplina_id = d.id 
;
-- Laura professora de banco de dados 
-- Antonio professor de tec web
insert into professor_turma(professor_id, turma_id) values(2,3),(3,2);
 
select * from professor_turma;
-- exercicio exiba o nome do professor com sua disciplina.