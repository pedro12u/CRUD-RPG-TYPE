# CRUD RPG - Escola de TI

Projeto desenvolvido como atividade da Escola de TI. O objetivo é criar um CRUD de personagens e itens mágicos de RPG, aplicando regras específicas e funcionalidades de um CRUD completo.

## Tecnologias utilizadas

- Node.js
- TypeScript
- Express
- Prisma ORM (SQLite)
- Zod (validação de dados)

## Como rodar o projeto

1. Instale as dependências:

```bash
npm install
```

Crie o banco de dados e aplique as migrations:

```bash
npx prisma migrate dev --name init
```

Rode o servidor:

```bash
npm run dev
```

O servidor vai ficar disponível em http://localhost:3333 (só não vai ser essa porta se vc trocar no .env)

Funcionalidades:

- Cadastro, listagem, atualização e remoção de personagens
- Cadastro, listagem e busca de itens mágicos
- Associação e remoção de itens aos personagens

Regras aplicadas conforme enunciado da atividade

Atividade entregue por Pedro Toscano – Escola de TI
