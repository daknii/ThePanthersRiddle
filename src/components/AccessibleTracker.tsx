import React from 'react';
import type { ProximityState } from '../types/puzzle';

interface AccessibleTrackerProps {
  proximityState: ProximityState;
  onAttemptAction: () => void;
  enabled: boolean;
}

export const AccessibleTracker: React.FC<AccessibleTrackerProps> = ({
  proximityState,
  onAttemptAction,
  enabled,
}) => {
  const getProximityDescription = (state: ProximityState): string => {
    switch (state) {
      case 'FAR':
        return 'Os olhos da pantera observam ao longe no escuro.';
      case 'GETTING_CLOSER':
        return 'Um dos olhos começa a piscar no abismo.';
      case 'CLOSER':
        return 'Ambos os olhos piscam de maneira descompassada.';
      case 'VERY_CLOSE':
        return 'Os olhos piscam em ritmo acelerado.';
      case 'INSIDE_TARGET':
        return 'Os olhos fixam em silêncio absoluto e um pulso escarlate surge no abismo.';
    }
  };

  return (
    <div className="sr-only" aria-live="polite" aria-atomic="true">
      <p>
        Instruções de acessibilidade: Utilize as setas do teclado (Cima, Baixo, Esquerda, Direita) ou W, A, S, D para deslocar o ponto de foco pelo abismo.
        Pressione a barra de Espaço ou a tecla Enter para tentar a interação na posição atual.
      </p>
      <p>{enabled ? getProximityDescription(proximityState) : 'Aguardando o despertar do enigma.'}</p>
      <button
        tabIndex={0}
        type="button"
        onClick={onAttemptAction}
        aria-label="Interagir na posição atual do foco"
      >
        Interagir
      </button>
    </div>
  );
};
