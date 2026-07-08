export interface Procedimento {
  c: string; // Código
  n: string; // Nome
  lat: string; // Lateralidade
}

export interface Cirurgia {
  id: string;
  criadoEm: string;
  status: 'aguardando' | 'apresentada' | 'paga' | 'glosada';
  paciente: string;
  dataCirurgia: string;
  apresentacaoPrevista: string;
  apresentacaoReal?: string;
  pagamentoPrevisto: string;
  pagamentoReal?: string;
  procedimentos?: Procedimento[];
  procedimento?: string; // Para os casos antigos com texto livre
  convenio: string;
  acomodacao: string;
  hospital: string;
  instrumentacao?: number;
  taxaVideo?: number;
  valorPago?: number;
  obs?: string;
}

export interface ConfigHospital {
  diasApresentacao: number[];
  prazoFechamentoConta: number;
  prazoPagamentoUnimed: number;
  hospitalPadrao: string;
}