'use client';

import React, { useState, useEffect } from 'react';
import { usePatient } from '@/context/PatientContext';
import { getAgeGroup, calculateBurns, LUND_BROWDER_CHART, AgeGroup } from '@/lib/formulas';
import { Flame, Info, Save, CheckCircle2, Plus, Minus } from 'lucide-react';
import ClinicalAlert from './ClinicalAlert';

export default function BurnsModule() {
  const { weightKg, ageMonths, saveCurrentConsultation } = usePatient();

  // Mode: 'direct' (direct % TBSA) or 'lund' (Lund-Browder calculator)
  const [inputMode, setInputMode] = useState<'direct' | 'lund'>('direct');

  // Formula: 'Galveston' or 'Parkland' (Parkland Modificado)
  const [formula, setFormula] = useState<'Galveston' | 'Parkland'>('Galveston');

  // Burn Type: 'thermal' or 'inhalation'
  const [burnType, setBurnType] = useState<'thermal' | 'inhalation'>('thermal');

  // Direct %SCQ input
  const [directScq, setDirectScq] = useState<number>(10);

  // Palm Rule helper counter
  const [palmCount, setPalmCount] = useState<number>(0);

  // Lund-Browder selection state (boolean for each body part)
  const [selectedParts, setSelectedParts] = useState<Record<string, boolean>>({
    head: false, neck: false, antTrunk: false, postTrunk: false,
    rButtock: false, lButtock: false, genitalia: false,
    rUpperArm: false, lUpperArm: false, rLowerArm: false, lLowerArm: false,
    rHand: false, lHand: false, rThigh: false, lThigh: false,
    rLeg: false, lLeg: false, rFoot: false, lFoot: false
  });

  // Calculate age group
  const ageGroup = getAgeGroup(ageMonths);
  const lundValues = LUND_BROWDER_CHART[ageGroup];

  // Calculate %SCQ based on selection
  const [calculatedScq, setCalculatedScq] = useState<number>(0);

  useEffect(() => {
    let sum = 0;
    Object.keys(selectedParts).forEach((part) => {
      if (selectedParts[part]) {
        sum += lundValues[part as keyof typeof lundValues] || 0;
      }
    });
    // Add palm rule contribution
    sum += palmCount * 1;
    setCalculatedScq(parseFloat(sum.toFixed(1)));
  }, [selectedParts, lundValues, palmCount]);

  // Final %SCQ to use in calculations
  const finalScq = inputMode === 'direct' ? directScq : calculatedScq;

  // Calculate results
  const results = calculateBurns(weightKg, finalScq, formula, ageMonths, burnType);

  // Saving state
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    const details = {
      method: 'Quemaduras - ' + (formula === 'Galveston' ? 'Galveston' : 'Parkland Modificado'),
      formula,
      burnType: formula === 'Parkland' ? burnType : undefined,
      ageGroup,
      scqPercentage: finalScq,
      inputMode,
      palmCount: inputMode === 'lund' ? palmCount : 0,
      results: {
        totalVolumeMl: results.totalVolumeMl,
        firstEightHoursMl: results.firstEightHoursMl,
        firstEightHoursRateMlh: results.firstEightHoursRateMlh,
        nextSixteenHoursMl: results.nextSixteenHoursMl,
        nextSixteenHoursRateMlh: results.nextSixteenHoursRateMlh,
        sctM2: results.sctM2,
        scqM2: results.scqM2,
        maintenanceAddedMl: results.maintenanceAddedMl,
      },
    };

    const success = await saveCurrentConsultation('quemaduras', details);
    setIsSaving(false);
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const togglePart = (part: string) => {
    setSelectedParts((prev) => ({ ...prev, [part]: !prev[part] }));
  };

  const bodyPartLabels: Record<string, string> = {
    head: 'Cabeza', neck: 'Cuello', antTrunk: 'Tronco Anterior', postTrunk: 'Tronco Posterior',
    rButtock: 'Glúteo Der.', lButtock: 'Glúteo Izq.', genitalia: 'Genitales',
    rUpperArm: 'Brazo Sup. Der.', lUpperArm: 'Brazo Sup. Izq.',
    rLowerArm: 'Antebrazo Der.', lLowerArm: 'Antebrazo Izq.',
    rHand: 'Mano Der.', lHand: 'Mano Izq.',
    rThigh: 'Muslo Der.', lThigh: 'Muslo Izq.',
    rLeg: 'Pierna Der.', lLeg: 'Pierna Izq.',
    rFoot: 'Pie Der.', lFoot: 'Pie Izq.'
  };

  const getAgeGroupLabel = (group: AgeGroup) => {
    const labels: Record<AgeGroup, string> = {
      under_1: 'Lactante < 1 año',
      '1_4': 'Niño 1-4 años',
      '5_9': 'Niño 5-9 años',
      '10_14': 'Niño 10-14 años',
      '15': 'Adolescente 15 años',
      adult: 'Adulto >= 16 años'
    };
    return labels[group];
  };

  return (
    <div className="space-y-6">
      {/* Module Title */}
      <div className="flex items-center gap-2">
        <Flame className="h-6 w-6 text-rose-600 animate-pulse-subtle" />
        <h2 className="text-xl font-bold text-slate-900">Manejo de Quemaduras Pediátricas</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Burn Estimation & Configuration */}
        <div className="lg:col-span-7 space-y-6">
          {/* Configuration Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3">Configuración de Protocolo</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Formula Option */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Fórmula de Cálculo</label>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setFormula('Galveston')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      formula === 'Galveston' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Galveston
                  </button>
                  <button
                    onClick={() => setFormula('Parkland')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      formula === 'Parkland' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Parkland Modificado
                  </button>
                </div>
              </div>

              {/* Burn Type (Only shown if Parkland is selected) */}
              {formula === 'Parkland' && (
                <div className="animate-fade-in">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Tipo de Quemadura</label>
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button
                      onClick={() => setBurnType('thermal')}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        burnType === 'thermal' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Térmica
                    </button>
                    <button
                      onClick={() => setBurnType('inhalation')}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        burnType === 'inhalation' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Inhalación
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Estimation Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            {/* Mode Selector */}
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base">Estimación de Quemadura (% SCQ)</h3>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setInputMode('direct')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    inputMode === 'direct' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Directo
                </button>
                <button
                  onClick={() => setInputMode('lund')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    inputMode === 'lund' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Lund-Browder
                </button>
              </div>
            </div>

            {inputMode === 'direct' ? (
              /* Direct Input Mode */
              <div className="space-y-4">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Ingrese directamente el porcentaje estimado de Superficie Corporal Quemada (% SCQ).
                </p>
                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 max-w-xs">
                  <span className="text-xs font-bold text-slate-500 uppercase">SCQ Total:</span>
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      step="0.5"
                      value={directScq}
                      onChange={(e) => setDirectScq(Math.max(1, Math.min(100, parseFloat(e.target.value) || 1)))}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 focus:border-rose-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all font-mono text-slate-900 text-center font-bold"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Lund-Browder Calculator Mode */
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-rose-50/50 border border-rose-100/50 rounded-xl p-3">
                  <span className="text-xs font-bold text-rose-700">Grupo de Edad Ajustado:</span>
                  <span className="text-xs font-bold bg-white text-rose-700 border border-rose-100 px-2.5 py-1 rounded-full">
                    {getAgeGroupLabel(ageGroup)}
                  </span>
                </div>

                {/* Palm Rule Helper */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-700">Regla de la Palma (1% SCQ)</h4>
                    <p className="text-[10px] text-slate-500">Cada palma del paciente equivale al 1% de su SC.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPalmCount(Math.max(0, palmCount - 1))}
                      className="p-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-sm font-bold font-mono text-slate-800 w-6 text-center">{palmCount}</span>
                    <button
                      onClick={() => setPalmCount(palmCount + 1)}
                      className="p-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Body Parts Grid */}
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Segmentos Corporales</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Object.keys(bodyPartLabels).map((part) => {
                      const isSelected = selectedParts[part];
                      const val = lundValues[part as keyof typeof lundValues];
                      return (
                        <button
                          key={part}
                          onClick={() => togglePart(part)}
                          className={`flex items-center justify-between p-2.5 text-left border rounded-xl transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-rose-50 border-rose-200 text-rose-900 font-semibold'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="text-xs truncate mr-1">{bodyPartLabels[part]}</span>
                          <span className="text-xs font-mono text-slate-400 shrink-0">{val}%</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Calculated SCQ Display */}
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex justify-between items-center">
                  <span className="text-xs font-bold text-rose-700">SCQ Calculada Total:</span>
                  <span className="text-xl font-bold font-mono text-rose-700">
                    {calculatedScq}%
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Warning for high SCQ */}
          {finalScq > 30 && (
            <ClinicalAlert
              type="critical"
              title="Alerta de Gravedad Crítica"
              message="Quemadura extensa mayor al 30% de Superficie Corporal Quemada. Alto riesgo de shock hipovolémico, síndrome compartimental y falla multiorgánica. Requiere monitorización invasiva y traslado inmediato a Unidad de Quemados."
            />
          )}
        </div>

        {/* Right Column: Calculations */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 text-base">
                  {formula === 'Galveston' ? 'Fórmula de Galveston' : 'Fórmula de Parkland Modificada'}
                </h3>
                <span className="bg-rose-50 text-rose-700 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border border-rose-100">
                  Resucitación 24h
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                {formula === 'Galveston'
                  ? 'Calcula líquidos basales y de resucitación combinados en base a la Superficie Corporal Total y Quemada.'
                  : 'Calcula líquidos de resucitación en base al peso y porcentaje de quemadura.'}
              </p>

              {/* Volume Output */}
              <div className="bg-rose-50/50 border border-rose-100/50 rounded-2xl p-5 text-center mb-6">
                <span className="text-[10px] uppercase font-bold text-rose-600 block mb-1">Volumen de Resucitación Total</span>
                <span className="text-3xl font-bold font-mono text-rose-700">
                  {results.totalVolumeMl} <span className="text-sm font-semibold">mL</span>
                </span>
                <p className="text-[10px] text-slate-500 mt-2">
                  {formula === 'Galveston' ? (
                    <>
                      (5000 × {results.scqM2} m² SCQ) + (2000 × {results.sctM2} m² SCT)
                    </>
                  ) : (
                    <>
                      ({burnType === 'inhalation' ? '4' : '3'} mL × {weightKg} kg × {finalScq}%)
                      {results.maintenanceAddedMl && ` + ${results.maintenanceAddedMl} mL Mantenimiento`}
                    </>
                  )}
                </p>
              </div>

              {/* Phases Breakdown */}
              <div className="space-y-4 mb-6">
                {/* Phase 1: First 8 Hours */}
                <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-700">Primeras 8 Horas (50%)</span>
                    <span className="text-xs font-bold font-mono text-slate-800">{results.firstEightHoursMl} mL</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>Tasa de Infusión:</span>
                    <span className="font-mono font-bold text-rose-600 text-sm">{results.firstEightHoursRateMlh} mL/h</span>
                  </div>
                </div>

                {/* Phase 2: Next 16 Hours */}
                <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-700">Siguientes 16 Horas (50%)</span>
                    <span className="text-xs font-bold font-mono text-slate-800">{results.nextSixteenHoursMl} mL</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>Tasa de Infusión:</span>
                    <span className="font-mono font-bold text-rose-600 text-sm">{results.nextSixteenHoursRateMlh} mL/h</span>
                  </div>
                </div>
              </div>
            </div>

            <ClinicalAlert
              type="info"
              title="Observación General"
              message={
                formula === 'Galveston'
                  ? 'La fórmula de Galveston ya incluye los requerimientos de líquidos de mantenimiento dentro de su cálculo total.'
                  : 'En los casos donde se utilice la fórmula "Parkland Modificada" en menores de 14 años y menos de 30 kg, los requerimientos de mantenimiento se agregan automáticamente en el resultado.'
              }
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
          disabled={isSaving || results.totalVolumeMl === 0}
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
