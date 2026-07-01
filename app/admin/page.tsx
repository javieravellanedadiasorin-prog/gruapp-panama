"use client";

import Image from "next/image";
import { useState } from "react";

export default function AdminPage() {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [logged, setLogged] = useState(false);

  const login = () => {
    if (user === "GRUAPP" && password === "987654321") {
      setLogged(true);
      return;
    }

    alert("Usuario o contraseña incorrectos");
  };

  if (!logged) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <section className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-2xl">
          <div className="flex justify-center">
            <Image
              src="/Logo.jpeg"
              alt="Grúas Ebenezer"
              width={180}
              height={180}
              priority
            />
          </div>

          <h1 className="mt-6 text-center text-3xl font-black">
            Panel privado
          </h1>

          <p className="mt-2 text-center text-sm text-zinc-400">
            Acceso administrativo GruApp Panamá
          </p>

          <div className="mt-8 space-y-4">
            <input
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="Usuario"
              className="w-full rounded-xl border border-zinc-700 bg-black p-4 text-white outline-none focus:border-blue-600"
            />

            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              type="password"
              className="w-full rounded-xl border border-zinc-700 bg-black p-4 text-white outline-none focus:border-blue-600"
            />

            <button
              onClick={login}
              className="w-full rounded-xl bg-blue-700 p-4 font-bold transition hover:bg-blue-800"
            >
              Ingresar
            </button>
          </div>

          <a
            href="/"
            className="mt-6 block text-center text-sm text-zinc-500 hover:text-white"
          >
            Volver al inicio
          </a>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black p-6 text-white">
      <section className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
          <div>
            <h1 className="text-3xl font-black">Panel Administrativo</h1>
            <p className="text-zinc-400">GruApp Panamá · Grúas Ebenezer</p>
          </div>

          <button
            onClick={() => setLogged(false)}
            className="rounded-xl bg-red-700 px-5 py-3 font-bold hover:bg-red-800"
          >
            Cerrar sesión
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <h2 className="text-xl font-bold">WhatsApp principal</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Número donde llegarán las solicitudes.
            </p>
            <input
              defaultValue="+507 0000-0000"
              className="mt-5 w-full rounded-xl border border-zinc-700 bg-black p-4 text-white"
            />
            <button className="mt-4 w-full rounded-xl bg-blue-700 p-4 font-bold">
              Guardar WhatsApp
            </button>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <h2 className="text-xl font-bold">Operadores</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Gestión inicial de operadores.
            </p>
            <button className="mt-5 w-full rounded-xl bg-red-700 p-4 font-bold">
              Agregar operador
            </button>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <h2 className="text-xl font-bold">Solicitudes</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Resumen de servicios registrados.
            </p>
            <div className="mt-5 text-5xl font-black">0</div>
          </div>
        </div>
      </section>
    </main>
  );
}