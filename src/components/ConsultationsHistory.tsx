'use client';

import React, { useState } from 'react';
import { usePatient } from '@/context/PatientContext';
import { Search, Calendar, Trash2, ChevronDown, ChevronUp, Droplets, Flame, Syringe, Stethoscope, AlertCircle, Layers } from 'lucide-react';
import { PatientConsultation } from '@/lib/supabase';
import { clsx } from 'clsx';

export default function ConsultationsHistory() {
  const { history, isLoadingHistory, deleteConsultation, currentModule } = usePatient();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [subModuleFilter, setSubModuleFilter] = useState<'all' | 'mantenimiento' | 'quemaduras' | 'cad' | 'eda'>('all');

  const handleToggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('¿Está seguro de que desea eliminar este registro clínico del historial?')) {
      await deleteConsultation(id);
    }
  };

  // Safe string conversion to prevent React child object crashes
  const renderVal = (val: any): string => {
    if (val === undefined || val === null) return '';
    if (typeof val === 'object') {
      try {
        return JSON.stringify(val);
      } catch (e) {
        return '[Objeto]';
      }
    }
    return String(val);
  };

  const getModuleIcon = (type: string) => {
    const cleanType = String(type || '').toLowerCase();
    const icons: Record<string, React.ReactNode> = {
      mantenimiento: <Droplets className="h-5 w-5 text-sky-600 dark:text-sky-400" />,
      quemaduras: <Flame className="h-5 w-5 text-rose-600 dark:text-rose-400" />,
      cad: <Syringe className="h-5 w-5 text-sky-600 dark:text-sky-400" />,
      eda: <Stethoscope className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,
    };
    return icons[cleanType] || <Droplets className="h-5 w-5 text-sky-600 dark:text-sky-400" />;
  };

  const getModuleLabel = (type: string) => {
    const cleanType = String(type || '').toLowerCase();
    const labels: Record<string, string> = {
      mantenimiento: 'Mantenimiento',
      quemaduras: 'Quemaduras',
      cad: 'CAD / DKA',
      eda: 'EDA / OMS',
    };
    return labels[cleanType] || 'Consulta';
  };

  const formatDate = (isoString: any) => {
    if (!isoString) return 'Fecha desconocida';
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return String(isoString);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return String(isoString || 'Fecha desconocida');
    }
  };

  // Filter history based on active parent module and specific sub-module filters
  const safeHistory = Array.isArray(history) ? history : [];
  const filteredHistory = safeHistory.filter((c) => {
    if (!c || typeof c !== 'object' || !c.consultation_type) return false;
    
    const typeStr = String(c.consultation_type).toLowerCase();
    
    // 1. Separation by Parent Module
    if (currentModule === 'liquidos') {
      // Only allow liquid-related consultation types
      const isLiquidType = ['mantenimiento', 'quemaduras', 'cad', 'eda'].includes(typeStr);
      if (!isLiquidType) return false;
      
      // Filter by specific sub-module if selected
      if (subModuleFilter !== 'all' && typeStr !== subModuleFilter) {
        return false;
      }
    } else if (currentModule === 'equipamiento') {
      if (typeStr !== 'equipamiento') return false;
    } else if (currentModule === 'medicamentos') {
      if (typeStr !== 'medicamentos') return false;
    } else if (currentModule === 'toxicologia') {
      if (typeStr !== 'toxicologia') return false;
    } else if (currentModule === 'pals') {
      if (typeStr !== 'pals') return false;
    }

    // 2. Search Term and Date Filters
    const label = getModuleLabel(typeStr);
    const matchesSearch =
      label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      typeStr.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = dateFilter && c.created_at ? String(c.created_at).startsWith(dateFilter) : true;

    return matchesSearch && matchesDate;
  });

  // Get localized empty message based on the active module
  const getEmptyMessage = () => {
    if (currentModule === 'equipamiento') {
      return {
        title: 'Historial de Equipamiento vacío',
        description: 'No hay registros guardados para Equipamiento y Vía Aérea. Este módulo es de referencia interactiva rápida basada en el peso/edad del paciente y no requiere guardar consultas.',
      };
    }
    if (currentModule === 'medicamentos') {
      return {
        title: 'Historial de Medicamentos vacío',
        description: 'No hay registros guardados para Medicamentos de Urgencia. Este módulo calcula dosis de seguridad en tiempo real según el peso del paciente y no requiere guardar consultas.',
      };
    }
    if (currentModule === 'toxicologia') {
      return {
        title: 'Historial de Toxicología vacío',
        description: 'No hay registros guardados para Toxicología y Antídotos. Este módulo sirve como guía de descontaminación y dosificación rápida sin persistencia de datos.',
      };
    }
    if (currentModule === 'pals') {
      return {
        title: 'Historial de PALS vacío',
        description: 'No hay registros guardados para Reanimación PALS. Este módulo interactivo de soporte vital avanzado se ejecuta en tiempo real para máxima agilidad clínica.',
      };
    }
    return {
      title: 'No se encontraron registros',
      description: 'No hay consultas guardadas que coincidan con la búsqueda actual o aún no se han registrado consultas en este módulo.',
    };
  };

  const emptyMsg = getEmptyMessage();

  return (
    <div className="space-y-6">
      {/* Sub-module Filter Tabs (Only shown for Líquidos y Electrólitos) */}
      {currentModule === 'liquidos' && (
        <div className="flex flex-wrap gap-1.5 bg-slate-100 dark:bg-slate-900/60 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 transition-colors">
          <button
            onClick={() => setSubModuleFilter('all')}
            className={clsx(
              'flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer',
              subModuleFilter === 'all'
                ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm border border-slate-200/50 dark:border-slate-700/50'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            )}
          >
            <Layers className="h-3.5 w-3.5" />
            Todos los Líquidos
          </button>
          <button
            onClick={() => setSubModuleFilter('mantenimiento')}
            className={clsx(
              'flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer',
              subModuleFilter === 'mantenimiento'
                ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm border border-slate-200/50 dark:border-slate-700/50'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            )}
          >
            <Droplets className="h-3.5 w-3.5 text-sky-500" />
            Mantenimiento
          </button>
          <button
            onClick={() => setSubModuleFilter('quemaduras')}
            className={clsx(
              'flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer',
              subModuleFilter === 'quemaduras'
                ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-sm border border-slate-200/50 dark:border-slate-700/50'
                : 'text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400'
            )}
          >
            <Flame className="h-3.5 w-3.5 text-rose-500" />
            Quemaduras
          </button>
          <button
            onClick={() => setSubModuleFilter('cad')}
            className={clsx(
              'flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer',
              subModuleFilter === 'cad'
                ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm border border-slate-200/50 dark:border-slate-700/50'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            )}
          >
            <Syringe className="h-3.5 w-3.5 text-sky-500" />
            CAD / DKA
          </button>
          <button
            onClick={() => setSubModuleFilter('eda')}
            className={clsx(
              'flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer',
              subModuleFilter === 'eda'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/50 dark:border-slate-700/50'
                : 'text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'
            )}
          >
            <Stethoscope className="h-3.5 w-3.5 text-emerald-500" />
            EDA / OMS
          </button>
        </div>
      )}

      {/* Search and Filter Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-6 shadow-sm transition-colors">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por paciente o módulo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-sky-500 dark:focus:border-sky-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-950 transition-all font-medium text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Date Filter */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-sky-500 dark:focus:border-sky-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-950 transition-all font-medium text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>
      </div>

      {/* History List */}
      {isLoadingHistory ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Cargando historial clínico...</p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm transition-colors px-4">
          <AlertCircle className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{emptyMsg.title}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
            {emptyMsg.description}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((c) => {
            const isExpanded = expandedId === c.id;
            return (
              <div
                key={c.id}
                className={clsx(
                  'bg-white dark:bg-slate-900 border rounded-2xl shadow-sm overflow-hidden transition-all duration-200 cursor-pointer',
                  isExpanded ? 'border-sky-300 dark:border-sky-500 ring-4 ring-sky-50 dark:ring-sky-950/30' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                )}
                onClick={() => handleToggleExpand(c.id)}
              >
                {/* Header Row */}
                <div className="flex items-center justify-between p-4 md:p-5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-800 shrink-0">
                      {getModuleIcon(c.consultation_type)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm md:text-base truncate">
                        Cálculo de {getModuleLabel(c.consultation_type)}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                        <span className="font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/30 border border-sky-100/50 dark:border-sky-900/40 px-1.5 py-0.5 rounded-md">
                          {formatDate(c.created_at)}
                        </span>
                        {c.weight_kg !== undefined && c.weight_kg !== null && (
                          <>
                            <span>•</span>
                            <span>{renderVal(c.weight_kg)} kg</span>
                          </>
                        )}
                        {c.talla_cm !== undefined && c.talla_cm !== null && (
                          <>
                            <span>•</span>
                            <span>{renderVal(c.talla_cm)} cm</span>
                          </>
                        )}
                        {c.sc_m2 !== undefined && c.sc_m2 !== null && (
                          <>
                            <span>•</span>
                            <span>{(Number(c.sc_m2) || 0).toFixed(3)} m²</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] md:text-xs text-slate-400 dark:text-slate-500 font-mono hidden sm:inline">
                      {formatDate(c.created_at)}
                    </span>
                    <button
                      onClick={(e) => handleDelete(e, c.id)}
                      className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all cursor-pointer"
                      title="Eliminar consulta"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                    )}
                  </div>
                </div>

                {/* Expanded Details Panel */}
                {isExpanded && (
                  <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 p-4 md:p-6 space-y-4">
                    <div className="flex justify-between items-center text-xs text-slate-400 dark:text-slate-500 font-mono sm:hidden border-b border-dashed border-slate-200 dark:border-slate-800 pb-2">
                      <span>Fecha de Registro:</span>
                      <span>{formatDate(c.created_at)}</span>
                    </div>

                    <h5 className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Detalles del Cálculo Clínico</h5>

                    {/* Render details based on type */}
                    {String(c.consultation_type).toLowerCase() === 'mantenimiento' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl p-4 shadow-sm">
                          <h6 className="font-bold text-slate-800 dark:text-slate-200 text-xs mb-3">Holliday-Segar (Peso)</h6>
                          <div className="space-y-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                            <div className="flex justify-between">
                              <span>Volumen Diario:</span>
                              <span className="font-mono text-slate-900 dark:text-slate-100 font-bold">{renderVal(c.details?.holliday?.dailyVolumeMl)} mL/día</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Tasa de Infusión:</span>
                              <span className="font-mono text-sky-700 dark:text-sky-300 font-bold">{renderVal(c.details?.holliday?.hourlyRateMlh)} mL/h</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Macrogoteo:</span>
                              <span className="font-mono text-slate-900 dark:text-slate-100">{renderVal(c.details?.holliday?.dropsPerMin)} gotas/min</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Microgoteo:</span>
                              <span className="font-mono text-slate-900 dark:text-slate-100">{renderVal(c.details?.holliday?.microdropsPerMin)} ugotas/min</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl p-4 shadow-sm">
                          <h6 className="font-bold text-slate-800 dark:text-slate-200 text-xs mb-3">Superficie Corporal (SC)</h6>
                          <div className="space-y-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                            <div className="flex justify-between">
                              <span>Volumen Diario:</span>
                              <span className="font-mono text-slate-900 dark:text-slate-100 font-bold">
                                {renderVal(c.details?.bsaBased?.dailyVolumeMlMin)} - {renderVal(c.details?.bsaBased?.dailyVolumeMlMax)} mL/día
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Tasa de Infusión:</span>
                              <span className="font-mono text-emerald-700 dark:text-emerald-300 font-bold">
                                {renderVal(c.details?.bsaBased?.hourlyRateMlhMin)} - {renderVal(c.details?.bsaBased?.hourlyRateMlhMax)} mL/h
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {String(c.consultation_type).toLowerCase() === 'quemaduras' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl p-4 shadow-sm">
                          <h6 className="font-bold text-slate-800 dark:text-slate-200 text-xs mb-3">Estimación y Parkland</h6>
                          <div className="space-y-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                            <div className="flex justify-between">
                              <span>Porcentaje SCQ:</span>
                              <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">{renderVal(c.details?.scqPercentage)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Volumen Total:</span>
                              <span className="font-mono text-slate-900 dark:text-slate-100 font-bold">{renderVal(c.details?.results?.totalVolumeMl)} mL</span>
                            </div>
                            {c.details?.results?.maintenanceAddedMl && (
                              <div className="flex justify-between">
                                <span>Mantenimiento Añadido:</span>
                                <span className="font-mono text-slate-900 dark:text-slate-100">{renderVal(c.details?.results?.maintenanceAddedMl)} mL</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl p-4 shadow-sm">
                          <h6 className="font-bold text-slate-800 dark:text-slate-200 text-xs mb-3">Tasa de Infusión por Fases</h6>
                          <div className="space-y-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                            <div className="flex justify-between border-b border-dashed border-slate-100 dark:border-slate-800 pb-1.5">
                              <span>Primeras 8 Horas:</span>
                              <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">{renderVal(c.details?.results?.firstEightHoursRateMlh)} mL/h</span>
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500">
                              <span>(Volumen: {renderVal(c.details?.results?.firstEightHoursMl)} mL)</span>
                            </div>
                            <div className="flex justify-between border-b border-dashed border-slate-100 dark:border-slate-800 pb-1.5 pt-1">
                              <span>Siguientes 16 Horas:</span>
                              <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">{renderVal(c.details?.results?.nextSixteenHoursRateMlh)} mL/h</span>
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500">
                              <span>(Volumen: {renderVal(c.details?.results?.nextSixteenHoursMl)} mL)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {String(c.consultation_type).toLowerCase() === 'cad' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl p-4 shadow-sm">
                          <h6 className="font-bold text-slate-800 dark:text-slate-200 text-xs mb-3">Parámetros de Cetoacidosis</h6>
                          <div className="space-y-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                            <div className="flex justify-between">
                              <span>Severidad:</span>
                              <span className="font-semibold text-slate-900 dark:text-slate-100 capitalize">{renderVal(c.details?.severity)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Compromiso Hemodinámico:</span>
                              <span className="font-semibold text-slate-900 dark:text-slate-100">{c.details?.conCompromiso ? 'Sí' : 'No'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Basal Veces:</span>
                              <span className="font-mono text-slate-900 dark:text-slate-100">{renderVal(c.details?.basalVeces)}x</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl p-4 shadow-sm">
                          <h6 className="font-bold text-slate-800 dark:text-slate-200 text-xs mb-3">Esquema de Infusión Sugerido</h6>
                          <div className="space-y-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                            <div className="flex justify-between">
                              <span>Bolo 10 mL/kg:</span>
                              <span className="font-mono text-slate-900 dark:text-slate-100 font-bold">{renderVal(c.details?.results?.bolus10VolumeMl)} mL</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Bolo 20 mL/kg (Shock):</span>
                              <span className="font-mono text-slate-900 dark:text-slate-100 font-bold">{renderVal(c.details?.results?.bolus20VolumeMl)} mL</span>
                            </div>
                            {c.details?.results?.totalVolumeMl48h ? (
                              <>
                                <div className="flex justify-between border-t border-dashed border-slate-100 dark:border-slate-800 pt-1.5 mt-1">
                                  <span>Volumen Total 48h:</span>
                                  <span className="font-mono text-sky-700 dark:text-sky-300 font-bold">{renderVal(c.details?.results?.totalVolumeMl48h)} mL</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Tasa de Infusión (48h):</span>
                                  <span className="font-mono text-sky-700 dark:text-sky-300 font-bold">{renderVal(c.details?.results?.hourlyRateMlh48h)} mL/h</span>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex justify-between border-t border-dashed border-slate-100 dark:border-slate-800 pt-1.5 mt-1">
                                  <span>Volumen Diario (24h):</span>
                                  <span className="font-mono text-sky-700 dark:text-sky-300 font-bold">
                                    {renderVal(c.details?.results?.dailyVolumeMlMin)} - {renderVal(c.details?.results?.dailyVolumeMlMax)} mL
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Tasa de Infusión (24h):</span>
                                  <span className="font-mono text-sky-700 dark:text-sky-300 font-bold">
                                    {renderVal(c.details?.results?.hourlyRateMlhMin)} - {renderVal(c.details?.results?.hourlyRateMlhMax)} mL/h
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {String(c.consultation_type).toLowerCase() === 'eda' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl p-4 shadow-sm">
                          <h6 className="font-bold text-slate-800 dark:text-slate-200 text-xs mb-3">Diagnóstico y Plan</h6>
                          <div className="space-y-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                            <div className="flex justify-between">
                              <span>Plan Seleccionado:</span>
                              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                Plan {renderVal(c.details?.results?.plan || c.details?.results?.recommendedPlan)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Volumen Requerido:</span>
                              <span className="font-mono text-slate-900 dark:text-slate-100 font-bold">
                                {c.details?.results?.volumeMl || c.details?.results?.fluidVolumeMl 
                                  ? `${renderVal(c.details?.results?.volumeMl || c.details?.results?.fluidVolumeMl)} mL` 
                                  : 'N/A'}
                              </span>
                            </div>
                            {(c.details?.results?.zincDose || c.details?.results?.zincDoseMg) && (
                              <div className="flex justify-between">
                                <span>Dosis de Zinc:</span>
                                <span className="font-mono text-slate-900 dark:text-slate-100 font-bold">
                                  {renderVal(c.details?.results?.zincDose || `${c.details?.results?.zincDoseMg} mg`)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl p-4 shadow-sm">
                          <h6 className="font-bold text-slate-800 dark:text-slate-200 text-xs mb-3">Instrucciones de Rehidratación</h6>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                            {renderVal(c.details?.results?.description || c.details?.results?.planDetails)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
