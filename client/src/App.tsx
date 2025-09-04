import React, { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PK!);

export default function App() {
  const [packs, setPacks] = useState<any[]>([]);
  const [role, setRole] = useState<"user" | "provider" | "admin">("user");
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE}/api/packs`)
      .then((res) => res.json())
      .then(setPacks);
  }, []);

  async function login(r: "user" | "provider" | "admin") {
    const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: r })
    });
    const data = await res.json();
    setRole(r);
    setToken(data.token);
  }

  async function handleCheckout(packId: string) {
    const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packId, email: "test@example.com" })
    });
    const { clientSecret } = await res.json();
    const stripe = await stripePromise;
    if (!stripe) return;
    await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: { token: "tok_visa" } }
    });
    const confirm = await fetch(`${import.meta.env.VITE_API_BASE}/api/confirm`, {
      method: "POST"
    });
    const { confirmation } = await confirm.json();
    alert("Reserva confirmada: " + confirmation);
  }

  async function handleAddPack() {
    if (!token) return alert("Inicia sesión como proveedor");
    await fetch(`${import.meta.env.VITE_API_BASE}/api/packs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        categoria: "Internacional",
        destino: "Nueva oferta",
        titulo: "Oferta de prueba",
        descripcion: "Generada por proveedor",
        precio: 1000
      })
    });
    const newPacks = await fetch(`${import.meta.env.VITE_API_BASE}/api/packs`).then((r) =>
      r.json()
    );
    setPacks(newPacks);
  }

  async function handleDeletePack(id: string) {
    if (!token) return alert("Inicia sesión como admin");
    await fetch(`${import.meta.env.VITE_API_BASE}/api/packs/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    setPacks(packs.filter((p) => p.id !== id));
  }

  return (
    <div>
      <h1>Escapadas románticas</h1>
      <div>
        <button onClick={() => login("user")}>Login Usuario</button>
        <button onClick={() => login("provider")}>Login Proveedor</button>
        <button onClick={() => login("admin")}>Login Admin</button>
      </div>

      {role === "provider" && (
        <button onClick={handleAddPack}>Agregar oferta</button>
      )}

      <ul>
        {packs.map((p) => (
          <li key={p.id}>
            {p.titulo} - {p.precio}€
            {role === "user" && (
              <button onClick={() => handleCheckout(p.id)}>Reservar</button>
            )}
            {role === "admin" && (
              <button onClick={() => handleDeletePack(p.id)}>Eliminar</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
