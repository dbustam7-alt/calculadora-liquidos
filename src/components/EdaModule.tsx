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

  // Plan C Subtype selection
  const [planCSubtype, setPlanCSubtype] = useState<'deshidratacion_grave' | 'shock_hipovolemico'>('deshidratacion_grave');

  // Assistant clinical signs state
  const [condition, setCondition] = useState<'alert' | 'irritable' | 'lethargic'>('alert');
  const [eyes, setEyes] = useState<'normal' | 'sunken'>('normal');
  const [thirst, setThirst] = useState<'normal' | 'thirsty' | 'unable_to_drink'>('normal');
  const [skinPinch, setSkinPinch] = useState<'immediate' | 'slow' | 'very_slow'>('immediate');

  // Results
  const [severity, setSeverity] = useState<DehydrationSeverity>('none');
  const [hydration, setHydration] = useState(calculateEdaHydration(weightKg, ageMonths, 'none', planCSubtype));

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
      setHydration(calculateEdaHydration(weightKg, ageMonths, currentSev, planCSubtype));
    } else {
      const currentAssessment: EdaAssessment = { condition, eyes, thirst, skinPinch };
      const calculatedSeverity = assessDehydration(currentAssessment);
      setSeverity(calculatedSeverity);
      setHydration(calculateEdaHydration(weightKg, ageMonths, calculatedSeverity, planCSubtype));

      // Sync the plan selector tab
      const planMap: Record<DehydrationSeverity, 'A' | 'B' | 'C'> = {
        none: 'A',
        some: 'B',
        severe: 'C',
      };
      setSelectedPlan(planMap[calculatedSeverity]);
    }
  }, [weightKg, ageMonths, mode, selectedPlan, condition, eyes, thirst, skinPinch, planCSubtype]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    const details = {
      method: 'Enfermedad Diarreica Aguda (EDA) - OMS',
      mode,
      planCSubtype: selectedPlan === 'C' ? planCSubtype : null,
      assessment: mode === 'assistant' ? { condition, eyes, thirst, skinPinch } : null,
      results: {
        severity,
        recommendedPlan: hydration.recommendedPlan,
        planDetails: hydration.planDetails,
        fluidVolumeMl: hydration.fluidVolumeMl,
        hourlyRates: hydration.hourlyRates,
        zincDoseMg: hydration.zincDoseMg,
        boloVolumeMlMin: hydration.boloVolumeMlMin,
        boloVolumeMlMax: hydration.boloVolumeMlMax,
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
        ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg dark:shadow-none' 
        : 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 border-slate-200 dark:border-slate-800 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20',
      B: active 
        ? 'bg-amber-500 text-white border-amber-500 shadow-lg dark:shadow-none' 
        : 'bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-400 border-slate-200 dark:border-slate-800 hover:bg-amber-50/50 dark:hover:bg-amber-950/20',
      C: active 
        ? 'bg-rose-600 text-white border-rose-600 shadow-lg dark:shadow-none animate-pulse-subtle' 
        : 'bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-400 border-slate-200 dark:border-slate-800 hover:bg-rose-50/50 dark:hover:bg-rose-950/20',
    };
    return styles[plan];
  };

  return (
    <div className="space-y-6">
      {/* Module Title */}
      <div className="flex items-center gap-2">
        <Stethoscope className="h-6 w-6 text-sky-600 dark:text-sky-500" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Planes de Rehidratación (EDA / OMS)</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Plan Selector & Optional Assistant */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6 transition-colors">
            {/* Mode / Selector Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Selección de Plan</h3>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => setMode('direct')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    mode === 'direct' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Directo
                </button>
                <button
                  onClick={() => setMode('assistant')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    mode === 'assistant' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Evaluación OMS
                </button>
              </div>
            </div>

            {mode === 'direct' ? (
              /* Direct Mode: Big Buttons for Plans */
              <div className="space-y-4">
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
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
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Marque los signos clínicos del paciente. El sistema calculará automáticamente la gravedad y el plan correspondiente según las guías de la OMS:
                </p>

                {/* Condition / State */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-1.5">Estado General / Conciencia</label>
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
                            ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-800 text-sky-900 dark:text-sky-200 font-bold'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Eyes */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-1.5">Ojos</label>
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
                            ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-800 text-sky-900 dark:text-sky-200 font-bold'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Thirst */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-1.5">Sed / Capacidad de Beber</label>
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
                            ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-800 text-sky-900 dark:text-sky-200 font-bold'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Skin Pinch */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-1.5">Signo del Pliegue Cutáneo</label>
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
                            ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-800 text-sky-900 dark:text-sky-200 font-bold'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Plan C Subtype Selection (Only shown if Plan C is active) */}
            {selectedPlan === 'C' && (
              <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-2xl p-4 space-y-3 animate-fade-in">
                <label className="block text-[10px] uppercase font-bold text-rose-800 dark:text-rose-300">Subtipo de Plan C</label>
                <div className="flex bg-rose-100/30 dark:bg-rose-950/40 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setPlanCSubtype('deshidratacion_grave')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      planCSubtype === 'deshidratacion_grave' ? 'bg-white dark:bg-slate-900 text-rose-900 dark:text-white shadow-sm' : 'text-rose-600 dark:text-rose-400 hover:text-rose-900 dark:hover:text-white'
                    }`}
                  >
                    Deshidratación Grave
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlanCSubtype('shock_hipovolemico')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      planCSubtype === 'shock_hipovolemico' ? 'bg-white dark:bg-slate-900 text-rose-900 dark:text-white shadow-sm' : 'text-rose-600 dark:text-rose-400 hover:text-rose-900 dark:hover:text-white'
                    }`}
                  >
                    Shock Hipovolémico
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* WHO Reference Guide Accordion */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-colors">
            <button
              onClick={() => setShowWhoGuide(!showWhoGuide)}
              className="w-full flex items-center justify-between p-4 font-bold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              <span className="flex items-center gap-2">
                <Info className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                Guía de Referencia OMS (Criterios)
              </span>
              {showWhoGuide ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {showWhoGuide && (
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 text-xs text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed">
                <div>
                  <span className="font-bold text-rose-600 dark:text-rose-400">Deshidratación Grave (Plan C):</span> Requiere al menos 2 signos, incluyendo al menos 1 signo clave (letárgico/inconsciente, no puede beber/bebe mal, o pliegue cutáneo muy lento).
                </div>
                <div>
                  <span className="font-bold text-amber-500 dark:text-amber-400">Alguna Deshidratación (Plan B):</span> Requiere al menos 2 signos, incluyendo al menos 1 signo clave (inquieto/irritable, bebe con avidez/sediento, o pliegue cutáneo lento).
                </div>
                <div>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Sin Deshidratación (Plan A):</span> No cumple con criterios suficientes para Plan B o C. Tratamiento en el hogar.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Calculations & Clinical Instructions */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6 transition-colors">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Plan de Hidratación Calculado</h3>

            {/* Plan Badge Highlight */}
            <div className={`border rounded-2xl p-5 ${
              hydration.recommendedPlan === 'A' ? 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/40' :
              hydration.recommendedPlan === 'B' ? 'bg-amber-50/50 dark:bg-amber-950/10 border-amber-100 dark:border-amber-900/40' :
              'bg-rose-50/50 dark:bg-rose-950/10 border-rose-100 dark:border-rose-900/40'
            }`}>
              <div>
                <span className={`text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-full ${
                  hydration.recommendedPlan === 'A' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' :
                  hydration.recommendedPlan === 'B' ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300' :
                  'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                }`}>
                  Plan {hydration.recommendedPlan}
                </span>
                <h4 className="text-base font-bold mt-2.5 text-slate-900 dark:text-white">
                  {hydration.recommendedPlan === 'A' && 'Tratamiento en el Hogar'}
                  {hydration.recommendedPlan === 'B' && 'Rehidratación Oral (SRO)'}
                  {hydration.recommendedPlan === 'C' && (planCSubtype === 'shock_hipovolemico' ? 'Shock Hipovolémico' : 'Rehidratación Intravenosa Rápida')}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {hydration.recommendedPlan === 'A' && 'Sin signos suficientes de deshidratación.'}
                  {hydration.recommendedPlan === 'B' && 'Deshidratación moderada detectada.'}
                  {hydration.recommendedPlan === 'C' && (planCSubtype === 'shock_hipovolemico' ? '¡EMERGENCIA! Shock hipovolémico detectado.' : 'Deshidratación grave. ¡Emergencia médica!')}
                </p>
              </div>
            </div>

            {/* Detailed Clinical Instructions */}
            <div className="bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 rounded-xl p-4 space-y-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Instrucciones de Administración</span>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {hydration.planDetails}
              </p>

              {/* Volume and Rates Breakdown if applicable */}
              {hydration.fluidVolumeMl && (
                <div className="border-t border-dashed border-slate-200 dark:border-slate-800 pt-3 mt-2 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Volumen de Rehidratación Total:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">{hydration.fluidVolumeMl} mL</span>
                  </div>
                  {hydration.hourlyRates && (
                    <div className="space-y-2 bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      {hydration.hourlyRates.phase1RateMlh && (
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 dark:text-slate-400 font-semibold">
                            Fase 1 ({hydration.hourlyRates.phase1DurationH === 0.5 ? '30 min' : `${hydration.hourlyRates.phase1DurationH}h`}):
                          </span>
                          <span className="font-mono font-bold text-sky-700 dark:text-sky-300">{hydration.hourlyRates.phase1RateMlh} mL/h</span>
                        </div>
                      )}
                      {hydration.hourlyRates.phase2RateMlh && (
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 dark:text-slate-400 font-semibold">Fase 2 ({hydration.hourlyRates.phase2DurationH}h):</span>
                          <span className="font-mono font-bold text-sky-700 dark:text-sky-300">{hydration.hourlyRates.phase2RateMlh} mL/h</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Emergency Alert for Plan C */}
            {hydration.recommendedPlan === 'C' && (
              <ClinicalAlert
                type="critical"
                title="Alerta de Emergencia Médica"
                message={
                  planCSubtype === 'shock_hipovolemico'
                    ? `Shock hipovolémico detectado. Administrar de inmediato un bolo de expansión de Ringer Lactato de ${weightKg * 20} a ${weightKg * 30} mL (20-30 mL/kg) y reevaluar pulso y estado de conciencia. Luego continuar con el esquema de infusión rápida.`
                    : 'Deshidratación grave detectada. Inicie rehidratación intravenosa rápida (Plan C) de inmediato. Si no hay acceso IV disponible, coloque sonda nasogástrica para SRO mientras se canaliza o se traslada al paciente.'
                }
              />
            )}
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
          disabled={isSaving}
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
