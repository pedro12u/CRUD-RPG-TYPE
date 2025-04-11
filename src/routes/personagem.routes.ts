import { Router } from "express";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

const personagemSchema = z.object({
  nome: z.string().min(1),
  nomeAventureiro: z.string().min(1),
  classe: z.enum(["Guerreiro", "Mago", "Arqueiro", "Ladino", "Bardo"]),
  level: z.number().int().nonnegative(),
  forcaBase: z.number().int().min(0).max(10),
  defesaBase: z.number().int().min(0).max(10),
});

router.post("/", async (req, res) => {
  try {
    const data = personagemSchema.parse(req.body);

    const total = data.forcaBase + data.defesaBase;
    if (total !== 10) {
      return res
        .status(400)
        .json({ erro: "Força e Defesa devem somar exatamente 10." });
    }

    const novoPersonagem = await prisma.personagem.create({
      data: { ...data },
    });

    return res.status(201).json(novoPersonagem);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ erro: err.errors });
    }
    console.error(err);
    return res.status(500).json({ erro: "Erro ao criar personagem." });
  }
});

router.get("/", async (req, res) => {
  try {
    const personagens = await prisma.personagem.findMany({
      include: { itens: true },
    });

    const resultado = personagens.map((personagem) => {
      const bonusForca = personagem.itens.reduce(
        (acc, item) => acc + item.forca,
        0
      );
      const bonusDefesa = personagem.itens.reduce(
        (acc, item) => acc + item.defesa,
        0
      );

      return {
        id: personagem.id,
        nome: personagem.nome,
        nomeAventureiro: personagem.nomeAventureiro,
        classe: personagem.classe,
        level: personagem.level,
        forcaBase: personagem.forcaBase,
        defesaBase: personagem.defesaBase,
        forcaTotal: personagem.forcaBase + bonusForca,
        defesaTotal: personagem.defesaBase + bonusDefesa,
        itensMagicos: personagem.itens,
      };
    });

    return res.status(200).json(resultado);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao listar personagens." });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const personagem = await prisma.personagem.findUnique({
      where: { id },
      include: { itens: true },
    });
    if (!personagem) {
      return res.status(404).json({ erro: "Personagem não encontrado." });
    }
    const bonusForca = personagem.itens.reduce(
      (acc, item) => acc + item.forca,
      0
    );
    const bonusDefesa = personagem.itens.reduce(
      (acc, item) => acc + item.defesa,
      0
    );
    const response = {
      ...personagem,
      forcaTotal: personagem.forcaBase + bonusForca,
      defesaTotal: personagem.defesaBase + bonusDefesa,
    };
    return res.json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: "Erro ao buscar personagem." });
  }
});

router.patch("/:id/nome-aventureiro", async (req, res) => {
  const { id } = req.params;
  const schema = z.object({
    nomeAventureiro: z.string().min(1),
  });
  try {
    const { nomeAventureiro } = schema.parse(req.body);
    const updatedPersonagem = await prisma.personagem.update({
      where: { id },
      data: { nomeAventureiro },
    });
    return res.json(updatedPersonagem);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ erro: err.errors });
    }
    console.error(err);
    return res
      .status(500)
      .json({ erro: "Erro ao atualizar nome aventureiro." });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.itemMagico.updateMany({
      where: { personagemId: id },
      data: { personagemId: null },
    });
    const deleted = await prisma.personagem.delete({
      where: { id },
    });
    return res.json(deleted);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao deletar personagem." });
  }
});

router.post("/:id/itens", async (req, res) => {
  const { id } = req.params;
  const schema = z.object({
    itemId: z.string().uuid(),
  });
  try {
    const { itemId } = schema.parse(req.body);
    const personagem = await prisma.personagem.findUnique({
      where: { id },
      include: { itens: true },
    });
    if (!personagem) {
      return res.status(404).json({ erro: "Personagem não encontrado." });
    }
    const item = await prisma.itemMagico.findUnique({
      where: { id: itemId },
    });
    if (!item) {
      return res.status(404).json({ erro: "Item não encontrado." });
    }
    if (item.personagemId) {
      return res
        .status(400)
        .json({ erro: "Item já está associado a um personagem." });
    }
    if (item.tipo === "Amuleto") {
      const jaPossuiAmuleto = personagem.itens.some(
        (i) => i.tipo === "Amuleto"
      );
      if (jaPossuiAmuleto) {
        return res
          .status(400)
          .json({ erro: "O personagem já possui um amuleto." });
      }
    }
    const updatedItem = await prisma.itemMagico.update({
      where: { id: itemId },
      data: { personagemId: id },
    });
    return res.status(200).json(updatedItem);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ erro: err.errors });
    }
    console.error(err);
    return res
      .status(500)
      .json({ erro: "Erro ao adicionar item ao personagem." });
  }
});

router.get("/:id/itens", async (req, res) => {
  const { id } = req.params;
  try {
    const itens = await prisma.itemMagico.findMany({
      where: { personagemId: id },
    });
    return res.status(200).json(itens);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ erro: "Erro ao buscar itens do personagem." });
  }
});

router.delete("/:id/itens/:itemId", async (req, res) => {
  const { id, itemId } = req.params;
  try {
    const item = await prisma.itemMagico.findUnique({
      where: { id: itemId },
    });
    if (!item || item.personagemId !== id) {
      return res
        .status(404)
        .json({ erro: "Item não encontrado no personagem." });
    }
    const updatedItem = await prisma.itemMagico.update({
      where: { id: itemId },
      data: { personagemId: null },
    });
    return res.status(200).json(updatedItem);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ erro: "Erro ao remover item do personagem." });
  }
});

router.get("/:id/amuleto", async (req, res) => {
  const { id } = req.params;
  try {
    const amuleto = await prisma.itemMagico.findFirst({
      where: {
        personagemId: id,
        tipo: "Amuleto",
      },
    });
    if (!amuleto) {
      return res
        .status(404)
        .json({ erro: "Amuleto não encontrado para o personagem." });
    }
    return res.status(200).json(amuleto);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ erro: "Erro ao buscar amuleto do personagem." });
  }
});

export default router;
