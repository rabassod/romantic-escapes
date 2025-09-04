// server/routes/packs.js
import express from "express";
import fs from "fs";

const router = express.Router();

// Cargar los packs desde el archivo
const packs = JSON.parse(
  fs.readFileSync(new URL("../packs.json", import.meta.url), "utf-8")
);

// Obtener todos los packs
router.get("/", (req, res) => {
  res.json(packs);
});

// Crear un pack nuevo (ejemplo proveedor)
router.post("/", (req, res) => {
  const newPack = { id: Date.now(), ...req.body };
  packs.push(newPack);
  res.status(201).json(newPack);
});

// Borrar un pack (ejemplo admin)
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const index = packs.findIndex((p) => p.id == id);
  if (index === -1) return res.status(404).json({ error: "No encontrado" });
  const deleted = packs.splice(index, 1);
  res.json(deleted[0]);
});

export default router;
