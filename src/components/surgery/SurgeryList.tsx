import React from 'react';
import { Cirurgia } from '../../types';
import { STATUS_CONFIG } from '../../constants/system';
import { fmt, brl, hoje, fromISO } from '../../utils/helpers';

interface Props {
  casos: Cirurgia[];
}

export default function SurgeryList({ casos }: Props) {
  if (casos.length === 0) {
    return (
      <div className="bg-white border border-[#DCE7E8] rounded-xl p-8 text-center text-[#5B7075] border-dashed text-[14.5px]">
        Nenhum registro encontrado.
      </div>
    );
  }

  const dataHoje = hoje();

  return (
    <div className="space-y-3">
      {casos.map(c => {
        const st = STATUS_CONFIG[c.status];
        const prev = fromISO(c.pagamentoPrevisto);
        const pendente = c.status === 'aguardando' || c.status === 'apresentada';
        const atrasada = pendente && prev && prev < dataHoje;
        const diasRestantes = prev ? Math.round((prev.getTime() - dataHoje.getTime()) / 86400000) : 0;

        return (
          <div key={c.id} className={`bg-white border rounded-xl p-4 shadow-sm ${atrasada ? 'border-l-4 border-l-[#B3372F]' : 'border-[#DCE7E8]'}`}>
            <div className="flex flex-wrap justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[17px] font-extrabold text-[#12333B]">{c.paciente}</div>
                <div className="text-[13.5px] text-[#0E7C86] font-semibold mt-1">
                  {c.procedimento || c.procedimentos?.map(p => `${p.c} - ${p.n}`).join(' | ')}
                </div>
                <div className="text-[12.5px] text-[#5B7075] mt-1 flex gap-2 items-center">
                  <span className="bg-[#EDF3F4] rounded-md px-2 py-0.5 font-semibold">{c.convenio}</span>
                  <span className="bg-[#EDF3F4] rounded-md px-2 py-0.5 font-semibold">{c.acomodacao}</span>
                  <span>{c.hospital}</span>
                </div>
                {(!!c.instrumentacao || !!c.taxaVideo) && (
                  <div className="text-[12.5px] text-[#12333B] font-semibold mt-2">
                    {c.instrumentacao ? `Instr: ${brl(c.instrumentacao)}` : ''} 
                    {c.instrumentacao && c.taxaVideo ? ' · ' : ''}
                    {c.taxaVideo ? `Vídeo: ${brl(c.taxaVideo)}` : ''}
                  </div>
                )}
              </div>
              
              <div className="text-right shrink-0">
                <span className={`text-xs font-bold rounded-full px-3 py-1 whitespace-nowrap ${st.bg} ${st.color}`}>
                  {st.label}
                </span>
                {atrasada && <div className="text-xs text-[#B3372F] font-bold mt-2">{Math.abs(diasRestantes)} dia(s) em atraso</div>}
                {!atrasada && pendente && <div className="text-xs text-[#5B7075] mt-2">vence em {diasRestantes} dia(s)</div>}
              </div>
            </div>

            {/* Ações simplificadas para o protótipo */}
            <div className="mt-4 pt-3 border-t border-[#EDF3F4] flex gap-2">
              {c.status === 'aguardando' && <button className="text-[13px] font-bold text-[#0E7C86] border border-[#9EC7CB] px-3 py-1.5 rounded-lg hover:bg-[#DDF0F1]">Marcar Entregue</button>}
              {c.status === 'apresentada' && <button className="text-[13px] font-bold text-[#0E7C86] border border-[#9EC7CB] px-3 py-1.5 rounded-lg hover:bg-[#DDF0F1]">Marcar Paga</button>}
              <button className="text-[12.5px] text-[#B3372F] underline ml-auto hover:text-red-800">excluir</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}