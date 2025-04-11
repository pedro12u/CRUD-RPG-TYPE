-- CreateTable
CREATE TABLE "Personagem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "nomeAventureiro" TEXT NOT NULL,
    "classe" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "forcaBase" INTEGER NOT NULL,
    "defesaBase" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "ItemMagico" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "forca" INTEGER NOT NULL,
    "defesa" INTEGER NOT NULL,
    "personagemId" TEXT,
    CONSTRAINT "ItemMagico_personagemId_fkey" FOREIGN KEY ("personagemId") REFERENCES "Personagem" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
