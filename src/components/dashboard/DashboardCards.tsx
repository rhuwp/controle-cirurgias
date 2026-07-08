import React from 'react';
import { Cirurgia } from '../../types';
import { STATUS_CONFIG } from '../../constants/system';
import { hoje, fromISO } from '../../utils/helpers';

interface Props {
  casos: Cirurgia[];
  filtroAtual: string;
  onFilterChange: (filtro: string) => void;
}

export default function DashboardCards({ casos, filtroAtual, onFilterChange }: Props) {
  const dataHoje = hoje();

  // Calcula os totais e atrasos
  const casosEnriquecidos = casos.map(c => {
    const prev = fromISO(c.pagamentoPrevisto);
    const pendente = c.status === 'aguardando' || c.status === 'apresentada';
    const atrasada = pendente && prev && prev < dataHoje;
    return { ...c, atrasada };
  });

  const totais = {
    aguardando: casosEnriquecidos.filter(c => c.status === 'aguardando').length,
    apresentada: casosEnriquecidos.filter(c => c.status === 'apresentada').length,
    atrasadas: casosEnriquecidos.filter(c => c.atrasada).length,
    paga: casosEnriquecidos.filter(c => c.status === 'paga').length,
  };

  const Card = ({ id, titulo, valor, destaque = false }: { id: keyof typeof STATUS_CONFIG | 'atrasadas', titulo: string, valor: number, destaque?: boolean }) => {
    const isAtivo = filtroAtual === id;
    // O card de atrasadas usa a cor de 'glosada' (vermelho) como base visual
    const configCor = id === 'atrasadas' ? STATUS_CONFIG['glosada'] : STATUS_CONFIG[id as keyof typeof STATUS_CONFIG];
    
    return (
      <button 
        onClick={() => onFilterChange(id)}
        className={`bg-white border rounded-xl p-4 text-left shadow-sm transition-all hover:scale-[1.02] 
          border-t-4 ${configCor.border} 
          ${destaque ? configCor.bgDestaque : ''} 
          ${isAtivo ? 'ring-2 ring-offset-2 ring-[#0E7C86]' : ''}`}
      >
        <div className={`text-3xl font-bold leading-tight ${configCor.color}`}>{valor}</div>
        <div className="text-[12.5px] text-[#314347] mt-1 font-semibold">{titulo}</div>
      </button>
    );
  };

  return (
    <div className="grid gap-3 mb-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <Card id="aguardando" titulo="Aguardando entrega" valor={totais.aguardando} />
      <Card id="apresentada" titulo="Em análise no convênio" valor={totais.apresentada} />
      <Card id="atrasadas" titulo="Pagamentos atrasados" valor={totais.atrasadas} destaque={totais.atrasadas > 0} />
      <Card id="paga" titulo="Pagas" valor={totais.paga} />
    </div>
  );
}