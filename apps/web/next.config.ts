import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  // Next.js по умолчанию генерирует в корне файлы-подсказки для ИИ-агентов —
  // в репозитории решения они не нужны.
  agentRules: false,
  // Приложение целиком клиентское: бэкенд challenge'а живёт на отдельном порту,
  // ходить в него из серверных компонентов смысла нет (токен гостевой сессии
  // хранится в браузере). Поэтому здесь нет ни rewrites, ни серверных запросов.
};

export default config;
