'use client';

import React, { useState, useEffect } from 'react';
import { usePatient } from '@/context/PatientContext';
import { calculateDka } from '@/lib/formulas';
import { Syringe, Info, Save, CheckCircle2 } from 'lucide-react';
import ClinicalAlert from './ClinicalAlert';

export default function DkaModule() {
  const { weightKg, saveCurrentConsultation } = usePatient();

  // Inputs
  const [measuredNa, setMeasuredNa] = useState<number>(135);
  const [glucoseMgDl, setGlucoseMgDl] = useState<number>(350);
  const [dehydrationPercentage, setDehydrationPercentage] = useState<number>(10);
  const [bolusMlKg, setBolusMlKg] = useState<number>(10);
  const [insulinUiKgH, setInsulinUiKgH] = useState<number>(0.1);
  const [correctionHours, setCorrectionHours] = useState<number>(48);

  // Results
  const [results, setResults] = useState(
    calculateDka(weightKg, measuredNa, glucoseMgDl, dehydrationPercentage, bolusMlKg, insulinUiKgH, correctionHours)
  );

  // Saving state
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Recalculate when inputs change
  useEffect(() => {
    setResults(
      calculateDka(weightKg, measuredNa, glucoseMgDl, dehydrationPercentage, bolusMlKg, insulinUiKgH, correctionHours)
    );
  }, [weightKg, measuredNa, glucoseMgDl, dehydrationPercentage, bolusMlKg, insulinUiKgH, correctionHours]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    const details = {
      method: 'Cetoacidosis Diabética (CAD)',
      inputs: {
        measuredNa,
        glucoseMgDl,
        dehydrationPercentage,
        bolusMlKg,
        insulinUiKgH,
        correctionHours,
      },
      results: {
        correctedSodiumMeqL: results.correctedSodiumMeqL,
        bolusVolumeMl: results.bolusVolumeMl,
        insulinRateUiH: results.insulinRateUiH,
        dehydrationDeficitMl: results.dehydrationDeficitMl,
        hourlyDeficitRateMlh: results.hourlyDeficitRateMlh,
        maintenanceHourlyRateMlh: results.maintenanceHourlyRateMlh,
        totalHourlyFluidRateMlh: results.totalHourlyFluidRateMlh,
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
        <Syringe className="h-6 w-6 text-sky-600" />
        <h2 className="text-xl font-bold text-slate-900">Manejo de Cetoacidosis Diabética (CAD)</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-base mb-2">Parámetros Clínicos de Entrada</h3>

            {/* Measured Na & Glucose Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Sodio Medido (mEq/L)</label>
                <input
                  type="number"
                  min="100"
                  max="180"
                  value={measuredNa || ''}
                  onChange={(e) => setMeasuredNa(Math.max(100, parseInt(e.target.value) || 100))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-sky-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-100 transition-all font-mono text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Glicemia (mg/dL)</label>
                <input
                  type="number"
                  min="50"
                  max="1500"
                  value={glucoseMgDl || ''}
                  onChange={(e) => setGlucoseMgDl(Math.max(50, parseInt(e.target.value) || 50))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-sky-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-100 transition-all font-mono text-slate-900"
                />
              </div>
            </div>

            {/* Dehydration & Bolus Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Deshidratación (%)</label>
                <select
                  value={dehydrationPercentage}
                  onChange={(e) => setDehydrationPercentage(parseInt(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-sky-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-100 transition-all font-semibold text-slate-900 cursor-pointer"
                >
                  <option value={5}>Leve (5%)</option>
                  <option value={10}>Moderada (10%)</option>
                  <option value={15}>Grave (15%)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Bolo Salino (mL/kg)</label>
                <select
                  value={bolusMlKg}
                  onChange={(e) => setBolusMlKg(parseInt(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-sky-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-100 transition-all font-semibold text-slate-900 cursor-pointer"
                >
                  <option value={0}>Sin Bolo (0 mL/kg)</option>
                  <option value={10}>Estándar (10 mL/kg)</option>
                  <option value={20}>Expansión (20 mL/kg)</option>
                </select>
              </div>
            </div>

            {/* Insulin & Correction Hours Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Insulina (UI/kg/h)</label>
                <select
                  value={insulinUiKgH}
                  onChange={(e) => setInsulinUiKgH(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-sky-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-100 transition-all font-semibold text-slate-900 cursor-pointer"
                >
                  <option value={0.05}>Baja (0.05 UI/kg/h)</option>
                  <option value={0.1}>Estándar (0.1 UI/kg/h)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Tiempo Corrección</label>
                <select
                  value={correctionHours}
                  onChange={(e) => setCorrectionHours(parseInt(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-sky-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-100 transition-all font-semibold text-slate-900 cursor-pointer"
                >
                  <option value={24}>Rápida (24 horas)</option>
                  <option value={48}>Segura (48 horas)</option>
                </select>
              </div>
            </div>
          </div>

          <ClinicalAlert
            type="info"
            title="Sodio Corregido por Glicemia"
            message="La hiperglicemia extrae agua al espacio extracelular, diluyendo artificialmente el Sodio. El Sodio Corregido estima el Sodio real una vez normalizada la glucosa para guiar la reposición de líquidos de forma segura."
          />
        </div>

        {/* Right Column: Outputs */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-800 text-base">Esquema de Manejo Calculado</h3>

            {/* Highlighted Corrected Na */}
            <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4 flex justify-between items-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-sky-600 block">Sodio Corregido</span>
                <span className="text-2xl font-bold font-mono text-sky-700">
                  {results.correctedSodiumMeqL} <span className="text-xs font-semibold">mEq/L</span>
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Sodio Medido</span>
                <span className="text-sm font-bold font-mono text-slate-600">{measuredNa} mEq/L</span>
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Volumen Bolo Inicial</span>
                <span className="text-lg font-bold font-mono text-slate-800">
                  {results.bolusVolumeMl} <span className="text-xs font-semibold text-slate-500">mL</span>
                </span>
                <span className="text-[9px] text-slate-400 block mt-1">Solución Salina 0.9%</span>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Infusión Insulina</span>
                <span className="text-lg font-bold font-mono text-slate-800">
                  {results.insulinRateUiH} <span className="text-xs font-semibold text-slate-500">UI/h</span>
                </span>
                <span className="text-[9px] text-slate-400 block mt-1">Insulina R (0.1 UI/kg/h)</span>
              </div>
            </div>

            {/* Fluid Deficit & Maintenance Breakdown */}
            <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-dashed border-slate-200">
                <span className="text-xs font-bold text-slate-700">Déficit por Deshidratación</span>
                <span className="text-xs font-bold font-mono text-slate-800">{results.dehydrationDeficitMl} mL</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>Tasa de Reposición Déficit:</span>
                <span className="font-mono font-semibold text-slate-700">{results.hourlyDeficitRateMlh} mL/h</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>Tasa de Mantenimiento Basal:</span>
                <span className="font-mono font-semibold text-slate-700">{results.maintenanceHourlyRateMlh} mL/h</span>
              </div>
              <div className="flex justify-between items-center text-xs text-sky-600 font-bold mt-1 border-t border-dashed border-slate-200 pt-2">
                <span>Tasa de Infusión Total:</span>
                <span className="font-mono text-base">{results.totalHourlyFluidRateMlh} mL/h</span>
              </div>
            </div>

            <ClinicalAlert
              type="warning"
              title="Seguridad Neurológica"
              message="Evite descensos bruscos de la osmolaridad plasmática. La corrección del déficit en 48 horas reduce significativamente el riesgo de edema cerebral en niños con CAD."
            />
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
          disabled={isSaving || results.totalHourlyFluidRateMlh === 0}
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
