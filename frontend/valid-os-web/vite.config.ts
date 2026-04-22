import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // Valores padrão para o runner de testes (CI não tem `.env` local; alinhar a `.env.example`)
    env: {
      VITE_API_URL: 'http://localhost:5000',
      VITE_KEYCLOAK_URL: 'http://localhost:8080',
      VITE_KEYCLOAK_REALM: 'valid-os',
      VITE_KEYCLOAK_CLIENT: 'valid-os-web',
    },
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.d.ts',
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/App.tsx',
        'src/env.ts',
        'src/app/**',
        'src/pages/**',
        'src/features/auth/lib/keycloak.ts',
        'src/shared/ui/Badge/**',
        'src/shared/ui/Card/**',
        'src/shared/ui/Dialog/**',
        'src/shared/ui/Dropdown/**',
        'src/shared/ui/Input/**',
        'src/shared/ui/TextArea/**',
        'src/shared/ui/Tooltip/**',
        'src/shared/ui/Skeleton/**',
        'src/shared/ui/EmptyState/**',
        'src/shared/ui/Select/**',
        'src/**/index.ts',
        'src/**/types.ts',
        'src/**/*-variants.ts',
      ],
    },
  },
})
