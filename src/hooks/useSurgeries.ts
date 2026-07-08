import { useState, useEffect } from 'react';
import { Cirurgia } from '../types';
import { hoje, toISO } from '../utils/helpers';

const KEY_CASOS = "unimed-cirurgias-v1";

export function useSurgeries() {
  const [casos, setCasos] = useState<Cirurgia[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY_CASOS);
      if (raw) {
        setCasos(JSON.parse(raw));
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoaded(true);
  }, []);

  const persistir = (novosCasos: Cirurgia[]) => {
    setCasos(novosCasos);
    localStorage.setItem(KEY_CASOS, JSON.stringify(novosCasos));
  };

  const addCirurgia = (novaCirurgia: Omit<Cirurgia, 'id' | 'criadoEm' | 'status'>) => {
    const surgeryCompleta: Cirurgia = {
      ...novaCirurgia,
      id: Date.now().toString(36),
      criadoEm: toISO(hoje()),
      status: 'aguardando'
    };
    persistir([surgeryCompleta, ...casos]);
  };

  const atualizarStatus = (id: string, novoStatus: Cirurgia['status'], dadosExtras?: Partial<Cirurgia>) => {
    const novosCasos = casos.map(c => 
      c.id === id ? { ...c, status: novoStatus, ...dadosExtras } : c
    );
    persistir(novosCasos);
  };

  const excluirCirurgia = (id: string) => {
    const novosCasos = casos.filter(c => c.id !== id);
    persistir(novosCasos);
  };

  return { casos, isLoaded, addCirurgia, atualizarStatus, excluirCirurgia };
}