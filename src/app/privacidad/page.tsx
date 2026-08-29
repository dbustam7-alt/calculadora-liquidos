'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, Lock, HardDrive, EyeOff, ShieldAlert } from 'lucide-react';

export default function PrivacyPage() {
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
          <div className="bg-sky-50 dark:bg-sky-950/30 p-3.5 rounded-2xl border border-sky-100/20 mb-4 text-sky-600 dark:text-sky-400">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Política de Privacidad
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
            PediaCode • Última actualización: 27 de agosto de 2026
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-sm md:text-base leading-relaxed text-slate-600 dark:text-slate-300">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <EyeOff className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              1. Resumen de Privacidad (Cero Recolección de Datos)
            </h2>
            <p>
              La premisa fundamental de PediaCode es la <strong>privacidad por diseño</strong>.
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>No recopilamos, no almacenamos, no rastreamos ni compartimos ningún tipo de información personal identificable (PII)</strong> de los usuarios ni de los pacientes evaluados.
              </li>
              <li>
                <strong>No recopilamos información de salud protegida (PHI)</strong>. La aplicación no solicita nombres reales de pacientes, números de identificación gubernamentales ni registros médicos que puedan asociar un cálculo clínico con una persona física.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              2. Almacenamiento Local (Offline-First)
            </h2>
            <p>
              Todos los datos ingresados en la Aplicación (como el peso, la edad, la talla o los porcentajes de quemaduras del paciente) y el historial de consultas calculadas se procesan y almacenan <strong>únicamente en la memoria local de su dispositivo</strong> (a través del almacenamiento local del navegador o de la aplicación móvil: <code className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">localStorage</code> / <code className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">IndexedDB</code>).
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Estos datos nunca se transmiten a servidores externos ni a terceros.</li>
              <li>
                Usted tiene el control total de esta información y puede borrar el historial de cálculos en cualquier momento eliminando los datos de la aplicación o desinstalándola de su dispositivo.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              3. Permisos del Dispositivo
            </h2>
            <p>
              La versión móvil de PediaCode está diseñada para funcionar de forma <strong>100% offline</strong> (sin conexión a internet).
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>No requiere permisos de geolocalización, acceso a la cámara, contactos, micrófono ni almacenamiento externo para realizar sus funciones de cálculo clínico.</li>
              <li>No se utilizan SDKs de seguimiento, analíticas invasivas ni redes de publicidad de terceros que puedan rastrear su comportamiento.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              4. Enlaces a Terceros
            </h2>
            <p>
              Nuestra aplicación web o móvil puede contener enlaces de referencia a guías clínicas oficiales (como la Organización Mundial de la Salud). No nos hacemos responsables de las políticas de privacidad o el contenido de dichos sitios web externos.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              5. Privacidad Infantil
            </h2>
            <p>
              Dado que no recopilamos ningún tipo de información personal, la Aplicación cumple plenamente con las leyes de protección de la privacidad infantil en internet (como COPPA en EE. UU. y normativas equivalentes en Latinoamérica y Europa).
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              6. Cambios a esta Política
            </h2>
            <p>
              Nos reservamos el derecho de actualizar esta Política de Privacidad en cualquier momento. Cualquier cambio será publicado en esta sección con su respectiva fecha de actualización.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-6">
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
              7. Contacto
            </h2>
            <p>
              Si tiene alguna pregunta o sugerencia sobre nuestra Política de Privacidad, no dude en ponerse en contacto con nosotros a través de nuestro correo de soporte oficial:
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
