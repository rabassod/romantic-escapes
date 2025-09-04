import "dotenv/config";
import express from "express";
import cors from "cors";
import Stripe from "stripe";
import { z } from "zod";
import packsRouter from "./routes/packs.js";
import { generateToken } from "./auth.js";
import packs from "./packs.json" assert { type: "json" };

const app = express();
app.use(cors());
app.use(express.json());

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Rutas de packs
app.use("/api/packs", packsRouter);

// Login fake (solo para test roles)
app.post("/api/login", (req, res) => {
  const { role = "user" } = req.body;
  const token = generateToken({ id: "demo", role });
  res.json({ token });
});

// Checkout (Stripe)
const CheckoutSchema = z.object({
  packId: z.string(),
  email: z.string().email(),
});
app.post("/api/checkout", async (req, res) => {
  const parse = CheckoutSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: "Payload inválido" });
  const { packId, email } = parse.data;
  const pack = packs.find((p) => p.id === packId);
  if (!pack) return res.status(404).json({ error: "Pack no encontrado" });

  const intent = await stripe.paymentIntents.create({
    amount: Math.round(pack.precio * 100),
    currency: "eur",
    receipt_email: email,
    metadata: { packId },
    automatic_payment_methods: { enabled: true },
  });

  res.json({ clientSecret: intent.client_secret });
});

// Confirmación de reserva (simulada)
app.post("/api/confirm", (req, res) => {
  const code = `ESC-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  res.json({ confirmation: code });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API on http://localhost:${port}`));
