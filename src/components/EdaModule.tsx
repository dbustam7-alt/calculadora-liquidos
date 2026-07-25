'use client';

import React, { useState, useEffect } from 'react';
import { usePatient } from '@/context/PatientContext';
import { assessDehydration, calculateEdaHydration, EdaAssessment, DehydrationSeverity } from '@/lib/formulas';
import { Stethoscope, Info, Save, CheckCircle2, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import ClinicalAlert from './ClinicalAlert';

export default function EdaModule() {
  const { weightKg, ageMonths, saveCurrentConsultation } = usePatient();

  // Mode: 'direct' (direct Plan selection) or 'assistant' (WHO clinical signs checklist)
  const [mode, setMode] = useState<'direct' | 'assistant'>('direct');

  // Direct Plan selection
  const [selectedPlan, setSelectedPlan] = useState<'A' | 'B' | 'C'>('A');

  // Assistant clinical signs state
  const [condition, setCondition] = useState<'alert' | 'irritable' | 'lethargic'>('alert');
  const [eyes, setEyes] = useState<'normal' | 'sunken'>('normal');
  const [thirst, setThirst] = useState<'normal' | 'thirsty' | 'unable_to_drink'>('normal');
  const [skinPinch, setSkinPinch] = useState<'immediate' | 'slow' | 'very_slow'>('immediate');

  // Results
  const [severity, setSeverity] = useState<DehydrationSeverity>('none');
  const [hydration, setHydration] = useState(calculateEdaHydration(weightKg, ageMonths, 'none'));

  // Show/Hide WHO reference guide
  const [showWhoGuide, setShowWhoGuide] = useState<boolean>(false);

  // Saving state
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Sync severity and hydration based on selected mode
  useEffect(() => {
    if (mode === 'direct') {
      const sevMap: Record<'A' | 'B' | 'C', DehydrationSeverity> = {
        A: 'none',
        B: 'some',
        C: 'severe',
      };
      const currentSev = sevMap[selectedPlan];
      setSeverity(currentSev);
      setHydration(calculateEdaHydration(weightKg, ageMonths, currentSev));
    } else {
      const currentAssessment: EdaAssessment = { condition, eyes, thirst, skinPinch };
      const calculatedSeverity = assessDehydration(currentAssessment);
      setSeverity(calculatedSeverity);
      setHydration(calculateEdaHydration(weightKg, ageMonths, calculatedSeverity));

      // Sync the plan selector tab
      const planMap: Record<DehydrationSeverity, 'A' | 'B' | 'C'> = {
        none: 'A',
        some: 'B',
        severe: 'C',
      };
      setSelectedPlan(planMap[calculatedSeverity]);
    }
  }, [weightKg, ageMonths, mode, selectedPlan, condition, eyes, thirst, skinPinch]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    const details = {
      method: 'Enfermedad Diarreica Aguda (EDA) - OMS',
      mode,
      assessment: mode === 'assistant' ? { condition, eyes, thirst, skinPinch } : null,
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

  const getPlanStyle = (plan: 'A' | 'B' | 'C', active: boolean) => {
    const styles = {
      A: active 
        ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-100' 
        : 'bg-white text-emerald-700 border-slate-200 hover:bg-emerald-50/50',
      B: active 
        ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-100' 
        : 'bg-white text-amber-700 border-slate-200 hover:bg-amber-50/50',
      C: active 
        ? 'bg-rose-600 text-white border-rose-600 shadow-lg shadow-rose-100 animate-pulse-subtle' 
        : 'bg-white text-rose-700 border-slate-200 hover:bg-rose-50/50',
    };
    return styles[plan];
  };

  return (
    <div className="space-y-6">
      {/* Module Title */}
      <div className="flex items-center gap-2">
        <Stethoscope className="h-6 w-6 text-sky-600" />
        <h2 className="text-xl font-bold text-slate-900">Planes de Rehidratación (EDA / OMS)</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Plan Selector & Optional Assistant */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            {/* Mode / Selector Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-bold text-slate-800 text-base">Selección de Plan</h3>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setMode('direct')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    mode === 'direct' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Directo
                </button>
                <button
                  onClick={() => setMode('assistant')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    mode === 'assistant' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Evaluación OMS
                </button>
              </div>
            </div>

            {mode === 'direct' ? (
              /* Direct Mode: Big Buttons for Plans */
              <div className="space-y-4">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Seleccione el Plan de Hidratación directamente según su diagnóstico clínico:
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {(['A', 'B', 'C'] as const).map((plan) => (
                    <button
                      key={plan}
                      onClick={() => setSelectedPlan(plan)}
                      className={`flex flex-col items-center justify-center py-4 border rounded-2xl transition-all cursor-pointer font-bold ${getPlanStyle(plan, selectedPlan === plan)}`}
                    >
                      <span className="text-2xl font-extrabold">Plan {plan}</span>
                      <span className="text-[10px] font-semibold uppercase mt-1">
                        {plan === 'A' && 'Sin Desh.'}
                        {plan === 'B' && 'Moderada'}
                        {plan === 'C' && 'Grave'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Assistant Mode: WHO Clinical Signs Checklist */
              <div className="space-y-4">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Marque los signos clínicos del paciente. El sistema calculará automáticamente la gravedad y el plan correspondiente según las guías de la OMS:
                </p>

                {/* Condition / State */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Estado General / Conciencia</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'alert', label: 'Alerta / Normal' },
                      { id: 'irritable', label: 'Inquieto / Irritable' },
                      { id: 'lethargic', label: 'Letárgico / Inconsciente' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setCondition(opt.id as any)}
                        className={`px-3 py-2 text-xs font-semibold border rounded-xl transition-all cursor-pointer ${
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
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Ojos</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'normal', label: 'Normales' },
                      { id: 'sunken', label: 'Hundidos' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setEyes(opt.id as any)}
                        className={`px-3 py-2 text-xs font-semibold border rounded-xl transition-all cursor-pointer ${
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
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Sed / Capacidad de Beber</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'normal', label: 'Bebe Normal' },
                      { id: 'thirsty', label: 'Bebe con Avidez' },
                      { id: 'unable_to_drink', label: 'No Puede Beber' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setThirst(opt.id as any)}
                        className={`px-3 py-2 text-xs font-semibold border rounded-xl transition-all cursor-pointer ${
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
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Signo del Pliegue Cutáneo</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'immediate', label: 'Inmediato' },
                      { id: 'slow', label: 'Lento' },
                      { id: 'very_slow', label: 'Muy Lento (>2s)' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setSkinPinch(opt.id as any)}
                        className={`px-3 py-2 text-xs font-semibold border rounded-xl transition-all cursor-pointer ${
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
            )}
          </div>

          {/* WHO Reference Guide Accordion */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <button
              onClick={() => setShowWhoGuide(!showWhoGuide)}
              className="w-full flex items-center justify-between p-4 font-bold text-slate-700 text-xs uppercase tracking-wider cursor-pointer hover:bg-slate-50 transition-all"
            >
              <span className="flex items-center gap-2">
                <Info className="h-4 w-4 text-sky-600" />
                Guía de Referencia OMS (Criterios)
              </span>
              {showWhoGuide ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {showWhoGuide && (
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-600 space-y-3 leading-relaxed">
                <div>
                  <span className="font-bold text-rose-600">Deshidratación Grave (Plan C):</span> Requiere al menos 2 signos, incluyendo al menos 1 signo clave (letárgico/inconsciente, no puede beber/bebe mal, o pliegue cutáneo muy lento).
                </div>
                <div>
                  <span className="font-bold text-amber-500">Alguna Deshidratación (Plan B):</span> Requiere al menos 2 signos, incluyendo al menos 1 signo clave (inquieto/irritable, bebe con avidez/sediento, o pliegue cutáneo lento).
                </div>
                <div>
                  <span className="font-bold text-emerald-600">Sin Deshidratación (Plan A):</span> No cumple con criterios suficientes para Plan B o C. Tratamiento en el hogar.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Calculations & Clinical Instructions */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-800 text-base">Plan de Hidratación Calculado</h3>

            {/* Plan Badge Highlight */}
            <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 rounded-2xl p-5">
              <div className={`text-white text-3xl font-extrabold h-16 w-16 rounded-2xl flex items-center justify-center shadow-lg shrink-0 ${
                hydration.recommendedPlan === 'A' ? 'bg-emerald-600 shadow-emerald-100' :
                hydration.recommendedPlan === 'B' ? 'bg-amber-500 shadow-amber-100' :
                'bg-rose-600 shadow-rose-100 animate-pulse-subtle'
              }`}>
                Plan {hydration.recommendedPlan}
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Plan de Manejo Clínico</span>
                <span className="text-base font-bold text-slate-800">
                  {hydration.recommendedPlan === 'A' && 'Tratamiento en el Hogar'}
                  {hydration.recommendedPlan === 'B' && 'Rehidratación Oral (SRO)'}
                  {hydration.recommendedPlan === 'C' && 'Rehidratación Intravenosa Rápida'}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  {hydration.recommendedPlan === 'A' && 'Sin signos suficientes de deshidratación.'}
                  {hydration.recommendedPlan === 'B' && 'Deshidratación moderada detectada.'}
                  {hydration.recommendedPlan === 'C' && 'Deshidratación grave. ¡Emergencia médica!'}
                </span>
              </div>
            </div>

            {/* Detailed Clinical Instructions */}
            <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 space-y-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Instrucciones de Administración</span>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {hydration.planDetails}
              </p>

              {/* Volume and Rates Breakdown if applicable */}
              {hydration.fluidVolumeMl && (
                <div className="border-t border-dashed border-slate-200 pt-3 mt-2 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">Volumen Total Requerido:</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">{hydration.fluidVolumeMl} mL</span>
                  </div>
                  {hydration.hourlyRates && (
                    <div className="space-y-2 bg-white p-3 rounded-xl border border-slate-100">
                      {hydration.hourlyRates.phase1RateMlh && (
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-semibold">
                            Fase 1 ({hydration.hourlyRates.phase1DurationH === 0.5 ? '30 min' : `${hydration.hourlyRates.phase1DurationH}h`}):
                          </span>
                          <span className="font-mono font-bold text-sky-700">{hydration.hourlyRates.phase1RateMlh} mL/h</span>
                        </div>
                      )}
                      {hydration.hourlyRates.phase2RateMlh && (
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-semibold">Fase 2 ({hydration.hourlyRates.phase2DurationH}h):</span>
                          <span className="font-mono font-bold text-sky-700">{hydration.hourlyRates.phase2RateMlh} mL/h</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {hydration.recommendedPlan === 'C' && (
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
