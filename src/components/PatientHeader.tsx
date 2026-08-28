'use client';

import React, { useState, useEffect } from 'react';
import { usePatient } from '@/context/PatientContext';
import { Calendar, Weight, Ruler, Activity, Droplets, Flame, Syringe, Stethoscope, Clock, LogOut, Sun, Moon } from 'lucide-react';
import ClinicalAlert from './ClinicalAlert';
import { clsx } from 'clsx';

export default function PatientHeader() {
  const {
    ageMonths,
    weightKg,
    heightCm,
    bsa,
    activeTab,
    user,
    darkMode,
    setAgeMonths,
    setWeightKg,
    setHeightCm,
    setActiveTab,
    signOut,
    toggleDarkMode,
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
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        {/* Top Branding & Patient Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center mb-3">
          {/* Brand Logo / Title & User Info */}
          <div className="lg:col-span-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-sky-600 text-white p-2 rounded-xl shadow-md shadow-sky-100 dark:shadow-none">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">PediatriCode</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Urgencias Pediátricas</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 text-slate-400 dark:text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                title={darkMode ? 'Modo Claro' : 'Modo Oscuro'}
              >
                {darkMode ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5" />}
              </button>

              {/* Mobile Sign Out */}
              {user && (
                <button
                  onClick={signOut}
                  className="lg:hidden p-2 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all cursor-pointer"
                  title="Cerrar Sesión"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Patient Inputs Grid */}
          <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Patient Age (Months & Years) */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">Edad</label>
              <div className="grid grid-cols-2 gap-1 relative">
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="240"
                    value={ageMonths || ''}
                    onChange={(e) => handleAgeMonthsChange(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-2 py-2 text-sm bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-sky-500 dark:focus:border-sky-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-950 transition-all font-mono text-slate-900 dark:text-slate-100 text-center"
                  />
                  <span className="absolute right-1.5 bottom-0.5 text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase pointer-events-none">m</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.1"
                    value={ageYears || ''}
                    onChange={(e) => handleAgeYearsChange(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-2 py-2 text-sm bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-sky-500 dark:focus:border-sky-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-950 transition-all font-mono text-slate-900 dark:text-slate-100 text-center"
                  />
                  <span className="absolute right-1.5 bottom-0.5 text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase pointer-events-none">a</span>
                </div>
              </div>
            </div>

            {/* Patient Weight */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">Peso (kg)</label>
              <div className="relative">
                <Weight className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                <input
                  type="number"
                  min="0.1"
                  max="150"
                  step="0.1"
                  value={weightKg || ''}
                  onChange={(e) => setWeightKg(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                  className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-sky-500 dark:focus:border-sky-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-950 transition-all font-mono text-slate-900 dark:text-slate-100"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 dark:text-slate-500">kg</span>
              </div>
            </div>

            {/* Patient Height */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">Talla (cm)</label>
              <div className="relative">
                <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                <input
                  type="number"
                  min="10"
                  max="250"
                  step="0.5"
                  value={heightCm || ''}
                  onChange={(e) => setHeightCm(Math.max(10, parseFloat(e.target.value) || 10))}
                  className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-sky-500 dark:focus:border-sky-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-950 transition-all font-mono text-slate-900 dark:text-slate-100"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 dark:text-slate-500">cm</span>
              </div>
            </div>

            {/* Real-time BSA (Mosteller) Display */}
            <div className="bg-sky-50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/50 rounded-xl px-3 py-1.5 flex flex-col justify-center items-center">
              <span className="text-[9px] uppercase font-bold text-sky-600 dark:text-sky-400 tracking-wider">Sup. Corporal</span>
              <span className="text-lg font-bold font-mono text-sky-700 dark:text-sky-300 leading-none mt-0.5">
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

        {/* Navigation Tabs & Desktop Sign Out */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 mt-2 overflow-x-auto scrollbar-none">
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
                      ? 'bg-sky-600 dark:bg-sky-500 text-white shadow-md shadow-sky-100 dark:shadow-none'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800'
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Desktop User Info & Sign Out */}
          {user && (
            <div className="hidden lg:flex items-center gap-3 pl-4 border-l border-slate-100 dark:border-slate-800">
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block uppercase">
                  {user.user_metadata?.specialty ? (
                    user.user_metadata.specialty === 'pediatria' ? 'Pediatría' :
                    user.user_metadata.specialty === 'urgencias_pediatricas' ? 'Urgencias Pediátricas' :
                    user.user_metadata.specialty === 'medicina_general' ? 'Medicina General' :
                    user.user_metadata.specialty === 'residente_pediatria' ? 'Residente Pediatría' :
                    user.user_metadata.specialty === 'enfermeria_pediatrica' ? 'Enfermería Ped.' : 'Médico'
                  ) : 'Usuario Activo'}
                </span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block max-w-[150px] truncate" title={user.user_metadata?.full_name || user.email}>
                  {user.user_metadata?.full_name || user.email}
                </span>
              </div>
              <button
                onClick={signOut}
                className="flex items-center justify-center p-2 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all cursor-pointer"
                title="Cerrar Sesión"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
