'use client';

import React, { useState } from 'react';
import { HelpCircle, BookOpen, ShieldCheck, FileText, Mail, ArrowRight, ExternalLink } from 'lucide-react';

export default function InfoModule() {
  const [activeSubTab, setActiveTab] = useState<'references' | 'disclaimer' | 'privacy' | 'support'>('references');

  const subTabs = [
    { id: 'references', label: 'Sustento Científico', icon: <BookOpen className="h-4 w-4" /> },
    { id: 'disclaimer', label: 'Descargo Médico', icon: <ShieldCheck className="h-4 w-4" /> },
    { id: 'privacy', label: 'Privacidad', icon: <FileText className="h-4 w-4" /> },
    { id: 'support', label: 'Soporte y Contacto', icon: <Mail className="h-4 w-4" /> },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Module Title */}
      <div className="flex items-center gap-2">
        <HelpCircle className="h-6 w-6 text-sky-600 dark:text-sky-500" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Información y Soporte Clínico</h2>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none">
        {subTabs.map((tab) => {
          const isSelected = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs md:text-sm font-bold border-b-2 transition-all duration-200 cursor-pointer min-w-max ${
                isSelected
                  ? 'border-sky-600 dark:border-sky-500 text-sky-600 dark:text-sky-400 font-extrabold'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors">
        {activeSubTab === 'references' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Sustento Científico y Referencias Clínicas</h3>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Para cumplir con las estrictas directrices de revisión de aplicaciones médicas de Apple (App Store Review Guidelines - Section 1.4.1 / 1.4.5) y Google Play, a continuación se detallan las fuentes bibliográficas, consensos internacionales y guías de práctica clínica oficiales en las que se basan los algoritmos de cálculo de <strong className="text-slate-800 dark:text-slate-200">PediatriCode</strong>:
              </p>
            </div>

            <div className="space-y-4">
              {/* Reference 1 */}
              <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-xl p-4 space-y-2">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">1. Líquidos de Mantenimiento (Holliday-Segar y Superficie Corporal)</h4>
                <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-300 space-y-1.5 leading-relaxed pl-1">
                  <li>
                    <strong className="text-slate-800 dark:text-slate-200">Método Holliday-Segar:</strong> Basado en el estudio clásico de Holliday y Segar, que establece los requerimientos calóricos y de agua basales en pediatría según el peso corporal.
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 italic mt-0.5 pl-4">
                      Referencia: Holliday MA, Segar WE. The maintenance need for water in parenteral fluid therapy. Pediatrics. 1957 May;19(5):823-32. PMID: 13431307.
                    </div>
                  </li>
                  <li>
                    <strong className="text-slate-800 dark:text-slate-200">Método por Superficie Corporal (SCT):</strong> Utilizado para pacientes mayores de 30 kg para evitar la sobrehidratación, calculando requerimientos estándar de 1500 a 1800 mL/m²/día.
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 italic mt-0.5 pl-4">
                      Referencia: Nelson Textbook of Pediatrics, 21st Edition. Chapter 54: Maintenance and Replacement Therapy. Elsevier, 2019.
                    </div>
                  </li>
                </ul>
              </div>

              {/* Reference 2 */}
              <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-xl p-4 space-y-2">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">2. Enfermedad Diarreica Aguda (EDA - Planes A, B y C de la OMS)</h4>
                <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-300 space-y-1.5 leading-relaxed pl-1">
                  <li>
                    <strong className="text-slate-800 dark:text-slate-200">Planes de Rehidratación Oral e Intravenosa:</strong> Algoritmos de evaluación clínica y reposición hídrica basados en las directrices oficiales de la Organización Mundial de la Salud (OMS) y UNICEF para el tratamiento de la diarrea aguda y deshidratación en niños.
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 italic mt-0.5 pl-4">
                      Referencia: World Health Organization. The treatment of diarrhea: a manual for physicians and other senior health workers. 4th rev. Geneva: World Health Organization; 2005. WHO/FCH/CAH/05.1.
                    </div>
                  </li>
                  <li>
                    <strong className="text-slate-800 dark:text-slate-200">Suplementación con Zinc:</strong> Recomendación de administración de Sulfato de Zinc (10 mg/día en &lt;6 meses, 20 mg/día en &gt;=6 meses) durante 14 días para reducir la severidad y recurrencia de los episodios diarreicos.
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 italic mt-0.5 pl-4">
                      Referencia: WHO/UNICEF Joint Statement. Clinical Management of Acute Diarrhoea. World Health Organization, Geneva, 2004. WHO/FCH/CAH/04.7.
                    </div>
                  </li>
                </ul>
              </div>

              {/* Reference 3 */}
              <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-xl p-4 space-y-2">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">3. Manejo de Quemaduras (Fórmula de Galveston y Parkland Modificada)</h4>
                <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-300 space-y-1.5 leading-relaxed pl-1">
                  <li>
                    <strong className="text-slate-800 dark:text-slate-200">Fórmula de Galveston:</strong> Utilizada en pediatría para calcular líquidos de resucitación y mantenimiento combinados en base a la Superficie Corporal Total y Quemada (5000 mL/m² SCQ + 2000 mL/m² SCT).
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 italic mt-0.5 pl-4">
                      Referencia: Carvajal HF. A physiologic approach to fluid therapy in severely burned children. Surg Gynecol Obstet. 1980 Mar;150(3):379-84. PMID: 7355208.
                    </div>
                  </li>
                  <li>
                    <strong className="text-slate-800 dark:text-slate-200">Fórmula de Parkland Modificada:</strong> Utilizada para calcular la resucitación con cristaloides (3 a 4 mL × Peso × % SCQ), añadiendo los líquidos de mantenimiento basales en pacientes pediátricos menores de 14 años y de menos de 30 kg.
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 italic mt-0.5 pl-4">
                      Referencia: American Burn Association. Advanced Burn Life Support (ABLS) Provider Manual. Chicago: American Burn Association, 2018.
                    </div>
                  </li>
                </ul>
              </div>

              {/* Reference 4 */}
              <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-xl p-4 space-y-2">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">4. Cetoacidosis Diabética (CAD)</h4>
                <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-300 space-y-1.5 leading-relaxed pl-1">
                  <li>
                    <strong className="text-slate-800 dark:text-slate-200">Protocolo de Rehidratación de 48 Horas:</strong> Algoritmo de reposición hídrica lenta y segura para evitar el edema cerebral en pediatría, calculando el déficit según el grado de deshidratación y sumando los líquidos basales de Holliday-Segar multiplicados por el requerimiento basal ajustado.
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 italic mt-0.5 pl-4">
                      Referencia: British Society for Paediatric Endocrinology and Diabetes (BSPED). Interim Guideline for the Management of Children and Young People under the age of 18 years with Diabetic Ketoacidosis. BSPED, 2021.
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 italic mt-0.5 pl-4">
                      Referencia: International Society for Pediatric and Adolescent Diabetes (ISPAD). ISPAD Clinical Practice Consensus Guidelines 2018: Diabetic ketoacidosis and hyperglycemic hyperosmolar state. Pediatric Diabetes. 2018;19(Suppl. 27):155–177.
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'disclaimer' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Términos de Uso y Descargo de Responsabilidad Médica</h3>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Por favor, lea atentamente este descargo de responsabilidad antes de utilizar la aplicación. El uso de la herramienta implica la aceptación de estos términos.
              </p>
            </div>

            <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-2xl p-5 space-y-3">
              <h4 className="text-sm font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider">
                CRÍTICO: ESTA APLICACIÓN NO ES UN DISPOSITIVO MÉDICO Y NO SUSTITUYE EL CRITERIO CLÍNICO PROFESIONAL.
              </h4>
              <div className="space-y-2 text-xs md:text-sm text-rose-900 dark:text-rose-200 leading-relaxed font-medium">
                <p>
                  • <strong className="text-rose-950 dark:text-rose-100">Herramienta de Apoyo Únicamente:</strong> PediatriCode ha sido diseñada exclusivamente como una herramienta de apoyo digital y un asistente de cálculo matemático para profesionales de la salud (médicos pediatras, médicos generales, residentes, internos y personal de enfermería).
                </p>
                <p>
                  • <strong className="text-rose-950 dark:text-rose-100">Responsabilidad del Profesional:</strong> El cálculo de líquidos, tasas de infusión, bolos de rehidratación y esquemas de resucitación es una tarea de alta complejidad y riesgo clínico. La decisión terapéutica final, la verificación de las dosis y la programación de los equipos de infusión son responsabilidad exclusiva y absoluta del profesional de la salud a cargo del paciente.
                </p>
                <p>
                  • <strong className="text-rose-950 dark:text-rose-100">Obligación de Doble Verificación:</strong> El usuario (profesional asistencial) tiene la obligación clínica de verificar de forma independiente los resultados matemáticos arrojados por la Aplicación antes de prescribir o administrar cualquier tratamiento o solución parenteral a un paciente. No se debe tomar ninguna acción clínica basándose únicamente en los resultados de esta herramienta.
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <h4 className="font-bold text-slate-800 dark:text-slate-200">Limitación de Responsabilidad</h4>
              <p>
                En la máxima medida permitida por la ley aplicable, el desarrollador de PediatriCode, sus afiliados, socios o licenciantes no serán responsables bajo ninguna circunstancia por cualquier error matemático, omisión, retraso o imprecisión en los cálculos generados por la Aplicación, ni por complicaciones médicas, lesiones corporales o mala práctica médica. La Aplicación se proporciona "tal cual" (As-Is) y sin garantías de ningún tipo.
              </p>
              <h4 className="font-bold text-slate-800 dark:text-slate-200">Propiedad Intelectual</h4>
              <p>
                Todos los derechos de propiedad intelectual sobre el diseño, código fuente, algoritmos, logotipos, marcas y contenidos de PediatriCode pertenecen exclusivamente al desarrollador de la Aplicación. Queda estrictamente prohibida la reproducción, ingeniería inversa, descompilación o distribución no autorizada de la misma.
              </p>
            </div>
          </div>
        )}

        {activeSubTab === 'privacy' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Política de Privacidad (Cero Recolección de Datos)</h3>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Nos tomamos muy en serio la privacidad de nuestros usuarios y la seguridad de los datos. Esta Política de Privacidad describe cómo se maneja la información dentro de la Aplicación móvil y el sitio web.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-xl p-4 space-y-2">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">1. Privacidad por Diseño</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  No recopilamos, no almacenamos, no rastreamos ni compartimos ningún tipo de información personal identificable (PII) de los usuarios ni de los pacientes evaluados. Tampoco recopilamos información de salud protegida (PHI); la aplicación no solicita nombres de pacientes ni registros médicos.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-xl p-4 space-y-2">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">2. Almacenamiento Local (Offline-First)</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Todos los datos ingresados en la Aplicación (como el peso, la edad, la talla o los porcentajes de quemaduras del paciente) y el historial de consultas calculadas se procesan y almacenan únicamente en la memoria local de su dispositivo (a través de localStorage / IndexedDB). Estos datos nunca se transmiten a servidores externos ni a terceros.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-xl p-4 space-y-2">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">3. Permisos del Dispositivo</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  La versión móvil de PediatriCode está diseñada para funcionar de forma 100% offline (sin conexión a internet). No requiere permisos de geolocalización, acceso a la cámara, contactos, micrófono ni almacenamiento externo. No se utilizan SDKs de seguimiento ni analíticas invasivas.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-xl p-4 space-y-2">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">4. Privacidad Infantil</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Dado que no recopilamos ningún tipo de información personal, la Aplicación cumple plenamente con las leyes de protección de la privacidad infantil en internet (como COPPA en EE. UU. y normativas equivalentes en Latinoamérica y Europa).
                </p>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'support' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Soporte, Sugerencias y Contacto</h3>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                ¿Tienes alguna sugerencia de mejora, reporte de error o consulta técnica? Estamos aquí para ayudarte a brindar la mejor atención clínica.
              </p>
            </div>

            <div className="bg-sky-50/50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/40 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-bold text-sky-900 dark:text-sky-200 text-sm">Correo de Soporte Oficial</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Escríbenos directamente para soporte o feedback clínico:
                </p>
                <span className="font-mono font-bold text-sky-700 dark:text-sky-300 text-sm block pt-1">
                  soporte@pediatricode.app
                </span>
              </div>
              <a
                href="mailto:soporte@pediatricode.app"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md shadow-sky-100 dark:shadow-none transition-all cursor-pointer"
              >
                Enviar Correo
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Acerca de PediatriCode</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                PediatriCode es una aplicación móvil de soporte de decisiones clínicas diseñada específicamente para médicos pediatras, de urgencias, residentes y personal de enfermería. Nuestro objetivo es automatizar cálculos complejos de líquidos y electrólitos en situaciones de alta presión, reduciendo el margen de error y optimizando los tiempos de respuesta en urgencias pediátricas.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
