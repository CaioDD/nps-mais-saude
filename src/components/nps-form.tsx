'use client';

import React, { useState, useRef } from 'react';
import { ChevronLeft, CheckCircle2, Loader2 } from 'lucide-react';

interface FormData {
  nps: number | null;
  experienciaGeral: string;
  atendimentoRecepcao: string;
  atendimentoColeta: string;
  tempoEspera: string;
  limpezaOrganizacao: string;
  prazoEntrega: string;
  recebeuOrientacoes: string;
  custoBeneficio: string;
  comoConheceu: string;
  comentarios: string;
}

const INITIAL: FormData = {
  nps: null,
  experienciaGeral: '',
  atendimentoRecepcao: '',
  atendimentoColeta: '',
  tempoEspera: '',
  limpezaOrganizacao: '',
  prazoEntrega: '',
  recebeuOrientacoes: '',
  custoBeneficio: '',
  comoConheceu: '',
  comentarios: '',
};

const TOTAL_STEPS = 8;

function npsClass(n: number, selected: boolean) {
  const base =
    'h-14 w-full rounded-2xl border-2 font-bold text-lg transition-all duration-150 active:scale-95 touch-manipulation select-none';
  if (!selected)
    return `${base} bg-white border-gray-200 text-gray-700 hover:border-gray-400`;
  if (n <= 6) return `${base} bg-red-500 border-red-500 text-white scale-105 shadow-lg`;
  if (n <= 8) return `${base} bg-amber-400 border-amber-400 text-white scale-105 shadow-lg`;
  return `${base} bg-green-500 border-green-500 text-white scale-105 shadow-lg`;
}

