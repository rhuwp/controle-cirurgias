import React, { useState, useMemo } from 'react';
import { useConfig } from '@/hooks/useConfig';
import { useSurgeries } from '@/hooks/useSurgeries';
import { CATALOGO, LATERALIDADES } from '@/constants/tuss';
import { ACOMODACOES } from '@/constants/system';
import { toISO, addDays, proximaEntrega, previsaoPagamento, semAcento, fmt } from '@/utils/helpers';
import { Procedimento, Cirurgia } from '@/types';


interface Props {
  onClose: () => void;
  onAdd: (novaCirurgia: Omit<Cirurgia, 'id' | 'criadoEm' | 'status'>) => void; 
}

export default function SurgeryForm({ onClose, onAdd }: Props) {
  const { cfg, convenios } = useConfig();
 

  // Estados do formulário
  const [paciente, setPaciente] = useState('');
  const [hospital, setHospital] = useState(cfg?.hospitalPadrao || '');
  const [convenio, setConvenio] = useState('');
  const [acomodacao, setAcomodacao] = useState('');
  const [dataCirurgia, setDataCirurgia] = useState('');
  
  // Estados do Catálogo
  const [buscaCat, setBuscaCat] = useState('');
  const [selProcs, setSelProcs] = useState<Procedimento[]>([]);
  
  // Estados Adicionais
  const [instrumentacao, setInstrumentacao] = useState<number | ''>('');
  const [taxaVideo, setTaxaVideo] = useState<number | ''>('');
  const [obs, setObs] = useState('');

  // Filtra o catálogo TUSS baseado na busca
  const catalogoFiltrado = useMemo(() => {
    if (!buscaCat) return [];
    const q = semAcento(buscaCat.toLowerCase());
    return CATALOGO.filter(p => semAcento(`${p.c} ${p.n}`.toLowerCase()).includes(q)).slice(0, 50); // Limita a 50 resultados para não travar
  }, [buscaCat]);

  const toggleProc = (cod: string, nome: string) => {
    const existe = selProcs.find(p => p.c === cod);
    if (existe) {
      setSelProcs(selProcs.filter(p => p.c !== cod));
    } else {
      setSelProcs([...selProcs, { c: cod, n: nome, lat: '' }]);
    }
  };

  const updateLat = (index: number, lat: string) => {
    const novos = [...selProcs];
    novos[index].lat = lat;
    setSelProcs(novos);
  };

  const addProcLivre = () => {
    const texto = window.prompt("Descreva o procedimento (sem código TUSS):");
    if (texto && texto.trim()) {
      setSelProcs([...selProcs, { c: '', n: texto.trim(), lat: '' }]);
    }
  };

  // Calcula as previsões em tempo real
  const dataEntregaPrevista = dataCirurgia ? proximaEntrega(dataCirurgia, cfg) : '';
  const dataPagamentoPrevista = dataEntregaPrevista ? previsaoPagamento(dataEntregaPrevista, cfg) : '';

  const podeSalvar = paciente.trim() !== '' && dataCirurgia !== '' && convenio !== '' && acomodacao !== '' && selProcs.length > 0;

  const handleSalvar = () => {
    if (!podeSalvar) return;
    
    onAdd({
      paciente: paciente.trim(),
      dataCirurgia,
      apresentacaoPrevista: dataEntregaPrevista,
      pagamentoPrevisto: dataPagamentoPrevista,
      procedimentos: selProcs,
      procedimento: selProcs.map(p => `${p.c ? p.c + ' ' : ''}${p.n}`).join(' | '),
      hospital: hospital.trim() || cfg.hospitalPadrao,
      convenio,
      acomodacao,
      instrumentacao: instrumentacao ? Number(instrumentacao) : undefined,
      taxaVideo: taxaVideo ? Number(taxaVideo) : undefined,
      obs: obs.trim()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#12333B]/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-[#DCE7E8] rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <h2 className="text-xl font-bold mb-4">Nova cirurgia</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <label className="flex flex-col gap-1">
            <span className="text-[12.5px] font-bold text-[#5B7075]">Paciente *</span>
            <input className="border border-[#C9D8DA] rounded-lg px-3 py-2 text-sm bg-[#FBFDFD] outline-none focus:border-[#0E7C86]" placeholder="Nome do paciente" value={paciente} onChange={e => setPaciente(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[12.5px] font-bold text-[#5B7075]">Hospital</span>
            <input className="border border-[#C9D8DA] rounded-lg px-3 py-2 text-sm bg-[#FBFDFD] outline-none focus:border-[#0E7C86]" value={hospital} onChange={e => setHospital(e.target.value)} />
          </label>
        </div>

        <div className="mb-4">
          <span className="text-[12.5px] font-bold text-[#5B7075] block mb-2">Convênio *</span>
          <div className="flex flex-wrap gap-2">
            {convenios.map(cv => (
              <button key={cv} onClick={() => setConvenio(cv)} className={`border rounded-full px-3 py-1.5 text-[13px] font-semibold transition-colors ${convenio === cv ? 'bg-[#0E7C86] text-white border-[#0E7C86]' : 'bg-white text-[#12333B] border-[#C9D8DA]'}`}>
                {cv}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <span className="text-[12.5px] font-bold text-[#5B7075] block mb-2">Acomodação *</span>
          <div className="flex flex-wrap gap-2">
            {ACOMODACOES.map(ac => (
              <button key={ac} onClick={() => setAcomodacao(ac)} className={`border rounded-full px-3 py-1.5 text-[13px] font-semibold transition-colors ${acomodacao === ac ? 'bg-[#12333B] text-white border-[#12333B]' : 'bg-white text-[#12333B] border-[#C9D8DA]'}`}>
                {ac}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="flex flex-col gap-1">
            <span className="text-[12.5px] font-bold text-[#5B7075]">Data da cirurgia *</span>
            <input type="date" className="border border-[#C9D8DA] rounded-lg px-3 py-2 text-sm bg-[#FBFDFD] w-full max-w-[200px] outline-none focus:border-[#0E7C86]" value={dataCirurgia} onChange={e => setDataCirurgia(e.target.value)} />
          </label>
        </div>

        <div className="mb-4">
          <span className="text-[12.5px] font-bold text-[#5B7075] block mb-1">Procedimentos (tabela TUSS) *</span>
          <input 
            className="border border-[#C9D8DA] rounded-lg px-3 py-2 text-sm bg-[#FBFDFD] w-full outline-none focus:border-[#0E7C86] mb-2" 
            placeholder="Filtrar por código ou nome... (ex: septoplastia)" 
            value={buscaCat} 
            onChange={e => setBuscaCat(e.target.value)} 
          />
          
          {buscaCat && (
            <div className="border border-[#C9D8DA] rounded-lg max-h-48 overflow-y-auto mb-2 bg-white">
              {catalogoFiltrado.length > 0 ? catalogoFiltrado.map(p => {
                const isSelected = selProcs.some(sp => sp.c === p.c);
                return (
                  <button key={p.c} onClick={() => toggleProc(p.c, p.n)} className={`w-full text-left px-3 py-2 text-[13.5px] border-b border-[#EDF3F4] last:border-0 hover:bg-[#DDF0F1] ${isSelected ? 'bg-[#DDF0F1] font-bold' : ''}`}>
                    <span className="bg-white border border-[#9EC7CB] text-[#0E7C86] font-mono text-[12px] px-1.5 py-0.5 rounded mr-2">{p.c}</span>
                    {p.n}
                  </button>
                );
              }) : (
                <div className="p-3 text-[13px] text-[#5B7075]">Nenhum procedimento encontrado.</div>
              )}
            </div>
          )}

          <div className="space-y-2 mt-3">
            {selProcs.map((p, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2 bg-[#DDF0F1] border border-[#9EC7CB] rounded-lg p-2 text-[12.5px] font-semibold text-[#0B5A61]">
                <span className="flex-1">{p.c ? `${p.c} · ` : ''}{p.n}</span>
                <select className="border border-[#C9D8DA] rounded px-2 py-1 bg-white outline-none" value={p.lat} onChange={e => updateLat(i, e.target.value)}>
                  {LATERALIDADES.map(l => <option key={l.v} value={l.v}>{l.t}</option>)}
                </select>
                <button onClick={() => setSelProcs(selProcs.filter((_, idx) => idx !== i))} className="text-lg font-bold px-2 hover:text-red-600">×</button>
              </div>
            ))}
          </div>
          
          <button onClick={addProcLivre} className="text-[12.5px] text-[#5B7075] underline mt-2 hover:text-[#12333B]">
            + adicionar procedimento fora da tabela (texto livre)
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <label className="flex flex-col gap-1">
            <span className="text-[12.5px] font-bold text-[#5B7075]">Instrum. cirúrgica (R$)</span>
            <input type="number" min="0" step="0.01" className="border border-[#C9D8DA] rounded-lg px-3 py-2 text-sm bg-[#FBFDFD] outline-none" value={instrumentacao} onChange={e => setInstrumentacao(e.target.value ? Number(e.target.value) : '')} placeholder="opcional" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[12.5px] font-bold text-[#5B7075]">Taxa de vídeo (R$)</span>
            <input type="number" min="0" step="0.01" className="border border-[#C9D8DA] rounded-lg px-3 py-2 text-sm bg-[#FBFDFD] outline-none" value={taxaVideo} onChange={e => setTaxaVideo(e.target.value ? Number(e.target.value) : '')} placeholder="opcional" />
          </label>
        </div>

        <label className="flex flex-col gap-1 mb-4">
          <span className="text-[12.5px] font-bold text-[#5B7075]">Observações</span>
          <textarea className="border border-[#C9D8DA] rounded-lg px-3 py-2 text-sm bg-[#FBFDFD] min-h-[60px] outline-none" value={obs} onChange={e => setObs(e.target.value)} placeholder="Ex.: OPME, particularidades da conta..."></textarea>
        </label>

        {dataCirurgia && (
          <div className="bg-[#DDF0F1] border border-[#9EC7CB] rounded-lg p-3 text-[13.5px] text-[#0B5A61] mb-4">
            Cirurgia em <b>{fmt(dataCirurgia)}</b> → entrega prevista em <b>{fmt(dataEntregaPrevista)}</b> (próximo dia fixo: {cfg.diasApresentacao.join('/')}) → pagamento até <b>{fmt(dataPagamentoPrevista)}</b> ({cfg.prazoPagamentoUnimed} dias após a entrega).
          </div>
        )}

        <div className="flex gap-2 mt-6 pt-4 border-t border-[#DCE7E8]">
          <button onClick={handleSalvar} disabled={!podeSalvar} className="bg-[#0E7C86] text-white rounded-lg px-4 py-2 text-sm font-bold hover:bg-[#0b5a61] disabled:opacity-50 disabled:cursor-not-allowed">
            Salvar cirurgia
          </button>
          <button onClick={onClose} className="bg-white text-[#12333B] border border-[#C9D8DA] rounded-lg px-4 py-2 text-sm font-semibold hover:bg-gray-50">
            Cancelar
          </button>
        </div>

      </div>
    </div>
  );
}