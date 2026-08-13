# Project Purpose: Calculadora Pediátrica de Urgencias

## Vision
Transformar fórmulas y tablas clínicas complejas de fluidoterapia pediátrica (Holliday-Segar, Parkland, Lund-Browder, Cetoacidosis Diabética y Planes de la OMS) en una herramienta web operativa de alta velocidad y libre de errores que optimice la toma de decisiones médicas en momentos críticos.

## Core Problem Solved
El cálculo manual de líquidos, electrólitos basales, tasas de infusión de insulina y esquemas de rehidratación bajo la presión de urgencias pediátricas consume tiempo valioso y acarrea riesgo de error humano. Al automatizar estos cálculos con verificación visual inmediata y alertas clínicas de seguridad, eliminamos la incertidumbre y agilizamos la atención médica.

## Unique Selling Proposition
Plataforma clínica integral "todo en uno" para urgencias pediátricas que combina cálculo automático de Superficie Corporal (Mosteller), ajuste dinámico de quemaduras por edad (Lund-Browder + Parkland), manejo guiado de Cetoacidosis Diabética (con Sodio corregido por glicemia e infusión continua de Insulina) y Planes de la OMS para EDA, respaldado por persistencia segura en Supabase PostgreSQL con fallback offline en `localStorage`.

## Target Audience
- Médicos Pediatras y Urgencistas Pediátricos.
- Residentes de Pediatría y Medicina de Urgencias.
- Personal de Enfermería en Salas de Urgencias y UCI Pediátrica.
- Auditores Médicos y Administradores de Salud.

## Deployment Strategy
Aplicación web moderna desarrollada en **Next.js (App Router)**, **TypeScript** y **Tailwind CSS**, conectada a la base de datos de **Supabase (PostgreSQL)**, integrada en un repositorio de **GitHub** y desplegada de forma continua y escalable en **Vercel**.

## Commercial Success
- **Impacto Clínico y de Seguridad**: Reducción a cero de errores de dosificación o infusión de líquidos pediátricos.
- **Eficiencia Operativa**: Reducción del tiempo de formulación de 10-15 minutos a menos de 30 segundos por paciente.
- **Trazabilidad y Calidad**: Estandarización de registros médicos e historial de consultas para auditoría clínica en hospitales y clínicas.