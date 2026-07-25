'use client';

import React, { useState, useEffect } from 'react';
import { usePatient } from '@/context/PatientContext';
import { calculateHollidaySegar, calculateBsaMaintenance } from '@/lib/formulas';
import { Droplet, Info, Save, CheckCircle2 } from 'lucide-react';
import ClinicalAlert from './ClinicalAlert';

export default function MaintenanceModule() {
  const { weightKg, bsa, saveCurrentConsultation } = usePatient();

  // Custom inputs for BSA-based maintenance
  const [fluidReqM2, setFluidReqM2] = useState<number>(1500);
  const [naReqM2, setNaReqM2] = useState<number>(40);
  const [kReqM2, setKReqM2] = useState<number>(20);

  // Results
  const [holliday, setHolliday] = useState(calculateHollidaySegar(weightKg));
  const [bsaMaint, setBsaMaint] = useState(calculateBsaMaintenance(bsa, fluidReqM2, naReqM2, kReqM2));

  // Saving state
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Recalculate when inputs change
  useEffect(() => {
    setHolliday(calculateHollidaySegar(weightKg));
  }, [weightKg]);

  useEffect(() => {
    setBsaMaint(calculateBsaMaintenance(bsa, fluidReqM2, naReqM2, kReqM2));
  }, [bsa, fluidReqM2, naReqM2, kReqM2]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    const details = {
      method: 'Holliday-Segar & Superficie Corporal',
      holliday: {
        dailyVolumeMl: holliday.dailyVolumeMl,
        hourlyRateMlh: holliday.hourlyRateMlh,
        dropsPerMin: holliday.dropsPerMin,
        microdropsPerMin: holliday.microdropsPerMin,
      },
      bsaBased: {
        inputs: { fluidReqM2, naReqM2, kReqM2 },
        results: {
          dailyVolumeMl: bsaMaint.dailyVolumeMl,
          hourlyRateMlh: bsaMaint.hourlyRateMlh,
          naTotalMeq: bsaMaint.naTotalMeq,
          kTotalMeq: bsaMaint.kTotalMeq,
        },
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
        <h2 className="text-xl font-bold text-slate-900">Líquidos y Electrólitos de Mantenimiento</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Holliday-Segar Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-base">Método Holliday-Segar</h3>
              <span className="bg-sky-50 text-sky-700 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border border-sky-100">
                Basado en Peso
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Método fisiológico estándar de oro para calcular líquidos basales en pediatría según el peso del paciente.
            </p>

            {/* Results Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Volumen Diario</span>
                <span className="text-xl font-bold font-mono text-slate-800">
                  {holliday.dailyVolumeMl} <span className="text-xs font-semibold text-slate-500">mL/día</span>
                </span>
              </div>
              <div className="bg-sky-50/50 rounded-xl p-4 border border-sky-100/50">
                <span className="text-[10px] uppercase font-bold text-sky-600 block mb-1">Tasa de Infusión</span>
                <span className="text-xl font-bold font-mono text-sky-700">
                  {holliday.hourlyRateMlh} <span className="text-xs font-semibold text-sky-500">mL/h</span>
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

          <ClinicalAlert
            type="info"
            title="Regla Holliday-Segar"
            message="100 mL/kg para los primeros 10 kg; 50 mL/kg para los siguientes 10 kg; y 20 mL/kg por cada kg adicional."
          />
        </div>

        {/* BSA-Based Maintenance Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-base">Método por Superficie Corporal (SC)</h3>
              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border border-emerald-100">
                Basado en SC
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Recomendado para niños mayores de 10 kg o adolescentes. Permite ajustar requerimientos específicos de líquidos y electrólitos.
            </p>

            {/* Parameter Adjustment Inputs */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div>
                <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Líquidos (mL/m²/d)</label>
                <input
                  type="number"
                  min="1000"
                  max="2000"
                  step="50"
                  value={fluidReqM2}
                  onChange={(e) => setFluidReqM2(Math.max(1000, parseInt(e.target.value) || 1000))}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all font-mono text-slate-900 text-center"
                />
              </div>
              <div>
                <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Sodio (mEq/m²/d)</label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  step="5"
                  value={naReqM2}
                  onChange={(e) => setNaReqM2(Math.max(10, parseInt(e.target.value) || 10))}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all font-mono text-slate-900 text-center"
                />
              </div>
              <div>
                <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Potasio (mEq/m²/d)</label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  step="5"
                  value={kReqM2}
                  onChange={(e) => setKReqM2(Math.max(10, parseInt(e.target.value) || 10))}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all font-mono text-slate-900 text-center"
                />
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Volumen Diario</span>
                <span className="text-xl font-bold font-mono text-slate-800">
                  {bsaMaint.dailyVolumeMl} <span className="text-xs font-semibold text-slate-500">mL/día</span>
                </span>
              </div>
              <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100/50">
                <span className="text-[10px] uppercase font-bold text-emerald-600 block mb-1">Tasa de Infusión</span>
                <span className="text-xl font-bold font-mono text-emerald-700">
                  {bsaMaint.hourlyRateMlh} <span className="text-xs font-semibold text-slate-500">mL/h</span>
                </span>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Sodio Basal Total</span>
                <span className="text-xl font-bold font-mono text-slate-800">
                  {bsaMaint.naTotalMeq} <span className="text-xs font-semibold text-slate-500">mEq/día</span>
                </span>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Potasio Basal Total</span>
                <span className="text-xl font-bold font-mono text-slate-800">
                  {bsaMaint.kTotalMeq} <span className="text-xs font-semibold text-slate-500">mEq/día</span>
                </span>
              </div>
            </div>
          </div>

          <ClinicalAlert
            type="success"
            title="Requerimientos Estándar"
            message="Líquidos: 1200-1800 mL/m²/día. Sodio: 30-50 mEq/m²/día. Potasio: 20-40 mEq/m²/día."
          />
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
          disabled={isSaving || holliday.dailyVolumeMl === 0}
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
