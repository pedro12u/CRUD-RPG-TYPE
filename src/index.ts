import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

import personagemRoutes from "./routes/personagem.routes";
import itemRoutes from "./routes/item.routes";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Servidor do RPG rodando ⚔️");
});

app.use("/personagens", personagemRoutes);
app.use("/itens", itemRoutes);

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`🔥 Servidor rodando na porta ${PORT}`);
});
