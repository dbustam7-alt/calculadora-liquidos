'use client';

import React, { useState } from 'react';
import { 
  HelpCircle, 
  BookOpen, 
  ShieldCheck, 
  FileText, 
  Mail, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp,
  Droplets,
  Wrench,
  Syringe,
  ShieldAlert,
  HeartPulse,
  Scale,
  Lock,
  Contact
} from 'lucide-react';
import { clsx } from 'clsx';

export default function InfoModule() {
  const [activeSubTab, setActiveTab] = useState<'references' | 'disclaimer' | 'privacy' | 'support'>('references');
  
  // Accordion state for scientific references
  const [openSection, setOpenSection] = useState<string | null>('liquidos');

  const subTabs = [
    { id: 'references', label: 'Sustento Científico', icon: <BookOpen className="h-4 w-4" /> },
    { id: 'disclaimer', label: 'Descargo Médico', icon: <ShieldCheck className="h-4 w-4" /> },
    { id: 'privacy', label: 'Privacidad', icon: <FileText className="h-4 w-4" /> },
    { id: 'support', label: 'Soporte y Contacto', icon: <Mail className="h-4 w-4" /> },
  ] as const;

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div className="space-y-6">
      {/* Module Title */}
      <div className="flex items-center gap-2.5">
        <div className="p-2 bg-sky-100 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 rounded-xl">
          <HelpCircle className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Información, Legal y Soporte</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Sustento científico, términos legales y canales de contacto oficial</p>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none">
        {subTabs.map((tab) => {
          const isSelected = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex items-center gap-2 px-4 py-3 text-xs md:text-sm font-bold border-b-2 transition-all duration-200 cursor-pointer min-w-max',
                isSelected
                  ? 'border-sky-600 dark:border-sky-500 text-sky-600 dark:text-sky-400 font-extrabold'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm transition-colors">
        
        {/* --- TAB 1: SUSTENTO CIENTÍFICO --- */}
        {activeSubTab === 'references' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Sustento Científico y Referencias Clínicas</h3>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                Para cumplir con las directrices de revisión de aplicaciones médicas de Apple (App Store Review Guidelines - Section 1.4.1 / 1.4.5) y Google Play, a continuación se detallan de forma granular las fuentes bibliográficas, consensos internacionales y guías de práctica clínica oficiales en las que se basan los algoritmos de cálculo de <strong className="text-slate-800 dark:text-slate-200">PediaCode</strong> organizados por módulo:
              </p>
            </div>

            <div className="space-y-3">
              
              {/* SECTION 1: LÍQUIDOS Y ELECTRÓLITOS */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                <button
                  onClick={() => toggleSection('liquidos')}
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950/40 hover:bg-slate-100 dark:hover:bg-slate-950 flex items-center justify-between transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Droplets className="h-5 w-5 text-sky-500" />
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">Módulo: Líquidos y Electrólitos</span>
                  </div>
                  {openSection === 'liquidos' ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                </button>
                
                {openSection === 'liquidos' && (
                  <div className="p-5 border-t border-slate-100 dark:border-slate-800/60 space-y-4 bg-white dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    <div className="space-y-3">
                      <div>
                        <strong className="text-slate-800 dark:text-slate-200 block mb-1">1. Líquidos de Mantenimiento (Holliday-Segar y Superficie Corporal)</strong>
                        <p className="pl-4">
                          • <strong className="text-slate-700 dark:text-slate-300">Holliday-Segar:</strong> Método clásico de cálculo calórico para requerimientos basales de agua (100 mL/kg para los primeros 10 kg, 50 mL/kg para los siguientes 10 kg, y 20 mL/kg por cada kg adicional).
                          <br />
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 italic block mt-0.5 pl-4">
                            Referencia: Holliday MA, Segar WE. The maintenance need for water in parenteral fluid therapy. Pediatrics. 1957 May;19(5):823-32. PMID: 13431307.
                          </span>
                        </p>
                        <p className="pl-4 mt-2">
                          • <strong className="text-slate-700 dark:text-slate-300">Superficie Corporal (SCT):</strong> Utilizado en niños mayores de 30 kg o para regímenes de restricción/expansión hídrica, calculando 1500 a 1800 mL/m²/día utilizando la fórmula de Mosteller para la superficie corporal.
                          <br />
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 italic block mt-0.5 pl-4">
                            Referencia: Mosteller RD. Simplified calculation of body-surface area. N Engl J Med. 1987 Oct 22;317(17):1098. PMID: 3657876.
                          </span>
                        </p>
                      </div>

                      <div className="border-t border-slate-100 dark:border-slate-800/40 pt-3">
                        <strong className="text-slate-800 dark:text-slate-200 block mb-1">2. Quemaduras Pediátricas (Galveston y Parkland Modificada)</strong>
                        <p className="pl-4">
                          • <strong className="text-slate-700 dark:text-slate-300">Fórmula de Galveston:</strong> Estándar de oro en pediatría que calcula los requerimientos hídricos combinados basados en la superficie corporal quemada (5000 mL/m² SCQ) más los basales (2000 mL/m² SCT).
                          <br />
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 italic block mt-0.5 pl-4">
                            Referencia: Carvajal HF. A physiologic approach to fluid therapy in severely burned children. Surg Gynecol Obstet. 1980 Mar;150(3):379-84. PMID: 7355208.
                          </span>
                        </p>
                        <p className="pl-4 mt-2">
                          • <strong className="text-slate-700 dark:text-slate-300">Parkland Modificada:</strong> Calcula el volumen de resucitación (3 a 4 mL x kg x % SCQ) sumando estrictamente los líquidos basales de mantenimiento de Holliday-Segar para evitar la deshidratación celular en niños pequeños.
                          <br />
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 italic block mt-0.5 pl-4">
                            Referencia: American Burn Association. Advanced Burn Life Support (ABLS) Provider Manual. Chicago: American Burn Association, 2018.
                          </span>
                        </p>
                      </div>

                      <div className="border-t border-slate-100 dark:border-slate-800/40 pt-3">
                        <strong className="text-slate-800 dark:text-slate-200 block mb-1">3. Cetoacidosis Diabética (CAD)</strong>
                        <p className="pl-4">
                          • <strong className="text-slate-700 dark:text-slate-300">Protocolo de Rehidratación Segura:</strong> Reposición hídrica lenta y progresiva durante 48 horas para evitar el edema cerebral. Se calcula el déficit de agua según el grado de deshidratación y se suma el mantenimiento basal, administrando una infusión continua de insulina a 0.05 a 0.1 UI/kg/h.
                          <br />
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 italic block mt-0.5 pl-4">
                            Referencia: International Society for Pediatric and Adolescent Diabetes (ISPAD). Clinical Practice Consensus Guidelines 2018: Diabetic ketoacidosis and hyperglycemic hyperosmolar state. Pediatric Diabetes. 2018;19(Suppl. 27):155–177.
                          </span>
                        </p>
                      </div>

                      <div className="border-t border-slate-100 dark:border-slate-800/40 pt-3">
                        <strong className="text-slate-800 dark:text-slate-200 block mb-1">4. Enfermedad Diarreica Aguda (EDA - Planes OMS)</strong>
                        <p className="pl-4">
                          • <strong className="text-slate-700 dark:text-slate-300">Planes A, B y C:</strong> Algoritmos oficiales de la Organización Mundial de la Salud (OMS) para la rehidratación oral (Planes A y B) e intravenosa rápida (Plan C) en casos de deshidratación grave, incluyendo la suplementación con sulfato de zinc.
                          <br />
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 italic block mt-0.5 pl-4">
                            Referencia: World Health Organization. The treatment of diarrhea: a manual for physicians and other senior health workers. 4th rev. Geneva: World Health Organization; 2005. WHO/FCH/CAH/05.1.
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 2: EQUIPAMIENTO Y VÍA AÉREA */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                <button
                  onClick={() => toggleSection('equipamiento')}
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950/40 hover:bg-slate-100 dark:hover:bg-slate-950 flex items-center justify-between transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Wrench className="h-5 w-5 text-emerald-500" />
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">Módulo: Equipamiento y Vía Aérea</span>
                  </div>
                  {openSection === 'equipamiento' ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                </button>
                
                {openSection === 'equipamiento' && (
                  <div className="p-5 border-t border-slate-100 dark:border-slate-800/60 space-y-4 bg-white dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    <div className="space-y-2">
                      <strong className="text-slate-800 dark:text-slate-200 block mb-1">Cálculo de Dispositivos y Vía Aérea Pediátrica</strong>
                      <p className="pl-4">
                        • <strong className="text-slate-700 dark:text-slate-300">Fórmula de Cole (TET sin balón):</strong> Tamaño (DI) = (Edad en años / 4) + 4.
                      </p>
                      <p className="pl-4">
                        • <strong className="text-slate-700 dark:text-slate-300">Fórmula de Motoyama (TET con balón):</strong> Tamaño (DI) = (Edad en años / 4) + 3.5.
                      </p>
                      <p className="pl-4">
                        • <strong className="text-slate-700 dark:text-slate-300">Profundidad del Tubo:</strong> Profundidad (cm) = (Edad en años / 2) + 12 o alternativamente DI del TET x 3.
                      </p>
                      <p className="pl-4">
                        • <strong className="text-slate-700 dark:text-slate-300">Sondas y Catéteres:</strong> Tamaños de sondas Foley, nasogástricas, máscaras laríngeas y manguitos de presión arterial adaptados según rangos de peso y edad pediátrica estándar.
                        <br />
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 italic block mt-1 pl-0">
                          Referencia: Nelson Textbook of Pediatrics, 21st Edition. Chapter 66: Pediatric Emergencies and Airway Management. Elsevier, 2019.
                        </span>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 italic block mt-0.5 pl-0">
                          Referencia: American Heart Association. Pediatric Advanced Life Support (PALS) Provider Manual. Dallas: American Heart Association, 2020.
                        </span>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 3: MEDICAMENTOS DE URGENCIA */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                <button
                  onClick={() => toggleSection('medicamentos')}
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950/40 hover:bg-slate-100 dark:hover:bg-slate-950 flex items-center justify-between transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Syringe className="h-5 w-5 text-rose-500" />
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">Módulo: Medicamentos de Urgencia</span>
                  </div>
                  {openSection === 'medicamentos' ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                </button>
                
                {openSection === 'medicamentos' && (
                  <div className="p-5 border-t border-slate-100 dark:border-slate-800/60 space-y-4 bg-white dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    <div className="space-y-2">
                      <strong className="text-slate-800 dark:text-slate-200 block mb-1">Dosificación de Fármacos Críticos en Urgencias</strong>
                      <p className="pl-4">
                        • <strong className="text-slate-700 dark:text-slate-300">Secuencia de Intubación Rápida (SIR):</strong> Dosis exactas por kilogramo de peso para inductores (Etomidato, Ketamina, Propofol) y bloqueadores neuromusculares (Succinilcolina, Rocuronio).
                      </p>
                      <p className="pl-4">
                        • <strong className="text-slate-700 dark:text-slate-300">Anticonvulsivantes de Emergencia:</strong> Protocolo de estatus epiléptico con dosis de Midazolam, Diazepam, Fenitoína y Levetiracetam, incluyendo límites de seguridad máximos por dosis única.
                      </p>
                      <p className="pl-4">
                        • <strong className="text-slate-700 dark:text-slate-300">Reanimación y Anafilaxia:</strong> Dosis de Adrenalina en paro (0.01 mg/kg IV/IO) y en anafilaxia (0.01 mg/kg IM de dilución 1:1,000).
                        <br />
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 italic block mt-1 pl-0">
                          Referencia: Kleinman ME, et al. Part 5: Pediatric Basic and Advanced Life Support: 2020 American Heart Association Guidelines for Cardiopulmonary Resuscitation and Emergency Cardiovascular Care. Circulation. 2020 Oct 20;142(16_suppl_2):S469-S523.
                        </span>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 italic block mt-0.5 pl-0">
                          Referencia: Harriet Lane Service, et al. The Harriet Lane Handbook: A Manual for Pediatric House Officers, 22nd Edition. Philadelphia: Elsevier, 2020.
                        </span>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 4: TOXICOLOGÍA Y ANTÍDOTOS */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                <button
                  onClick={() => toggleSection('toxicologia')}
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950/40 hover:bg-slate-100 dark:hover:bg-slate-950 flex items-center justify-between transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <ShieldAlert className="h-5 w-5 text-violet-500" />
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">Módulo: Toxicología y Antídotos</span>
                  </div>
                  {openSection === 'toxicologia' ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                </button>
                
                {openSection === 'toxicologia' && (
                  <div className="p-5 border-t border-slate-100 dark:border-slate-800/60 space-y-4 bg-white dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    <div className="space-y-2">
                      <strong className="text-slate-800 dark:text-slate-200 block mb-1">Manejo Inicial del Paciente Intoxicado</strong>
                      <p className="pl-4">
                        • <strong className="text-slate-700 dark:text-slate-300">Descontaminación:</strong> Dosis de Carbón Activado (1 a 2 g/kg, máx 50 g) y volumen de Lavado Gástrico (10 mL/kg por ciclo con solución salina tibia) para evitar hiponatremias dilucionales graves.
                      </p>
                      <p className="pl-4">
                        • <strong className="text-slate-700 dark:text-slate-300">Antídotos Específicos:</strong> Protocolo IV de 21 horas de N-Acetilcisteína para intoxicación por paracetamol, dosis de Naloxona para opiáceos, Flumazenil para benzodiacepinas y Atropina para organofosforados.
                      </p>
                      <p className="pl-4">
                        • <strong className="text-slate-700 dark:text-slate-300">Toxíndromes Clínicos:</strong> Algoritmo de clasificación diagnóstica basado en pupilas, frecuencia cardíaca, estado de la piel y estado mental.
                        <br />
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 italic block mt-1 pl-0">
                          Referencia: Chyka PA, et al. Position paper: Single-dose activated charcoal. Clin Toxicol (Phila). 2005;43(2):61-87. PMID: 15822758.
                        </span>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 italic block mt-0.5 pl-0">
                          Referencia: Rumack BH, Matthew H. Acetaminophen poisoning and toxicity. Pediatrics. 1975 Jun;55(6):871-6. PMID: 1134886.
                        </span>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 5: REANIMACIÓN PALS */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                <button
                  onClick={() => toggleSection('pals')}
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950/40 hover:bg-slate-100 dark:hover:bg-slate-950 flex items-center justify-between transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <HeartPulse className="h-5 w-5 text-rose-500" />
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">Módulo: Reanimación PALS</span>
                  </div>
                  {openSection === 'pals' ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                </button>
                
                {openSection === 'pals' && (
                  <div className="p-5 border-t border-slate-100 dark:border-slate-800/60 space-y-4 bg-white dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    <div className="space-y-2">
                      <strong className="text-slate-800 dark:text-slate-200 block mb-1">Soporte Vital Avanzado Pediátrico (PALS)</strong>
                      <p className="pl-4">
                        • <strong className="text-slate-700 dark:text-slate-300">Algoritmo de Paro Cardíaco:</strong> Manejo interactivo de ritmos desfibrilables (FV/TVSP) y no desfibrilables (Asistolia/AESP), incluyendo la dosificación de descargas eléctricas (2 J/kg, 4 J/kg hasta 10 J/kg) y fármacos (Adrenalina, Amiodarona, Lidocaína).
                      </p>
                      <p className="pl-4">
                        • <strong className="text-slate-700 dark:text-slate-300">Bradicardia y Taquicardia con Pulso:</strong> Algoritmos de evaluación de perfusión, indicación de RCP para bradicardias con FC menor a 60 LPM con compromiso, maniobras vagales, dosis de Adenosina (0.1 y 0.2 mg/kg) y Cardioversión Sincrónica (0.5 a 2 J/kg).
                        <br />
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 italic block mt-1 pl-0">
                          Referencia: American Heart Association. 2020 American Heart Association Guidelines for Cardiopulmonary Resuscitation and Emergency Cardiovascular Care. Circulation. 2020;142(16_suppl_2).
                        </span>
                      </p>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* --- TAB 2: DESCARGO MÉDICO --- */}
        {activeSubTab === 'disclaimer' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Scale className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Términos de Uso y Descargo de Responsabilidad Médica</h3>
            </div>

            <div className="bg-rose-50/50 dark:bg-rose-950/10 border border-rose-200/60 dark:border-rose-900/30 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-extrabold text-rose-700 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                CRÍTICO: ESTA APLICACIÓN NO ES UN DISPOSITIVO MÉDICO Y NO SUSTITUYE EL CRITERIO CLÍNICO PROFESIONAL.
              </h4>
              <div className="space-y-2.5 text-xs md:text-sm text-rose-950 dark:text-rose-200 leading-relaxed font-medium">
                <p>
                  • <strong className="text-rose-950 dark:text-rose-100">Herramienta de Apoyo Únicamente:</strong> PediaCode ha sido diseñada exclusivamente como una herramienta de apoyo digital y un asistente de cálculo matemático para profesionales de la salud (médicos pediatras, médicos de urgencias, médicos generales, residentes, internos y personal de enfermería pediátrica).
                </p>
                <p>
                  • <strong className="text-rose-950 dark:text-rose-100">Responsabilidad del Profesional:</strong> El cálculo de líquidos, tasas de infusión, bolos de rehidratación, equipamiento de vía aérea, dosificación de medicamentos de urgencia y esquemas de resucitación es una tarea de alta complejidad y riesgo clínico. La decisión terapéutica final, la verificación de las dosis y la programación de los equipos de infusión son responsabilidad exclusiva y absoluta del profesional de la salud a cargo del paciente.
                </p>
                <p>
                  • <strong className="text-rose-950 dark:text-rose-100">Obligación de Doble Verificación:</strong> El usuario (profesional asistencial) tiene la obligación clínica de verificar de forma independiente los resultados matemáticos arrojados por la Aplicación antes de prescribir o administrar cualquier tratamiento, fármaco o solución parenteral a un paciente. No se debe tomar ninguna acción clínica basándose únicamente en los resultados de esta herramienta.
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              <h4 className="font-bold text-slate-800 dark:text-slate-200">Limitación de Responsabilidad</h4>
              <p>
                En la máxima medida permitida por la ley aplicable, el desarrollador de PediaCode, sus afiliados, socios o licenciantes no serán responsables bajo ninguna circunstancia por cualquier error matemático, omisión, retraso o imprecisión en los cálculos generados por la Aplicación, ni por complicaciones médicas, lesiones corporales o mala práctica médica. La Aplicación se proporciona "tal cual" (As-Is) y sin garantías de ningún tipo.
              </p>
              <h4 className="font-bold text-slate-800 dark:text-slate-200">Propiedad Intelectual</h4>
              <p>
                Todos los derechos de propiedad intelectual sobre el diseño, código fuente, algoritmos, logotipos, marcas y contenidos de PediaCode pertenecen exclusivamente al desarrollador de la Aplicación. Queda estrictamente prohibida la reproducción, ingeniería inversa, descompilación o distribución no autorizada de la misma.
              </p>
            </div>
          </div>
        )}

        {/* --- TAB 3: PRIVACIDAD --- */}
        {activeSubTab === 'privacy' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Lock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Política de Privacidad (Cero Recolección de Datos)</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 rounded-xl p-4 space-y-2 font-medium">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">1. Privacidad por Diseño</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  No recopilamos, no almacenamos, no rastreamos ni compartimos ningún tipo de información personal identificable (PII) de los usuarios ni de los pacientes evaluados. Tampoco recopilamos información de salud protegida (PHI); la aplicación no solicita nombres de pacientes ni registros médicos.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 rounded-xl p-4 space-y-2 font-medium">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">2. Almacenamiento Local (Offline-First)</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Todos los datos ingresados en la Aplicación (como el peso, la edad, la talla o los porcentajes de quemaduras del paciente) y el historial de consultas calculadas se procesan y almacenan únicamente en la memoria local de su dispositivo (a través de localStorage / IndexedDB). Estos datos nunca se transmiten a servidores externos ni a terceros.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 rounded-xl p-4 space-y-2 font-medium">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">3. Permisos del Dispositivo</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  La versión móvil de PediaCode está diseñada para funcionar de forma 100% offline (sin conexión a internet). No requiere permisos de geolocalización, acceso a la cámara, contactos, micrófono ni almacenamiento externo. No se utilizan SDKs de seguimiento ni analíticas invasivas.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 rounded-xl p-4 space-y-2 font-medium">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">4. Privacidad Infantil</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Dado que no recopilamos ningún tipo de información personal, la Aplicación cumple plenamente con las leyes de protección de la privacidad infantil en internet (como COPPA en EE. UU. y normativas equivalentes en Latinoamérica y Europa).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 4: SOPORTE Y CONTACTO --- */}
        {activeSubTab === 'support' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Contact className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Soporte, Sugerencias y Contacto</h3>
            </div>

            <div className="bg-sky-50/50 dark:bg-sky-950/10 border border-sky-100 dark:border-sky-900/30 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 font-medium">
                <h4 className="font-bold text-sky-900 dark:text-sky-200 text-sm">Correo de Soporte Oficial</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Escríbenos directamente para soporte o feedback clínico:
                </p>
                <span className="font-mono font-bold text-sky-700 dark:text-sky-300 text-sm block pt-1">
                  soporte@pediacode.app
                </span>
              </div>
              <a
                href="mailto:soporte@pediacode.app"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md shadow-sky-100 dark:shadow-none transition-all cursor-pointer"
              >
                Enviar Correo
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>

            <div className="space-y-3 font-medium">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Acerca de PediaCode</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                PediaCode es una suite de soporte de decisiones clínicas diseñada específicamente para médicos pediatras, de urgencias, residentes y personal de enfermería. Nuestro objetivo es automatizar cálculos complejos de líquidos, electrólitos, equipamiento y dosificación de medicamentos en situaciones de alta presión, reduciendo el margen de error y optimizando los tiempos de respuesta en urgencias pediátricas.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
