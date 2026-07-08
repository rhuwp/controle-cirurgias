import React, { useState } from 'react';
import { Cirurgia, ConfigHospital } from '../../types';
import { STATUS_CONFIG } from '../../constants/system';
import { fmt, brl, hoje, fromISO, toISO, previsaoPagamento } from '../../utils/helpers';

interface Props {
  casos: Cirurgia[];
  onUpdateStatus: (id: string, status: Cirurgia['status'], extras?: Partial<Cirurgia>) => void;
  onDelete: (id: string) => void;
  cfg: ConfigHospital;
}

export default function SurgeryList({ casos, onUpdateStatus, onDelete, cfg }: Props) {
  const [detalheAberto, setDetalheAberto] = useState<string | null>(null);
  
  // Estado para controlar os Modais (Diálogos) iguais ao HTML original
  const [dlg, setDlg] = useState({ open: false, id: '', type: '', titulo: '', rotulo: '', data: '', valor: '', pedirValor: false });

  const dataHoje = hoje();

  // Funções de abrir Modal
  const abrirModalApresentada = (c: Cirurgia) => {
    setDlg({ open: true, id: c.id, type: 'apresentada', titulo: 'Conta entregue ao convênio', rotulo: 'Data real de entrega', data: c.apresentacaoPrevista || toISO(dataHoje), valor: '', pedirValor: false });
  };

  const abrirModalPaga = (c: Cirurgia) => {
    setDlg({ open: true, id: c.id, type: 'paga', titulo: 'Registrar pagamento', rotulo: 'Data do pagamento', data: toISO(dataHoje), valor: '', pedirValor: true });
  };

  const confirmarModal = () => {
    if (!dlg.data) return alert("Informe a data.");
    
    if (dlg.type === 'apresentada') {
      const pagPrevisto = previsaoPagamento(dlg.data, cfg);
      onUpdateStatus(dlg.id, 'apresentada', { apresentacaoReal: dlg.data, pagamentoPrevisto: pagPrevisto });
    } else if (dlg.type === 'paga') {
      onUpdateStatus(dlg.id, 'paga', { pagamentoReal: dlg.data, valorPago: dlg.valor ? Number(dlg.valor) : undefined });
    }
    setDlg({ ...dlg, open: false });
  };

  const handleExcluir = (id: string) => {
    if (window.confirm("Excluir este registro definitivamente?")) {
      onDelete(id);
    }
  };

  if (casos.length === 0) {
    return <div className="bg-white border border-[#C9D8DA] rounded-xl p-9 text-center text-[#5B7075] border-dashed text-[14.5px]">Nenhum registro corresponde ao filtro atual.</div>;
  }

  return (
    <div className="space-y-3">
      {casos.map(c => {
        const st = STATUS_CONFIG[c.status];
        const prev = fromISO(c.pagamentoPrevisto);
        const pendente = c.status === 'aguardando' || c.status === 'apresentada';
        const atrasada = pendente && prev && prev < dataHoje;
        const diasRestantes = prev ? Math.round((prev.getTime() - dataHoje.getTime()) / 86400000) : 0;

        // Lógicas da Timeline original do HTML
        const etapaNum = c.status === "aguardando" ? 0 : c.status === "apresentada" ? 1 : 2;
        const rot3 = c.status === "paga" ? "Paga" : c.status === "glosada" ? "Glosada" : "Pagamento previsto";
        const dat3 = c.status === "paga" ? `${fmt(c.pagamentoReal)}${c.valorPago ? ' · ' + brl(c.valorPago) : ''}` : fmt(c.pagamentoPrevisto);

        // Lógica de Instrumentação/Vídeo original
        let cobrHTML = null;
        if (c.instrumentacao || c.taxaVideo) {
          const partes = [];
          if (c.instrumentacao) partes.push(`Instrumentação cirúrgica: ${brl(c.instrumentacao)}`);
          if (c.taxaVideo) partes.push(`Taxa de vídeo: ${brl(c.taxaVideo)}`);
          cobrHTML = <div className="text-[12.5px] text-[#12333B] mt-[3px] font-semibold">{partes.join(" · ")}</div>;
        }

        return (
          <div key={c.id} className={`bg-white border rounded-xl p-4 shadow-sm ${atrasada ? 'border-l-4 border-l-[#B3372F]' : 'border-[#DCE7E8]'}`}>
            
            {/* Topo do Card */}
            <div className="flex flex-wrap justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[17px] font-extrabold text-[#12333B]">{c.paciente}</div>
                <div className="text-[13.5px] text-[#0E7C86] font-semibold mt-0.5">
                  {c.procedimento || c.procedimentos?.map(p => `${p.c ? p.c + ' ' : ''}${p.n}`).join(' | ')}
                </div>
                <div className="text-[12.5px] text-[#5B7075] mt-1 flex flex-wrap gap-1 items-center">
                  <span className="bg-[#EDF3F4] rounded-md px-2 py-px font-semibold">{c.convenio || "—"}</span>
                  {c.acomodacao && <span className="bg-[#EDF3F4] rounded-md px-2 py-px font-semibold">{c.acomodacao}</span>}
                  <span>{c.hospital}</span>
                </div>
                {cobrHTML}
              </div>
              
              <div className="text-right shrink-0">
                <span className={`text-xs font-bold rounded-full px-3 py-1.5 whitespace-nowrap ${st.bg} ${st.color}`}>
                  {st.label}
                </span>
                {atrasada && <div className="text-xs text-[#B3372F] font-bold mt-1.5 text-right">{Math.abs(diasRestantes)} dia(s) além do prazo</div>}
                {!atrasada && pendente && prev && <div className="text-xs text-[#5B7075] mt-1.5 text-right">pagamento em ~{diasRestantes} dia(s)</div>}
              </div>
            </div>

            {/* TIMELINE (LINHA DO TEMPO) idêntica ao HTML */}
            <div className="flex items-end mt-4 mb-1 pt-2 px-1.5 overflow-x-auto">
              <Etapa rotulo="Cirurgia" data={fmt(c.dataCirurgia)} on={true} />
              <Trilho on={etapaNum >= 1} />
              <Etapa rotulo={c.apresentacaoReal ? "Entregue" : "Entrega prevista"} data={fmt(c.apresentacaoReal || c.apresentacaoPrevista)} on={etapaNum >= 1} />
              <Trilho on={etapaNum >= 2} />
              <Etapa rotulo={rot3} data={dat3} on={etapaNum >= 2} alerta={c.status === 'glosada'} />
            </div>

            {/* Ações / Botões */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {c.status === 'aguardando' && (
                <button onClick={() => abrirModalApresentada(c)} className="bg-white border border-[#9EC7CB] text-[#0E7C86] rounded-lg px-3.5 py-1.5 text-[13px] font-bold hover:bg-gray-50">
                  Marcar entregue
                </button>
              )}
              {c.status === 'apresentada' && (
                <>
                  <button onClick={() => abrirModalPaga(c)} className="bg-white border border-[#9EC7CB] text-[#0E7C86] rounded-lg px-3.5 py-1.5 text-[13px] font-bold hover:bg-gray-50">
                    Marcar paga
                  </button>
                  <button onClick={() => onUpdateStatus(c.id, 'glosada')} className="bg-white border border-[#E5B8B3] text-[#B3372F] rounded-lg px-3.5 py-1.5 text-[13px] font-bold hover:bg-red-50">
                    Marcar glosada
                  </button>
                </>
              )}
              {c.status === 'glosada' && (
                <button onClick={() => onUpdateStatus(c.id, 'apresentada')} className="bg-white border border-[#9EC7CB] text-[#0E7C86] rounded-lg px-3.5 py-1.5 text-[13px] font-bold hover:bg-gray-50">
                  Reapresentar (recurso)
                </button>
              )}
              
              <span className="flex-1"></span>
              
              <button onClick={() => setDetalheAberto(detalheAberto === c.id ? null : c.id)} className="bg-transparent border-none text-[#5B7075] text-[12.5px] underline hover:text-[#12333B]">
                {detalheAberto === c.id ? 'fechar' : 'detalhes'}
              </button>
              <button onClick={() => handleExcluir(c.id)} className="bg-transparent border-none text-[#B3372F] text-[12.5px] underline hover:text-red-800">
                excluir
              </button>
            </div>

            {/* Detalhes expandidos */}
            {detalheAberto === c.id && (
              <div className="mt-2.5 pt-2.5 border-t border-[#EDF3F4] text-[13.5px]">
                {c.obs ? <span><b>Observações:</b> {c.obs}</span> : <span className="text-[#7A8B90]">Sem observações.</span>}
                <div className="mt-1.5 text-[12px] text-[#7A8B90]">Registrado em {fmt(c.criadoEm)}</div>
              </div>
            )}
          </div>
        );
      })}

      {/* DIÁLOGO / MODAL (Idêntico à tag <dialog> do HTML) */}
      {dlg.open && (
        <div className="fixed inset-0 bg-[#12333B]/35 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#DCE7E8] rounded-xl p-6 w-full max-w-[420px] shadow-2xl">
            <h2 className="text-[17px] font-bold m-0 mb-3.5">{dlg.titulo}</h2>
            
            <div className="flex flex-col gap-1 mb-3">
              <span className="text-[12.5px] font-bold text-[#5B7075]">{dlg.rotulo}</span>
              <input type="date" className="border border-[#C9D8DA] rounded-lg px-3 py-2 text-sm bg-[#FBFDFD] outline-none" value={dlg.data} onChange={e => setDlg({...dlg, data: e.target.value})} />
            </div>

            {dlg.pedirValor && (
              <div className="flex flex-col gap-1 mb-3">
                <span className="text-[12.5px] font-bold text-[#5B7075]">Valor pago (R$) — opcional</span>
                <input type="number" min="0" step="0.01" className="border border-[#C9D8DA] rounded-lg px-3 py-2 text-sm bg-[#FBFDFD] outline-none" value={dlg.valor} onChange={e => setDlg({...dlg, valor: e.target.value})} />
              </div>
            )}

            <div className="flex gap-2.5 mt-4">
              <button onClick={confirmarModal} className="bg-[#0E7C86] text-white rounded-lg px-[18px] py-[10px] text-sm font-bold hover:bg-[#0b5a61]">Confirmar</button>
              <button onClick={() => setDlg({...dlg, open: false})} className="bg-white text-[#12333B] border border-[#C9D8DA] rounded-lg px-4 py-2 text-sm font-semibold hover:bg-gray-50">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Componentes visuais da Timeline
const Etapa = ({ rotulo, data, on, alerta }: any) => (
  <div className="text-center min-w-[90px]">
    <div className={`w-3 h-3 rounded-full mx-auto mb-1.5 ${alerta ? 'bg-[#B3372F]' : on ? 'bg-[#0E7C86] shadow-[0_0_0_3px_#DDF0F1]' : 'bg-[#C9D8DA]'}`}></div>
    <div className="text-[11px] uppercase tracking-[0.5px] text-[#5B7075] font-semibold">{rotulo}</div>
    <div className="text-[13px] font-semibold text-[#12333B]">{data}</div>
  </div>
);

const Trilho = ({ on }: { on: boolean }) => (
  <div className={`flex-1 h-[2px] mx-1 mb-[34px] ${on ? 'bg-[#0E7C86]' : 'bg-[#C9D8DA]'}`}></div>
);