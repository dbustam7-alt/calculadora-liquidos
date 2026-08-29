'use client';

import React, { useState } from 'react';
import { usePatient } from '@/context/PatientContext';
import { 
  Search, 
  Syringe, 
  ShieldAlert, 
  Info, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle,
  FileText,
  Flame,
  Activity,
  HeartPulse
} from 'lucide-react';
import { clsx } from 'clsx';

interface DrugDefinition {
  id: string;
  name: string;
  category: 'sir' | 'anticonvulsivantes' | 'reanimacion' | 'asma_anafilaxia';
  presentation: string; // e.g. "Ampolla 10 mg / 2 mL"
  concentrationValue: number; // e.g. 5 (mg/mL)
  unit: 'mg' | 'mcg';
  dosePerKg: number; // e.g. 0.1 (mg/kg)
  maxDose: number; // e.g. 5 (mg)
  minDose?: number; // e.g. 0.1 (mg)
  notes: string; // Clinical notes or warnings
  preparation: (weight: number, calculatedDose: number) => string;
}

export default function MedsModule() {
  const { weightKg, ageMonths } = usePatient();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'sir' | 'anticonvulsivantes' | 'reanimacion' | 'asma_anafilaxia'>('all');
  const [expandedDrugId, setExpandedId] = useState<string | null>(null);

  const ageYears = ageMonths / 12;

  // --- DRUGS DATABASE (STRICTLY PEDIATRIC) ---
  const drugs: DrugDefinition[] = [
    // --- 1. SECUENCIA DE INTUBACIÓN RÁPIDA (SIR) ---
    {
      id: 'atropina',
      name: 'Atropina',
      category: 'sir',
      presentation: 'Ampolla 1 mg / 1 mL (0.5 mg/mL o 1 mg/mL)',
      concentrationValue: 1, // standard 1 mg/mL
      unit: 'mg',
      dosePerKg: 0.02,
      minDose: 0.1, // Minimum pediatric dose to avoid paradoxical bradycardia
      maxDose: 0.5, // Maximum single pediatric dose
      notes: 'Indicada como pre-medicación para prevenir bradicardia refleja en lactantes (<1 año) o al usar Succinilcolina. Dosis mínima absoluta es de 0.1 mg.',
      preparation: (w, dose) => {
        const vol = dose / 1; // 1 mg/mL
        if (dose <= 0.1) {
          return `Dosis mínima aplicada (0.1 mg). Extraer 0.1 mL de la ampolla directamente (sin dilución) o diluir 1 ampolla (1 mg) en 9 mL de Solución Salina 0.9% (quedando 0.1 mg/mL) y administrar 1.0 mL IV.`;
        }
        return `Extraer ${(vol).toFixed(2)} mL de la ampolla directamente y administrar IV. O para mayor precisión, diluir 1 ampolla (1 mg) en 9 mL de Solución Salina 0.9% (concentración final 0.1 mg/mL) y administrar ${(dose * 10).toFixed(1)} mL de la dilución.`;
      }
    },
    {
      id: 'fentanilo',
      name: 'Fentanilo',
      category: 'sir',
      presentation: 'Ampolla 100 mcg / 2 mL (50 mcg/mL)',
      concentrationValue: 50,
      unit: 'mcg',
      dosePerKg: 1.5, // 1 - 2 mcg/kg
      maxDose: 100,
      notes: 'Opioide potente. Administrar lentamente en 3-5 minutos para evitar rigidez de la pared torácica (tórax leñoso). Puede causar hipotensión y depresión respiratoria.',
      preparation: (w, dose) => {
        const vol = dose / 50; // 50 mcg/mL
        return `Extraer ${(vol).toFixed(2)} mL de la ampolla directamente (contiene ${dose.toFixed(1)} mcg) y administrar en bolo IV lento. Para lactantes pequeños, diluir 1 mL de Fentanilo (50 mcg) en 9 mL de Solución Salina (quedando 5 mcg/mL) y administrar ${(dose / 5).toFixed(1)} mL de la dilución.`;
      }
    },
    {
      id: 'ketamina',
      name: 'Ketamina',
      category: 'sir',
      presentation: 'Vial 500 mg / 10 mL (50 mg/mL)',
      concentrationValue: 50,
      unit: 'mg',
      dosePerKg: 1.5, // 1 - 2 mg/kg
      maxDose: 100,
      notes: 'Inductor de elección en pacientes asmáticos (broncodilatador) o en shock hemodinámico (mantiene estabilidad cardiovascular). Puede causar laringoespasmo y sialorrea.',
      preparation: (w, dose) => {
        const vol = dose / 50; // 50 mg/mL
        return `Extraer ${(vol).toFixed(2)} mL del vial directamente (contiene ${dose.toFixed(1)} mg) y administrar IV lento. Para lactantes, diluir 1 mL de Ketamina (50 mg) en 9 mL de Solución Salina (quedando 5 mg/mL) y administrar ${(dose / 5).toFixed(1)} mL de la dilución.`;
      }
    },
    {
      id: 'etomidato',
      name: 'Etomidato',
      category: 'sir',
      presentation: 'Ampolla 20 mg / 10 mL (2 mg/mL)',
      concentrationValue: 2,
      unit: 'mg',
      dosePerKg: 0.3,
      maxDose: 20,
      notes: 'Inductor sumamente estable a nivel cardiovascular. Ideal en sospecha de hipertensión endocraneana o shock. Puede causar mioclonías y supresión adrenal transitoria.',
      preparation: (w, dose) => {
        const vol = dose / 2; // 2 mg/mL
        return `Extraer ${(vol).toFixed(2)} mL de la ampolla directamente (contiene ${dose.toFixed(1)} mg) y administrar en bolo IV lento.`;
      }
    },
    {
      id: 'rocuronio',
      name: 'Rocuronio',
      category: 'sir',
      presentation: 'Vial 50 mg / 5 mL (10 mg/mL)',
      concentrationValue: 10,
      unit: 'mg',
      dosePerKg: 1.0,
      maxDose: 100,
      notes: 'Bloqueador neuromuscular no despolarizante de acción rápida. Paralizante de elección si la Succinilcolina está contraindicada. Duración de acción: 30-45 minutos.',
      preparation: (w, dose) => {
        const vol = dose / 10; // 10 mg/mL
        return `Extraer ${(vol).toFixed(2)} mL del vial directamente (contiene ${dose.toFixed(1)} mg) y administrar IV rápido.`;
      }
    },
    {
      id: 'succinilcolina',
      name: 'Succinilcolina',
      category: 'sir',
      presentation: 'Ampolla 100 mg / 2 mL (20 mg/mL)',
      concentrationValue: 20,
      unit: 'mg',
      dosePerKg: 1.5, // 1.5 - 2.0 mg/kg en niños pequeños
      maxDose: 150,
      notes: 'Bloqueador neuromuscular despolarizante de acción ultra-rápida (inicio <60s). Contraindicado en hiperpotasemia, quemaduras >72h, distrofia muscular, trauma ocular abierto o antecedentes de hipertermia maligna.',
      preparation: (w, dose) => {
        const vol = dose / 20; // 20 mg/mL
        return `Extraer ${(vol).toFixed(2)} mL de la ampolla directamente (contiene ${dose.toFixed(1)} mg) y administrar IV rápido.`;
      }
    },

    // --- 2. ANTICONVULSIVANTES ---
    {
      id: 'midazolam_conv',
      name: 'Midazolam (Estatus Convulsivo)',
      category: 'anticonvulsivantes',
      presentation: 'Ampolla 15 mg / 3 mL (5 mg/mL) o 5 mg / 5 mL (1 mg/mL)',
      concentrationValue: 5,
      unit: 'mg',
      dosePerKg: 0.2, // IV / IM / Intranasal
      maxDose: 10,
      notes: 'Benzodiacepina de primera elección. Rápida acción. Si no hay acceso IV, administrar vía Intranasal (usando atomizador nasal) o Intramuscular (IM). Puede causar depresión respiratoria.',
      preparation: (w, dose) => {
        const vol = dose / 5; // 5 mg/mL
        return `Extraer ${(vol).toFixed(2)} mL de la ampolla de 5 mg/mL (contiene ${dose.toFixed(1)} mg). Para administración Intranasal (IN), dividir la dosis administrando la mitad de volumen en cada fosa nasal. Para uso IV, se puede diluir con Solución Salina para mayor precisión.`;
      }
    },
    {
      id: 'diazepam_conv',
      name: 'Diazepam (Estatus Convulsivo)',
      category: 'anticonvulsivantes',
      presentation: 'Ampolla 10 mg / 2 mL (5 mg/mL)',
      concentrationValue: 5,
      unit: 'mg',
      dosePerKg: 0.2, // IV o Rectal
      maxDose: 10,
      notes: 'Benzodiacepina clásica. Vía rectal es una alternativa excelente en el ámbito prehospitalario o sin acceso venoso (dosis rectal: 0.2 - 0.5 mg/kg). Evitar infusiones continuas por acumulación.',
      preparation: (w, dose) => {
        const vol = dose / 5; // 5 mg/mL
        return `Extraer ${(vol).toFixed(2)} mL de la ampolla directamente (contiene ${dose.toFixed(1)} mg) y administrar IV lento (no exceder 2 mg/min) o vía rectal utilizando una sonda o jeringa sin aguja.`;
      }
    },
    {
      id: 'levetiracetam',
      name: 'Levetiracetam (Keppra)',
      category: 'anticonvulsivantes',
      presentation: 'Vial 500 mg / 5 mL (100 mg/mL)',
      concentrationValue: 100,
      unit: 'mg',
      dosePerKg: 40, // 40 - 60 mg/kg
      maxDose: 3000,
      notes: 'Anticonvulsivante de segunda línea de excelente perfil de seguridad. No causa depresión respiratoria ni hipotensión. Infundir en un periodo de 15 minutos.',
      preparation: (w, dose) => {
        const vol = dose / 100; // 100 mg/mL
        return `Extraer ${(vol).toFixed(1)} mL del vial (contiene ${dose.toFixed(0)} mg). Diluir el volumen extraído en Solución Salina 0.9% o Dextrosa 5% para un volumen final de 20 a 50 mL, e infundir IV en 15 minutos.`;
      }
    },
    {
      id: 'fenitoina',
      name: 'Fenitoína (Epamin)',
      category: 'anticonvulsivantes',
      presentation: 'Ampolla 250 mg / 5 mL (50 mg/mL)',
      concentrationValue: 50,
      unit: 'mg',
      dosePerKg: 20,
      maxDose: 1000,
      notes: 'Anticonvulsivante de segunda línea. Administrar estrictamente diluido SOLO en Solución Salina 0.9% (precipita en Dextrosa). Infundir lentamente (máximo 1 mg/kg/min y no superar 50 mg/min) bajo monitoreo electrocardiográfico continuo debido al riesgo de arritmias e hipotensión.',
      preparation: (w, dose) => {
        const vol = dose / 50; // 50 mg/mL
        const infusionTimeMin = Math.ceil(dose / Math.min(w, 50));
        return `Extraer ${(vol).toFixed(1)} mL de la ampolla (contiene ${dose.toFixed(0)} mg). Diluir en Solución Salina 0.9% para una concentración máxima de 10 mg/mL (volumen de dilución aproximado: ${(dose / 10).toFixed(0)} mL). Infundir IV lento en un periodo mínimo de ${Math.max(10, infusionTimeMin)} minutos bajo monitoreo cardíaco.`;
      }
    },

    // --- 3. REANIMACIÓN / PARO ---
    {
      id: 'adrenalina_paro',
      name: 'Adrenalina IV/IO (Paro / RCP)',
      category: 'reanimacion',
      presentation: 'Ampolla 1 mg / 1 mL (1:1000)',
      concentrationValue: 1,
      unit: 'mg',
      dosePerKg: 0.01, // 0.01 mg/kg (equivalente a 0.1 mL/kg de la dilución 1:10,000)
      maxDose: 1,
      notes: 'Administrar cada 3 a 5 minutos durante el RCP. Para administración IV/IO, se debe diluir estrictamente a concentración 1:10,000 (0.1 mg/mL).',
      preparation: (w, dose) => {
        // 0.01 mg/kg is exactly 0.1 mL/kg of 1:10,000
        const volDiluted = w * 0.1;
        const clampedVol = Math.min(10, volDiluted);
        return `DILUCIÓN OBLIGATORIA (1:10,000): Tomar 1 mL de Adrenalina (1 mg) de la ampolla y diluirlo con 9 mL de Solución Salina 0.9% en una jeringa de 10 mL. Administrar exactamente ${clampedVol.toFixed(1)} mL de esta jeringa diluida por vía IV/IO rápida, seguido inmediatamente de un bolo de Solución Salina para empujar el fármaco.`;
      }
    },
    {
      id: 'amiodarona_paro',
      name: 'Amiodarona (Paro / RCP)',
      category: 'reanimacion',
      presentation: 'Ampolla 150 mg / 3 mL (50 mg/mL)',
      concentrationValue: 50,
      unit: 'mg',
      dosePerKg: 5,
      maxDose: 300,
      notes: 'Indicada en ritmos desfibrilables (Fibrilación Ventricular o Taquicardia Ventricular sin pulso) refractarios a la segunda descarga. Se puede repetir hasta 3 dosis en total.',
      preparation: (w, dose) => {
        const vol = dose / 50; // 50 mg/mL
        return `Extraer ${(vol).toFixed(2)} mL de la ampolla directamente (contiene ${dose.toFixed(1)} mg) y administrar en bolo IV/IO rápido durante las maniobras de RCP. Diluir únicamente en Dextrosa al 5% si se va a infundir fuera del contexto de paro.`;
      }
    },

    // --- 4. ASMA Y ANAFILAXIA ---
    {
      id: 'adrenalina_anafilaxia',
      name: 'Adrenalina IM (Anafilaxia)',
      category: 'asma_anafilaxia',
      presentation: 'Ampolla 1 mg / 1 mL (1:1000)',
      concentrationValue: 1,
      unit: 'mg',
      dosePerKg: 0.01, // IM directa
      maxDose: 0.3, // 0.3 mg max for children, 0.5 mg for adolescents
      notes: 'Administración de emergencia por vía INTRAMUSCULAR (IM) en la cara anterolateral del muslo (vasto lateral). NO administrar diluida ni por vía IV en anafilaxia a menos que sea un paro inminente o bajo monitoreo crítico.',
      preparation: (w, dose) => {
        // Max dose is 0.3 mg for children under 12, or 0.5 mg for older
        const limit = ageYears < 12 ? 0.3 : 0.5;
        const finalDose = Math.min(limit, dose);
        const vol = finalDose / 1; // 1 mg/mL
        return `Extraer exactamente ${vol.toFixed(2)} mL de la ampolla de Adrenalina 1:1000 directamente utilizando una jeringa de 1 mL (de insulina o tuberculina) para asegurar precisión. Administrar vía INTRAMUSCULAR (IM) profunda en el muslo. Se puede repetir cada 5-15 minutos si no hay mejoría.`;
      }
    },
    {
      id: 'sulfato_magnesio',
      name: 'Sulfato de Magnesio (Asma Grave)',
      category: 'asma_anafilaxia',
      presentation: 'Ampolla 2 g / 10 mL (200 mg/mL) o al 20%',
      concentrationValue: 200,
      unit: 'mg',
      dosePerKg: 50, // 40 - 75 mg/kg
      maxDose: 2000,
      notes: 'Broncodilatador de rescate potente en crisis asmática refractaria. Puede causar hipotensión profunda y rubor por vasodilatación. Infundir lentamente en 20 minutos bajo monitoreo de presión arterial.',
      preparation: (w, dose) => {
        const vol = dose / 200; // 200 mg/mL
        return `Extraer ${(vol).toFixed(1)} mL de la ampolla (contiene ${dose.toFixed(0)} mg). Diluir en 50 a 100 mL de Solución Salina 0.9% o Dextrosa 5% e infundir por bomba de infusión IV en un periodo de 20 minutos.`;
      }
    },
    {
      id: 'metilprednisolona',
      name: 'Metilprednisolona (Solu-Medrol)',
      category: 'asma_anafilaxia',
      presentation: 'Frasco ampolla 40 mg o 125 mg (liofilizado + diluyente)',
      concentrationValue: 40, // standard calculation helper
      unit: 'mg',
      dosePerKg: 2, // 1 - 2 mg/kg
      maxDose: 125,
      notes: 'Corticoide sistémico de elección en crisis asmática grave o anafilaxia. Inicio de acción en 4-6 horas.',
      preparation: (w, dose) => {
        // If dose is small, use 40mg vial
        if (dose <= 40) {
          return `Reconstituir el frasco de 40 mg con su diluyente de 1 mL (quedando 40 mg/mL). Extraer ${(dose / 40).toFixed(2)} mL de la solución reconstituida y administrar IV lento o IM.`;
        }
        // Else use 125mg vial (usually comes with 2 mL diluent, making 62.5 mg/mL)
        return `Reconstituir el frasco de 125 mg con su diluyente de 2 mL (quedando 62.5 mg/mL). Extraer ${(dose / 62.5).toFixed(2)} mL de la solución reconstituida (contiene ${dose.toFixed(1)} mg) y administrar IV lento.`;
      }
    }
  ];

  // --- FILTER & SEARCH LOGIC ---
  const filteredDrugs = drugs.filter((d) => {
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          d.presentation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          d.notes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || d.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryLabel = (cat: string) => {
    const labels = {
      sir: 'Secuencia de Intubación (SIR)',
      anticonvulsivantes: 'Anticonvulsivantes',
      reanimacion: 'Reanimación / RCP',
      asma_anafilaxia: 'Asma y Anafilaxia'
    };
    return labels[cat as keyof typeof labels] || cat;
  };

  const calculateDose = (drug: DrugDefinition) => {
    let calculated = weightKg * drug.dosePerKg;
    let isLimited = false;

    // Apply minimum dose if defined
    if (drug.minDose && calculated < drug.minDose) {
      calculated = drug.minDose;
    }

    // Apply maximum dose
    if (calculated > drug.maxDose) {
      calculated = drug.maxDose;
      isLimited = true;
    }

    return {
      value: parseFloat(calculated.toFixed(2)),
      isLimited
    };
  };

  return (
    <div className="space-y-6">
      {/* Active Patient Details Banner */}
      <div className="bg-sky-50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/40 rounded-2xl p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
        <div className="text-xs text-sky-800 dark:text-sky-300 font-medium">
          <p className="font-bold mb-0.5 text-sky-900 dark:text-sky-200">
            Dosificación Activa por Peso: {weightKg} kg
          </p>
          <p className="leading-relaxed">
            Las dosis se calculan automáticamente multiplicando el peso por la dosis/kg estándar pediátrica. El sistema aplica límites máximos de seguridad (dosis de adulto) de forma automática.
          </p>
        </div>
      </div>

      {/* Controls: Search & Category Filter */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 md:p-6 shadow-sm space-y-4 transition-colors">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Input */}
          <div className="md:col-span-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Buscar fármaco o indicación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-sky-500 dark:focus:border-sky-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-950 transition-all font-medium text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Category Filter Buttons */}
          <div className="md:col-span-2 flex flex-wrap gap-2 items-center">
            {(['all', 'sir', 'anticonvulsivantes', 'reanimacion', 'asma_anafilaxia'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={clsx(
                  'px-3.5 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer',
                  activeCategory === cat
                    ? 'bg-sky-600 dark:bg-sky-500 text-white border-sky-600 dark:border-sky-500 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100'
                )}
              >
                {cat === 'all' ? 'Todos' : cat === 'sir' ? 'SIR' : cat === 'anticonvulsivantes' ? 'Anticonvulsivantes' : cat === 'reanimacion' ? 'Reanimación' : 'Asma/Anafilaxia'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Meds List */}
      <div className="space-y-3">
        {filteredDrugs.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm transition-colors">
            <AlertTriangle className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">No se encontraron medicamentos</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-1 leading-relaxed">
              No hay fármacos en la base de datos que coincidan con los criterios de búsqueda actuales.
            </p>
          </div>
        ) : (
          filteredDrugs.map((drug) => {
            const isExpanded = expandedDrugId === drug.id;
            const dose = calculateDose(drug);

            return (
              <div
                key={drug.id}
                className={clsx(
                  'bg-white dark:bg-slate-900 border rounded-2xl shadow-sm overflow-hidden transition-all duration-200 cursor-pointer',
                  isExpanded 
                    ? 'border-sky-300 dark:border-sky-500 ring-4 ring-sky-50 dark:ring-sky-950/20' 
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                )}
                onClick={() => setExpandedId(isExpanded ? null : drug.id)}
              >
                {/* Collapsed Card Header */}
                <div className="p-4 md:p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Category Icon */}
                    <div className={clsx(
                      'p-2.5 rounded-xl border shrink-0',
                      drug.category === 'sir' && 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/40',
                      drug.category === 'anticonvulsivantes' && 'bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 border-violet-100 dark:border-violet-900/40',
                      drug.category === 'reanimacion' && 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/40',
                      drug.category === 'asma_anafilaxia' && 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40'
                    )}>
                      <Syringe className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm md:text-base truncate">
                          {drug.name}
                        </h4>
                        <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md border uppercase tracking-wider bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700">
                          {drug.category === 'sir' ? 'SIR' : drug.category === 'anticonvulsivantes' ? 'Anticonvulsivo' : drug.category === 'reanimacion' ? 'RCP' : 'Asma/Anafilaxia'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 truncate">
                        Presentación: {drug.presentation}
                      </p>
                    </div>
                  </div>

                  {/* Calculated Dose Display */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">Dosis Calculada</span>
                      <div className="flex items-baseline justify-end gap-0.5 mt-0.5">
                        <span className={clsx(
                          'text-base md:text-lg font-mono font-bold',
                          dose.isLimited ? 'text-amber-600 dark:text-amber-400' : 'text-sky-600 dark:text-sky-400'
                        )}>
                          {dose.value}
                        </span>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{drug.unit}</span>
                      </div>
                      {dose.isLimited && (
                        <span className="text-[8px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block mt-0.5">
                          Dosis Máx. Alcanzada
                        </span>
                      )}
                    </div>

                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                    )}
                  </div>
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 p-4 md:p-6 space-y-4">
                    {/* Dose & Security Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Formula Base */}
                      <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl p-3.5 shadow-sm">
                        <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Fórmula de Dosis</span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1.5 block">
                          {drug.dosePerKg} {drug.unit}/kg
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">
                          Multiplicado por {weightKg} kg
                        </span>
                      </div>

                      {/* Limit Max */}
                      <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl p-3.5 shadow-sm">
                        <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Dosis Máxima de Adulto</span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1.5 block">
                          {drug.maxDose} {drug.unit}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">
                          Límite de seguridad absoluto
                        </span>
                      </div>

                      {/* Presentation Concentration */}
                      <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl p-3.5 shadow-sm">
                        <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Concentración</span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1.5 block">
                          {drug.concentrationValue} {drug.unit}/mL
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">
                          Valor para cálculo de volumen
                        </span>
                      </div>
                    </div>

                    {/* Preparation Guide (Crucial for nursing) */}
                    <div className="bg-sky-50/50 dark:bg-sky-950/20 border border-sky-100/50 dark:border-sky-900/30 rounded-xl p-4 space-y-2">
                      <h5 className="text-[10px] uppercase font-bold text-sky-700 dark:text-sky-400 tracking-wider flex items-center gap-1.5">
                        <FileText className="h-4 w-4" />
                        Guía de Preparación e Instrucciones de Enfermería
                      </h5>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        {drug.preparation(weightKg, dose.value)}
                      </p>
                    </div>

                    {/* Clinical Warnings & Notes */}
                    <div className="bg-amber-50/40 dark:bg-amber-950/10 border border-amber-100/50 dark:border-amber-900/20 rounded-xl p-4 space-y-1.5">
                      <h5 className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 tracking-wider flex items-center gap-1.5">
                        <ShieldAlert className="h-4 w-4" />
                        Consideraciones Clínicas y Alertas de Seguridad
                      </h5>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                        {drug.notes}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Scientific Reference Alert */}
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-[10px] md:text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
        <p className="font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
          <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
          Sustento Científico y Guías Clínicas de Referencia:
        </p>
        <p>
          Las dosis, límites de seguridad máximos y guías de dilución recomendadas en este módulo han sido adaptadas estrictamente de las pautas de soporte vital avanzado pediátrico de la <strong className="text-slate-700 dark:text-slate-300">American Heart Association (AHA - PALS 2020/2025)</strong>, el <strong className="text-slate-700 dark:text-slate-300">Manual Harriet Lane de Pediatría (Edición 22)</strong> y guías de dosificación de fármacos de la Asociación Española de Pediatría (AEP).
        </p>
      </div>
    </div>
  );
}
