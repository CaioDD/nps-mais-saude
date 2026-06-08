import NpsForm from "@/components/nps-form";
import Image from "next/image";
import PageBackground from "@/components/page-background";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pesquisa de Satisfação | Mais Saúde",
  description: "Sua opinião é fundamental para nossa melhoria contínua.",
};

export default function Home() {
  return (
    <div
      className="min-h-screen relative overflow-hidden flex flex-col"
      style={{
        background: "linear-gradient(168deg, #4aa6b8 0%, #267585 22%, #1a5264 48%, #10303e 72%, #091c28 100%)",
      }}
    >
      <PageBackground />

      {/* Logo grande ao fundo — marca d'água */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none flex items-center justify-center"
      >
        <Image
          src="/logo.jpg"
          alt=""
          width={420}
          height={420}
          className="mix-blend-screen"
          style={{ filter: 'invert(1)', opacity: 0.18 }}
          priority
        />
      </div>

      {/* Conteúdo da página */}
      <div className="relative z-10 flex-1 flex flex-col py-8 px-4 sm:py-12">
        <div className="max-w-lg mx-auto w-full">

          {/* Logo */}
          <div className="flex flex-col items-center mb-7">
            <div className="w-24 h-24 rounded-3xl bg-white/15 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/25 shadow-xl">
              <Image
                src="/logo.jpg"
                alt="Logo Mais Saúde"
                width={72}
                height={72}
                className="rounded-2xl object-contain"
                priority
              />
            </div>
          </div>

          {/* Card do formulário */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <main className="px-5 py-6 sm:px-8 sm:py-8">
              <NpsForm />
            </main>
            <footer className="bg-gray-50 px-6 py-3 text-center border-t border-gray-100">
              <p className="text-xs text-gray-400">
                © {new Date().getFullYear()} Clínica e Laboratório Mais Saúde
              </p>
            </footer>
          </div>

        </div>
      </div>
    </div>
  );
}
