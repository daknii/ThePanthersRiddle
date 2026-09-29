import React, { useEffect, useRef } from 'react';
import { animate } from 'animejs';

/**
 * Component: Page3Placeholder
 * Clean minimal placeholder for Page 3 of the puzzle.
 * To be replaced later by the teacher / developer.
 */
export const Page3Placeholder: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      animate(containerRef.current, {
        opacity: [0, 1],
        filter: ['blur(14px)', 'blur(0px)'],
        duration: 3200,
        ease: 'inOutCubic',
      });
    }
  }, []);

  return (
    <main
      ref={containerRef}
      className="w-full h-full min-h-screen flex flex-col items-center justify-center bg-[#050303] text-center px-6 opacity-0 select-none cursor-default"
      aria-label="Página 3 do Enigma"
    >
      <div className="max-w-md">
        <span className="font-mono text-xs tracking-[0.35em] text-[#990011] uppercase block mb-3.5">
          PORTAL CONECTADO • LIMIAR III
        </span>
        <h2 className="font-serif text-2xl sm:text-4xl text-[#ded4d6] font-bold tracking-[0.22em] uppercase mb-4">
          PÁGINA 3
        </h2>
        <p className="font-mono text-xs sm:text-sm text-[#5c4e51] tracking-[0.18em] uppercase">
          [ Espaço reservado para o próximo enigma do professor ]
        </p>
      </div>
    </main>
  );
};
