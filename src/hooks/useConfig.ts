import { useState, useEffect } from 'react';
import { ConfigHospital } from '../types';
import { DEFAULT_CFG, DEFAULT_CONVENIOS } from '../constants/system';

const KEY_CFG = "unimed-config-v1";
const KEY_CONV = "unimed-convenios-v1";

export function useConfig() {
  const [cfg, setCfg] = useState<ConfigHospital>(DEFAULT_CFG);
  const [convenios, setConvenios] = useState<string[]>(DEFAULT_CONVENIOS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedCfg = localStorage.getItem(KEY_CFG);
      if (savedCfg) setCfg({ ...DEFAULT_CFG, ...JSON.parse(savedCfg) });

      const savedConv = localStorage.getItem(KEY_CONV);
      if (savedConv) setConvenios(JSON.parse(savedConv));
    } catch (e) {
      console.error(e);
    }
    setIsLoaded(true);
  }, []);

  const salvarConfig = (novaCfg: ConfigHospital) => {
    setCfg(novaCfg);
    localStorage.setItem(KEY_CFG, JSON.stringify(novaCfg));
  };

  const salvarConvenios = (novosConv: string[]) => {
    setConvenios(novosConv);
    localStorage.setItem(KEY_CONV, JSON.stringify(novosConv));
  };

  return { cfg, convenios, isLoaded, salvarConfig, salvarConvenios };
}