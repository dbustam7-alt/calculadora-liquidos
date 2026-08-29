'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Stethoscope, Scale, BookOpen, AlertTriangle } from 'lucide-react';

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-10 shadow-xl shadow-slate-100 dark:shadow-none transition-colors">
        {/* Back Button */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al Inicio
          </Link>
        </div>

        {/* Header */}
        <div className="flex flex-col items-center text-center border-b border-slate-100 dark:border-slate-800 pb-8 mb-8">
          <div className="bg-rose-50 dark:bg-rose-950/30 p-3.5 rounded-2xl border border-rose-100/20 mb-4 text-rose-600 dark:text-rose-400">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Términos de Uso y Descargo Médico
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
            PediaCode • Última actualización: 27 de agosto de 2026
          </p>
        </div>

        {/* Critical Alert Banner */}
        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-2xl p-5 mb-8 flex gap-4 items-start">
          <AlertTriangle className="h-6 w-6 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold text-rose-900 dark:text-rose-300 text-sm md:text-base">
              AVISO CRÍTICO DE SEGURIDAD CLÍNICA
            </h3>
            <p className="text-xs md:text-sm text-rose-700 dark:text-rose-400 leading-relaxed font-medium">
              ESTA APLICACIÓN NO ES UN DISPOSITIVO MÉDICO Y NO SUSTITUYE BAJO NINGUNA CIRCUNSTANCIA EL CRITERIO CLÍNICO PROFESIONAL.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8 text-sm md:text-base leading-relaxed text-slate-600 dark:text-slate-300">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              1. Descargo de Responsabilidad Médica (Medical Disclaimer)
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Herramienta de Apoyo Únicamente:</strong> PediaCode ha sido diseñada exclusivamente como una herramienta de apoyo digital y un asistente de cálculo matemático para profesionales de la salud (médicos pediatras, médicos generales, residentes, internos y personal de enfermería).
              </li>
              <li>
                <strong>Responsabilidad del Profesional:</strong> El cálculo de líquidos, tasas de infusión, bolos de rehidratación y esquemas de resucitación es una tarea de alta complejidad y riesgo clínico. <strong>La decisión terapéutica final, la verificación de las dosis y la programación de los equipos de infusión son responsabilidad exclusiva y absoluta del profesional de la salud a cargo del paciente.</strong>
              </li>
              <li>
                <strong>Obligación de Doble Verificación:</strong> El usuario (profesional asistencial) tiene la obligación clínica de verificar de forma independiente los resultados matemáticos arrojados por la Aplicación antes de prescribir o administrar cualquier tratamiento o solución parenteral a un paciente. No se debe tomar ninguna acción clínica basándose únicamente en los resultados de esta herramienta.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Scale className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              2. Limitación de Responsabilidad (Limitation of Liability)
            </h2>
            <p>
              En la máxima medida permitida por la ley aplicable, el desarrollador de PediaCode, sus afiliados, socios o licenciantes <strong>no serán responsables bajo ninguna circunstancia</strong> por:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Cualquier error matemático, omisión, retraso o imprecisión en los cálculos generados por la Aplicación.</li>
              <li>
                Cualquier daño directo, indirecto, incidental, especial, punitivo o consecuente (incluyendo, entre otros, complicaciones médicas, lesiones corporales, mala práctica médica, muerte del paciente o pérdida de datos) que resulten del uso o la imposibilidad de usar la Aplicación, o de decisiones médicas tomadas en base a sus resultados.
              </li>
              <li>
                La Aplicación se proporciona <strong>&quot;tal cual&quot; (As-Is)</strong> y <strong>&quot;según disponibilidad&quot;</strong>, sin garantías de ningún tipo, ya sean expresas o implícitas, incluyendo, entre otras, las garantías implícitas de comerciabilidad, idoneidad para un propósito particular o ausencia de errores.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              3. Propiedad Intelectual
            </h2>
            <p>
              Todos los derechos de propiedad intelectual sobre el diseño, código fuente, algoritmos, logotipos, marcas y contenidos de PediaCode pertenecen exclusivamente al desarrollador de la Aplicación. Queda estrictamente prohibida la reproducción, ingeniería inversa, descompilación o distribución no autorizada de la misma.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              4. Modificaciones de la Aplicación
            </h2>
            <p>
              Nos reservamos el derecho de modificar, suspender o retirar la Aplicación (o cualquier parte de ella) en cualquier momento, con o sin previo aviso, para realizar actualizaciones de seguridad, mejoras clínicas o ajustes técnicos.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Scale className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              5. Ley Aplicable y Jurisdicción
            </h2>
            <p>
              Estos Términos se regirán e interpretarán de acuerdo con las leyes del país de residencia del desarrollador principal de la Aplicación, y cualquier disputa relacionada con los mismos estará sujeta a la jurisdicción exclusiva de sus tribunales competentes.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-6">
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
              6. Contacto y Soporte
            </h2>
            <p>
              Para reportar errores, sugerir mejoras o realizar consultas de soporte, puede escribir a:
            </p>
            <p className="font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 w-fit">
              soporte@pediacode.app
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
