'use client';
import { useState } from 'react';
import Header from '@/components/layout/Header';
import DashboardCards from '@/components/dashboard/DashboardCards';
import SurgeryList from '@/components/surgery/SurgeryList';
import SurgeryForm from '@/components/surgery/SurgeryForm';
import { useSurgeries } from '@/hooks/useSurgeries';
import { useConfig } from '@/hooks/useConfig';
import { semAcento } from '@/utils/helpers';

export default function Home() {
  const [modalNovoAberto, setModalNovoAberto] = useState(false);
  const [filtro, setFiltro] = useState('todos');
  const [busca, setBusca] = useState('');
  
  // Pegamos as funções e a config do banco de dados local
  const { casos, isLoaded, atualizarStatus, excluirCirurgia, addCirurgia } = useSurgeries();
  const { cfg } = useConfig();

  if (!isLoaded) return null;

  const casosFiltrados = casos.filter(c => {
    if (filtro === 'atrasadas') {
      const prev = c.pagamentoPrevisto ? new Date(c.pagamentoPrevisto) : null;
      const hoje = new Date();
      hoje.setHours(0,0,0,0);
      const pendente = c.status === 'aguardando' || c.status === 'apresentada';
      if (!(pendente && prev && prev < hoje)) return false;
    } else if (filtro !== 'todos' && c.status !== filtro) {
      return false;
    }

    if (busca) {
      const termo = semAcento(busca.toLowerCase());
      const textoCaso = semAcento(`${c.paciente} ${c.convenio} ${c.hospital} ${c.procedimento}`.toLowerCase());
      if (!textoCaso.includes(termo)) return false;
    }

    return true;
  });

  return (
    <main className="min-h-screen bg-[#F4F8F8] p-8 md:px-12 pb-16 font-sans">
      <Header 
        onNewSurgery={() => setModalNovoAberto(true)} 
        onOpenConfig={() => alert("Painel de Config em breve!")}
        onExport={() => alert("Exportação em breve!")}
      />

      <DashboardCards casos={casos} filtroAtual={filtro} onFilterChange={setFiltro} />

      <div className="flex gap-2 flex-wrap items-center mb-4">
        {['todos', 'aguardando', 'apresentada', 'atrasadas', 'paga', 'glosada'].map(f => (
          <button 
            key={f}
            onClick={() => setFiltro(f)}
            className={`border rounded-full px-4 py-1.5 text-[13px] font-medium capitalize transition-colors
              ${filtro === f ? 'bg-[#12333B] text-white border-[#12333B]' : 'bg-white text-[#12333B] border-[#C9D8DA] hover:bg-gray-50'}`}
          >
            {f === 'apresentada' ? 'Em análise' : f}
          </button>
        ))}
        <input 
          className="ml-auto border border-[#C9D8DA] rounded-lg px-4 py-2 text-[13.5px] min-w-[260px] bg-white outline-none focus:border-[#0E7C86]" 
          placeholder="Buscar paciente, convênio..." 
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {/* AQUI ESTÁ A CORREÇÃO: Passando as funções para a lista! */}
      <SurgeryList 
        casos={casosFiltrados} 
        onUpdateStatus={atualizarStatus} 
        onDelete={excluirCirurgia}
        cfg={cfg}
      />

      {modalNovoAberto && (
        <SurgeryForm 
          onClose={() => setModalNovoAberto(false)} 
          onAdd={addCirurgia} 
        />
      )}
    </main>
  );
}