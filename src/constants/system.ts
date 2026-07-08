export const STATUS_CONFIG = {
  aguardando: { label: "Aguardando entrega", color: "text-[#B7791F]", bg: "bg-[#FBF0DC]", border: "border-t-[#B7791F]", bgDestaque: "bg-orange-50" },
  apresentada: { label: "Em análise", color: "text-[#0E7C86]", bg: "bg-[#DDF0F1]", border: "border-t-[#0E7C86]", bgDestaque: "" },
  paga: { label: "Paga", color: "text-[#1E7A46]", bg: "bg-[#DFF2E6]", border: "border-t-[#1E7A46]", bgDestaque: "" },
  glosada: { label: "Glosada", color: "text-[#B3372F]", bg: "bg-[#F9E3E0]", border: "border-t-[#B3372F]", bgDestaque: "" }
};

export const DEFAULT_CONVENIOS = [
  "Unimed Curitiba — Local",
  "Unimed — Intercâmbio",
  "Unimed — Federação",
  "SulAmérica",
  "Bradesco Saúde",
  "Fellows"
];

export const ACOMODACOES = ["Enfermaria", "Apartamento"];

export const DEFAULT_CFG = {
  diasApresentacao: [5, 20],
  prazoFechamentoConta: 5,
  prazoPagamentoUnimed: 30,
  hospitalPadrao: "Hospital IPO"
};