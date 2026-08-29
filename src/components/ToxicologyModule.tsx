'use client';

import React, { useState } from 'react';
import { usePatient } from '@/context/PatientContext';
import { 
  ShieldAlert, 
  Info, 
  CheckCircle, 
  AlertTriangle, 
  Activity, 
  FileText, 
  Eye, 
  Layers,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { clsx } from 'clsx';

// --- TOXIDROMES DEFINITIONS ---
interface Toxidrome {
  id: string;
  name: string;
  substances: string;
  triad: string;
  pupils: 'miosis' | 'midriasis' | 'normal';
  heartRate: 'bradicardia' | 'taquicardia' | 'normal';
  skin: 'sudorosa' | 'seca' | 'normal';
  mentalState: 'deprimido' | 'agitado' | 'normal';
  antidote: string;
  clinicalNotes: string;
}

const TOXIDROMES: Toxidrome[] = [
  {
    id: 'opiaceo',
    name: 'Toxíndrome Opiáceo / Sedante',
    substances: 'Heroína, Fentanilo, Tramadol, Morfina, Codeína, Clonidina.',
    triad: 'Depresión respiratoria + Pupilas puntiformes (miosis) + Estado mental deprimido (coma).',
    pupils: 'miosis',
    heartRate: 'bradicardia',
    skin: 'normal',
    mentalState: 'deprimido',
    antidote: 'Naloxona',
    clinicalNotes: 'La prioridad absoluta es asegurar la ventilación y oxigenación. Administrar Naloxona en bolos repetidos si hay depresión respiratoria grave.'
  },
  {
    id: 'colinergico',
    name: 'Toxíndrome Colinérgico',
    substances: 'Organofosforados, Carbamatos (insecticidas, plaguicidas), Fisostigmina.',
    triad: 'Sialorrea (salivación) + Broncorrea (secreciones) + Miosis puntiforme + Fasciculaciones.',
    pupils: 'miosis',
    heartRate: 'bradicardia',
    skin: 'sudorosa',
    mentalState: 'deprimido',
    antidote: 'Atropina',
    clinicalNotes: '¡Emergencia vital por asfixia debido a broncorrea extrema! El objetivo de la Atropina no es normalizar las pupilas, sino secar las secreciones bronquiales (atropinización).'
  },
  {
    id: 'anticolinergico',
    name: 'Toxíndrome Anticolinérgico',
    substances: 'Atropina, Antihistamínicos (difenhidramina), Escopolamina, Antidepresivos tricíclicos.',
    triad: 'Midriasis + Taquicardia + Piel roja, caliente y seca + Retención urinaria + Delirio ("Loco como una cabra, rojo como un tomate, seco como un hueso").',
    pupils: 'midriasis',
    heartRate: 'taquicardia',
    skin: 'seca',
    mentalState: 'agitado',
    antidote: 'Soporte clínico (Fisostigmina en casos muy graves)',
    clinicalNotes: 'Controlar la hipertermia con medidas físicas. Evitar las benzodiacepinas a menos que haya agitación extrema o convulsiones.'
  },
  {
    id: 'simpaticomimetico',
    name: 'Toxíndrome Simpaticomimético',
    substances: 'Cocaína, Anfetaminas, Éxtasis, Ritalina, Descongestionantes (pseudoefedrina).',
    triad: 'Midriasis + Taquicardia + Hipertensión + Piel muy sudorosa + Agitación psicomotriz extrema.',
    pupils: 'midriasis',
    heartRate: 'taquicardia',
    skin: 'sudorosa',
    mentalState: 'agitado',
    antidote: 'Benzodiacepinas (Midazolam/Diazepam) para control de agitación y presión',
    clinicalNotes: 'Riesgo elevado de arritmias, infarto de miocardio e hipertermia maligna. Enfriamiento físico inmediato y sedación con benzodiacepinas.'
  }
];

export default function ToxicologyModule() {
  const { weightKg } = usePatient();
  const [activeSubTab, setActiveSubTab] = useState<'decontam' | 'antidotes' | 'toxidromes'>('decontam');

  // --- TOXIDROME ASSISTANT STATE ---
  const [selectedPupils, setSelectedPupils] = useState<'miosis' | 'midriasis' | 'normal' | null>(null);
  const [selectedHeartRate, setSelectedHeartRate] = useState<'bradicardia' | 'taquicardia' | 'normal' | null>(null);
  const [selectedSkin, setSelectedSkin] = useState<'sudorosa' | 'seca' | 'normal' | null>(null);
  const [selectedMentalState, setSelectedMentalState] = useState<'deprimido' | 'agitado' | 'normal' | null>(null);

  // --- ANTIDOTE CALCULATIONS ---
  const getNacProtocol = () => {
    // N-Acetylcysteine (NAC) 21-hour IV protocol for Acetaminophen poisoning
    // Dose: Loading: 150 mg/kg in 1h, Dose 2: 50 mg/kg in 4h, Dose 3: 100 mg/kg in 16h
    const loadDoseMg = weightKg * 150;
    const loadClamped = Math.min(15000, loadDoseMg); // Max 15g
    const loadVolMl = loadClamped / 200; // standard 20% solution (200 mg/mL)

    const secondDoseMg = weightKg * 50;
    const secondClamped = Math.min(5000, secondDoseMg); // Max 5g
    const secondVolMl = secondClamped / 200;

    const thirdDoseMg = weightKg * 100;
    const thirdClamped = Math.min(10000, thirdDoseMg); // Max 10g
    const thirdVolMl = thirdClamped / 200;

    // Dilution volumes based on weight to avoid fluid overload in small children
    let loadDiluentMl = 100;
    let secondDiluentMl = 250;
    let thirdDiluentMl = 500;

    if (weightKg < 20) {
      loadDiluentMl = parseFloat((weightKg * 3).toFixed(0)); // ~3 mL/kg
      secondDiluentMl = parseFloat((weightKg * 7).toFixed(0));
      thirdDiluentMl = parseFloat((weightKg * 14).toFixed(0));
    }

    return {
      load: { mg: loadClamped, ml: loadVolMl, diluent: loadDiluentMl, rate: parseFloat(((loadVolMl + loadDiluentMl) / 1).toFixed(1)) },
      second: { mg: secondClamped, ml: secondVolMl, diluent: secondDiluentMl, rate: parseFloat(((secondVolMl + secondDiluentMl) / 4).toFixed(1)) },
      third: { mg: thirdClamped, ml: thirdVolMl, diluent: thirdDiluentMl, rate: parseFloat(((thirdVolMl + thirdDiluentMl) / 16).toFixed(1)) }
    };
  };

  const getAntidotes = () => {
    const nac = getNacProtocol();

    return [
      {
        id: 'nac',
        name: 'N-Acetilcisteína (Antídoto de Paracetamol)',
        presentation: 'Ampolla al 20% (200 mg/mL)',
        dose: 'Protocolo IV de 21 horas (3 fases continuas)',
        calculation: `Carga: ${nac.load.mg.toFixed(0)} mg • Fase 2: ${nac.second.mg.toFixed(0)} mg • Fase 3: ${nac.third.mg.toFixed(0)} mg`,
        preparation: `Protocolo de infusión continua por bomba de infusión:
1. FASe 1 (Carga - 1 hora): Extraer ${nac.load.ml.toFixed(1)} mL de NAC al 20%. Diluir en ${nac.load.diluent} mL de Dextrosa al 5% o Salino 0.9%. Infundir a una tasa de ${nac.load.rate} mL/h en 1 hora.
2. FASE 2 (4 horas): Extraer ${nac.second.ml.toFixed(1)} mL de NAC al 20%. Diluir en ${nac.second.diluent} mL de Dextrosa al 5% o Salino 0.9%. Infundir a una tasa de ${nac.second.rate} mL/h en 4 horas.
3. FASE 3 (16 horas): Extraer ${nac.third.ml.toFixed(1)} mL de NAC al 20%. Diluir en ${nac.third.diluent} mL de Dextrosa al 5% o Salino 0.9%. Infundir a una tasa de ${nac.third.rate} mL/h en 16 horas.`,
        notes: 'Iniciar de inmediato si los niveles séricos de paracetamol están por encima de la línea de toxicidad en el nomograma de Rumack-Matthew o en sospecha de ingesta masiva (>150 mg/kg) con más de 8 horas de evolución.'
      },
      {
        id: 'naloxona',
        name: 'Naloxona (Antídoto de Opiáceos)',
        presentation: 'Ampolla 0.4 mg / 1 mL',
        dose: '0.01 mg/kg a 0.1 mg/kg IV / IO / IM',
        calculation: `${Math.min(2, parseFloat((weightKg * 0.01).toFixed(2)))} mg - ${Math.min(2, parseFloat((weightKg * 0.1).toFixed(2)))} mg`,
        preparation: `Extraer de la ampolla directamente. 
* Para dosis baja (reversión parcial sin retirar analgesia): Administrar ${(Math.min(2, weightKg * 0.01) / 0.4).toFixed(2)} mL IV.
* Para dosis de reanimación (depresión respiratoria grave): Administrar ${(Math.min(2, weightKg * 0.1) / 0.4).toFixed(2)} mL IV/IO rápido (Dosis máxima: 2 mg o 5 ampollas). Se puede repetir cada 2-3 minutos si es necesario.`,
        notes: 'El objetivo es restaurar una ventilación espontánea adecuada, no necesariamente despertar por completo al paciente. Vida media corta (30-90 min), vigilar estrechamente por recurrencia de la depresión respiratoria.'
      },
      {
        id: 'flumazenil',
        name: 'Flumazenil (Antídoto de Benzodiacepinas)',
        presentation: 'Ampolla 0.5 mg / 5 mL (0.1 mg/mL)',
        dose: '0.01 mg/kg IV lento',
        calculation: `${Math.min(0.2, parseFloat((weightKg * 0.01).toFixed(2)))} mg (Máx. 0.2 mg por dosis)`,
        preparation: `Extraer ${(Math.min(0.2, weightKg * 0.01) / 0.1).toFixed(1)} mL de la ampolla directamente y administrar por vía IV lenta en un periodo de 15 segundos. Se puede repetir cada minuto hasta una dosis acumulada máxima de 1 mg (o 10 mL de solución).`,
        notes: 'Contraindicado absolutamente en pacientes con epilepsia crónica bajo tratamiento con benzodiacepinas (puede desencadenar estatus epiléptico refractario) o en sospecha de co-ingesta de antidepresivos tricíclicos.'
      },
      {
        id: 'atropina_tox',
        name: 'Atropina (Antídoto de Organofosforados)',
        presentation: 'Ampolla 1 mg / 1 mL',
        dose: '0.02 mg/kg a 0.05 mg/kg IV cada 5-10 minutos',
        calculation: `${Math.max(0.1, Math.min(2, parseFloat((weightKg * 0.02).toFixed(2))))} mg - ${Math.min(5, parseFloat((weightKg * 0.05).toFixed(2)))} mg`,
        preparation: `Extraer de la ampolla de Atropina (1 mg/mL) directamente. Administrar en bolo IV rápido cada 5 a 10 minutos. El objetivo clínico es lograr la "atropinización": secado de secreciones bronquiales, resolución de sibilancias y frecuencia cardíaca adecuada.`,
        notes: 'La miosis y la taquicardia no son contraindicaciones para suspender la atropina. La prioridad absoluta es revertir la broncorrea y el broncoespasmo que comprometen la ventilación.'
      }
    ];
  };

  // --- TOXIDROME MATCHING LOGIC ---
  const getMatchedToxidrome = () => {
    // Count matches for each toxidrome
    const scores = TOXIDROMES.map((tox) => {
      let score = 0;
      if (selectedPupils && selectedPupils === tox.pupils) score++;
      if (selectedHeartRate && selectedHeartRate === tox.heartRate) score++;
      if (selectedSkin && selectedSkin === tox.skin) score++;
      if (selectedMentalState && selectedMentalState === tox.mentalState) score++;
      return { tox, score };
    });

    // Sort by score descending
    scores.sort((a, b) => b.score - a.score);

    // Only return if there is at least a score of 2 matches
    if (scores[0].score >= 2) {
      return scores[0];
    }
    return null;
  };

  const matchedResult = getMatchedToxidrome();

  const handleResetToxidrome = () => {
    setSelectedPupils(null);
    setSelectedHeartRate(null);
    setSelectedSkin(null);
    setSelectedMentalState(null);
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveSubTab('decontam')}
          className={clsx(
            'flex-1 py-3 text-xs md:text-sm font-bold border-b-2 transition-all cursor-pointer text-center',
            activeSubTab === 'decontam'
              ? 'border-sky-600 dark:border-sky-500 text-sky-600 dark:text-sky-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          )}
        >
          Descontaminación
        </button>
        <button
          onClick={() => setActiveSubTab('antidotes')}
          className={clsx(
            'flex-1 py-3 text-xs md:text-sm font-bold border-b-2 transition-all cursor-pointer text-center',
            activeSubTab === 'antidotes'
              ? 'border-sky-600 dark:border-sky-500 text-sky-600 dark:text-sky-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          )}
        >
          Antídotos por Peso
        </button>
        <button
          onClick={() => setActiveSubTab('toxidromes')}
          className={clsx(
            'flex-1 py-3 text-xs md:text-sm font-bold border-b-2 transition-all cursor-pointer text-center',
            activeSubTab === 'toxidromes'
              ? 'border-sky-600 dark:border-sky-500 text-sky-600 dark:text-sky-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          )}
        >
          Asistente de Toxíndromes
        </button>
      </div>

      {/* --- SUB-TAB 1: DESCONTAMINACIÓN GASTROINTESTINAL --- */}
      {activeSubTab === 'decontam' && (
        <div className="space-y-6">
          <div className="bg-sky-50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/40 rounded-2xl p-4 flex items-start gap-3">
            <Info className="h-5 w-5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
            <div className="text-xs text-sky-800 dark:text-sky-300 font-medium">
              <p className="font-bold mb-0.5 text-sky-900 dark:text-sky-200">
                Parámetros Activos: Peso {weightKg} kg
              </p>
              <p className="leading-relaxed">
                Las dosis de carbón activado y volúmenes de lavado gástrico se calculan de forma personalizada para evitar complicaciones graves como la intoxicación por agua o la hipotermia.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Carbón Activado */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 transition-colors">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl">
                  <Activity className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm md:text-base">Carbón Activado</h4>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl text-center border border-slate-100 dark:border-slate-900">
                <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Dosis Pediátrica Recomendada</span>
                <span className="text-xl md:text-2xl font-mono font-bold text-slate-900 dark:text-white mt-1 block">
                  {Math.min(50, weightKg * 1)} g a {Math.min(50, weightKg * 2)} g
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">
                  (Calculado a 1 - 2 g/kg • Dosis máxima: 50 g)
                </span>
              </div>

              <div className="space-y-3 text-xs font-medium text-slate-600 dark:text-slate-300">
                <p className="leading-relaxed">
                  <strong className="text-slate-800 dark:text-slate-200">Preparación:</strong> Mezclar la dosis calculada con agua en una proporción de 1:4 o 1:8 (ej. 20 g de carbón en 100-150 mL de agua) para crear una suspensión homogénea. Administrar vía oral o por sonda nasogástrica.
                </p>
                <div className="bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100/50 dark:border-amber-900/20 rounded-xl p-3 text-[11px] leading-relaxed text-amber-800 dark:text-amber-400">
                  <p className="font-bold mb-1 flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" /> Contraindicaciones Absolutas:
                  </p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    <li>Vía aérea no protegida (riesgo de neumonitis por aspiración).</li>
                    <li>Ingesta de cáusticos (ácidos/álcalis) o hidrocarburos.</li>
                    <li>Ingesta de metales (hierro, litio) o alcoholes (no se absorben).</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Lavado Gástrico */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 transition-colors">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl">
                  <FileText className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm md:text-base">Lavado Gástrico Pediátrico</h4>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl text-center border border-slate-100 dark:border-slate-900">
                <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Volumen por Ciclo Seguro</span>
                <span className="text-xl md:text-2xl font-mono font-bold text-sky-600 dark:text-sky-400 mt-1 block">
                  {Math.min(250, parseFloat((weightKg * 10).toFixed(0)))} mL por ciclo
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">
                  (Calculado a 10 mL/kg • Volumen máximo por ciclo: 250 mL)
                </span>
              </div>

              <div className="space-y-3 text-xs font-medium text-slate-600 dark:text-slate-300">
                <p className="leading-relaxed">
                  <strong className="text-slate-800 dark:text-slate-200">Técnica Pediátrica:</strong> Utilizar estrictamente <strong className="text-slate-900 dark:text-white">Solución Salina al 0.9% tibia</strong> (a temperatura corporal) para prevenir la hipotermia y la hiponatremia dilucional (intoxicación por agua), la cual puede causar edema cerebral y convulsiones en niños pequeños.
                </p>
                <p className="leading-relaxed">
                  Repetir los ciclos de infusión y aspiración suave hasta que el líquido de retorno sea completamente claro (volumen total sugerido: 1 a 2 litros o hasta aclaramiento).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- SUB-TAB 2: ANTÍDOTOS ESPECÍFICOS --- */}
      {activeSubTab === 'antidotes' && (
        <div className="space-y-4">
          {getAntidotes().map((ant) => (
            <div
              key={ant.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm md:text-base flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                    {ant.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    Presentación: {ant.presentation}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-900 shrink-0 text-right">
                  <span className="block text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase">Dosis Guía</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mt-0.5">{ant.dose}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1 bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-100 dark:border-slate-900">
                  <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Cálculo por Peso ({weightKg} kg)</span>
                  <span className="text-sm font-mono font-bold text-sky-600 dark:text-sky-400 mt-1.5 block leading-relaxed">
                    {ant.calculation}
                  </span>
                </div>

                <div className="md:col-span-2 bg-sky-50/30 dark:bg-sky-950/10 border border-sky-100/50 dark:border-sky-900/20 p-3.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                  <span className="block text-[9px] font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5" /> Preparación e Instrucciones
                  </span>
                  <p className="whitespace-pre-line font-medium">{ant.preparation}</p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium border border-slate-100 dark:border-slate-900">
                <strong className="text-slate-700 dark:text-slate-300">Nota Clínica:</strong> {ant.notes}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- SUB-TAB 3: ASISTENTE DE TOXÍNDROMES --- */}
      {activeSubTab === 'toxidromes' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6 transition-colors">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base md:text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-sky-600 dark:text-sky-400 animate-pulse" />
                  Asistente Diagnóstico de Toxíndromes
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Selecciona los signos clínicos observados en el paciente pediátrico</p>
              </div>
              <button
                onClick={handleResetToxidrome}
                className="p-2 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs font-bold"
                title="Restablecer signos"
              >
                <RefreshCw className="h-4 w-4" />
                Limpiar
              </button>
            </div>

            {/* Signs Selectors Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Pupils */}
              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-extrabold text-slate-400 dark:text-slate-500 tracking-wider">Pupilas</label>
                <div className="flex flex-col gap-1.5">
                  {(['miosis', 'midriasis', 'normal'] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setSelectedPupils(opt)}
                      className={clsx(
                        'w-full px-3 py-2 text-xs font-bold rounded-xl border text-left transition-all cursor-pointer capitalize',
                        selectedPupils === opt
                          ? 'bg-sky-600 dark:bg-sky-500 text-white border-sky-600 dark:border-sky-500 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                      )}
                    >
                      {opt === 'miosis' ? '👁️ Miosis (Puntiformes)' : opt === 'midriasis' ? '👁️ Midriasis (Dilatadas)' : '👁️ Normal'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Heart Rate */}
              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-extrabold text-slate-400 dark:text-slate-500 tracking-wider">Frecuencia Cardíaca</label>
                <div className="flex flex-col gap-1.5">
                  {(['bradicardia', 'taquicardia', 'normal'] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setSelectedHeartRate(opt)}
                      className={clsx(
                        'w-full px-3 py-2 text-xs font-bold rounded-xl border text-left transition-all cursor-pointer capitalize',
                        selectedHeartRate === opt
                          ? 'bg-sky-600 dark:bg-sky-500 text-white border-sky-600 dark:border-sky-500 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                      )}
                    >
                      {opt === 'bradicardia' ? '❤️ Bradicardia (Baja)' : opt === 'taquicardia' ? '❤️ Taquicardia (Alta)' : '❤️ Normal'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Skin */}
              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-extrabold text-slate-400 dark:text-slate-500 tracking-wider">Piel / Mucosas</label>
                <div className="flex flex-col gap-1.5">
                  {(['sudorosa', 'seca', 'normal'] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setSelectedSkin(opt)}
                      className={clsx(
                        'w-full px-3 py-2 text-xs font-bold rounded-xl border text-left transition-all cursor-pointer capitalize',
                        selectedSkin === opt
                          ? 'bg-sky-600 dark:bg-sky-500 text-white border-sky-600 dark:border-sky-500 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                      )}
                    >
                      {opt === 'sudorosa' ? '💧 Sudorosa / Húmeda' : opt === 'seca' ? '☀️ Seca / Caliente' : '☀️ Normal'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mental State */}
              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-extrabold text-slate-400 dark:text-slate-500 tracking-wider">Estado Mental</label>
                <div className="flex flex-col gap-1.5">
                  {(['deprimido', 'agitado', 'normal'] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setSelectedMentalState(opt)}
                      className={clsx(
                        'w-full px-3 py-2 text-xs font-bold rounded-xl border text-left transition-all cursor-pointer capitalize',
                        selectedMentalState === opt
                          ? 'bg-sky-600 dark:bg-sky-500 text-white border-sky-600 dark:border-sky-500 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                      )}
                    >
                      {opt === 'deprimido' ? '🧠 Deprimido (Somnoliento/Coma)' : opt === 'agitado' ? '🧠 Agitado / Delirio' : '🧠 Alerta / Normal'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Panel */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
              {matchedResult ? (
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-5 space-y-4 animate-fade-in">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
                    <CheckCircle className="h-5 w-5 shrink-0" />
                    <h4 className="font-bold text-sm md:text-base">Sugerencia Diagnóstica Altamente Coincidente:</h4>
                  </div>
                  
                  <div className="space-y-2">
                    <h5 className="text-lg font-extrabold text-slate-900 dark:text-white">{matchedResult.tox.name}</h5>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      <strong className="text-slate-800 dark:text-slate-200">Sustancias comunes:</strong> {matchedResult.tox.substances}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      <strong className="text-slate-800 dark:text-slate-200">Tríada clínica:</strong> {matchedResult.tox.triad}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="bg-white dark:bg-slate-950 p-3.5 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                      <span className="block text-[9px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Antídoto de Elección</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white mt-1 block">{matchedResult.tox.antidote}</span>
                    </div>
                    <div className="bg-white dark:bg-slate-950 p-3.5 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                      <span className="block text-[9px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Coincidencia de Signos</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white mt-1 block">{matchedResult.score} de 4 signos marcados</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium italic border-t border-emerald-100/50 dark:border-emerald-900/20 pt-3">
                    * {matchedResult.tox.clinicalNotes}
                  </p>
                </div>
              ) : (
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-2xl p-5 text-center text-slate-500 dark:text-slate-400 font-medium py-8">
                  <Eye className="h-8 w-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                  <p className="text-xs md:text-sm">Selecciona al menos 2 signos clínicos para generar una sugerencia diagnóstica.</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-1">El asistente comparará tus selecciones con los perfiles de los toxíndromes pediátricos más comunes.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Scientific Reference Alert */}
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-[10px] md:text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
        <p className="font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
          <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
          Sustento Científico y Guías Clínicas de Referencia:
        </p>
        <p>
          Las guías de descontaminación, dosificación de antídotos específicos y criterios de clasificación de toxíndromes han sido adaptadas estrictamente de las pautas de toxicología clínica de la <strong className="text-slate-700 dark:text-slate-300">Academia Americana de Pediatría (AAP)</strong>, la <strong className="text-slate-700 dark:text-slate-300">Asociación Española de Pediatría (AEP)</strong> y el <strong className="text-slate-700 dark:text-slate-300">Manual Harriet Lane de Pediatría (Edición 22)</strong>.
        </p>
      </div>
    </div>
  );
}
