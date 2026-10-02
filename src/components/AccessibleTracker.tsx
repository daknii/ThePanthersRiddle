import React from 'react';
import type { ProximityState } from '../types/puzzle';

interface AccessibleTrackerProps {
  proximityState: ProximityState;
  onAttemptAction: () => void;
  enabled: boolean;
}

/**
 * Component: AccessibleTracker
 * Provides accessible auditory and screen-reader alternatives for cursor tracking.
 * Visually hidden to maintain the cryptic mystery aesthetic, but fully readable
 * by assistive technologies (NVDA, VoiceOver, TalkBack, Orca).
 */
export const AccessibleTracker: React.FC<AccessibleTrackerProps> = ({
  proximityState,
  onAttemptAction,
  enabled,
}) => {
  // Map proximity states to screen-reader accessible descriptions
  const getProximityDescription = (state: ProximityState): string => {
    switch (state) {
      case 'FAR':
        return 'Os olhos da pantera observam ao longe no escuro.';
      case 'GETTING_CLOSER':
        return 'Um dos olhos começa a piscar involuntariamente.';
      case 'CLOSER':
        return 'Ambos os olhos piscam de maneira descompassada e assíncrona.';
      case 'VERY_CLOSE':
        return 'Os olhos piscam freneticamente em ritmo muito acelerado.';
      case 'INSIDE_TARGET':
        return 'Alvo encontrado! Os olhos pararam de piscar e um sinal vermelho pulsa em suas pupilas. Clique agora.';
    }
  };

  return (
    <div className="sr-only" aria-live="polite" aria-atomic="true">
      <p>
        Instruções de acessibilidade: Utilize as setas do teclado (Cima, Baixo, Esquerda, Direita) ou W, A, S, D para deslocar o ponto de foco pelo abismo.
        Pressione a barra de Espaço ou a tecla Enter para tentar o clique na posição atual.
      </p>
      <p>{enabled ? getProximityDescription(proximityState) : 'Aguardando o despertar do enigma.'}</p>
      <button
        tabIndex={0}
        type="button"
        onClick={onAttemptAction}
        aria-label="Tentar clique na posição atual do foco"
      >
        Interagir
      </button>
    </div>
  );
};
