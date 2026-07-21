import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // Sem isso, testar em `npm run dev -- -H 0.0.0.0` a partir de um
  // celular real na rede local (ex.: iPhone acessando o IP da máquina)
  // faz o Next bloquear os recursos de dev (HMR/webpack) como
  // cross-origin — a página carrega no primeiro load (SSR), mas o HMR
  // fica quebrado silenciosamente durante a sessão de testes.
  allowedDevOrigins: ["192.168.0.105"],
};

export default nextConfig;
