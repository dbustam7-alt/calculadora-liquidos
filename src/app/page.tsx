'use client';

import React from 'react';
import { usePatient } from '@/context/PatientContext';
import PatientHeader from '@/components/PatientHeader';
import MaintenanceModule from '@/components/MaintenanceModule';
import BurnsModule from '@/components/BurnsModule';
import DkaModule from '@/components/DkaModule';
import EdaModule from '@/components/EdaModule';
import ConsultationsHistory from '@/components/ConsultationsHistory';
import InfoModule from '@/components/InfoModule';
import Dashboard from '@/components/Dashboard';
import EquipmentModule from '@/components/EquipmentModule';
import MedsModule from '@/components/MedsModule';
import AuthScreen from '@/components/AuthScreen';

export default function Home() {
  const { activeTab, user, isAuthLoading } = usePatient();

  // Show loading spinner while checking auth session
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600 mb-4"></div>
        <p className="text-sm text-slate-500 font-medium">Verificando sesión clínica...</p>
      </div>
    );
  }

  // If user is not authenticated, render the Auth Screen
  if (!user) {
    return <AuthScreen />;
  }

  // If active tab is dashboard, render the main menu hub
  if (activeTab === 'dashboard') {
    return <Dashboard />;
  }

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
      case 'equipamiento':
        return <EquipmentModule />;
      case 'medicamentos':
        return <MedsModule />;
      case 'historial':
        return <ConsultationsHistory />;
      case 'info':
        return <InfoModule />;
      default:
        return <MaintenanceModule />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Sticky Patient Header & Navigation */}
      <PatientHeader />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="animate-fade-in">
          {renderActiveModule()}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-4 text-center text-[10px] md:text-xs text-slate-400 dark:text-slate-500 font-medium transition-colors">
        <div className="max-w-7xl mx-auto px-4">
          <p>© {new Date().getFullYear()} PediaCode. Diseñado para soporte clínico de alta velocidad en urgencias pediátricas.</p>
          <p className="mt-1 text-slate-400 dark:text-slate-500">
            Aviso de Seguridad: Esta herramienta es un asistente de cálculo clínico para profesionales de la salud. Verifique siempre las dosis y tasas de infusión antes de la administración.
          </p>
        </div>
      </footer>
    </div>
  );
}
