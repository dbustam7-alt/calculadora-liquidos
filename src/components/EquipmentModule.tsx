'use client';

import React from 'react';
import { usePatient } from '@/context/PatientContext';
import { 
  Activity, 
  ChevronRight, 
  Wrench, 
  ShieldAlert, 
  CheckCircle, 
  Info,
  Layers,
  ArrowRight,
  User,
  HeartPulse
} from 'lucide-react';
import ClinicalAlert from './ClinicalAlert';

export default function EquipmentModule() {
  const { ageMonths, weightKg } = usePatient();
  const ageYears = ageMonths / 12;

  // --- 1. TUBO ENDOTRAQUEAL (TET) CALCULATIONS ---
  const getTetCalculations = () => {
    // Under 1 year (neonates / infants)
    if (ageMonths < 12) {
      if (weightKg < 1.0) {
        return {
          uncuffed: '2.5 mm',
          cuffed: 'No recomendado (<1 kg)',
          depthOral: '6.0 - 6.5 cm',
          depthNasal: '8.0 - 8.5 cm',
          note: 'Basado en peso extremadamente bajo al nacer (<1000 g).'
        };
      } else if (weightKg >= 1.0 && weightKg < 2.0) {
        return {
          uncuffed: '3.0 mm',
          cuffed: 'No recomendado (1-2 kg)',
          depthOral: '7.0 - 7.5 cm',
          depthNasal: '9.0 - 9.5 cm',
          note: 'Basado en peso muy bajo al nacer (1000 - 2000 g).'
        };
      } else if (weightKg >= 2.0 && weightKg < 3.0) {
        return {
          uncuffed: '3.0 - 3.5 mm',
          cuffed: '3.0 mm (Ultra-bajo perfil)',
          depthOral: '8.0 - 8.5 cm',
          depthNasal: '10.0 - 10.5 cm',
          note: 'Basado en peso al nacer >2000 g.'
        };
      } else {
        // 3kg to 10kg, < 1 year
        return {
          uncuffed: '3.5 mm',
          cuffed: '3.0 mm',
          depthOral: '9.0 cm',
          depthNasal: '11.0 cm',
          note: 'Lactante menor de 1 año.'
        };
      }
    }

    // ≥ 1 year and < 2 years
    if (ageYears >= 1 && ageYears < 2) {
      return {
        uncuffed: '4.0 mm',
        cuffed: '3.5 mm',
        depthOral: '10.0 - 10.5 cm',
        depthNasal: '12.0 - 12.5 cm',
        note: 'Lactante mayor (12-24 meses).'
      };
    }

    // ≥ 2 years (Cole & Motoyama formulas)
    // Uncuffed = Age/4 + 4
    const uncuffedSize = parseFloat((ageYears / 4 + 4).toFixed(1));
    // Cuffed = Age/4 + 3.5
    const cuffedSize = parseFloat((ageYears / 4 + 3.5).toFixed(1));

    // Depth = Size * 3 or Age/2 + 12
    const depthOralMin = parseFloat((uncuffedSize * 3).toFixed(1));
    const depthOralMax = parseFloat((ageYears / 2 + 12).toFixed(1));
    const depthOralStr = `${depthOralMin} cm (o ${depthOralMax.toFixed(1)} cm)`;
    const depthNasalStr = `${parseFloat((uncuffedSize * 3 + 2).toFixed(1))} cm`;

    return {
      uncuffed: `${uncuffedSize} mm`,
      cuffed: `${cuffedSize} mm`,
      depthOral: depthOralStr,
      depthNasal: depthNasalStr,
      note: `Calculado con fórmulas estándar para ≥2 años (Cole: Edad/4 + 4, Motoyama: Edad/4 + 3.5).`
    };
  };

  // --- 2. LARINGOSCOPIO (Miller vs Macintosh) ---
  const getLaryngoscope = () => {
    if (weightKg < 1.5) {
      return {
        type: 'Hoja Recta (Miller)',
        size: 'Tamaño 00',
        description: 'Prematuros extremos o peso muy bajo al nacer.'
      };
    }
    if (ageMonths < 1) {
      return {
        type: 'Hoja Recta (Miller)',
        size: 'Tamaño 0',
        description: 'Neonatos a término.'
      };
    }
    if (ageMonths >= 1 && ageYears < 2) {
      return {
        type: 'Hoja Recta (Miller)',
        size: 'Tamaño 1',
        description: 'Lactantes. Permite deprimir directamente la epiglotis blanda y larga.'
      };
    }
    if (ageYears >= 2 && ageYears < 6) {
      return {
        type: 'Hoja Recta (Miller) o Curva (Macintosh)',
        size: 'Tamaño 2',
        description: 'Preescolares. Se puede usar Miller para control directo de epiglotis o Macintosh en la vallécula.'
      };
    }
    if (ageYears >= 6 && ageYears < 12) {
      return {
        type: 'Hoja Curva (Macintosh) o Recta (Miller)',
        size: 'Tamaño 3',
        description: 'Escolares.'
      };
    }
    // 12 to 18 years
    return {
      type: 'Hoja Curva (Macintosh)',
      size: 'Tamaño 3 o 4',
      description: 'Adolescentes.'
    };
  };

  // --- 3. MÁSCARA LARÍNGEA ---
  const getLaryngealMask = () => {
    if (weightKg < 5) {
      return {
        size: 'Tamaño 1',
        maxCuffVolume: '4 mL',
        note: 'Lactantes pequeños y neonatos (<5 kg).'
      };
    }
    if (weightKg >= 5 && weightKg < 10) {
      return {
        size: 'Tamaño 1.5',
        maxCuffVolume: '7 mL',
        note: 'Lactantes de 5 a 10 kg.'
      };
    }
    if (weightKg >= 10 && weightKg < 20) {
      return {
        size: 'Tamaño 2',
        maxCuffVolume: '10 mL',
        note: 'Niños pequeños de 10 a 20 kg.'
      };
    }
    if (weightKg >= 20 && weightKg < 30) {
      return {
        size: 'Tamaño 2.5',
        maxCuffVolume: '14 mL',
        note: 'Niños de 20 a 30 kg.'
      };
    }
    if (weightKg >= 30 && weightKg <= 50) {
      return {
        size: 'Tamaño 3',
        maxCuffVolume: '20 mL',
        note: 'Escolares de 30 a 50 kg.'
      };
    }
    // > 50 kg
    return {
      size: 'Tamaño 4',
      maxCuffVolume: '30 mL',
      note: 'Adolescentes y adultos pequeños (>50 kg).'
    };
  };

  // --- 4. SONDAS (Foley & Nasogástrica) ---
  const getSondes = () => {
    let foleySize = '';
    let foleyNote = '';
    let sngSize = '';
    let sngNote = '';

    // Foley calculations
    if (ageMonths < 12) {
      foleySize = '5 - 6 Fr';
      foleyNote = 'Lactante menor. Usar catéter de alimentación si no hay Foley disponible.';
    } else if (ageYears >= 1 && ageYears < 2) {
      foleySize = '6 - 8 Fr';
      foleyNote = 'Lactante mayor.';
    } else {
      // (Age * 2) + 2 for older children, or standard ranges
      const calculatedFoley = Math.round(ageYears * 2 + 2);
      // Ensure even size
      const evenFoley = calculatedFoley % 2 === 0 ? calculatedFoley : calculatedFoley - 1;
      const clampedFoley = Math.max(8, Math.min(14, evenFoley));
      foleySize = `${clampedFoley} - ${clampedFoley + 2} Fr`;
      foleyNote = `Calculado con fórmula pediátrica estándar: (Edad × 2) + 2.`;
    }

    // SNG calculations
    if (ageMonths < 12) {
      sngSize = '5 - 6 Fr';
      sngNote = 'Lactante menor.';
    } else if (ageYears >= 1 && ageYears < 2) {
      sngSize = '6 - 8 Fr';
      sngNote = 'Lactante mayor.';
    } else {
      // (Age * 2) + 4
      const calculatedSng = Math.round(ageYears * 2 + 4);
      const evenSng = calculatedSng % 2 === 0 ? calculatedSng : calculatedSng - 1;
      const clampedSng = Math.max(8, Math.min(16, evenSng));
      sngSize = `${clampedSng} - ${clampedSng + 2} Fr`;
      sngNote = `Calculado con fórmula pediátrica estándar: (Edad × 2) + 4.`;
    }

    return {
      foley: { size: foleySize, note: foleyNote },
      sng: { size: sngSize, note: sngNote }
    };
  };

  // --- 5. VASCULAR ACCESS (IV Catheter & Intraosseous) ---
  const getVascularAccess = () => {
    let ivSize = '';
    let ivDesc = '';
    let ioSize = '';
    let ioDesc = '';

    // IV Catheter
    if (weightKg < 3) {
      ivSize = 'G24';
      ivDesc = 'Neonatos prematuros o de muy bajo peso. Acceso sumamente delicado.';
    } else if (weightKg >= 3 && weightKg < 10) {
      ivSize = 'G24 - G22';
      ivDesc = 'Lactantes. Se prefiere G24 para venas del dorso de la mano o pie.';
    } else if (weightKg >= 10 && weightKg < 30) {
      ivSize = 'G22 - G20';
      ivDesc = 'Preescolares y escolares.';
    } else {
      ivSize = 'G20 - G18';
      ivDesc = 'Adolescentes. Permite flujos rápidos de reanimación.';
    }

    // Intraosseous Needle (EZ-IO standard)
    if (weightKg < 40) {
      ioSize = '15 mm (Rosa)';
      ioDesc = 'Pacientes pediátricos <40 kg. Diseñada para evitar perforar la corteza ósea posterior.';
    } else {
      ioSize = '25 mm (Azul)';
      ioDesc = 'Pacientes pediátricos o adolescentes ≥40 kg. Longitud estándar para tejido subcutáneo normal.';
    }

    return {
      iv: { size: ivSize, desc: ivDesc },
      io: { size: ioSize, desc: ioDesc }
    };
  };

  const tet = getTetCalculations();
  const laryngoscope = getLaryngoscope();
  const lma = getLaryngealMask();
  const sondes = getSondes();
  const vascular = getVascularAccess();

  return (
    <div className="space-y-6">
      {/* Alert for age/weight context */}
      <div className="bg-sky-50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/40 rounded-2xl p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
        <div className="text-xs text-sky-800 dark:text-sky-300 font-medium">
          <p className="font-bold mb-0.5 text-sky-900 dark:text-sky-200">
            Parámetros de Entrada Activos: Peso {weightKg} kg • Edad {ageMonths} meses ({ageYears.toFixed(1)} años)
          </p>
          <p className="leading-relaxed">
            Las sugerencias de equipamiento y vía aérea se calculan automáticamente de forma personalizada para la anatomía de este paciente pediátrico.
          </p>
        </div>
      </div>

      {/* Main Grid: Airway vs Accesses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* --- CARD 1: VÍA AÉREA Y VENTILACIÓN --- */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6 transition-colors">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-2xl border border-rose-100 dark:border-rose-900/40">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base md:text-lg">Vía Aérea y Ventilación</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Dispositivos y laringoscopio recomendados</p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Tubo Endotraqueal */}
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-2xl p-4 space-y-4">
              <h4 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Tubo Endotraqueal (TET)</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-3 text-center">
                  <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Sin Balón</span>
                  <span className="text-lg font-mono font-bold text-slate-900 dark:text-white mt-1 block">{tet.uncuffed}</span>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-3 text-center">
                  <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Con Balón</span>
                  <span className="text-lg font-mono font-bold text-sky-600 dark:text-sky-400 mt-1 block">{tet.cuffed}</span>
                </div>
              </div>

              <div className="space-y-2.5 text-xs font-medium text-slate-600 dark:text-slate-300 border-t border-slate-200/50 dark:border-slate-800/50 pt-3">
                <div className="flex justify-between">
                  <span>Profundidad Oral:</span>
                  <span className="font-mono text-slate-900 dark:text-slate-100 font-bold">{tet.depthOral}</span>
                </div>
                <div className="flex justify-between">
                  <span>Profundidad Nasal:</span>
                  <span className="font-mono text-slate-900 dark:text-slate-100 font-bold">{tet.depthNasal}</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed font-medium italic">
                * {tet.note}
              </p>
            </div>

            {/* Laringoscopio */}
            <div className="border border-slate-100 dark:border-slate-800 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Laringoscopio Pediátrico</h4>
              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 px-3 py-2 rounded-xl">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{laryngoscope.type}</span>
                <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 px-2 py-1 rounded-lg border border-rose-100 dark:border-rose-900/40">
                  {laryngoscope.size}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                {laryngoscope.description}
              </p>
            </div>

            {/* Máscara Laríngea */}
            <div className="border border-slate-100 dark:border-slate-800 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Máscara Laríngea (Rescate)</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl text-center">
                  <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">Tamaño</span>
                  <span className="text-sm font-mono font-bold text-slate-900 dark:text-white mt-0.5 block">{lma.size}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl text-center">
                  <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">Volumen Máx. Balón</span>
                  <span className="text-sm font-mono font-bold text-slate-900 dark:text-white mt-0.5 block">{lma.maxCuffVolume}</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                * {lma.note}
              </p>
            </div>
          </div>
        </div>

        {/* --- CARD 2: ACCESOS, SONDAS Y MONITOREO --- */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6 transition-colors">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-100 dark:border-emerald-900/40">
              <Wrench className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base md:text-lg">Accesos, Sondas y Monitoreo</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Calibres y tamaños de soporte clínico</p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Accesos Vasculares */}
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-2xl p-4 space-y-4">
              <h4 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Accesos Vasculares de Emergencia</h4>
              
              {/* Venoso Periférico */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Catéter Venoso Periférico:</span>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
                    {vascular.iv.size}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  {vascular.iv.desc}
                </p>
              </div>

              {/* Intraóseo */}
              <div className="space-y-1.5 border-t border-slate-200/50 dark:border-slate-800/50 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Aguja Intraósea (EZ-IO):</span>
                  <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 px-2 py-0.5 rounded-lg border border-rose-100 dark:border-rose-900/40">
                    {vascular.io.size}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  {vascular.io.desc}
                </p>
              </div>
            </div>

            {/* Sondas Foley y Nasogástrica */}
            <div className="border border-slate-100 dark:border-slate-800 rounded-2xl p-4 space-y-4">
              <h4 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Sondas Clínicas</h4>
              
              {/* Sonda Foley */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Sonda Vesical (Foley):</span>
                  <span className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/30 px-2 py-0.5 rounded-lg border border-sky-100/50 dark:border-sky-900/40">
                    {sondes.foley.size}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  {sondes.foley.note}
                </p>
              </div>

              {/* Sonda Nasogástrica */}
              <div className="space-y-1.5 border-t border-slate-200/50 dark:border-slate-800/50 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Sonda Nasogástrica (SNG):</span>
                  <span className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/30 px-2 py-0.5 rounded-lg border border-sky-100/50 dark:border-sky-900/40">
                    {sondes.sng.size}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  {sondes.sng.note}
                </p>
              </div>
            </div>

            {/* Monitoreo de Presión */}
            <div className="border border-slate-100 dark:border-slate-800 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Manguito de Presión Arterial</h4>
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                <p className="font-bold text-slate-900 dark:text-white mb-1">Ancho sugerido del manguito:</p>
                <p className="text-slate-600 dark:text-slate-400">
                  Debe cubrir aproximadamente el <strong className="text-slate-900 dark:text-white">40%</strong> de la circunferencia del brazo (punto medio entre el acromion y el olécranon) y la vejiga inflable debe rodear del <strong className="text-slate-900 dark:text-white">80% al 100%</strong> del brazo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scientific Reference Alert */}
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-[10px] md:text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
        <p className="font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
          <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
          Sustento Científico y Guías Clínicas de Referencia:
        </p>
        <p>
          Las fórmulas y rangos de tamaños anatómicos de este módulo han sido adaptados estrictamente de las pautas de soporte vital avanzado pediátrico de la <strong className="text-slate-700 dark:text-slate-300">American Heart Association (AHA - PALS 2020/2025)</strong>, el <strong className="text-slate-700 dark:text-slate-300">Manual Harriet Lane de Pediatría (Edición 22)</strong> y consensos de anestesiología pediátrica para la prevención de estenosis subglótica mediante el uso de tubos con balón de ultra-bajo perfil.
        </p>
      </div>
    </div>
  );
}
