import * as XLSX from 'xlsx';
import { Cirurgia } from '@/types';
import { STATUS_CONFIG } from '@/constants/system';
import { fmt, toISO, hoje } from './helpers';

const dataBR = (iso?: string) => iso ? fmt(iso) : '';
const num = (v?: string | number) => v === null || v === undefined || v === "" ? "" : Number(v);

const latTexto = (v: string) => {
  const m: Record<string, string> = { UD: "unilateral direita", UE: "unilateral esquerda", BL: "bilateral" };
  return m[v] || "";
};

export const exportarExcel = (casos: Cirurgia[]) => {
  const cabecalho = [
    "Paciente", "Convênio", "Acomodação", "Códigos TUSS", "Procedimentos (com lateralidade)", "Hospital",
    "Data cirurgia", "Entrega prevista", "Entrega real", "Pagamento previsto", "Pagamento real",
    "Instrumentação cirúrgica (R$)", "Taxa de vídeo (R$)", "Valor pago (R$)", "Status", "Observações"
  ];

  const linhas = casos.map(c => {
    let cods = "", nomes = "";
    if (c.procedimentos && c.procedimentos.length) {
      cods = c.procedimentos.map(p => p.c).filter(Boolean).join(" + ");
      nomes = c.procedimentos.map(p => `${p.n}${p.lat ? ' — ' + latTexto(p.lat) : ''}`).join(" | ");
    } else {
      nomes = c.procedimento || "";
    }

    return [
      c.paciente || "", c.convenio || "", c.acomodacao || "", cods, nomes, c.hospital || "",
      dataBR(c.dataCirurgia), dataBR(c.apresentacaoPrevista), dataBR(c.apresentacaoReal),
      dataBR(c.pagamentoPrevisto), dataBR(c.pagamentoReal),
      num(c.instrumentacao), num(c.taxaVideo), num(c.valorPago),
      STATUS_CONFIG[c.status]?.label || "", c.obs || ""
    ];
  });

  const ws = XLSX.utils.aoa_to_sheet([cabecalho, ...linhas]);
  
  // Largura das colunas idênticas ao HTML
  ws["!cols"] = [
    { wch: 26 }, { wch: 22 }, { wch: 12 }, { wch: 22 }, { wch: 55 }, { wch: 16 },
    { wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 16 }, { wch: 14 },
    { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 18 }, { wch: 30 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Cirurgias");
  XLSX.writeFile(wb, `cirurgias-${toISO(hoje())}.xlsx`);
};