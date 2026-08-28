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

  const renderInteractiveBody = () => {
    const getPartStyle = (part: string) => {
      const isSelected = selectedParts[part];
      return {
        fill: isSelected
          ? 'rgba(239, 68, 68, 0.45)'
          : 'rgba(148, 163, 184, 0.15)',
        stroke: isSelected
          ? 'rgb(239, 68, 68)'
          : 'rgb(148, 163, 184)',
        strokeWidth: isSelected ? '2' : '1.2',
        transition: 'all 0.2s ease-in-out',
      };
    };

    return (
      <div className="flex flex-col sm:flex-row gap-6 justify-center items-center bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80">
        {/* Anterior View */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-2">Vista Anterior (Frente)</span>
          <div className="relative bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <svg viewBox="0 0 120 240" className="w-32 h-64 select-none">
              {/* Head */}
              <circle
                cx="60"
                cy="28"
                r="18"
                onClick={() => togglePart('head')}
                style={getPartStyle('head')}
                className="cursor-pointer hover:opacity-80"
              />
              <text x="60" y="31" textAnchor="middle" className="text-[8px] font-bold fill-slate-500 dark:fill-slate-400 pointer-events-none">C</text>

              {/* Neck */}
              <rect
                x="54"
                y="46"
                width="12"
                height="8"
                rx="1"
                onClick={() => togglePart('neck')}
                style={getPartStyle('neck')}
                className="cursor-pointer hover:opacity-80"
              />

              {/* Trunk Anterior */}
              <rect
                x="36"
                y="54"
                width="48"
                height="75"
                rx="4"
                onClick={() => togglePart('antTrunk')}
                style={getPartStyle('antTrunk')}
                className="cursor-pointer hover:opacity-80"
              />
              <text x="60" y="94" textAnchor="middle" className="text-[9px] font-bold fill-slate-500 dark:fill-slate-400 pointer-events-none">Tronco Ant.</text>

              {/* Genitalia */}
              <polygon
                points="52,129 68,129 60,139"
                onClick={() => togglePart('genitalia')}
                style={getPartStyle('genitalia')}
                className="cursor-pointer hover:opacity-80"
              />

              {/* Right Upper Arm */}
              <rect
                x="16"
                y="54"
                width="16"
                height="36"
                rx="3"
                onClick={() => togglePart('rUpperArm')}
                style={getPartStyle('rUpperArm')}
                className="cursor-pointer hover:opacity-80"
              />

              {/* Left Upper Arm */}
              <rect
                x="88"
                y="54"
                width="16"
                height="36"
                rx="3"
                onClick={() => togglePart('lUpperArm')}
                style={getPartStyle('lUpperArm')}
                className="cursor-pointer hover:opacity-80"
              />

              {/* Right Lower Arm */}
              <rect
                x="12"
                y="92"
                width="14"
                height="32"
                rx="2"
                onClick={() => togglePart('rLowerArm')}
                style={getPartStyle('rLowerArm')}
                className="cursor-pointer hover:opacity-80"
              />

              {/* Left Lower Arm */}
              <rect
                x="94"
                y="92"
                width="14"
                height="32"
                rx="2"
                onClick={() => togglePart('lLowerArm')}
                style={getPartStyle('lLowerArm')}
                className="cursor-pointer hover:opacity-80"
              />

              {/* Right Hand */}
              <circle
                cx="19"
                cy="130"
                r="7"
                onClick={() => togglePart('rHand')}
                style={getPartStyle('rHand')}
                className="cursor-pointer hover:opacity-80"
              />

              {/* Left Hand */}
              <circle
                cx="101"
                cy="130"
                r="7"
                onClick={() => togglePart('lHand')}
                style={getPartStyle('lHand')}
                className="cursor-pointer hover:opacity-80"
              />

              {/* Right Thigh */}
              <rect
                x="37"
                y="131"
                width="21"
                height="46"
                rx="3"
                onClick={() => togglePart('rThigh')}
                style={getPartStyle('rThigh')}
                className="cursor-pointer hover:opacity-80"
              />

              {/* Left Thigh */}
              <rect
                x="62"
                y="131"
                width="21"
                height="46"
                rx="3"
                onClick={() => togglePart('lThigh')}
                style={getPartStyle('lThigh')}
                className="cursor-pointer hover:opacity-80"
              />

              {/* Right Leg */}
              <rect
                x="40"
                y="179"
                width="16"
                height="42"
                rx="2"
                onClick={() => togglePart('rLeg')}
                style={getPartStyle('rLeg')}
                className="cursor-pointer hover:opacity-80"
              />

              {/* Left Leg */}
              <rect
                x="64"
                y="179"
                width="16"
                height="42"
                rx="2"
                onClick={() => togglePart('lLeg')}
                style={getPartStyle('lLeg')}
                className="cursor-pointer hover:opacity-80"
              />

              {/* Right Foot */}
              <rect
                x="32"
                y="223"
                width="24"
                height="10"
                rx="1"
                onClick={() => togglePart('rFoot')}
                style={getPartStyle('rFoot')}
                className="cursor-pointer hover:opacity-80"
              />

              {/* Left Foot */}
              <rect
                x="64"
                y="223"
                width="24"
                height="10"
                rx="1"
                onClick={() => togglePart('lFoot')}
                style={getPartStyle('lFoot')}
                className="cursor-pointer hover:opacity-80"
              />
            </svg>
          </div>
        </div>

        {/* Posterior View */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-2">Vista Posterior (Espalda)</span>
          <div className="relative bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <svg viewBox="0 0 120 240" className="w-32 h-64 select-none">
              {/* Head */}
              <circle
                cx="60"
                cy="28"
                r="18"
                onClick={() => togglePart('head')}
                style={getPartStyle('head')}
                className="cursor-pointer hover:opacity-80"
              />
              <text x="60" y="31" textAnchor="middle" className="text-[8px] font-bold fill-slate-500 dark:fill-slate-400 pointer-events-none">C</text>

              {/* Neck */}
              <rect
                x="54"
                y="46"
                width="12"
                height="8"
                rx="1"
                onClick={() => togglePart('neck')}
                style={getPartStyle('neck')}
                className="cursor-pointer hover:opacity-80"
              />

              {/* Trunk Posterior */}
              <rect
                x="36"
                y="54"
                width="48"
                height="75"
                rx="4"
                onClick={() => togglePart('postTrunk')}
                style={getPartStyle('postTrunk')}
                className="cursor-pointer hover:opacity-80"
              />
              <text x="60" y="94" textAnchor="middle" className="text-[9px] font-bold fill-slate-500 dark:fill-slate-400 pointer-events-none">Tronco Post.</text>

              {/* Right Buttock */}
              <rect
                x="36"
                y="131"
                width="24"
                height="18"
                rx="3"
                onClick={() => togglePart('rButtock')}
                style={getPartStyle('rButtock')}
                className="cursor-pointer hover:opacity-80"
              />

              {/* Left Buttock */}
              <rect
                x="60"
                y="131"
                width="24"
                height="18"
                rx="3"
                onClick={() => togglePart('lButtock')}
                style={getPartStyle('lButtock')}
                className="cursor-pointer hover:opacity-80"
              />

              {/* Right Upper Arm */}
              <rect
                x="16"
                y="54"
                width="16"
                height="36"
                rx="3"
                onClick={() => togglePart('rUpperArm')}
                style={getPartStyle('rUpperArm')}
                className="cursor-pointer hover:opacity-80"
              />

              {/* Left Upper Arm */}
              <rect
                x="88"
                y="54"
                width="16"
                height="36"
                rx="3"
                onClick={() => togglePart('lUpperArm')}
                style={getPartStyle('lUpperArm')}
                className="cursor-pointer hover:opacity-80"
              />

              {/* Right Lower Arm */}
              <rect
                x="12"
                y="92"
                width="14"
                height="32"
                rx="2"
                onClick={() => togglePart('rLowerArm')}
                style={getPartStyle('rLowerArm')}
                className="cursor-pointer hover:opacity-80"
              />

              {/* Left Lower Arm */}
              <rect
                x="94"
                y="92"
                width="14"
                height="32"
                rx="2"
                onClick={() => togglePart('lLowerArm')}
                style={getPartStyle('lLowerArm')}
                className="cursor-pointer hover:opacity-80"
              />

              {/* Right Hand */}
              <circle
                cx="19"
                cy="130"
                r="7"
                onClick={() => togglePart('rHand')}
                style={getPartStyle('rHand')}
                className="cursor-pointer hover:opacity-80"
              />

              {/* Left Hand */}
              <circle
                cx="101"
                cy="130"
                r="7"
                onClick={() => togglePart('lHand')}
                style={getPartStyle('lHand')}
                className="cursor-pointer hover:opacity-80"
              />

              {/* Right Thigh */}
              <rect
                x="37"
                y="151"
                width="21"
                height="28"
                rx="3"
                onClick={() => togglePart('rThigh')}
                style={getPartStyle('rThigh')}
                className="cursor-pointer hover:opacity-80"
              />

              {/* Left Thigh */}
              <rect
                x="62"
                y="151"
                width="21"
                height="28"
                rx="3"
                onClick={() => togglePart('lThigh')}
                style={getPartStyle('lThigh')}
                className="cursor-pointer hover:opacity-80"
              />

              {/* Right Leg */}
              <rect
                x="40"
                y="179"
                width="16"
                height="42"
                rx="2"
                onClick={() => togglePart('rLeg')}
                style={getPartStyle('rLeg')}
                className="cursor-pointer hover:opacity-80"
              />

              {/* Left Leg */}
              <rect
                x="64"
                y="179"
                width="16"
                height="42"
                rx="2"
                onClick={() => togglePart('lLeg')}
                style={getPartStyle('lLeg')}
                className="cursor-pointer hover:opacity-80"
              />

              {/* Right Foot */}
              <rect
                x="32"
                y="223"
                width="24"
                height="10"
                rx="1"
                onClick={() => togglePart('rFoot')}
                style={getPartStyle('rFoot')}
                className="cursor-pointer hover:opacity-80"
              />

              {/* Left Foot */}
              <rect
                x="64"
                y="223"
                width="24"
                height="10"
                rx="1"
                onClick={() => togglePart('lFoot')}
                style={getPartStyle('lFoot')}
                className="cursor-pointer hover:opacity-80"
              />
            </svg>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Module Title */}
      <div className="flex items-center gap-2">
        <Flame className="h-6 w-6 text-rose-600 dark:text-rose-500 animate-pulse-subtle" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Manejo de Quemaduras Pediátricas</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Burn Estimation & Configuration */}
        <div className="lg:col-span-7 space-y-6">
          {/* Configuration Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 transition-colors">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base border-b border-slate-100 dark:border-slate-800 pb-3">Configuración de Protocolo</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Formula Option */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-1.5">Fórmula de Cálculo</label>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    onClick={() => setFormula('Galveston')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      formula === 'Galveston' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Galveston
                  </button>
                  <button
                    onClick={() => setFormula('Parkland')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      formula === 'Parkland' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Parkland Modificado
                  </button>
                </div>
              </div>

              {/* Burn Type (Only shown if Parkland is selected) */}
              {formula === 'Parkland' && (
                <div className="animate-fade-in">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-1.5">Tipo de Quemadura</label>
                  <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    <button
                      onClick={() => setBurnType('thermal')}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        burnType === 'thermal' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Térmica
                    </button>
                    <button
                      onClick={() => setBurnType('inhalation')}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        burnType === 'inhalation' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors">
            {/* Mode Selector */}
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Estimación de Quemadura (% SCQ)</h3>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => setInputMode('direct')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    inputMode === 'direct' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Directo
                </button>
                <button
                  onClick={() => setInputMode('lund')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    inputMode === 'lund' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Lund-Browder
                </button>
              </div>
            </div>

            {inputMode === 'direct' ? (
              /* Direct Input Mode */
              <div className="space-y-4">
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Ingrese directamente el porcentaje estimado de Superficie Corporal Quemada (% SCQ).
                </p>
                <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800 max-w-xs">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">SCQ Total:</span>
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      step="0.5"
                      value={directScq}
                      onChange={(e) => setDirectScq(Math.max(1, Math.min(100, parseFloat(e.target.value) || 1)))}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-rose-500 dark:focus:border-rose-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-950 transition-all font-mono text-slate-900 dark:text-slate-100 text-center font-bold"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 dark:text-slate-500">%</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Lund-Browder Calculator Mode */
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100/50 dark:border-rose-900/30 rounded-xl p-3">
                  <span className="text-xs font-bold text-rose-700 dark:text-rose-300">Grupo de Edad Ajustado:</span>
                  <span className="text-xs font-bold bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-300 border border-rose-100 dark:border-rose-900 px-2.5 py-1 rounded-full">
                    {getAgeGroupLabel(ageGroup)}
                  </span>
                </div>

                {/* Palm Rule Helper */}
                <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">Regla de la Palma (1% SCQ)</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Cada palma del paciente equivale al 1% de su SC.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPalmCount(Math.max(0, palmCount - 1))}
                      className="p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-sm font-bold font-mono text-slate-800 dark:text-slate-100 w-6 text-center">{palmCount}</span>
                    <button
                      onClick={() => setPalmCount(palmCount + 1)}
                      className="p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Interactive Body Selector */}
                {renderInteractiveBody()}

                {/* Body Parts Grid */}
                <div>
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Segmentos Corporales (Lista)</h4>
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
                              ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 text-rose-900 dark:text-rose-200 font-semibold'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <span className="text-xs truncate mr-1">{bodyPartLabels[part]}</span>
                          <span className="text-xs font-mono text-slate-400 dark:text-slate-500 shrink-0">{val}%</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Calculated SCQ Display */}
                <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 rounded-xl p-4 flex justify-between items-center">
                  <span className="text-xs font-bold text-rose-700 dark:text-rose-300">SCQ Calculada Total:</span>
                  <span className="text-xl font-bold font-mono text-rose-700 dark:text-rose-300">
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
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-full transition-colors">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                  {formula === 'Galveston' ? 'Fórmula de Galveston' : 'Fórmula de Parkland Modificada'}
                </h3>
                <span className="bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border border-rose-100 dark:border-rose-900/50">
                  Resucitación 24h
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                {formula === 'Galveston'
                  ? 'Calcula líquidos basales y de resucitación combinados en base a la Superficie Corporal Total y Quemada.'
                  : 'Calcula líquidos de resucitación en base al peso y porcentaje de quemadura.'}
              </p>

              {/* Volume Output */}
              <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100/50 dark:border-rose-900/30 rounded-2xl p-5 text-center mb-6">
                <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 block mb-1">Volumen de Resucitación Total</span>
                <span className="text-3xl font-bold font-mono text-rose-700 dark:text-rose-300">
                  {results.totalVolumeMl} <span className="text-sm font-semibold">mL</span>
                </span>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2">
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
                <div className="border border-slate-100 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-800/20">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Primeras 8 Horas (50%)</span>
                    <span className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200">{results.firstEightHoursMl} mL</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                    <span>Tasa de Infusión:</span>
                    <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-sm">{results.firstEightHoursRateMlh} mL/h</span>
                  </div>
                </div>

                {/* Phase 2: Next 16 Hours */}
                <div className="border border-slate-100 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-800/20">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Siguientes 16 Horas (50%)</span>
                    <span className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200">{results.nextSixteenHoursMl} mL</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                    <span>Tasa de Infusión:</span>
                    <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-sm">{results.nextSixteenHoursRateMlh} mL/h</span>
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
          disabled={isSaving || results.totalVolumeMl === 0}
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