function BigOption({
  emoji,
  label,
  selected,
  onClick,
}: {
  emoji: string;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-2 p-4 border-2 rounded-2xl transition-all duration-150 min-h-[84px] w-full font-medium text-sm active:scale-95 touch-manipulation select-none ${
        selected
          ? 'border-petroleum-dark bg-petroleum-dark text-white shadow-lg'
          : 'border-gray-200 bg-white text-gray-700 hover:border-petroleum-dark/50'
      }`}
    >
      <span className="text-3xl leading-none">{emoji}</span>
      <span>{label}</span>
    </button>
  );
}

function SubRating({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { emoji: string; label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{label}</p>
      <div className="grid grid-cols-4 gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex flex-col items-center justify-center gap-1 p-2 border-2 rounded-xl transition-all active:scale-95 touch-manipulation min-h-[62px] select-none ${
              value === opt.value
                ? 'border-petroleum-dark bg-petroleum-dark text-white shadow-md'
                : 'border-gray-200 bg-white text-gray-600 hover:border-petroleum-dark/30'
            }`}
          >
            <span className="text-lg leading-none">{opt.emoji}</span>
            <span className="text-[10px] font-semibold text-center leading-tight">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

const RATING = [
  { emoji: '😍', label: 'Excelente', value: 'Excelente' },
  { emoji: '😊', label: 'Bom', value: 'Bom' },
  { emoji: '😐', label: 'Regular', value: 'Regular' },
  { emoji: '😞', label: 'Ruim', value: 'Ruim' },
];

const SPEED = [
  { emoji: '⚡', label: 'Muito rápido', value: 'Muito rápido' },
  { emoji: '✅', label: 'Adequado', value: 'Adequado' },
  { emoji: '🐢', label: 'Demorado', value: 'Demorado' },
  { emoji: '🐌', label: 'Muito demorado', value: 'Muito demorado' },
];

export default function NpsForm({ filial }: { filial?: string }) {
  const [step, setStep] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [dir, setDir] = useState<'fwd' | 'bwd'>('fwd');
  const [data, setData] = useState<FormData>(INITIAL);
  const [enviado, setEnviado] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const advancingRef = useRef(false);

  const go = (newStep: number, direction: 'fwd' | 'bwd', patch?: Partial<FormData>) => {
    if (patch) setData((prev) => ({ ...prev, ...patch }));
    setDir(direction);
    setAnimKey((k) => k + 1);
    setStep(newStep);
  };

  const next = (patch?: Partial<FormData>) => go(step + 1, 'fwd', patch);
  const prev = () => go(step - 1, 'bwd');

  const autoNext = (patch: Partial<FormData>) => {
    if (advancingRef.current) return;
    advancingRef.current = true;
    setData((prev) => ({ ...prev, ...patch }));
    const nextStep = step + 1;
    setTimeout(() => {
      go(nextStep, 'fwd', patch);
      advancingRef.current = false;
    }, 260);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await fetch('/api/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, filial: filial ?? 'desconhecida', timestamp: new Date().toISOString() }),
      });
    } catch {
      // fail silently — user gets thank you regardless
    }
    setIsSubmitting(false);
    setEnviado(true);
  };

  const reset = () => {
    setData(INITIAL);
    setAnimKey((k) => k + 1);
    setDir('fwd');
    setStep(0);
    setEnviado(false);
  };

  if (enviado) {
    const isPromoter = (data.nps ?? 0) >= 9;
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-5 min-h-[360px] slide-in-right">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-petroleum-dark">
            {isPromoter ? 'Muito obrigado! 🎉' : 'Obrigado pelo feedback!'}
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
            {isPromoter
              ? 'Ficamos muito felizes com sua avaliação! Sua opinião nos motiva a manter a qualidade.'
              : 'Sua opinião é muito importante para nós. Vamos continuar trabalhando para melhorar!'}
          </p>
        </div>
        <button
          onClick={reset}
          className="text-petroleum-dark text-sm underline underline-offset-2 mt-2 touch-manipulation"
        >
          Enviar outra resposta
        </button>
      </div>
    );
  }

  const commentPrompt =
    data.nps !== null && data.nps >= 9
      ? 'O que você mais gostou? 😊'
      : data.nps !== null && data.nps >= 7
      ? 'Como podemos melhorar sua experiência?'
      : 'O que podemos fazer para melhorar?';

  const steps: { title: string; content: React.ReactNode }[] = [
    // 0 — NPS
    {
      title: 'De 0 a 10, qual a probabilidade de você indicar o Laboratório Mais Saúde a um amigo ou familiar?',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {Array.from({ length: 11 }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => autoNext({ nps: i })}
                className={npsClass(i, data.nps === i)}
              >
                {i}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-400 font-semibold px-0.5">
            <span>😞 Não indicaria</span>
            <span>Com certeza! 😍</span>
          </div>
        </div>
      ),
    },

    // 1 — Experiência geral
    {
      title: 'De forma geral, como foi sua experiência no laboratório hoje?',
      content: (
        <div className="grid grid-cols-2 gap-3">
          {[
            { emoji: '😍', label: 'Excelente' },
            { emoji: '😊', label: 'Boa' },
            { emoji: '😐', label: 'Regular' },
            { emoji: '😞', label: 'Ruim' },
          ].map((opt) => (
            <BigOption
              key={opt.label}
              emoji={opt.emoji}
              label={opt.label}
              selected={data.experienciaGeral === opt.label}
              onClick={() => autoNext({ experienciaGeral: opt.label })}
            />
          ))}
        </div>
      ),
    },

    // 2 — Atendimento
    {
      title: 'Como você avalia o atendimento?',
      content: (
        <div className="space-y-5">
          <SubRating
            label="Recepção"
            options={RATING}
            value={data.atendimentoRecepcao}
            onChange={(v) => setData((p) => ({ ...p, atendimentoRecepcao: v }))}
          />
          <SubRating
            label="Coleta / Enfermagem"
            options={RATING}
            value={data.atendimentoColeta}
            onChange={(v) => setData((p) => ({ ...p, atendimentoColeta: v }))}
          />
          {data.atendimentoRecepcao && data.atendimentoColeta && (
            <button
              type="button"
              onClick={() => next()}
              className="w-full py-4 bg-petroleum-dark text-white font-bold rounded-2xl active:scale-95 transition-all touch-manipulation"
            >
              Continuar →
            </button>
          )}
        </div>
      ),
    },

    // 3 — Estrutura
    {
      title: 'E a estrutura do laboratório?',
      content: (
        <div className="space-y-5">
          <SubRating
            label="Tempo de espera"
            options={SPEED}
            value={data.tempoEspera}
            onChange={(v) => setData((p) => ({ ...p, tempoEspera: v }))}
          />
          <SubRating
            label="Limpeza e organização"
            options={RATING}
            value={data.limpezaOrganizacao}
            onChange={(v) => setData((p) => ({ ...p, limpezaOrganizacao: v }))}
          />
          {data.tempoEspera && data.limpezaOrganizacao && (
            <button
              type="button"
              onClick={() => next()}
              className="w-full py-4 bg-petroleum-dark text-white font-bold rounded-2xl active:scale-95 transition-all touch-manipulation"
            >
              Continuar →
            </button>
          )}
        </div>
      ),
    },

    // 4 — Resultado / exame
    {
      title: 'Sobre o resultado do seu exame:',
      content: (
        <div className="space-y-5">
          <SubRating
            label="Prazo de entrega dos resultados"
            options={SPEED}
            value={data.prazoEntrega}
            onChange={(v) => setData((p) => ({ ...p, prazoEntrega: v }))}
          />
          <div className="space-y-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              Orientações antes do exame
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { emoji: '✅', label: 'Recebi', value: 'Sim' },
                { emoji: '🤔', label: 'Parcialmente', value: 'Mais ou menos' },
                { emoji: '❌', label: 'Não recebi', value: 'Não' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setData((p) => ({ ...p, recebeuOrientacoes: opt.value }))}
                  className={`flex flex-col items-center justify-center gap-1.5 p-3 border-2 rounded-xl transition-all active:scale-95 touch-manipulation min-h-[68px] select-none ${
                    data.recebeuOrientacoes === opt.value
                      ? 'border-petroleum-dark bg-petroleum-dark text-white shadow-md'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-petroleum-dark/30'
                  }`}
                >
                  <span className="text-xl">{opt.emoji}</span>
                  <span className="text-xs font-semibold text-center leading-tight">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
          {data.prazoEntrega && data.recebeuOrientacoes && (
            <button
              type="button"
              onClick={() => next()}
              className="w-full py-4 bg-petroleum-dark text-white font-bold rounded-2xl active:scale-95 transition-all touch-manipulation"
            >
              Continuar →
            </button>
          )}
        </div>
      ),
    },

    // 5 — Custo-benefício
    {
      title: 'Como você avalia o custo-benefício do laboratório?',
      content: (
        <div className="grid grid-cols-2 gap-3">
          {[
            { emoji: '🌟', label: 'Excelente' },
            { emoji: '👍', label: 'Bom' },
            { emoji: '😑', label: 'Regular' },
            { emoji: '👎', label: 'Ruim' },
          ].map((opt) => (
            <BigOption
              key={opt.label}
              emoji={opt.emoji}
              label={opt.label}
              selected={data.custoBeneficio === opt.label}
              onClick={() => autoNext({ custoBeneficio: opt.label })}
            />
          ))}
        </div>
      ),
    },

    // 6 — Como conheceu
    {
      title: 'Como você conheceu o Laboratório Mais Saúde?',
      content: (
        <div className="space-y-2">
          {[
            { emoji: '👥', label: 'Indicação de amigo/familiar', value: 'Indicação' },
            { emoji: '👨‍⚕️', label: 'Indicação médica', value: 'Médico' },
            { emoji: '📱', label: 'Instagram / Redes sociais', value: 'Instagram' },
            { emoji: '🔍', label: 'Google / Internet', value: 'Google' },
            { emoji: '🚶', label: 'Passando pela frente', value: 'Passando na frente' },
            { emoji: '✏️', label: 'Outro', value: 'Outros' },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => autoNext({ comoConheceu: opt.value })}
              className={`w-full flex items-center gap-4 px-4 py-3.5 border-2 rounded-2xl transition-all duration-150 active:scale-[0.98] touch-manipulation select-none ${
                data.comoConheceu === opt.value
                  ? 'border-petroleum-dark bg-petroleum-dark text-white shadow-md'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-petroleum-dark/40'
              }`}
            >
              <span className="text-2xl">{opt.emoji}</span>
              <span className="font-medium">{opt.label}</span>
            </button>
          ))}
        </div>
      ),
    },

    // 7 — Comentários
    {
      title: commentPrompt,
      content: (
        <div className="space-y-4">
          <textarea
            value={data.comentarios}
            onChange={(e) => setData((p) => ({ ...p, comentarios: e.target.value }))}
            placeholder="Escreva aqui (opcional)..."
            rows={4}
            className="w-full p-4 border-2 border-gray-200 rounded-2xl bg-gray-50 focus:border-petroleum-dark focus:bg-white outline-none transition-all resize-none text-gray-700 text-base"
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-4 bg-petroleum-dark text-white font-bold text-lg rounded-2xl shadow-lg active:scale-95 transition-all touch-manipulation flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
            {isSubmitting ? 'Enviando...' : 'Enviar Avaliação'}
          </button>
          {!isSubmitting && (
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full py-2 text-gray-400 text-sm touch-manipulation"
            >
              Pular e enviar
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5 pb-8">
      {/* Progress dots */}
      <div className="flex flex-col items-center gap-1.5 py-1">
        <div className="relative flex items-center w-full">
          {/* connecting line behind dots */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-gray-200" />
          {/* colored fill line for completed portion */}
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-px bg-petroleum-dark origin-left"
            style={{
              width: step === 0 ? '0%' : `${(step / (TOTAL_STEPS - 1)) * 100}%`,
              transition: 'width 400ms ease-out',
            }}
          />
          {/* dots */}
          <div className="relative flex items-center justify-between w-full">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <span
                key={i}
                style={{ transition: 'transform 300ms ease-out, background-color 300ms ease-out, box-shadow 300ms ease-out' }}
                className={`rounded-full block flex-shrink-0 ${
                  i === step
                    ? 'w-4 h-4 bg-white border-2 border-petroleum-dark shadow-[0_0_0_3px_rgba(0,77,64,0.18)] scale-110'
                    : i < step
                    ? 'w-3 h-3 bg-petroleum-dark'
                    : 'w-2.5 h-2.5 bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
        <span className="text-xs text-gray-400 font-medium">{step + 1} de {TOTAL_STEPS}</span>
      </div>

      {/* Back */}
      {step > 0 && (
        <button
          type="button"
          onClick={prev}
          className="flex items-center gap-1 text-gray-400 hover:text-petroleum-dark transition-colors text-sm font-medium py-1 touch-manipulation"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar
        </button>
      )}

      {/* Step content with slide animation */}
      <div key={animKey} className={dir === 'fwd' ? 'slide-in-right' : 'slide-in-left'}>
        <h2 className="text-xl font-bold text-gray-800 leading-snug mb-6">
          {steps[step].title}
        </h2>
        {steps[step].content}
      </div>
    </div>
  );
}
