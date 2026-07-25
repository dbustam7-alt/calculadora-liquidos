'use client';

import React, { useState, useEffect } from 'react';
import { usePatient } from '@/context/PatientContext';
import { User, Calendar, Weight, Ruler, Activity, Droplets, Flame, Syringe, Stethoscope, Clock } from 'lucide-react';
import ClinicalAlert from './ClinicalAlert';
import { clsx } from 'clsx';

export default function PatientHeader() {
  const {
    name,
    ageMonths,
    weightKg,
    heightCm,
    bsa,
    activeTab,
    setName,
    setAgeMonths,
    setWeightKg,
    setHeightCm,
    setActiveTab,
  } = usePatient();

  // Local state for age in years helper
  const [ageYears, setAgeYears] = useState<number>(1);

  // Update ageYears when ageMonths changes
  useEffect(() => {
    setAgeYears(parseFloat((ageMonths / 12).toFixed(1)));
  }, [ageMonths]);

  const handleAgeYearsChange = (years: number) => {
    setAgeYears(years);
    setAgeMonths(Math.round(years * 12));
  };

  const handleAgeMonthsChange = (months: number) => {
    setAgeMonths(months);
    setAgeYears(parseFloat((months / 12).toFixed(1)));
  };

  // Check for pediatric safety thresholds
  const isOverweightPediatric = weightKg > 80;
  const isOverAgePediatric = ageMonths > 216; // > 18 years

  const tabs = [
    { id: 'mantenimiento', label: 'Mantenimiento', icon: <Droplets className="h-4 w-4" /> },
    { id: 'quemaduras', label: 'Quemaduras', icon: <Flame className="h-4 w-4" /> },
    { id: 'cad', label: 'CAD / DKA', icon: <Syringe className="h-4 w-4" /> },
    { id: 'eda', label: 'EDA / OMS', icon: <Stethoscope className="h-4 w-4" /> },
    { id: 'historial', label: 'Historial', icon: <Clock className="h-4 w-4" /> },
  ] as const;

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        {/* Top Branding & Patient Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center mb-3">
          {/* Brand Logo / Title */}
          <div className="lg:col-span-3 flex items-center gap-2">
            <div className="bg-sky-600 text-white p-2 rounded-xl shadow-md shadow-sky-100">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">PediatriCode</h1>
              <p className="text-xs text-slate-500 font-medium">Urgencias Pediátricas</p>
            </div>
          </div>

          {/* Patient Inputs Grid */}
          <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            {/* Patient Name */}
            <div className="relative">
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Nombre del Paciente</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Paciente Anónimo"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-sky-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-100 transition-all font-medium text-slate-900"
                />
              </div>
            </div>

            {/* Patient Age (Months & Years) */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Edad</label>
              <div className="grid grid-cols-2 gap-1 relative">
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="240"
                    value={ageMonths || ''}
                    onChange={(e) => handleAgeMonthsChange(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-2 py-2 text-sm bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-sky-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-100 transition-all font-mono text-slate-900 text-center"
                  />
                  <span className="absolute right-1.5 bottom-0.5 text-[8px] font-bold text-slate-400 uppercase pointer-events-none">m</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.1"
                    value={ageYears || ''}
                    onChange={(e) => handleAgeYearsChange(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-2 py-2 text-sm bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-sky-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-100 transition-all font-mono text-slate-900 text-center"
                  />
                  <span className="absolute right-1.5 bottom-0.5 text-[8px] font-bold text-slate-400 uppercase pointer-events-none">a</span>
                </div>
              </div>
            </div>

            {/* Patient Weight */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Peso (kg)</label>
              <div className="relative">
                <Weight className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="number"
                  min="0.1"
                  max="150"
                  step="0.1"
                  value={weightKg || ''}
                  onChange={(e) => setWeightKg(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                  className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-sky-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-100 transition-all font-mono text-slate-900"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">kg</span>
              </div>
            </div>

            {/* Patient Height */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Talla (cm)</label>
              <div className="relative">
                <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="number"
                  min="10"
                  max="250"
                  step="0.5"
                  value={heightCm || ''}
                  onChange={(e) => setHeightCm(Math.max(10, parseFloat(e.target.value) || 10))}
                  className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-sky-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-100 transition-all font-mono text-slate-900"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">cm</span>
              </div>
            </div>

            {/* Real-time BSA (Mosteller) Display */}
            <div className="bg-sky-50 border border-sky-100 rounded-xl px-3 py-1.5 flex flex-col justify-center items-center">
              <span className="text-[9px] uppercase font-bold text-sky-600 tracking-wider">Sup. Corporal</span>
              <span className="text-lg font-bold font-mono text-sky-700 leading-none mt-0.5">
                {bsa.toFixed(3)} <span className="text-xs font-semibold">m²</span>
              </span>
            </div>
          </div>
        </div>

        {/* Safety Warnings */}
        {(isOverweightPediatric || isOverAgePediatric) && (
          <div className="mb-3">
            <ClinicalAlert
              type="warning"
              title="Alerta de Seguridad Pediátrica"
              message={`El paciente supera los límites pediátricos estándar (${isOverweightPediatric ? 'Peso > 80 kg' : ''} ${isOverweightPediatric && isOverAgePediatric ? 'y ' : ''} ${isOverAgePediatric ? 'Edad > 18 años' : ''}). Las fórmulas de Holliday-Segar y dosis pediátricas pueden no ser aplicables. Considere guías de manejo para adultos.`}
            />
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-t border-slate-100 mt-2 overflow-x-auto scrollbar-none">
          <nav className="flex space-x-1 py-1 min-w-max" aria-label="Tabs">
            {tabs.map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    'flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer',
                    isSelected
                      ? 'bg-sky-600 text-white shadow-md shadow-sky-100'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
