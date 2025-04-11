import { Router } from "express";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

const itemSchema = z.object({
  nome: z.string().min(1),
  tipo: z.enum(["Arma", "Armadura", "Amuleto"]),
  forca: z.number().int().min(0).max(10),
  defesa: z.number().int().min(0).max(10),
});

router.post("/", async (req, res) => {
  try {
    const data = itemSchema.parse(req.body);

    if (data.forca === 0 && data.defesa === 0) {
      return res
        .status(400)
        .json({ erro: "Item não pode ter força e defesa zeradas." });
    }

    if (data.tipo === "Arma" && data.defesa !== 0) {
      return res
        .status(400)
        .json({ erro: "Armas devem ter defesa igual a 0." });
    }

    if (data.tipo === "Armadura" && data.forca !== 0) {
      return res
        .status(400)
        .json({ erro: "Armaduras devem ter força igual a 0." });
    }

    const novoItem = await prisma.itemMagico.create({ data });
    return res.status(201).json(novoItem);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ erro: err.errors });
    }
    console.error(err);
    return res.status(500).json({ erro: "Erro ao criar item." });
  }
});

router.get("/", async (req, res) => {
  try {
    const itens = await prisma.itemMagico.findMany();
    return res.status(200).json(itens);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao listar itens mágicos." });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const item = await prisma.itemMagico.findUnique({
      where: { id },
    });
    if (!item) return res.status(404).json({ erro: "Item não encontrado." });
    return res.status(200).json(item);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao buscar item." });
  }
});

export default router;
