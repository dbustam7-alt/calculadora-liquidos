'use client';

import React, { useState } from 'react';
import { usePatient } from '@/context/PatientContext';
import { Search, Calendar, Trash2, ChevronDown, ChevronUp, Droplets, Flame, Syringe, Stethoscope, AlertCircle } from 'lucide-react';
import { PatientConsultation } from '@/lib/supabase';
import { clsx } from 'clsx';

export default function ConsultationsHistory() {
  const { history, isLoadingHistory, deleteConsultation } = usePatient();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleToggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('¿Está seguro de que desea eliminar este registro clínico del historial?')) {
      await deleteConsultation(id);
    }
  };

  // Filter history based on search term and date
  const filteredHistory = history.filter((c) => {
    const label = getModuleLabel(c.consultation_type);
    const matchesSearch =
      label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.consultation_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = dateFilter ? c.created_at.startsWith(dateFilter) : true;

    return matchesSearch && matchesDate;
  });

  const getModuleIcon = (type: PatientConsultation['consultation_type']) => {
    const icons = {
      mantenimiento: <Droplets className="h-5 w-5 text-sky-600" />,
      quemaduras: <Flame className="h-5 w-5 text-rose-600" />,
      cad: <Syringe className="h-5 w-5 text-sky-600" />,
      eda: <Stethoscope className="h-5 w-5 text-emerald-600" />,
    };
    return icons[type];
  };

  const getModuleLabel = (type: PatientConsultation['consultation_type']) => {
    const labels = {
      mantenimiento: 'Mantenimiento',
      quemaduras: 'Quemaduras',
      cad: 'CAD / DKA',
      eda: 'EDA / OMS',
    };
    return labels[type];
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por paciente o módulo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-sky-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-100 transition-all font-medium text-slate-900"
            />
          </div>

          {/* Date Filter */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-sky-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-100 transition-all font-medium text-slate-900"
            />
          </div>
        </div>
      </div>

      {/* History List */}
      {isLoadingHistory ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-sm text-slate-500 font-medium">Cargando historial clínico...</p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <AlertCircle className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-sm">No se encontraron registros</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed">
            No hay consultas guardadas que coincidan con la búsqueda actual o aún no se han registrado consultas.
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
                  'bg-white border rounded-2xl shadow-sm overflow-hidden transition-all duration-200 cursor-pointer',
                  isExpanded ? 'border-sky-300 ring-4 ring-sky-50' : 'border-slate-200 hover:border-slate-300'
                )}
                onClick={() => handleToggleExpand(c.id)}
              >
                {/* Header Row */}
                <div className="flex items-center justify-between p-4 md:p-5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 shrink-0">
                      {getModuleIcon(c.consultation_type)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 text-sm md:text-base truncate">
                        Cálculo de {getModuleLabel(c.consultation_type)}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 font-medium mt-0.5">
                        <span className="font-semibold text-sky-700 bg-sky-50 border border-sky-100/50 px-1.5 py-0.5 rounded-md">
                          {formatDate(c.created_at)}
                        </span>
                        <span>•</span>
                        <span>{c.weight_kg} kg</span>
                        <span>•</span>
                        <span>{c.talla_cm} cm</span>
                        <span>•</span>
                        <span>{c.sc_m2.toFixed(3)} m²</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] md:text-xs text-slate-400 font-mono hidden sm:inline">
                      {formatDate(c.created_at)}
                    </span>
                    <button
                      onClick={(e) => handleDelete(e, c.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                      title="Eliminar consulta"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details Panel */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-4 md:p-6 space-y-4">
                    <div className="flex justify-between items-center text-xs text-slate-400 font-mono sm:hidden border-b border-dashed border-slate-200 pb-2">
                      <span>Fecha de Registro:</span>
                      <span>{formatDate(c.created_at)}</span>
                    </div>

                    <h5 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Detalles del Cálculo Clínico</h5>

                    {/* Render details based on type */}
                    {c.consultation_type === 'mantenimiento' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                          <h6 className="font-bold text-slate-800 text-xs mb-3">Holliday-Segar (Peso)</h6>
                          <div className="space-y-2 text-xs font-medium text-slate-600">
                            <div className="flex justify-between">
                              <span>Volumen Diario:</span>
                              <span className="font-mono text-slate-900 font-bold">{c.details.holliday?.dailyVolumeMl} mL/día</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Tasa de Infusión:</span>
                              <span className="font-mono text-sky-700 font-bold">{c.details.holliday?.hourlyRateMlh} mL/h</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Macrogoteo:</span>
                              <span className="font-mono text-slate-900">{c.details.holliday?.dropsPerMin} gotas/min</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Microgoteo:</span>
                              <span className="font-mono text-slate-900">{c.details.holliday?.microdropsPerMin} ugotas/min</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                          <h6 className="font-bold text-slate-800 text-xs mb-3">Superficie Corporal (SC)</h6>
                          <div className="space-y-2 text-xs font-medium text-slate-600">
                            <div className="flex justify-between">
                              <span>Volumen Diario:</span>
                              <span className="font-mono text-slate-900 font-bold">{c.details.bsaBased?.results?.dailyVolumeMl} mL/día</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Tasa de Infusión:</span>
                              <span className="font-mono text-emerald-700 font-bold">{c.details.bsaBased?.results?.hourlyRateMlh} mL/h</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Sodio Basal Total:</span>
                              <span className="font-mono text-slate-900">{c.details.bsaBased?.results?.naTotalMeq} mEq/día</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Potasio Basal Total:</span>
                              <span className="font-mono text-slate-900">{c.details.bsaBased?.results?.kTotalMeq} mEq/día</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {c.consultation_type === 'quemaduras' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                          <h6 className="font-bold text-slate-800 text-xs mb-3">Estimación y Parkland</h6>
                          <div className="space-y-2 text-xs font-medium text-slate-600">
                            <div className="flex justify-between">
                              <span>Porcentaje SCQ:</span>
                              <span className="font-mono text-rose-600 font-bold">{c.details.scqPercentage}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Volumen Parkland Total:</span>
                              <span className="font-mono text-slate-900 font-bold">{c.details.results?.totalVolumeMl} mL</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Mantenimiento Diario:</span>
                              <span className="font-mono text-slate-900">{c.details.results?.maintenanceDailyVolumeMl} mL/día</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                          <h6 className="font-bold text-slate-800 text-xs mb-3">Tasa de Infusión por Fases</h6>
                          <div className="space-y-2 text-xs font-medium text-slate-600">
                            <div className="flex justify-between border-b border-dashed border-slate-100 pb-1.5">
                              <span>Primeras 8 Horas:</span>
                              <span className="font-mono text-rose-600 font-bold">{c.details.results?.combinedFirstEightHoursRateMlh} mL/h</span>
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-400">
                              <span>(Resucitación: {c.details.results?.firstEightHoursRateMlh} mL/h + Mantenimiento)</span>
                            </div>
                            <div className="flex justify-between border-b border-dashed border-slate-100 pb-1.5 pt-1">
                              <span>Siguientes 16 Horas:</span>
                              <span className="font-mono text-rose-600 font-bold">{c.details.results?.combinedNextSixteenHoursRateMlh} mL/h</span>
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-400">
                              <span>(Resucitación: {c.details.results?.nextSixteenHoursRateMlh} mL/h + Mantenimiento)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {c.consultation_type === 'cad' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                          <h6 className="font-bold text-slate-800 text-xs mb-3">Parámetros y Sodio</h6>
                          <div className="space-y-2 text-xs font-medium text-slate-600">
                            <div className="flex justify-between">
                              <span>Sodio Corregido:</span>
                              <span className="font-mono text-sky-700 font-bold">{c.details.results?.correctedSodiumMeqL} mEq/L</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Sodio Medido:</span>
                              <span className="font-mono text-slate-900">{c.details.inputs?.measuredNa} mEq/L</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Glicemia:</span>
                              <span className="font-mono text-slate-900">{c.details.inputs?.glucoseMgDl} mg/dL</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Deshidratación (%):</span>
                              <span className="font-mono text-slate-900">{c.details.inputs?.dehydrationPercentage}%</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                          <h6 className="font-bold text-slate-800 text-xs mb-3">Manejo de Líquidos e Insulina</h6>
                          <div className="space-y-2 text-xs font-medium text-slate-600">
                            <div className="flex justify-between">
                              <span>Bolo Inicial Salino:</span>
                              <span className="font-mono text-slate-900 font-bold">{c.details.results?.bolusVolumeMl} mL</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Infusión de Insulina:</span>
                              <span className="font-mono text-slate-900 font-bold">{c.details.results?.insulinRateUiH} UI/h</span>
                            </div>
                            <div className="flex justify-between border-t border-dashed border-slate-100 pt-1.5 mt-1">
                              <span>Tasa de Infusión Total:</span>
                              <span className="font-mono text-sky-700 font-bold">{c.details.results?.totalHourlyFluidRateMlh} mL/h</span>
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-400">
                              <span>(Déficit: {c.details.results?.hourlyDeficitRateMlh} mL/h + Mantenimiento)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {c.consultation_type === 'eda' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                          <h6 className="font-bold text-slate-800 text-xs mb-3">Diagnóstico y Plan</h6>
                          <div className="space-y-2 text-xs font-medium text-slate-600">
                            <div className="flex justify-between">
                              <span>Gravedad Deshidratación:</span>
                              <span className="font-semibold text-slate-900">{c.details.results?.severity === 'none' ? 'Sin Deshidratación' : c.details.results?.severity === 'some' ? 'Moderada' : 'Grave'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Plan Recomendado:</span>
                              <span className="font-bold text-emerald-600">Plan {c.details.results?.recommendedPlan}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Volumen Requerido:</span>
                              <span className="font-mono text-slate-900 font-bold">{c.details.results?.fluidVolumeMl ? `${c.details.results.fluidVolumeMl} mL` : 'N/A'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                          <h6 className="font-bold text-slate-800 text-xs mb-3">Instrucciones de Rehidratación</h6>
                          <p className="text-xs text-slate-600 leading-relaxed font-medium">
                            {c.details.results?.planDetails}
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
