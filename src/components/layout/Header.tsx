import React from 'react';

interface HeaderProps {
  onNewSurgery: () => void;
  onOpenConfig: () => void;
  onExport: () => void;
}

export default function Header({ onNewSurgery, onOpenConfig, onExport }: HeaderProps) {
  return (
    <header className="flex flex-wrap gap-4 items-end justify-between mb-6">
      <div>
        <div className="text-[11.5px] tracking-[2px] uppercase text-[#0E7C86] font-bold mb-1">
          Faturamento cirúrgico · Rinologia
        </div>
        <h1 className="m-0 text-[clamp(24px,3.4vw,34px)] font-extrabold tracking-[-0.5px] text-[#12333B]">
          Controle de Cirurgias
        </h1>
      </div>
      <div className="flex gap-2 flex-wrap">
        <button onClick={onExport} className="bg-white text-[#12333B] border border-[#C9D8DA] rounded-lg px-4 py-2 text-sm font-semibold hover:bg-gray-50">
          Exportar Excel
        </button>
        <button onClick={onOpenConfig} className="bg-white text-[#12333B] border border-[#C9D8DA] rounded-lg px-4 py-2 text-sm font-semibold hover:bg-gray-50">
          Parâmetros e convênios
        </button>
        <button onClick={onNewSurgery} className="bg-[#0E7C86] text-white rounded-lg px-[18px] py-[10px] text-sm font-bold hover:bg-[#0b5a61] transition-colors">
          + Nova cirurgia
        </button>
      </div>
    </header>
  );
}