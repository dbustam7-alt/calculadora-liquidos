'use client';

import React, { useState, useEffect } from 'react';
import { usePatient } from '@/context/PatientContext';
import { calculateHollidaySegar, calculateBsaMaintenance } from '@/lib/formulas';
import { Droplet, Info, Save, CheckCircle2, AlertCircle, Check } from 'lucide-react';
import ClinicalAlert from './ClinicalAlert';

export default function MaintenanceModule() {
  const { weightKg, bsa, saveCurrentConsultation } = usePatient();

  // Results
  const [holliday, setHolliday] = useState(calculateHollidaySegar(weightKg));
  const [bsaMaint, setBsaMaint] = useState(calculateBsaMaintenance(bsa));

  // Saving state
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Recalculate when inputs change
  useEffect(() => {
    setHolliday(calculateHollidaySegar(weightKg));
    setBsaMaint(calculateBsaMaintenance(bsa));
  }, [weightKg, bsa]);

  const isWeightUnder30 = weightKg <= 30;

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    const details = {
      method: 'Líquidos de Mantenimiento',
      recommendedMethod: isWeightUnder30 ? 'Holliday-Segar' : 'Superficie Corporal',
      weightKg,
      bsa,
      holliday: {
        dailyVolumeMl: holliday.dailyVolumeMl,
        hourlyRateMlh: holliday.hourlyRateMlh,
        dropsPerMin: holliday.dropsPerMin,
        microdropsPerMin: holliday.microdropsPerMin,
      },
      bsaBased: {
        dailyVolumeMlMin: bsaMaint.dailyVolumeMlMin,
        dailyVolumeMlMax: bsaMaint.dailyVolumeMlMax,
        hourlyRateMlhMin: bsaMaint.hourlyRateMlhMin,
        hourlyRateMlhMax: bsaMaint.hourlyRateMlhMax,
      },
    };

    const success = await saveCurrentConsultation('mantenimiento', details);
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
        <Droplet className="h-6 w-6 text-sky-600" />
        <h2 className="text-xl font-bold text-slate-900">Líquidos de Mantenimiento</h2>
      </div>

      {/* Dynamic Recommendation Alert */}
      <div className="animate-fade-in">
        <ClinicalAlert
          type={isWeightUnder30 ? 'info' : 'warning'}
          title={isWeightUnder30 ? 'Indicación: Método Holliday-Segar' : 'Indicación: Método por Superficie Corporal'}
          message={
            isWeightUnder30
              ? `Paciente con peso de ${weightKg} kg (≤ 30 kg). Se recomienda utilizar el método estándar de Holliday-Segar para el cálculo de líquidos basales.`
              : `Paciente con peso de ${weightKg} kg (> 30 kg). Se recomienda utilizar el método de Superficie Corporal (SC) para evitar sobrehidratación.`
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Holliday-Segar Card */}
        <div className={`bg-white border rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-all duration-300 ${
          isWeightUnder30 
            ? 'border-sky-500 ring-2 ring-sky-100' 
            : 'border-slate-200 opacity-75 hover:opacity-100'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                Método Holliday-Segar
                {isWeightUnder30 && <span className="bg-sky-100 text-sky-800 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase">Recomendado</span>}
              </h3>
              <span className="bg-sky-50 text-sky-700 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border border-sky-100">
                Basado en Peso
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Método fisiológico estándar para calcular líquidos de mantenimiento en niños con peso menor o igual a 30 kg.
            </p>

            {/* Results Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Volumen Diario (24h)</span>
                <span className="text-xl font-bold font-mono text-slate-800">
                  {holliday.dailyVolumeMl} <span className="text-xs font-semibold text-slate-500">mL/día</span>
                </span>
              </div>
              <div className={`rounded-xl p-4 border transition-all ${
                isWeightUnder30 ? 'bg-sky-50 border-sky-100' : 'bg-slate-50 border-slate-100'
              }`}>
                <span className={`text-[10px] uppercase font-bold block mb-1 ${
                  isWeightUnder30 ? 'text-sky-600' : 'text-slate-400'
                }`}>Tasa de Infusión</span>
                <span className={`text-xl font-bold font-mono ${
                  isWeightUnder30 ? 'text-sky-700' : 'text-slate-800'
                }`}>
                  {holliday.hourlyRateMlh} <span className="text-xs font-semibold text-slate-500">mL/h</span>
                </span>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Macrogoteo</span>
                <span className="text-xl font-bold font-mono text-slate-800">
                  {holliday.dropsPerMin} <span className="text-xs font-semibold text-slate-500">gotas/min</span>
                </span>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Microgoteo</span>
                <span className="text-xl font-bold font-mono text-slate-800">
                  {holliday.microdropsPerMin} <span className="text-xs font-semibold text-slate-500">ugotas/min</span>
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 text-xs text-slate-600 space-y-1">
            <div className="font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Info className="h-3.5 w-3.5 text-sky-600" /> Regla de Cálculo:
            </div>
            <p className="leading-relaxed">
              • <strong>1 a 10 kg:</strong> 100 mL por cada kg.
            </p>
            <p className="leading-relaxed">
              • <strong>10 a 20 kg:</strong> 1000 mL + 50 mL por cada kg mayor a 10 kg.
            </p>
            <p className="leading-relaxed">
              • <strong>20 a 30 kg:</strong> 1500 mL + 20 mL por cada kg mayor a 20 kg.
            </p>
          </div>
        </div>

        {/* BSA-Based Maintenance Card */}
        <div className={`bg-white border rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-all duration-300 ${
          !isWeightUnder30 
            ? 'border-emerald-500 ring-2 ring-emerald-100' 
            : 'border-slate-200 opacity-75 hover:opacity-100'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                Método por Superficie Corporal
                {!isWeightUnder30 && <span className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase">Recomendado</span>}
              </h3>
              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border border-emerald-100">
                Basado en SC
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Método recomendado para niños mayores de 30 kg para calcular líquidos basales en base a su Superficie Corporal (SCT).
            </p>

            {/* Results Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 col-span-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Volumen Diario Sugerido (24h)</span>
                <span className="text-xl font-bold font-mono text-slate-800">
                  {bsaMaint.dailyVolumeMlMin} - {bsaMaint.dailyVolumeMlMax} <span className="text-xs font-semibold text-slate-500">mL/día</span>
                </span>
              </div>
              <div className={`rounded-xl p-4 border transition-all col-span-2 ${
                !isWeightUnder30 ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'
              }`}>
                <span className={`text-[10px] uppercase font-bold block mb-1 ${
                  !isWeightUnder30 ? 'text-emerald-600' : 'text-slate-400'
                }`}>Tasa de Infusión Sugerida</span>
                <span className={`text-xl font-bold font-mono ${
                  !isWeightUnder30 ? 'text-emerald-700' : 'text-slate-800'
                }`}>
                  {bsaMaint.hourlyRateMlhMin} - {bsaMaint.hourlyRateMlhMax} <span className="text-xs font-semibold text-slate-500">mL/h</span>
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 text-xs text-slate-600 space-y-1">
            <div className="font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Info className="h-3.5 w-3.5 text-emerald-600" /> Regla de Cálculo:
            </div>
            <p className="leading-relaxed">
              • <strong>Rango de líquidos:</strong> 1500 a 1800 mL por m² de Superficie Corporal al día.
            </p>
            <p className="leading-relaxed">
              • <strong>Superficie Corporal ({bsa.toFixed(3)} m²):</strong> Calculada automáticamente en base al peso del paciente.
            </p>
          </div>
        </div>
      </div>

      {/* Save Consultation Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-50 border border-slate-200 rounded-2xl p-4 md:p-6 gap-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-slate-800 text-sm">Guardar Registro Clínico</h4>
            <p className="text-xs text-slate-500">
              Al guardar, se registrará esta consulta en el historial del paciente con todos los datos calculados.
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving || weightKg <= 0}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white font-bold text-sm rounded-xl shadow-lg shadow-sky-100 hover:shadow-sky-200 disabled:shadow-none transition-all duration-200 cursor-pointer"
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
