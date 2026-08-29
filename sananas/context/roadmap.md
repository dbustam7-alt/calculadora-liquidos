# Project Roadmap: Calculadora Pediátrica de Urgencias

## Phase 1: Context & Cursor Environment Setup
- [x] Análisis del prompt maestro y definición de arquitectura full-stack.
- [x] Configuración de `.cursorrules` para Next.js, Supabase, Tailwind CSS, Vercel y GitHub.
- [x] Generación de archivos de contexto (`purpose.md`, `design.md`, `clinical_formulas.md`, `user_preferences.md`, `supabase.md`).

## Phase 2: Next.js & Supabase Architecture Setup
- [x] Inicialización del proyecto Next.js 15+ (App Router) + TypeScript + Bun.
- [x] Configuración de Tailwind CSS v4 con tokens de color clínico y tipografía mono para números.
- [x] Configuración del cliente API de Supabase (`src/lib/supabase.ts`) con fallback a `localStorage`.

## Phase 3: Pure Clinical Formulas & Global State
- [x] Implementación de funciones puras médicas (`src/lib/formulas.ts`): Mosteller (SC), Holliday-Segar, Parkland, Lund-Browder, CAD (Insulina y Sodio corregido), Planes OMS (EDA).
- [x] Proveedor de Estado Global del Paciente (`PatientContext.tsx`) para sincronización en tiempo real.

## Phase 4: UI Components & Clinical Modules
- [x] Componente Header Fijo del Paciente con cálculo instantáneo de Superficie Corporal ($\text{m}^2$).
- [x] Pestañas de navegación responsive para urgencias.
- [x] Módulo 1: Líquidos y Electrolitos de Mantenimiento ($Na$, $K$, $\text{mL/h}$, $\text{gotas/min}$).
- [x] Módulo 2: Quemaduras Pediátricas (Lund-Browder dinámico por edad + Parkland $50\%/50\%$).
- [x] Módulo 3: Cetoacidosis Diabética (Bolos, déficit a $24-48\text{ h}$, infusión de insulina y Sodio corregido).
- [x] Módulo 4: Enfermedad Diarreica Aguda (EDA) y evaluación de deshidratación según OMS.

## Phase 5: Persistence, Security & Deployment
- [x] Guardado de consultas y resúmenes clínicos en Supabase PostgreSQL (`patient_consultations`) con fallback en `localStorage`.
- [x] Módulo de Historial con búsqueda por paciente, filtro por fecha y vista detallada desplegable.
- [x] Implementación de Autenticación con Supabase Auth (Registro e Inicio de Sesión).
- [x] Registro expandido con datos profesionales (Nombre, Especialidad, Hospital, Registro Médico).
- [x] Integración de Inicio de Sesión con Google (Google OAuth).
- [x] Vinculación a repositorio en GitHub y despliegue continuo en Vercel (Listo para producción).

## Phase 6: Monetization & Premium Features
- [x] Implementación de Modo Oscuro Nativo con persistencia local y toggle en Header.
- [x] Implementación de Selector Interactivo de Quemaduras (Lund-Browder) con diagramas corporales SVG interactivos.
- [x] Implementación del Dashboard Hub (Menú Principal) para expansión modular de urgencias pediátricas.
- [x] Implementación del Módulo de Equipamiento y Vía Aérea Pediátrica.
- [x] Implementación del Módulo de Medicamentos de Urgencia Pediátrica.
- [x] Implementación del Módulo de Toxicología y Antídotos Pediátricos.
- [ ] Configuración e integración de Capacitor para compilación nativa en iOS y Android (en rama de desarrollo).
