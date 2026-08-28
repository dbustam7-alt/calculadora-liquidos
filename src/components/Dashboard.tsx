'use client';

import React from 'react';
import { usePatient } from '@/context/PatientContext';
import { 
  Activity, 
  Droplets, 
  Syringe, 
  HeartPulse, 
  ShieldAlert, 
  ChevronRight, 
  LogOut, 
  Sun, 
  Moon, 
  User,
  Lock
} from 'lucide-react';

export default function Dashboard() {
  const { user, darkMode, setActiveTab, signOut, toggleDarkMode } = usePatient();

  const getSpecialtyLabel = (specialty?: string) => {
    const labels: Record<string, string> = {
      pediatria: 'Pediatría',
      urgencias_pediatricas: 'Urgencias Pediátricas',
      medicina_general: 'Medicina General',
      residente_pediatria: 'Residente Pediatría',
      enfermeria_pediatrica: 'Enfermería Pediátrica',
    };
    return specialty ? (labels[specialty] || 'Médico') : 'Usuario Activo';
  };

  const modules = [
    {
      id: 'liquidos',
      title: 'Líquidos y Electrólitos',
      description: 'Mantenimiento basal (Holliday-Segar / SC), resucitación en quemaduras (Galveston / Parkland), cetoacidosis diabética (CAD) y deshidratación (OMS).',
      icon: <Droplets className="h-7 w-7 text-sky-600 dark:text-sky-400" />,
      bgIcon: 'bg-sky-50 dark:bg-sky-950/30 border-sky-100 dark:border-sky-900/40',
      active: true,
      badge: 'Activo',
      badgeStyle: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40',
      onClick: () => setActiveTab('mantenimiento'),
    },
    {
      id: 'medicamentos',
      title: 'Medicamentos de Urgencia',
      description: 'Dosificación exacta de fármacos de reanimación, sedación, analgesia, anticonvulsivantes, secuencia de intubación rápida y antibióticos según el peso.',
      icon: <Syringe className="h-7 w-7 text-rose-500 dark:text-rose-400" />,
      bgIcon: 'bg-rose-50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900/40',
      active: false,
      badge: 'Próximamente',
      badgeStyle: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700',
    },
    {
      id: 'equipamiento',
      title: 'Equipamiento y Vía Aérea',
      description: 'Sugerencias automáticas de tamaño de tubos endotraqueales, palas de laringoscopio, mascarillas, catéteres, sondas Foley y tamaño de manguito de presión.',
      icon: <Activity className="h-7 w-7 text-emerald-500 dark:text-emerald-400" />,
      bgIcon: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/40',
      active: false,
      badge: 'Próximamente',
      badgeStyle: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700',
    },
    {
      id: 'pals',
      title: 'Reanimación PALS',
      description: 'Guía interactiva paso a paso para ritmos desfibrilables y no desfibrilables, asfixia, bradicardia, taquicardia inestable y soporte vital avanzado.',
      icon: <HeartPulse className="h-7 w-7 text-amber-500 dark:text-amber-400" />,
      bgIcon: 'bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/40',
      active: false,
      badge: 'Próximamente',
      badgeStyle: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700',
    },
    {
      id: 'toxicologia',
      title: 'Toxicología y Antídotos',
      description: 'Manejo inicial de intoxicaciones comunes, cálculo de dosis de antídotos específicos, lavado gástrico, carbón activado y escalas de gravedad toxicológica.',
      icon: <ShieldAlert className="h-7 w-7 text-violet-500 dark:text-violet-400" />,
      bgIcon: 'bg-violet-50 dark:bg-violet-950/30 border-violet-100 dark:border-violet-900/40',
      active: false,
      badge: 'Próximamente',
      badgeStyle: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors">
      {/* Dashboard Header */}
      <header className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm py-4 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="bg-sky-600 text-white p-2.5 rounded-2xl shadow-md shadow-sky-100 dark:shadow-none">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">PediaCode</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Urgencias Pediátricas</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2.5 text-slate-400 dark:text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
              title={darkMode ? 'Modo Claro' : 'Modo Oscuro'}
            >
              {darkMode ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* User Profile Info */}
            {user && (
              <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-slate-100 dark:border-slate-800">
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block uppercase">
                    {getSpecialtyLabel(user.user_metadata?.specialty)}
                  </span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block max-w-[150px] truncate" title={user.user_metadata?.full_name || user.email}>
                    {user.user_metadata?.full_name || user.email}
                  </span>
                </div>
              </div>
            )}

            {/* Sign Out */}
            {user && (
              <button
                onClick={signOut}
                className="p-2.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all cursor-pointer"
                title="Cerrar Sesión"
              >
                <LogOut className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="animate-fade-in space-y-8">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-sky-600 to-indigo-600 dark:from-sky-950/40 dark:to-indigo-950/40 border border-sky-100/10 rounded-3xl p-6 md:p-8 text-white shadow-lg shadow-sky-100/20 dark:shadow-none">
            <div className="max-w-3xl space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider bg-white/20 dark:bg-sky-900/40 px-3 py-1 rounded-full">
                {user?.user_metadata?.hospital || 'Hospital Activo'}
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold leading-tight">
                Hola, {user?.user_metadata?.full_name?.split(' ')[0] || 'Doctor'}.
              </h2>
              <p className="text-sm md:text-base text-sky-100 dark:text-sky-300 font-medium max-w-2xl leading-relaxed">
                Bienvenido al centro de control clínico de PediaCode. Selecciona uno de los módulos de urgencias pediátricas para comenzar tus cálculos y guías asistenciales.
              </p>
            </div>
          </div>

          {/* Modules Grid */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Módulos de Urgencia</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.map((m) => (
                <div
                  key={m.id}
                  onClick={m.active ? m.onClick : undefined}
                  className={`group bg-white dark:bg-slate-900 border rounded-3xl p-6 shadow-sm flex flex-col justify-between transition-all duration-300 ${
                    m.active 
                      ? 'border-slate-200 dark:border-slate-800 hover:border-sky-500 dark:hover:border-sky-500 hover:shadow-md hover:shadow-sky-100/10 cursor-pointer' 
                      : 'border-slate-100 dark:border-slate-900 opacity-70 cursor-not-allowed'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Icon & Badge */}
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-2xl border ${m.bgIcon}`}>
                        {m.icon}
                      </div>
                      <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border uppercase tracking-wider ${m.badgeStyle}`}>
                        {m.badge}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div className="space-y-1.5">
                      <h4 className="font-bold text-slate-900 dark:text-white text-base md:text-lg flex items-center gap-1.5">
                        {m.title}
                        {!m.active && <Lock className="h-3.5 w-3.5 text-slate-400 dark:text-slate-600" />}
                      </h4>
                      <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        {m.description}
                      </p>
                    </div>
                  </div>

                  {/* Action Button */}
                  {m.active ? (
                    <div className="pt-6 flex justify-end">
                      <button className="flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 group-hover:text-sky-700 dark:group-hover:text-sky-300 transition-all">
                        Ingresar Módulo
                        <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  ) : (
                    <div className="pt-6 flex justify-end">
                      <span className="text-xs font-bold text-slate-400 dark:text-slate-600">
                        Bloqueado
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 text-center text-[10px] md:text-xs text-slate-400 dark:text-slate-500 font-medium transition-colors">
        <div className="max-w-7xl mx-auto px-4">
          <p>© {new Date().getFullYear()} PediaCode. Diseñado para soporte clínico de alta velocidad en urgencias pediátricas.</p>
          <p className="mt-1 text-slate-400 dark:text-slate-500 max-w-3xl mx-auto leading-relaxed">
            Aviso de Seguridad: Esta herramienta es un asistente de cálculo clínico para profesionales de la salud. Verifique siempre las dosis, vías de administración y tasas de infusión de forma independiente antes de cualquier procedimiento.
          </p>
        </div>
      </footer>
    </div>
  );
}
