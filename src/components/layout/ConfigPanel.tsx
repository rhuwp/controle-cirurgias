import React, { useState } from 'react';
import { useConfig } from '@/hooks/useConfig';

interface Props {
  onClose: () => void;
}

export default function ConfigPanel({ onClose }: Props) {
  const { cfg, convenios } = useConfig();

  // Estados locais para edição
  const [dias, setDias] = useState(cfg.diasApresentacao.join(', '));
  const [fechamento, setFechamento] = useState(cfg.prazoFechamentoConta.toString());
  const [pgto, setPgto] = useState(cfg.prazoPagamentoUnimed.toString());
  const [hospital, setHospital] = useState(cfg.hospitalPadrao);
  
  const [listaConv, setListaConv] = useState<string[]>([...convenios]);
  const [novoConv, setNovoConv] = useState('');

  const handleAddConvenio = () => {
    const t = novoConv.trim();
    if (!t) return;
    if (!listaConv.includes(t)) {
      setListaConv([...listaConv, t]);
    }
    setNovoConv('');
  };

  const handleRemoveConvenio = (index: number) => {
    if (window.confirm(`Remover o convênio "${listaConv[index]}" da lista? (Os casos já cadastrados não são alterados.)`)) {
      const novaLista = [...listaConv];
      novaLista.splice(index, 1);
      setListaConv(novaLista);
    }
  };

  const handleSalvar = () => {
    // Processa os dias separados por vírgula
    let listaDias = dias.split(/[,;\s]+/).map(n => parseInt(n, 10)).filter(n => n >= 1 && n <= 31);
    listaDias = Array.from(new Set(listaDias)).sort((a, b) => a - b);
    
    const novoCfg = {
      diasApresentacao: listaDias.length ? listaDias : cfg.diasApresentacao,
      prazoFechamentoConta: Math.max(0, parseInt(fechamento, 10) || 0),
      prazoPagamentoUnimed: Math.max(1, parseInt(pgto, 10) || 30),
      hospitalPadrao: hospital.trim() || "Hospital"
    };

    localStorage.setItem('unimed-config-v1', JSON.stringify(novoCfg));
    localStorage.setItem('unimed-convenios-v1', JSON.stringify(listaConv));
    
    // Força o recarregamento da página para aplicar globalmente as novas regras de datas
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-[#12333B]/35 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-[#DCE7E8] rounded-xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-[#12333B] mb-4">Parâmetros de faturamento</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <label className="flex flex-col gap-1">
            <span className="text-[12.5px] font-bold text-[#314347]">Dias fixos de entrega (ex: 5, 20)</span>
            <input className="border border-[#C9D8DA] rounded-lg px-3 py-2 text-sm bg-[#FBFDFD] outline-none focus:border-[#0E7C86]" value={dias} onChange={e => setDias(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[12.5px] font-bold text-[#314347]">Prazo hospital p/ fechar conta (dias)</span>
            <input type="number" min="0" className="border border-[#C9D8DA] rounded-lg px-3 py-2 text-sm bg-[#FBFDFD] outline-none focus:border-[#0E7C86]" value={fechamento} onChange={e => setFechamento(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[12.5px] font-bold text-[#314347]">Prazo pagamento convênio (dias)</span>
            <input type="number" min="1" className="border border-[#C9D8DA] rounded-lg px-3 py-2 text-sm bg-[#FBFDFD] outline-none focus:border-[#0E7C86]" value={pgto} onChange={e => setPgto(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[12.5px] font-bold text-[#314347]">Hospital padrão</span>
            <input className="border border-[#C9D8DA] rounded-lg px-3 py-2 text-sm bg-[#FBFDFD] outline-none focus:border-[#0E7C86]" value={hospital} onChange={e => setHospital(e.target.value)} />
          </label>
        </div>

        <h3 className="text-[14px] font-bold text-[#314347] uppercase tracking-[1px] mb-1">Convênios</h3>
        <p className="text-[13px] text-[#314347] mb-3">Estes convênios aparecem como botões no cadastro. Adicione ou remova conforme sua carteira.</p>
        
        <div className="flex flex-col gap-2 mb-3">
          {listaConv.length === 0 ? (
            <div className="text-[13px] text-[#314347]">Nenhum convênio cadastrado.</div>
          ) : (
            listaConv.map((cv, i) => (
              <div key={i} className="flex items-center gap-2 bg-[#FBFDFD] border border-[#C9D8DA] rounded-lg px-3 py-2 text-[13.5px]">
                <span className="flex-1 text-[#12333B] font-medium">{cv}</span>
                <button onClick={() => handleRemoveConvenio(i)} className="text-[12.5px] text-[#B3372F] underline hover:text-red-800">remover</button>
              </div>
            ))
          )}
        </div>

        <div className="flex gap-2 max-w-[480px] mb-6">
          <input className="flex-1 border border-[#C9D8DA] rounded-lg px-3 py-2 text-sm bg-[#FBFDFD] outline-none focus:border-[#0E7C86]" placeholder="Nome do novo convênio..." value={novoConv} onChange={e => setNovoConv(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddConvenio()} />
          <button onClick={handleAddConvenio} className="bg-white text-[#12333B] border border-[#C9D8DA] rounded-lg px-4 py-2 text-sm font-semibold hover:bg-gray-50">Adicionar</button>
        </div>

        <div className="flex gap-2 pt-4 border-t border-[#DCE7E8]">
          <button onClick={handleSalvar} className="bg-[#0E7C86] text-white rounded-lg px-4 py-2 text-sm font-bold hover:bg-[#0b5a61]">Salvar parâmetros</button>
          <button onClick={onClose} className="bg-white text-[#12333B] border border-[#C9D8DA] rounded-lg px-4 py-2 text-sm font-semibold hover:bg-gray-50">Cancelar</button>
        </div>
      </div>
    </div>
  );
}