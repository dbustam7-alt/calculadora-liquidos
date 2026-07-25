'use client';

import React from 'react';
import { usePatient } from '@/context/PatientContext';
import PatientHeader from '@/components/PatientHeader';
import MaintenanceModule from '@/components/MaintenanceModule';
import BurnsModule from '@/components/BurnsModule';
import DkaModule from '@/components/DkaModule';
import EdaModule from '@/components/EdaModule';
import ConsultationsHistory from '@/components/ConsultationsHistory';

export default function Home() {
  const { activeTab } = usePatient();

  const renderActiveModule = () => {
    switch (activeTab) {
      case 'mantenimiento':
        return <MaintenanceModule />;
      case 'quemaduras':
        return <BurnsModule />;
      case 'cad':
        return <DkaModule />;
      case 'eda':
        return <EdaModule />;
      case 'historial':
        return <ConsultationsHistory />;
      default:
        return <MaintenanceModule />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Sticky Patient Header & Navigation */}
      <PatientHeader />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="animate-fade-in">
          {renderActiveModule()}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-[10px] md:text-xs text-slate-400 font-medium">
        <div className="max-w-7xl mx-auto px-4">
          <p>© {new Date().getFullYear()} PediatriCode. Diseñado para soporte clínico de alta velocidad en urgencias pediátricas.</p>
          <p className="mt-1 text-slate-400">
            Aviso de Seguridad: Esta herramienta es un asistente de cálculo clínico para profesionales de la salud. Verifique siempre las dosis y tasas de infusión antes de la administración.
          </p>
        </div>
      </footer>
    </div>
  );
}
