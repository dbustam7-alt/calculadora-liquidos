# Design Decisions & Guidance: Calculadora Pediátrica de Urgencias

## Overall Aesthetic
- **Panel Clínico de Alta Gama (Clinical Grade Dashboard)**: Estética moderna, limpia, profesional y libre de distracciones visuales.
- **Baja Carga Cognitiva**: Diseñada para situaciones de alta presión en urgencias pediátricas donde la velocidad y precisión son críticas.
- **Sensación de Seguridad**: Elevación sutil en tarjetas (`shadow-sm`), bordes nítidos (`border-slate-200`) y alto contraste para legibilidad en entornos hospitalarios.

## Color Palette
- **Azul Clínico Principal (Primary)**: `sky-600` (`#0284c7`) / `sky-700` para acciones primarias y la marca del aplicativo.
- **Verde Estabilidad (Success/Normal)**: `emerald-600` (`#059669`) / `emerald-700` para estados normales, confirmación de guardado y valores fisiológicos dentro de rango.
- **Ámbar Advertencia (Warning)**: `amber-500` (`#f59e0b`) / `amber-800` para notas clínicas importantes, recomendaciones y alertas moderadas.
- **Rojo Alerta Crítica (Danger/Critical)**: `rose-600` (`#e11d48`) / `rose-700` para quemaduras extensas ($>30\% \text{ SCQ}$), CAD severo, deshidratación grave (Plan C) o límites excedidos.
- **Gris Slate Neutro (Backgrounds & Text)**:
  - Fondo: `slate-50` (`#f8fafc`)
  - Tarjetas: `bg-white` (`#ffffff`)
  - Texto Principal: `slate-900` (`#0f172a`)
  - Texto Secundario: `slate-500` (`#64748b`)

## Typography
- **Fuente Principal**: Sans-serif moderna e hiperlegible (Inter, `-apple-system`, `BlinkMacSystemFont`).
- **Fuente Numérica para Cálculos**: Monospaced (`font-mono`) para todos los resultados numéricos, flujos ($\text{mL/h}$), dosis y tasas para evitar confusión de caracteres en pantalla.
- **Escala Tipográfica**:
  - Encabezados de módulo: `text-xl font-semibold text-slate-900`
  - Números destacados de resultados: `text-2xl md:text-3xl font-bold font-mono text-sky-700`
  - Etiquetas de unidad: `text-xs uppercase font-medium text-slate-500`

## Layout & Spacing
- **Patient Header Fijo/Sticky**: La barra con los datos del paciente (Nombre, Edad, Peso, Talla y SC Mosteller) permanece accesible en la parte superior para evitar volver a ingresar datos.
- **Navegación por Pestañas**: Barra horizontal scrollable o pestañas principales alineadas en la parte superior (`Mantenimiento`, `Quemaduras`, `CAD`, `EDA`, `Historial`).
- **Retícula Adaptativa (Grid System)**: 
  - Vista Móvil: 1 columna.
  - Vista Tablet/Desktop: 2 a 3 columnas (`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`).
- **Espaciado**: Uso de unidades consistentes de Tailwind (`p-4 md:p-6`, `gap-4`).

## UI Components
- **Barra Datos del Paciente**: Inputs limpios con sufijo de unidad integrado (ej. `kg`, `cm`, `meses`) y cálculo automático de $\text{SC (m}^2\text{)}$.
- **Tarjetas de Resultado (Calculation Cards)**: Tarjetas destacadas con fondo claro, borde coloreado según el estado y badge de unidades.
- **Alertas Clínicas (`ClinicalAlert`)**: Banners destacados con icono descriptivo, color temático y texto explicativo.
- **Selector de Planes OMS**: Botones tipo pill/radio de selección rápida para evaluar deshidratación en EDA (Plan A, Plan B, Plan C).
- **Desplegable de Historial (Accordion)**: Elementos expandibles en la pestaña de historial para inspeccionar el resumen completo de una consulta previa.

## Imagery & Icons
- **Biblioteca de Iconos**: `lucide-react` para máxima ligereza y coherencia visual.
  - 💧 `Droplets` / `Activity` -> Líquidos y Mantenimiento.
  - 🔥 `Flame` -> Módulo de Quemaduras.
  - 🧪 `FlaskConical` / `Syringe` -> Cetoacidosis Diabética e Insulina.
  - 🩺 `Stethoscope` / `ShieldAlert` -> EDA y Alertas Clínicas.
  - 📂 `FileText` / `Clock` -> Historial de Pacientes.
  - 👤 `User` -> Datos del Paciente.

## Responsiveness
- **Mobile-First & Tablet Optimized**: Diseñado pensando en médicos usando iPad o teléfonos durante rondas médicas de urgencias.
- **Botones con Zona Táctil Amplia**: Mínimo `min-h-[44px]` en botones e inputs para fácil pulsación táctil.
- **Navegación sin Desbordamientos**: Pestañas móviles con scroll horizontal suave y sombras indicadoras de desbordamiento.