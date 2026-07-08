import { ConfigHospital } from '../types';

// Retorna apenas a data atual (zerada)
export function hoje(): Date {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}

// Converte Date para string ISO (YYYY-MM-DD)
export function toISO(d: Date): string {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

// Converte string ISO para Date
export function fromISO(s: string | null | undefined): Date | null {
  if (!s) return null;
  const p = s.split("-").map(Number);
  return new Date(p[0], p[1] - 1, p[2]);
}

// Adiciona dias a uma data
export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

// Formatação curta: 15 de out. de 2026
export function fmt(iso: string | null | undefined): string {
  const d = fromISO(iso);
  if (!d) return "—";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

// Formatação longa: seg., 15 de outubro de 2026
export function fmtLongo(iso: string | null | undefined): string {
  const d = fromISO(iso);
  if (!d) return "";
  return d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "long", year: "numeric" });
}

// Formatação em Reais (R$)
export function brl(v?: number | string | null): string {
  if (v === null || v === undefined || v === "" || isNaN(Number(v))) return "—";
  return Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Tira acentos para a barra de busca
export function semAcento(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// --- REGRAS DE NEGÓCIO DO FATURAMENTO --- //

export function proximaEntrega(cirISO: string, cfg: ConfigHospital): string {
  const dataCirurgia = fromISO(cirISO);
  if (!dataCirurgia) return '';
  
  const base = addDays(dataCirurgia, cfg.prazoFechamentoConta);
  const dias = [...cfg.diasApresentacao].sort((a, b) => a - b);
  
  if (dias.length === 0) return toISO(base);
  
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < dias.length; j++) {
      const cand = new Date(base.getFullYear(), base.getMonth() + i, dias[j]);
      if (cand.getDate() !== dias[j]) continue;
      if (cand >= base) return toISO(cand);
    }
  }
  return toISO(addDays(base, 15));
}

export function previsaoPagamento(apISO: string, cfg: ConfigHospital): string {
  const dataApresentacao = fromISO(apISO);
  if (!dataApresentacao) return '';
  return toISO(addDays(dataApresentacao, cfg.prazoPagamentoUnimed));
}