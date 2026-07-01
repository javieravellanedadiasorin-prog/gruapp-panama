import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6">
        <Image
          src="/Logo.jpeg"
          alt="Grúas Ebenezer"
          width={280}
          height={280}
          priority
          className="mb-8"
        />

        <h1 className="text-center text-6xl font-black">
          GRUAPP PANAMÁ
        </h1>

        <p className="mt-4 text-center text-xl text-gray-300">
          Plataforma de asistencia vial
        </p>

        <p className="mt-2 font-bold text-red-500">
          Powered by Grúas Ebenezer
        </p>

        <div className="mt-12 grid w-full max-w-4xl gap-5 md:grid-cols-3">
          <a
            href="/solicitar"
            className="rounded-2xl bg-red-700 p-6 text-center text-xl font-bold transition hover:bg-red-800"
          >
            🚚 Solicitar grúa
          </a>

          <a
            href="/operador"
            className="rounded-2xl bg-zinc-800 p-6 text-center text-xl font-bold transition hover:bg-zinc-700"
          >
            👷 Soy operador
          </a>

          <a
            href="/admin"
            className="rounded-2xl bg-blue-700 p-6 text-center text-xl font-bold transition hover:bg-blue-800"
          >
            🔒 Panel privado
          </a>
        </div>

        <p className="mt-10 text-sm text-zinc-500">
          Versión v0.1.0-alpha
        </p>
      </section>
    </main>
  );
}