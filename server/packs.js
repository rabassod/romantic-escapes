import express from "express";
import fs from "fs";
import packs from "../packs.json" assert { type: "json" };
import { auth } from "../auth.js";

const router = express.Router();

// GET packs (usuario público)
router.get("/", (req, res) => {
  res.json(packs);
});

// CREATE (proveedor o admin)
router.post("/", auth("provider"), (req, res) => {
  const pack = { id: Date.now().toString(), ...req.body };
  packs.push(pack);
  fs.writeFileSync("./server/packs.json", JSON.stringify(packs, null, 2));
  res.status(201).json(pack);
});

// DELETE (admin only)
router.delete("/:id", auth("admin"), (req, res) => {
  const idx = packs.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "No encontrado" });
  packs.splice(idx, 1);
  fs.writeFileSync("./server/packs.json", JSON.stringify(packs, null, 2));
  res.json({ ok: true });
});

export default router;
