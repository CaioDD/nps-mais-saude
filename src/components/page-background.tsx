"use client";

/**
 * Fundo CSS puro — replica o visual de "Para o fundo.png"
 * com gradiente teal-azul e formas orgânicas, nítido em qualquer resolução.
 */
export default function PageBackground() {
  return (
    <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">

      {/* ── Pílula vertical — topo direito ──────────────────────────── */}
      <div style={{
        position: 'absolute',
        top: '-6%',
        right: '18%',
        width: '72px',
        height: '195px',
        borderRadius: '50%',
        background: 'rgba(8, 32, 46, 0.58)',
      }} />

      {/* ── Grande arco direito — domina o centro ───────────────────── */}
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '-22%',
        width: '340px',
        height: '460px',
        borderRadius: '64% 36% 70% 30% / 38% 58% 42% 62%',
        background: 'rgba(10, 40, 58, 0.52)',
      }} />

      {/* ── Arco grande inferior esquerdo ───────────────────────────── */}
      <div style={{
        position: 'absolute',
        bottom: '-18%',
        left: '-22%',
        width: '400px',
        height: '340px',
        borderRadius: '52% 48% 38% 62% / 62% 38% 62% 38%',
        background: 'rgba(7, 26, 40, 0.62)',
      }} />

      {/* ── Faixa curva inferior — tipo serpente ─────────────────────── */}
      <div style={{
        position: 'absolute',
        bottom: '19%',
        right: '6%',
        width: '195px',
        height: '62px',
        borderRadius: '50%',
        background: 'rgba(14, 50, 66, 0.56)',
        transform: 'rotate(-14deg)',
      }} />

      {/* ── Segundo arco auxiliar centro-esquerdo ────────────────────── */}
      <div style={{
        position: 'absolute',
        top: '38%',
        left: '-18%',
        width: '260px',
        height: '280px',
        borderRadius: '50% 50% 60% 40% / 56% 44% 56% 44%',
        background: 'rgba(9, 35, 50, 0.38)',
      }} />

      {/* ── Faísca / estrela 4 pontas — canto inferior direito ──────── */}
      <div style={{
        position: 'absolute',
        bottom: '14%',
        right: '16%',
        width: '13px',
        height: '13px',
        background: 'rgba(255, 255, 255, 0.55)',
        clipPath: 'polygon(50% 0%, 57% 43%, 100% 50%, 57% 57%, 50% 100%, 43% 57%, 0% 50%, 43% 43%)',
      }} />

    </div>
  );
}
