'use client';

import React, { useState, useEffect } from 'react';
import { usePatient } from '@/context/PatientContext';
import { assessDehydration, calculateEdaHydration, EdaAssessment } from '@/lib/formulas';
import { Stethoscope, Info, Save, CheckCircle2 } from 'lucide-react';
import ClinicalAlert from './ClinicalAlert';

export default function EdaModule() {
  const { weightKg, ageMonths, saveCurrentConsultation } = usePatient();

  // Assessment state
  const [condition, setCondition] = useState<'alert' | 'irritable' | 'lethargic'>('alert');
  const [eyes, setEyes] = useState<'normal' | 'sunken'>('normal');
  const [thirst, setThirst] = useState<'normal' | 'thirsty' | 'unable_to_drink'>('normal');
  const [skinPinch, setSkinPinch] = useState<'immediate' | 'slow' | 'very_slow'>('immediate');

  // Results
  const [severity, setSeverity] = useState(assessDehydration({ condition, eyes, thirst, skinPinch }));
  const [hydration, setHydration] = useState(calculateEdaHydration(weightKg, ageMonths, severity));

  // Saving state
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Recalculate severity and hydration when inputs change
  useEffect(() => {
    const currentAssessment: EdaAssessment = { condition, eyes, thirst, skinPinch };
    const calculatedSeverity = assessDehydration(currentAssessment);
    setSeverity(calculatedSeverity);
    setHydration(calculateEdaHydration(weightKg, ageMonths, calculatedSeverity));
  }, [weightKg, ageMonths, condition, eyes, thirst, skinPinch]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    const details = {
      method: 'Enfermedad Diarreica Aguda (EDA) - OMS',
      assessment: { condition, eyes, thirst, skinPinch },
      results: {
        severity,
        recommendedPlan: hydration.recommendedPlan,
        planDetails: hydration.planDetails,
        fluidVolumeMl: hydration.fluidVolumeMl,
        hourlyRates: hydration.hourlyRates,
      },
    };

    const success = await saveCurrentConsultation('eda', details);
    setIsSaving(false);
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const getSeverityLabel = (sev: typeof severity) => {
    const labels = {
      none: { text: 'Sin Deshidratación', style: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
      some: { text: 'Deshidratación Moderada / Alguna', style: 'bg-amber-50 text-amber-700 border-amber-100' },
      severe: { text: 'Deshidratación Grave', style: 'bg-rose-50 text-rose-700 border-rose-100 animate-pulse-subtle' },
    };
    return labels[sev];
  };

  const getPlanColor = (plan: 'A' | 'B' | 'C') => {
    const colors = {
      A: 'bg-emerald-600 shadow-emerald-100',
      B: 'bg-amber-500 shadow-amber-100',
      C: 'bg-rose-600 shadow-rose-100 animate-pulse-subtle',
    };
    return colors[plan];
  };

  return (
    <div className="space-y-6">
      {/* Module Title */}
      <div className="flex items-center gap-2">
        <Stethoscope className="h-6 w-6 text-sky-600" />
        <h2 className="text-xl font-bold text-slate-900">EDA y Evaluación de Deshidratación (OMS)</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Clinical Signs Checklist */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-base mb-2">Evaluación de Signos Clínicos</h3>

            {/* Condition / State */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2">Estado General / Conciencia</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'alert', label: 'Alerta / Normal' },
                  { id: 'irritable', label: 'Inquieto / Irritable' },
                  { id: 'lethargic', label: 'Letárgico / Inconsciente' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setCondition(opt.id as any)}
                    className={`px-3 py-2.5 text-xs font-semibold border rounded-xl transition-all cursor-pointer ${
                      condition === opt.id
                        ? 'bg-sky-50 border-sky-300 text-sky-900 font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Eyes */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2">Ojos</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'normal', label: 'Normales' },
                  { id: 'sunken', label: 'Hundidos' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setEyes(opt.id as any)}
                    className={`px-3 py-2.5 text-xs font-semibold border rounded-xl transition-all cursor-pointer ${
                      eyes === opt.id
                        ? 'bg-sky-50 border-sky-300 text-sky-900 font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Thirst */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2">Sed / Capacidad de Beber</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'normal', label: 'Bebe Normal' },
                  { id: 'thirsty', label: 'Bebe con Avidez' },
                  { id: 'unable_to_drink', label: 'No Puede Beber' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setThirst(opt.id as any)}
                    className={`px-3 py-2.5 text-xs font-semibold border rounded-xl transition-all cursor-pointer ${
                      thirst === opt.id
                        ? 'bg-sky-50 border-sky-300 text-sky-900 font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Skin Pinch */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-2">Signo del Pliegue Cutáneo</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'immediate', label: 'Inmediato' },
                  { id: 'slow', label: 'Lento' },
                  { id: 'very_slow', label: 'Muy Lento (>2s)' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSkinPinch(opt.id as any)}
                    className={`px-3 py-2.5 text-xs font-semibold border rounded-xl transition-all cursor-pointer ${
                      skinPinch === opt.id
                        ? 'bg-sky-50 border-sky-300 text-sky-900 font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Assessment & WHO Plan */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-800 text-base">Diagnóstico y Plan de Hidratación</h3>

            {/* Automatic Severity Display */}
            <div className="flex justify-between items-center bg-slate-50 border border-slate-200 rounded-xl p-4">
              <span className="text-xs font-bold text-slate-500 uppercase">Estado de Deshidratación:</span>
              <span className={`text-xs font-bold border px-3 py-1.5 rounded-full ${getSeverityLabel(severity).style}`}>
                {getSeverityLabel(severity).text}
              </span>
            </div>

            {/* Recommended Plan Highlight */}
            <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 rounded-2xl p-5">
              <div className={`text-white text-3xl font-extrabold h-16 w-16 rounded-2xl flex items-center justify-center shadow-lg shrink-0 ${getPlanColor(hydration.recommendedPlan)}`}>
                Plan {hydration.recommendedPlan}
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Plan Recomendado por la OMS</span>
                <span className="text-base font-bold text-slate-800">
                  {hydration.recommendedPlan === 'A' && 'Tratamiento en el Hogar'}
                  {hydration.recommendedPlan === 'B' && 'Rehidratación Oral en Clínica'}
                  {hydration.recommendedPlan === 'C' && 'Rehidratación Intravenosa Rápida'}
                </span>
              </div>
            </div>

            {/* Detailed Instructions */}
            <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 space-y-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Instrucciones Clínicas Detalladas</span>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {hydration.planDetails}
              </p>

              {/* Volume and Rates Breakdown if applicable */}
              {hydration.fluidVolumeMl && (
                <div className="border-t border-dashed border-slate-200 pt-3 mt-2 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">Volumen Total Requerido:</span>
                    <span className="font-mono font-bold text-slate-900">{hydration.fluidVolumeMl} mL</span>
                  </div>
                  {hydration.hourlyRates && (
                    <div className="space-y-1 bg-white p-2.5 rounded-lg border border-slate-100">
                      {hydration.hourlyRates.phase1RateMlh && (
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500">Fase 1 ({hydration.hourlyRates.phase1DurationH}h):</span>
                          <span className="font-mono font-semibold text-slate-800">{hydration.hourlyRates.phase1RateMlh} mL/h</span>
                        </div>
                      )}
                      {hydration.hourlyRates.phase2RateMlh && (
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500">Fase 2 ({hydration.hourlyRates.phase2DurationH}h):</span>
                          <span className="font-mono font-semibold text-slate-800">{hydration.hourlyRates.phase2RateMlh} mL/h</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {severity === 'severe' && (
              <ClinicalAlert
                type="critical"
                title="Alerta de Emergencia Médica"
                message="Deshidratación grave detectada. Inicie rehidratación intravenosa inmediata (Plan C). Si no hay acceso IV disponible, coloque sonda nasogástrica para SRO mientras se canaliza o se traslada al paciente."
              />
            )}
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
          disabled={isSaving}
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
