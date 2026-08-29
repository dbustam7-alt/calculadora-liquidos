'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePatient } from '@/context/PatientContext';
import { 
  HeartPulse, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Zap, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  ArrowRight, 
  Plus, 
  Minus,
  RefreshCw,
  ShieldAlert
} from 'lucide-react';
import { clsx } from 'clsx';

export default function PalsModule() {
  const { weightKg } = usePatient();

  // --- CPR TIMER & METRONOME STATE ---
  const [timerRunning, setTimerRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(120); // 2-minute CPR cycles
  const [cprCycles, setCprCycles] = useState(0);
  const [metronomeActive, setMetronomeActive] = useState(false);
  const [soundEnabled, setSoundActive] = useState(false);
  const [timelineEvents, setTimelineEvents] = useState<{ time: string; text: string; type: 'shock' | 'drug' | 'cycle' | 'info' }[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const metronomeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // --- ALGORITHM WIZARD STATE ---
  const [mainAlgorithm, setMainAlgorithm] = useState<'rcp' | 'brady' | 'tachy'>('rcp');
  
  // RCP Sub-states
  const [rcpType, setRcpType] = useState<'shockable' | 'non_shockable'>('shockable');
  const [rcpStep, setRcpTypeStep] = useState(1); // Step in the flow

  // Brady Sub-states
  const [bradyPerfusion, setBradyPerfusion] = useState<'good' | 'poor'>('poor');
  const [bradyCprNeeded, setBradyCprNeeded] = useState<boolean | null>(null);

  // Tachy Sub-states
  const [tachyQrs, setTachyQrs] = useState<'narrow' | 'wide'>('narrow');
  const [tachyType, setTachyType] = useState<'svt' | 'sinus' | 'vt'>('svt');

  // --- CPR TIMER LOGIC ---
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            // Cycle finished!
            handleCycleComplete();
            return 120;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning]);

  const handleCycleComplete = () => {
    setCprCycles((prev) => prev + 1);
    addTimelineEvent(`Ciclo ${cprCycles + 1} de RCP completado. Evaluar ritmo y pulso.`, 'cycle');
    // Play alert sound if enabled
    if (soundEnabled) {
      playBeep(880, 0.5); // High pitch alert
    }
  };

  const toggleTimer = () => {
    if (!timerRunning && timelineEvents.length === 0) {
      addTimelineEvent('Inicio de reanimación PALS.', 'info');
    }
    setTimerRunning(!timerRunning);
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setSecondsLeft(120);
    setCprCycles(0);
    setTimelineEvents([]);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // --- METRONOME LOGIC (110 BPM) ---
  useEffect(() => {
    if (metronomeActive) {
      const intervalMs = 60000 / 110; // 110 beats per minute
      metronomeIntervalRef.current = setInterval(() => {
        if (soundEnabled) {
          playBeep(1200, 0.05); // Short high pitch click
        }
      }, intervalMs);
    } else {
      if (metronomeIntervalRef.current) clearInterval(metronomeIntervalRef.current);
    }

    return () => {
      if (metronomeIntervalRef.current) clearInterval(metronomeIntervalRef.current);
    };
  }, [metronomeActive, soundEnabled]);

  const playBeep = (freq: number, duration: number) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.error('Audio metronome error:', e);
    }
  };

  const addTimelineEvent = (text: string, type: 'shock' | 'drug' | 'cycle' | 'info') => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setTimelineEvents((prev) => [{ time: timeStr, text, type }, ...prev]);
  };

  // --- CALCULATED PALS DOSES ---
  const getPalsDoses = () => {
    // Defibrillation
    const shock1J = weightKg * 2;
    const shock2J = weightKg * 4;
    const shockMaxJ = Math.min(360, weightKg * 10); // Max 10 J/kg or adult dose (360J)

    // Cardioversion
    const cardio1J = weightKg * 0.5;
    const cardioMaxJ = weightKg * 2;

    // Epinephrine (0.01 mg/kg IV/IO -> 0.1 mL/kg of 1:10,000 dilution)
    const epiMg = weightKg * 0.01;
    const epiMl = weightKg * 0.1; // 1:10,000 dilution is 0.1 mg/mL

    // Amiodarone (5 mg/kg bolus)
    const amioMg = weightKg * 5;
    const amioClampedMg = Math.min(300, amioMg);

    // Lidocaine (1 mg/kg loading)
    const lidoMg = weightKg * 1;

    // Adenosine (1st dose: 0.1 mg/kg [max 6mg], 2nd dose: 0.2 mg/kg [max 12mg])
    const adeno1Mg = Math.min(6, weightKg * 0.1);
    const adeno2Mg = Math.min(12, weightKg * 0.2);

    // Atropine (0.02 mg/kg, min 0.1mg, max single dose 0.5mg)
    const atropineMg = Math.max(0.1, Math.min(0.5, weightKg * 0.02));

    return {
      shock1J: parseFloat(shock1J.toFixed(0)),
      shock2J: parseFloat(shock2J.toFixed(0)),
      shockMaxJ: parseFloat(shockMaxJ.toFixed(0)),
      cardio1J: parseFloat(cardio1J.toFixed(1)),
      cardioMaxJ: parseFloat(cardioMaxJ.toFixed(0)),
      epiMg: parseFloat(epiMg.toFixed(3)),
      epiMl: parseFloat(epiMl.toFixed(1)),
      amioMg: parseFloat(amioClampedMg.toFixed(0)),
      lidoMg: parseFloat(lidoMg.toFixed(1)),
      adeno1Mg: parseFloat(adeno1Mg.toFixed(2)),
      adeno2Mg: parseFloat(adeno2Mg.toFixed(2)),
      atropineMg: parseFloat(atropineMg.toFixed(2)),
    };
  };

  const doses = getPalsDoses();

  const handleRecordShock = (joules: number) => {
    addTimelineEvent(`⚡ Desfibrilación administrada: ${joules} Joules.`, 'shock');
  };

  const handleRecordDrug = (drugName: string, doseStr: string) => {
    addTimelineEvent(`💊 Fármaco administrado: ${drugName} (${doseStr}).`, 'drug');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* --- LEFT COLUMN: CPR TIMER, METRONOME & TIMELINE (4 COLS) --- */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* CPR Control Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-5 transition-colors">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm md:text-base flex items-center gap-2">
              <Clock className="h-5 w-5 text-rose-500" />
              Cronómetro de RCP
            </h3>
            <span className="bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-rose-100 dark:border-rose-900/40">
              Ciclos de 2 min
            </span>
          </div>

          {/* Time Display */}
          <div className="text-center space-y-1">
            <span className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Tiempo Restante del Ciclo</span>
            <div className="text-5xl md:text-6xl font-mono font-extrabold text-slate-900 dark:text-white tracking-tight">
              {formatTime(secondsLeft)}
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-bold mt-2">
              <span>Ciclos Completados:</span>
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2.5 py-0.5 rounded-lg font-mono text-sm border border-slate-200 dark:border-slate-700">
                {cprCycles}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-rose-500 h-full transition-all duration-1000"
              style={{ width: `${(secondsLeft / 120) * 100}%` }}
            ></div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={toggleTimer}
              className={clsx(
                'py-3 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer border shadow-sm',
                timerRunning
                  ? 'bg-amber-500 border-amber-500 text-white hover:bg-amber-600'
                  : 'bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700'
              )}
            >
              {timerRunning ? (
                <>
                  <Pause className="h-4 w-4" />
                  Pausar
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Iniciar
                </>
              )}
            </button>

            <button
              onClick={() => {
                setSecondsLeft(120);
                if (timerRunning) {
                  addTimelineEvent('Ciclo de RCP reiniciado manualmente.', 'info');
                }
              }}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 py-3 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
              Reiniciar
            </button>

            <button
              onClick={resetTimer}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 py-3 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              Reset Todo
            </button>
          </div>

          {/* Metronome Control */}
          <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={clsx(
                'p-2 rounded-xl border transition-all',
                metronomeActive 
                  ? 'bg-rose-500/10 border-rose-200 text-rose-600 dark:text-rose-400 animate-pulse' 
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
              )}>
                <HeartPulse className="h-4 w-4" />
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">Metrónomo (110 LPM)</span>
                <span className="block text-[10px] text-slate-400 dark:text-slate-500">Guía de Compresiones CPR</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {/* Sound Toggle */}
              <button
                onClick={() => setSoundActive(!soundEnabled)}
                className={clsx(
                  'p-2 rounded-lg border transition-all cursor-pointer',
                  soundEnabled
                    ? 'bg-sky-500 border-sky-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                )}
                title={soundEnabled ? 'Silenciar sonido' : 'Activar sonido'}
              >
                {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
              </button>
              {/* Metronome Toggle */}
              <button
                onClick={() => setMetronomeActive(!metronomeActive)}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer',
                  metronomeActive
                    ? 'bg-rose-600 border-rose-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                )}
              >
                {metronomeActive ? 'Detener' : 'Activar'}
              </button>
            </div>
          </div>
        </div>

        {/* Timeline Events Log */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 transition-colors">
          <h4 className="font-bold text-slate-900 dark:text-white text-xs md:text-sm uppercase tracking-wider text-slate-400 dark:text-slate-500">Registro de Eventos</h4>
          
          <div className="max-h-48 overflow-y-auto space-y-2.5 pr-1 font-medium">
            {timelineEvents.length === 0 ? (
              <p className="text-center text-xs text-slate-400 dark:text-slate-600 py-6">No hay eventos registrados aún en este ciclo.</p>
            ) : (
              timelineEvents.map((evt, idx) => (
                <div 
                  key={idx} 
                  className={clsx(
                    'p-2.5 rounded-xl text-[11px] leading-relaxed border flex items-start gap-2 animate-fade-in',
                    evt.type === 'shock' ? 'bg-amber-50 dark:bg-amber-950/10 border-amber-100 dark:border-amber-900/20 text-amber-900 dark:text-amber-400' :
                    evt.type === 'drug' ? 'bg-rose-50 dark:bg-rose-950/10 border-rose-100 dark:border-rose-900/20 text-rose-900 dark:text-rose-400' :
                    evt.type === 'cycle' ? 'bg-sky-50 dark:bg-sky-950/10 border-sky-100 dark:border-sky-900/20 text-sky-900 dark:text-sky-400' :
                    'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-900 text-slate-700 dark:text-slate-300'
                  )}
                >
                  <span className="font-mono font-bold text-[10px] text-slate-400 dark:text-slate-500 shrink-0 mt-0.5">{evt.time}</span>
                  <span>{evt.text}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* --- RIGHT COLUMN: ACTIVE ALGORITHM WIZARD (8 COLS) --- */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Main Algorithm Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setMainAlgorithm('rcp')}
            className={clsx(
              'flex-1 py-3 text-xs md:text-sm font-bold border-b-2 transition-all cursor-pointer text-center',
              mainAlgorithm === 'rcp'
                ? 'border-rose-600 dark:border-rose-500 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            )}
          >
            Paro Cardiorrespiratorio (RCP)
          </button>
          <button
            onClick={() => setMainAlgorithm('brady')}
            className={clsx(
              'flex-1 py-3 text-xs md:text-sm font-bold border-b-2 transition-all cursor-pointer text-center',
              mainAlgorithm === 'brady'
                ? 'border-rose-600 dark:border-rose-500 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            )}
          >
            Bradicardia con Pulso
          </button>
          <button
            onClick={() => setMainAlgorithm('tachy')}
            className={clsx(
              'flex-1 py-3 text-xs md:text-sm font-bold border-b-2 transition-all cursor-pointer text-center',
              mainAlgorithm === 'tachy'
                ? 'border-rose-600 dark:border-rose-500 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            )}
          >
            Taquicardia con Pulso
          </button>
        </div>

        {/* --- ALGORITHM 1: PARO CARDIORRESPIRATORIO (RCP) --- */}
        {mainAlgorithm === 'rcp' && (
          <div className="space-y-6">
            {/* Toggle Shockable vs Non-Shockable */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between transition-colors">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Tipo de Ritmo Identificado:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setRcpType('shockable');
                    setRcpTypeStep(1);
                  }}
                  className={clsx(
                    'px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer',
                    rcpType === 'shockable'
                      ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                  )}
                >
                  ⚡ Desfibrilable (FV / TVSP)
                </button>
                <button
                  onClick={() => {
                    setRcpType('non_shockable');
                    setRcpTypeStep(1);
                  }}
                  className={clsx(
                    'px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer',
                    rcpType === 'non_shockable'
                      ? 'bg-slate-800 dark:bg-slate-700 border-slate-800 dark:border-slate-700 text-white shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                  )}
                >
                  Asistolia / AESP (No Desfibrilable)
                </button>
              </div>
            </div>

            {/* Step-by-Step Wizard Content */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6 transition-colors">
              
              {/* SHOCKABLE FLOW (FV / TVSP) */}
              {rcpType === 'shockable' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm md:text-base">
                      Flujo: Ritmo Desfibrilable (FV / TVSP)
                    </h4>
                    <span className="bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-100 dark:border-amber-900/40">
                      Paso {rcpStep} de 4
                    </span>
                  </div>

                  {rcpStep === 1 && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="bg-rose-50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/20 p-4 rounded-2xl space-y-2">
                        <span className="text-xs font-extrabold text-rose-700 dark:text-rose-400 uppercase tracking-wider block">Acción Inmediata 1</span>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Iniciar RCP de alta calidad de inmediato.</p>
                        <ul className="list-disc pl-5 text-xs text-slate-600 dark:text-slate-300 space-y-1 font-medium">
                          <li>Administrar Oxígeno libre.</li>
                          <li>Conectar el monitor/desfibrilador.</li>
                        </ul>
                      </div>

                      <div className="bg-amber-50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/20 p-4 rounded-2xl space-y-3">
                        <span className="text-xs font-extrabold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">Acción Inmediata 2: Descarga 1</span>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Cargar desfibrilador y administrar descarga.</p>
                        
                        <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-amber-200 dark:border-amber-900/30 text-center">
                          <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">Energía Recomendada (2 J/kg)</span>
                          <span className="text-2xl font-mono font-extrabold text-amber-600 dark:text-amber-400 mt-1 block">
                            {doses.shock1J} Joules
                          </span>
                        </div>

                        <button
                          onClick={() => handleRecordShock(doses.shock1J)}
                          className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <Zap className="h-4 w-4" />
                          Registrar Descarga de {doses.shock1J} J
                        </button>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-900 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                        <strong className="text-slate-800 dark:text-slate-200">Siguiente paso:</strong> Reanudar RCP inmediatamente por 2 minutos sin evaluar ritmo ni pulso. Haz clic en "Siguiente Paso" cuando el ciclo termine.
                      </div>
                    </div>
                  )}

                  {rcpStep === 2 && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="bg-rose-50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/20 p-4 rounded-2xl space-y-2">
                        <span className="text-xs font-extrabold text-rose-700 dark:text-rose-400 uppercase tracking-wider block">Acción Inmediata 1</span>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">RCP por 2 minutos + Obtener acceso IV/IO.</p>
                      </div>

                      <div className="bg-amber-50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/20 p-4 rounded-2xl space-y-3">
                        <span className="text-xs font-extrabold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">Acción Inmediata 2: Descarga 2</span>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Si persiste FV/TVSP, administrar segunda descarga.</p>
                        
                        <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-amber-200 dark:border-amber-900/30 text-center">
                          <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">Energía Recomendada (4 J/kg)</span>
                          <span className="text-2xl font-mono font-extrabold text-amber-600 dark:text-amber-400 mt-1 block">
                            {doses.shock2J} Joules
                          </span>
                        </div>

                        <button
                          onClick={() => handleRecordShock(doses.shock2J)}
                          className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <Zap className="h-4 w-4" />
                          Registrar Descarga de {doses.shock2J} J
                        </button>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-900 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                        <strong className="text-slate-800 dark:text-slate-200">Siguiente paso:</strong> Reanudar RCP de inmediato. En el siguiente ciclo se considerará la administración de Adrenalina.
                      </div>
                    </div>
                  )}

                  {rcpStep === 3 && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="bg-rose-50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/20 p-4 rounded-2xl space-y-3">
                        <span className="text-xs font-extrabold text-rose-700 dark:text-rose-400 uppercase tracking-wider block">Acción Farmacológica: Adrenalina</span>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Administrar Adrenalina cada 3-5 minutos.</p>
                        
                        <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-rose-200 dark:border-rose-900/30 text-center">
                          <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">Dosis (0.01 mg/kg IV/IO)</span>
                          <span className="text-xl font-mono font-extrabold text-rose-600 dark:text-rose-400 mt-1 block">
                            {doses.epiMg} mg • {doses.epiMl} mL
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">
                            (Dilución estándar 1:10,000 o 0.1 mg/mL)
                          </span>
                        </div>

                        <button
                          onClick={() => handleRecordDrug('Adrenalina', `${doses.epiMg} mg / ${doses.epiMl} mL`)}
                          className="w-full bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          💊 Registrar Adrenalina
                        </button>
                      </div>

                      <div className="bg-amber-50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/20 p-4 rounded-2xl space-y-3">
                        <span className="text-xs font-extrabold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">Acción de Choque: Descarga 3</span>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Si persiste FV/TVSP, administrar tercera descarga.</p>
                        
                        <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-amber-200 dark:border-amber-900/30 text-center">
                          <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">Energía Recomendada (&ge; 4 J/kg)</span>
                          <span className="text-2xl font-mono font-extrabold text-amber-600 dark:text-amber-400 mt-1 block">
                            {doses.shock2J} Joules
                          </span>
                        </div>

                        <button
                          onClick={() => handleRecordShock(doses.shock2J)}
                          className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <Zap className="h-4 w-4" />
                          Registrar Descarga de {doses.shock2J} J
                        </button>
                      </div>
                    </div>
                  )}

                  {rcpStep === 4 && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="bg-rose-50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/20 p-4 rounded-2xl space-y-3">
                        <span className="text-xs font-extrabold text-rose-700 dark:text-rose-400 uppercase tracking-wider block">Acción Antiarrítmica</span>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Administrar Amiodarona o Lidocaina para FV/TVSP refractaria.</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-rose-200 dark:border-rose-900/30 text-center">
                            <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">Amiodarona (5 mg/kg IV/IO)</span>
                            <span className="text-lg font-mono font-extrabold text-rose-600 dark:text-rose-400 mt-1 block">
                              {doses.amioMg} mg
                            </span>
                            <span className="text-[9px] text-slate-400 dark:text-slate-500 block mt-1">
                              (Se puede repetir hasta 3 veces)
                            </span>
                            <button
                              onClick={() => handleRecordDrug('Amiodarona', `${doses.amioMg} mg`)}
                              className="w-full bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/20 border border-rose-200 dark:border-rose-900/40 py-1.5 rounded-lg text-[10px] font-bold mt-2 cursor-pointer"
                            >
                              Registrar Amio
                            </button>
                          </div>

                          <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-rose-200 dark:border-rose-900/30 text-center">
                            <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">Lidocaína (1 mg/kg IV/IO)</span>
                            <span className="text-lg font-mono font-extrabold text-rose-600 dark:text-rose-400 mt-1 block">
                              {doses.lidoMg} mg
                            </span>
                            <span className="text-[9px] text-slate-400 dark:text-slate-500 block mt-1">
                              (Mantenimiento: 20-50 mcg/kg/min)
                            </span>
                            <button
                              onClick={() => handleRecordDrug('Lidocaína', `${doses.lidoMg} mg`)}
                              className="w-full bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/20 border border-rose-200 dark:border-rose-900/40 py-1.5 rounded-lg text-[10px] font-bold mt-2 cursor-pointer"
                            >
                              Registrar Lido
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="bg-amber-50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/20 p-4 rounded-2xl space-y-3">
                        <span className="text-xs font-extrabold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">Acción de Choque: Descarga 4+</span>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Si persiste FV/TVSP, administrar descarga subsiguiente.</p>
                        
                        <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-amber-200 dark:border-amber-900/30 text-center">
                          <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">Energía Recomendada (Hasta 10 J/kg)</span>
                          <span className="text-2xl font-mono font-extrabold text-amber-600 dark:text-amber-400 mt-1 block">
                            {doses.shockMaxJ} Joules
                          </span>
                        </div>

                        <button
                          onClick={() => handleRecordShock(doses.shockMaxJ)}
                          className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <Zap className="h-4 w-4" />
                          Registrar Descarga de {doses.shockMaxJ} J
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons inside Wizard */}
                  <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                    <button
                      onClick={() => setRcpTypeStep((prev) => Math.max(1, prev - 1))}
                      disabled={rcpStep === 1}
                      className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-30 cursor-pointer"
                    >
                      Atrás
                    </button>
                    <button
                      onClick={() => setRcpTypeStep((prev) => Math.min(4, prev + 1))}
                      disabled={rcpStep === 4}
                      className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      Siguiente Paso
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* NON-SHOCKABLE FLOW (Asistolia / AESP) */}
              {rcpType === 'non_shockable' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm md:text-base">
                      Flujo: Ritmo No Desfibrilable (Asistolia / AESP)
                    </h4>
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                      Paso {rcpStep} de 2
                    </span>
                  </div>

                  {rcpStep === 1 && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="bg-rose-50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/20 p-4 rounded-2xl space-y-3">
                        <span className="text-xs font-extrabold text-rose-700 dark:text-rose-400 uppercase tracking-wider block">Acción Farmacológica Prioritaria</span>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Administrar Adrenalina lo antes posible (IV/IO).</p>
                        
                        <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-rose-200 dark:border-rose-900/30 text-center">
                          <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">Dosis (0.01 mg/kg IV/IO)</span>
                          <span className="text-xl font-mono font-extrabold text-rose-600 dark:text-rose-400 mt-1 block">
                            {doses.epiMg} mg • {doses.epiMl} mL
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">
                            (Dilución estándar 1:10,000 o 0.1 mg/mL)
                          </span>
                        </div>

                        <button
                          onClick={() => handleRecordDrug('Adrenalina', `${doses.epiMg} mg / ${doses.epiMl} mL`)}
                          className="w-full bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          💊 Registrar Adrenalina
                        </button>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-900 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium space-y-2">
                        <p className="font-bold text-slate-800 dark:text-slate-200">Acciones de Soporte:</p>
                        <ul className="list-disc pl-4 space-y-1">
                          <li>Iniciar RCP de alta calidad de inmediato por 2 minutos.</li>
                          <li>Obtener acceso IV/IO.</li>
                          <li>Considerar manejo avanzado de la vía aérea y capnografía.</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {rcpStep === 2 && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="bg-amber-50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/20 p-4 rounded-2xl space-y-2">
                        <span className="text-xs font-extrabold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">Evaluación de Ritmo</span>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Evaluar ritmo tras 2 minutos de RCP.</p>
                        <ul className="list-disc pl-5 text-xs text-slate-600 dark:text-slate-300 space-y-1 font-medium">
                          <li>¿El ritmo se volvió desfibrilable? &rarr; Cambiar a flujo Desfibrilable.</li>
                          <li>¿Sigue en Asistolia/AESP? &rarr; Continuar RCP 2 minutos y repetir Adrenalina cada 3-5 minutos.</li>
                        </ul>
                      </div>

                      <div className="bg-sky-50 dark:bg-sky-950/10 border border-sky-100 dark:border-sky-900/20 p-4 rounded-2xl space-y-2 text-xs text-sky-800 dark:text-sky-300 font-medium">
                        <p className="font-bold mb-1">Buscar y tratar causas reversibles (H y T):</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="block font-bold">6 H's:</span>
                            <ul className="list-disc pl-4 text-[11px] space-y-0.5">
                              <li>Hipovolemia</li>
                              <li>Hipoxia</li>
                              <li>Hidrogeniones (Acidosis)</li>
                              <li>Hipo/Hiperpotasemia</li>
                              <li>Hipotermia</li>
                              <li>Hipoglucemia</li>
                            </ul>
                          </div>
                          <div>
                            <span className="block font-bold">6 T's:</span>
                            <ul className="list-disc pl-4 text-[11px] space-y-0.5">
                              <li>Tensión, neumotórax</li>
                              <li>Taponamiento cardíaco</li>
                              <li>Tóxicos</li>
                              <li>Trombosis pulmonar</li>
                              <li>Trombosis coronaria</li>
                              <li>Trauma</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons inside Wizard */}
                  <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                    <button
                      onClick={() => setRcpTypeStep((prev) => Math.max(1, prev - 1))}
                      disabled={rcpStep === 1}
                      className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-30 cursor-pointer"
                    >
                      Atrás
                    </button>
                    <button
                      onClick={() => setRcpTypeStep((prev) => Math.min(2, prev + 1))}
                      disabled={rcpStep === 2}
                      className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      Siguiente Paso
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- ALGORITHM 2: BRADICARDIA CON PULSO --- */}
        {mainAlgorithm === 'brady' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6 transition-colors">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base md:text-lg">
                Algoritmo de Bradicardia Pediátrica con Pulso
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Para pacientes con FC menor a la esperada para su edad con compromiso hemodinámico</p>
            </div>

            {/* Question 1: Perfusion */}
            <div className="space-y-3">
              <span className="block text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Paso 1: Evaluar Signos de Mala Perfusión</span>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">¿El paciente presenta alteración del estado mental, hipotensión o signos de choque?</p>
              
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setBradyPerfusion('poor');
                    setBradyCprNeeded(null);
                  }}
                  className={clsx(
                    'flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer',
                    bradyPerfusion === 'poor'
                      ? 'bg-rose-600 border-rose-600 text-white shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                  )}
                >
                  ⚠️ Sí, mala perfusión
                </button>
                <button
                  onClick={() => {
                    setBradyPerfusion('good');
                    setBradyCprNeeded(null);
                  }}
                  className={clsx(
                    'flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer',
                    bradyPerfusion === 'good'
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                  )}
                >
                  ✅ No, perfusión adecuada
                </button>
              </div>
            </div>

            {/* Flow based on Perfusion */}
            {bradyPerfusion === 'good' ? (
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-4 space-y-2 animate-fade-in">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  <h4 className="font-bold text-sm">Conducta Recomendada: Soporte y Observación</h4>
                </div>
                <ul className="list-disc pl-5 text-xs text-slate-600 dark:text-slate-400 space-y-1 font-medium">
                  <li>Asegurar vía aérea (O2 si es necesario).</li>
                  <li>Monitorear signos vitales y ECG continuamente.</li>
                  <li>Buscar y tratar causas subyacentes.</li>
                  <li>Consultar a especialista en cardiología pediátrica.</li>
                </ul>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                {/* Question 2: CPR trigger */}
                <div className="bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100/50 dark:border-rose-900/20 p-4 rounded-2xl space-y-3">
                  <span className="block text-xs font-extrabold text-rose-700 dark:text-rose-400 uppercase tracking-wider">Paso 2: Evaluar Frecuencia Cardíaca</span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-bold">¿La Frecuencia Cardíaca es menor a 60 LPM a pesar de oxigenación y ventilación adecuadas?</p>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setBradyCprNeeded(true)}
                      className={clsx(
                        'flex-1 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer',
                        bradyCprNeeded === true
                          ? 'bg-rose-600 border-rose-600 text-white'
                          : 'bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                      )}
                    >
                      🚨 Sí (FC &lt; 60)
                    </button>
                    <button
                      onClick={() => setBradyCprNeeded(false)}
                      className={clsx(
                        'flex-1 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer',
                        bradyCprNeeded === false
                          ? 'bg-slate-800 dark:bg-slate-700 text-white'
                          : 'bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                      )}
                    >
                      No (FC &ge; 60)
                    </button>
                  </div>
                </div>

                {bradyCprNeeded === true && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="bg-rose-600 text-white p-4 rounded-2xl space-y-1.5 shadow-sm">
                      <h4 className="font-bold text-sm flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        ¡INDICACIÓN ABSOLUTA DE RCP!
                      </h4>
                      <p className="text-xs leading-relaxed font-medium">
                        Iniciar compresiones torácicas de inmediato. En pediatría, una FC &lt; 60 con mala perfusión a pesar de ventilación se trata como paro cardíaco.
                      </p>
                    </div>

                    {/* Drug Calculations for Bradycardia */}
                    <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-4">
                      <span className="block text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Fármacos para Bradicardia</span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Epinephrine */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3.5 rounded-xl text-center space-y-2">
                          <span className="block text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase">Adrenalina (Primera Elección)</span>
                          <span className="text-lg font-mono font-extrabold text-slate-900 dark:text-white block">
                            {doses.epiMg} mg • {doses.epiMl} mL
                          </span>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 block leading-tight">
                            Dosis: 0.01 mg/kg (1:10,000) IV/IO cada 3-5 minutos.
                          </span>
                          <button
                            onClick={() => handleRecordDrug('Adrenalina (Bradicardia)', `${doses.epiMg} mg / ${doses.epiMl} mL`)}
                            className="w-full bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/20 border border-rose-200 dark:border-rose-900/40 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer"
                          >
                            Registrar Adrenalina
                          </button>
                        </div>

                        {/* Atropine */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3.5 rounded-xl text-center space-y-2">
                          <span className="block text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase">Atropina (Tono vagal o Bloqueo AV)</span>
                          <span className="text-lg font-mono font-extrabold text-slate-900 dark:text-white block">
                            {doses.atropineMg} mg
                          </span>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 block leading-tight">
                            Dosis: 0.02 mg/kg IV/IO (Mín: 0.1 mg, Máx: 0.5 mg). Se puede repetir una vez.
                          </span>
                          <button
                            onClick={() => handleRecordDrug('Atropina (Bradicardia)', `${doses.atropineMg} mg`)}
                            className="w-full bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/20 border border-sky-200 dark:border-sky-900/40 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer"
                          >
                            Registrar Atropina
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {bradyCprNeeded === false && (
                  <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-4 space-y-2 animate-fade-in text-xs text-slate-600 dark:text-slate-300 font-medium">
                    <p className="font-bold text-amber-800 dark:text-amber-400">Conducta Recomendada:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Apoyar vía aérea, ventilación y administrar oxígeno si es necesario.</li>
                      <li>Monitorear continuamente.</li>
                      <li>Si la FC cae por debajo de 60 con mala perfusión, reevaluar inicio de RCP.</li>
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* --- ALGORITHM 3: TAQUICARDIA CON PULSO --- */}
        {mainAlgorithm === 'tachy' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6 transition-colors">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base md:text-lg">
                Algoritmo de Taquicardia Pediátrica con Pulso
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Para pacientes con frecuencias cardíacas elevadas y pulso palpable</p>
            </div>

            {/* Step 1: QRS Width */}
            <div className="space-y-3">
              <span className="block text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Paso 1: Duración del Complejo QRS</span>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Evaluar el ancho del QRS en el monitor/ECG:</p>
              
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setTachyQrs('narrow');
                    setTachyType('svt');
                  }}
                  className={clsx(
                    'flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer',
                    tachyQrs === 'narrow'
                      ? 'bg-sky-600 border-sky-600 text-white shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                  )}
                >
                  Complejo Estrecho (&le; 0.09s)
                </button>
                <button
                  onClick={() => {
                    setTachyQrs('wide');
                    setTachyType('vt');
                  }}
                  className={clsx(
                    'flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer',
                    tachyQrs === 'wide'
                      ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                  )}
                >
                  Complejo Ancho (&gt; 0.09s)
                </button>
              </div>
            </div>

            {/* NARROW QRS FLOW */}
            {tachyQrs === 'narrow' && (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-900 space-y-3">
                  <span className="block text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Paso 2: Diferenciar TS vs SVT</span>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTachyType('svt')}
                      className={clsx(
                        'flex-1 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer',
                        tachyType === 'svt'
                          ? 'bg-sky-600 border-sky-600 text-white'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                      )}
                    >
                      SVT (Taquicardia Supraventricular)
                    </button>
                    <button
                      onClick={() => setTachyType('sinus')}
                      className={clsx(
                        'flex-1 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer',
                        tachyType === 'sinus'
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                      )}
                    >
                      TS (Taquicardia Sinusal)
                    </button>
                  </div>
                </div>

                {tachyType === 'sinus' && (
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-4 space-y-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
                    <h4 className="font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" /> Criterios de Taquicardia Sinusal (TS):
                    </h4>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Frecuencia: Lactantes &lt; 220 LPM, Niños &lt; 180 LPM.</li>
                      <li>Ondas P presentes y normales. Intervalo PR variable.</li>
                      <li>Historia compatible con deshidratación, fiebre, dolor, etc.</li>
                      <li><strong className="text-slate-800 dark:text-slate-200">Conducta:</strong> Tratar la causa de fondo (líquidos, antipiréticos, analgesia).</li>
                    </ul>
                  </div>
                )}

                {tachyType === 'svt' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="bg-sky-50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/30 rounded-2xl p-4 space-y-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
                      <h4 className="font-bold text-sky-800 dark:text-sky-400 flex items-center gap-1.5">
                        <Info className="h-4 w-4" /> Criterios de SVT:
                      </h4>
                      <ul className="list-disc pl-4 space-y-0.5">
                        <li>Frecuencia: Lactantes &ge; 220 LPM, Niños &ge; 180 LPM.</li>
                        <li>Ondas P ausentes o anormales. Inicio súbito.</li>
                      </ul>
                    </div>

                    {/* SVT Treatment options */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-4">
                      <span className="block text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Tratamientos para SVT</span>
                      
                      <div className="space-y-3">
                        {/* Vagal */}
                        <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-900 text-xs text-slate-600 dark:text-slate-300">
                          <strong className="text-slate-800 dark:text-slate-200">1. Maniobras Vagales:</strong> Aplicar hielo en la cara (lactantes) o soplar a través de una jeringa (niños). Solo si el paciente está hemodinámicamente estable. No retrasar el tratamiento farmacológico.
                        </div>

                        {/* Adenosine */}
                        <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-100 dark:border-slate-900 space-y-3">
                          <span className="block text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase">2. Adenosina (Si hay acceso IV/IO)</span>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-center">
                              <span className="block text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase">1ª Dosis (0.1 mg/kg)</span>
                              <span className="text-base font-mono font-bold text-slate-900 dark:text-white mt-1 block">
                                {doses.adeno1Mg} mg
                              </span>
                              <span className="text-[8px] text-slate-400 dark:text-slate-500 block mt-0.5">(Máx: 6 mg)</span>
                              <button
                                onClick={() => handleRecordDrug('Adenosina (1ª Dosis)', `${doses.adeno1Mg} mg`)}
                                className="w-full bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/20 border border-sky-200 dark:border-sky-900/40 py-1 rounded text-[9px] font-bold mt-1.5 cursor-pointer"
                              >
                                Registrar 1ª Dosis
                              </button>
                            </div>

                            <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-center">
                              <span className="block text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase">2ª Dosis (0.2 mg/kg)</span>
                              <span className="text-base font-mono font-bold text-slate-900 dark:text-white mt-1 block">
                                {doses.adeno2Mg} mg
                              </span>
                              <span className="text-[8px] text-slate-400 dark:text-slate-500 block mt-0.5">(Máx: 12 mg)</span>
                              <button
                                onClick={() => handleRecordDrug('Adenosina (2ª Dosis)', `${doses.adeno2Mg} mg`)}
                                className="w-full bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/20 border border-sky-200 dark:border-sky-900/40 py-1 rounded text-[9px] font-bold mt-1.5 cursor-pointer"
                              >
                                Registrar 2ª Dosis
                              </button>
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed font-medium">
                            * Administrar por vía IV/IO rápida (técnica de 2 jeringas) seguida inmediatamente de un bolo de solución salina de 5-10 mL.
                          </p>
                        </div>

                        {/* Cardioversion */}
                        <div className="bg-amber-50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/20 p-3.5 rounded-xl space-y-3">
                          <span className="block text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase">3. Cardioversión Sincrónica (Inestable o sin acceso)</span>
                          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">Indicada de inmediato si el paciente presenta signos de choque o mala perfusión grave.</p>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-amber-200 dark:border-amber-900/30 text-center">
                              <span className="block text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase">Dosis Inicial (0.5 - 1 J/kg)</span>
                              <span className="text-base font-mono font-bold text-slate-900 dark:text-white mt-1 block">
                                {doses.cardio1J} a {doses.cardioMaxJ} J
                              </span>
                            </div>
                            <div className="bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-amber-200 dark:border-amber-900/30 text-center">
                              <span className="block text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase">Dosis Subsiguiente (2 J/kg)</span>
                              <span className="text-base font-mono font-bold text-slate-900 dark:text-white mt-1 block">
                                {doses.cardioMaxJ} J
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleRecordShock(doses.cardio1J)}
                            className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                          >
                            ⚡ Registrar Cardioversión de {doses.cardio1J} J
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* WIDE QRS FLOW */}
            {tachyQrs === 'wide' && (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-4 space-y-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
                  <h4 className="font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4" /> Taquicardia de Complejo Ancho (Sugerente de TV):
                  </h4>
                  <p>Riesgo inminente de deterioro a paro cardíaco. Requiere monitoreo estricto y preparación para cardioversión.</p>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-4">
                  <span className="block text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Tratamiento de Taquicardia Ventricular (TV) con Pulso</span>
                  
                  <div className="space-y-3">
                    {/* Cardioversion */}
                    <div className="bg-amber-50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/20 p-3.5 rounded-xl space-y-3">
                      <span className="block text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase">1. Cardioversión Sincrónica (Inestable)</span>
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">Si hay signos de mala perfusión o inestabilidad hemodinámica, realizar cardioversión sincrónica de inmediato.</p>
                      
                      <div className="bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-amber-200 dark:border-amber-900/30 text-center">
                        <span className="block text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase">Dosis Inicial Recomendada (0.5 - 1 J/kg)</span>
                        <span className="text-lg font-mono font-bold text-slate-900 dark:text-white mt-1 block">
                          {doses.cardio1J} a {doses.cardioMaxJ} J
                        </span>
                      </div>

                      <button
                        onClick={() => handleRecordShock(doses.cardio1J)}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        ⚡ Registrar Cardioversión de {doses.cardio1J} J
                      </button>
                    </div>

                    {/* Amiodarone */}
                    <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-100 dark:border-slate-900 space-y-3">
                      <span className="block text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase">2. Amiodarona (Estable con acceso IV/IO)</span>
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">Si el paciente está estable, se puede intentar infusión de Amiodarona.</p>
                      
                      <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-center">
                        <span className="block text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase">Dosis (5 mg/kg IV/IO en 20-60 minutos)</span>
                        <span className="text-base font-mono font-bold text-slate-900 dark:text-white mt-1 block">
                          {doses.amioMg} mg
                        </span>
                      </div>

                      <button
                        onClick={() => handleRecordDrug('Amiodarona (TV)', `${doses.amioMg} mg`)}
                        className="w-full bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/20 border border-rose-200 dark:border-rose-900/40 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer"
                      >
                        Registrar Amiodarona
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Scientific Reference Alert */}
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-[10px] md:text-xs text-slate-500 dark:text-slate-400 leading-relaxed transition-colors">
          <p className="font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            Sustento Científico y Guías Clínicas de Referencia:
          </p>
          <p>
            Los algoritmos de RCP, bradicardia y taquicardia pediátrica, así como las dosis de desfibrilación, cardioversión y fármacos de soporte vital avanzado, se basan estrictamente en las directrices de la <strong className="text-slate-700 dark:text-slate-300">American Heart Association (AHA) para Soporte Vital Avanzado Pediátrico (PALS)</strong>, actualizadas según los consensos de ciencia de reanimación más recientes.
          </p>
        </div>
      </div>
    </div>
  );
}
