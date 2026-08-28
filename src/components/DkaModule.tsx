'use client';

import React, { useState, useEffect } from 'react';
import { usePatient } from '@/context/PatientContext';
import { calculateDka } from '@/lib/formulas';
import { Syringe, Info, Save, CheckCircle2 } from 'lucide-react';
import ClinicalAlert from './ClinicalAlert';

export default function DkaModule() {
  const { weightKg, saveCurrentConsultation } = usePatient();

  // Inputs
  const [severity, setSeverity] = useState<'leve' | 'moderada' | 'grave'>('moderada');
  const [conCompromiso, setConCompromiso] = useState<boolean>(false);
  const [basalVeces, setBasalVeces] = useState<number>(2.0);

  // Results
  const [results, setResults] = useState(
    calculateDka(weightKg, severity, conCompromiso, basalVeces)
  );

  // Saving state
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Recalculate when inputs change
  useEffect(() => {
    setResults(calculateDka(weightKg, severity, conCompromiso, basalVeces));
  }, [weightKg, severity, conCompromiso, basalVeces]);

  const isWeightUnder30 = weightKg <= 30;

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    const details = {
      method: 'Cetoacidosis Diabética (CAD)',
      inputs: {
        severity,
        conCompromiso,
        basalVeces,
      },
      results: {
        bolus10VolumeMl: results.bolus10VolumeMl,
        bolus20VolumeMl: results.bolus20VolumeMl,
        dailyVolumeMlMin: results.dailyVolumeMlMin,
        dailyVolumeMlMax: results.dailyVolumeMlMax,
        hourlyRateMlhMin: results.hourlyRateMlhMin,
        hourlyRateMlhMax: results.hourlyRateMlhMax,
        totalVolumeMl48h: results.totalVolumeMl48h,
        hourlyRateMlh48h: results.hourlyRateMlh48h,
        maintVolume24h: results.maintVolume24h,
        deficitVolumeMl: results.deficitVolumeMl,
        sctM2: results.sctM2,
      },
    };

    const success = await saveCurrentConsultation('cad', details);
    setIsSaving(false);
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Title */}
      <div className="flex items-center gap-2">
        <Syringe className="h-6 w-6 text-sky-600 dark:text-sky-500" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Manejo de Cetoacidosis Diabética (CAD)</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5 transition-colors">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base border-b border-slate-100 dark:border-slate-800 pb-3">Parámetros Clínicos</h3>

            {/* Severity and Compromiso */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-1.5">Tipo de Cetoacidosis</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as any)}
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-sky-500 dark:focus:border-sky-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-950 transition-all font-semibold text-slate-900 dark:text-slate-100 cursor-pointer"
                >
                  <option value="leve">Cetoacidosis Leve</option>
                  <option value="moderada">Cetoacidosis Moderada</option>
                  <option value="grave">Cetoacidosis Grave</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-1.5">Compromiso Hemodinámico</label>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setConCompromiso(true)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      conCompromiso ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Sí
                  </button>
                  <button
                    type="button"
                    onClick={() => setConCompromiso(false)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      !conCompromiso ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>

            {/* Basal Veces Multiplier (Only shown for weight <= 30 kg) */}
            {isWeightUnder30 && (
              <div className="animate-fade-in">
                <label className="block text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-1.5">
                  Requerimiento Basal (# Veces Mantenimiento)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1.0"
                    max="2.5"
                    step="0.1"
                    value={basalVeces}
                    onChange={(e) => setBasalVeces(parseFloat(e.target.value))}
                    className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-600 dark:accent-sky-500"
                  />
                  <span className="font-mono font-bold text-sm text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl min-w-[60px] text-center">
                    {basalVeces.toFixed(1)}x
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5">
                  Multiplica los líquidos basales de Holliday-Segar para compensar la deshidratación intracelular.
                </p>
              </div>
            )}
          </div>

          <ClinicalAlert
            type={isWeightUnder30 ? 'info' : 'warning'}
            title={isWeightUnder30 ? 'Indicación: Protocolo ≤ 30 kg' : 'Indicación: Protocolo > 30 kg'}
            message={
              isWeightUnder30
                ? `Para pacientes ≤ 30 kg se calcula la hidratación para 48 horas sumando el déficit por deshidratación (${
                    severity === 'leve' ? '50' : severity === 'moderada' ? '70' : '100'
                  } mL/kg) y el requerimiento basal de Holliday-Segar multiplicado por ${basalVeces.toFixed(1)}.`
                : 'Para pacientes > 30 kg se recomienda el cálculo de líquidos basales por Superficie Corporal (2500 a 3000 mL/m²/día) para evitar edema cerebral.'
            }
          />
        </div>

        {/* Right Column: Outputs */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6 transition-colors">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base border-b border-slate-100 dark:border-slate-800 pb-3">Esquema de Hidratación Calculado</h3>

            {/* Initial Bolus Section (Only shown if conCompromiso is true) */}
            {conCompromiso && (
              <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-2xl p-5 space-y-3 animate-fade-in">
                <span className="text-[10px] uppercase font-extrabold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950 px-2.5 py-1 rounded-full w-fit block">
                  ¡Bolo Inicial Requerido!
                </span>
                <p className="text-xs text-rose-800 dark:text-rose-200 leading-relaxed font-medium">
                  Paciente con compromiso hemodinámico. Administrar de inmediato bolo de expansión de Ringer Lactato o Solución Salina 0.9%:
                </p>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="bg-white/80 dark:bg-slate-900/80 rounded-xl p-3 border border-rose-200/50 dark:border-rose-900/30 text-center">
                    <span className="text-[9px] uppercase font-bold text-rose-600 dark:text-rose-400 block mb-0.5">Bolo a 10 mL/kg</span>
                    <span className="text-lg font-bold font-mono text-rose-700 dark:text-rose-300">{results.bolus10VolumeMl} mL</span>
                  </div>
                  <div className="bg-white/80 dark:bg-slate-900/80 rounded-xl p-3 border border-rose-200/50 dark:border-rose-900/30 text-center">
                    <span className="text-[9px] uppercase font-bold text-rose-600 dark:text-rose-400 block mb-0.5">Bolo a 20 mL/kg</span>
                    <span className="text-lg font-bold font-mono text-rose-700 dark:text-rose-300">{results.bolus20VolumeMl} mL</span>
                  </div>
                </div>
              </div>
            )}

            {/* Fluid Calculations */}
            {isWeightUnder30 ? (
              /* Weight <= 30 kg (48 Hours Protocol) */
              <div className="space-y-4 animate-fade-in">
                <div className="bg-sky-50/50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/40 rounded-2xl p-5 text-center">
                  <span className="text-[10px] uppercase font-bold text-sky-600 dark:text-sky-400 block mb-1">Volumen Total para 48 Horas</span>
                  <span className="text-3xl font-bold font-mono text-sky-700 dark:text-sky-300">
                    {results.totalVolumeMl48h} <span className="text-sm font-semibold">mL</span>
                  </span>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2">
                    ({results.maintVolume24h} mL Basal × {basalVeces.toFixed(1)}) + ({results.deficitVolumeMl} mL Déficit)
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-100 dark:border-slate-800/80">
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block mb-1">Mantenimiento Basal (24h)</span>
                    <span className="text-lg font-bold font-mono text-slate-800 dark:text-slate-100">
                      {results.maintVolume24h} <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">mL</span>
                    </span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-100 dark:border-slate-800/80">
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block mb-1">Déficit por Deshidratación</span>
                    <span className="text-lg font-bold font-mono text-slate-800 dark:text-slate-100">
                      {results.deficitVolumeMl} <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">mL</span>
                    </span>
                  </div>
                </div>

                <div className="border border-sky-100 dark:border-sky-900/40 bg-sky-50/20 dark:bg-sky-950/10 rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-sky-600 dark:text-sky-400 block">Tasa de Infusión por Hora</span>
                    <span className="text-xl font-bold font-mono text-sky-700 dark:text-sky-300">
                      {results.hourlyRateMlh48h} <span className="text-xs font-semibold">mL/h</span>
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-full">
                    Durante 48 horas
                  </span>
                </div>
              </div>
            ) : (
              /* Weight > 30 kg (Surface Area Protocol) */
              <div className="space-y-4 animate-fade-in">
                <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl p-5 text-center">
                  <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block mb-1">Volumen Diario Sugerido (24h)</span>
                  <span className="text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-300">
                    {results.dailyVolumeMlMin} - {results.dailyVolumeMlMax} <span className="text-sm font-semibold">mL</span>
                  </span>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2">
                    (2500 a 3000 mL × {results.sctM2.toFixed(3)} m² SC)
                  </p>
                </div>

                <div className="border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-emerald-950/10 rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">Tasa de Infusión Sugerida</span>
                    <span className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-300">
                      {results.hourlyRateMlhMin} - {results.hourlyRateMlhMax} <span className="text-xs font-semibold">mL/h</span>
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-full">
                    Durante 24 horas
                  </span>
                </div>
              </div>
            )}

            <ClinicalAlert
              type="warning"
              title="Seguridad Neurológica"
              message="Evite descensos bruscos de la osmolaridad plasmática. La corrección lenta del déficit hídrico en 48 horas (para ≤ 30 kg) reduce significativamente el riesgo de edema cerebral en niños con CAD."
            />
          </div>
        </div>
      </div>

      {/* Save Consultation Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-6 gap-4 transition-colors">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-slate-500 dark:text-slate-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Guardar Registro Clínico</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Al guardar, se registrará esta consulta en el historial del paciente con todos los datos calculados.
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving || weightKg <= 0}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white font-bold text-sm rounded-xl shadow-lg shadow-sky-100 dark:shadow-none hover:shadow-sky-200 disabled:shadow-none transition-all duration-200 cursor-pointer"
        >
          {saveSuccess ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              ¡Consulta Guardada!
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {isSaving ? 'Guardando...' : 'Guardar Consulta'}
            </>
          )
        }
        </button>
      </div>
    </div>
  );
}
