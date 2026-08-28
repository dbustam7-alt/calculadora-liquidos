/**
 * PediaCode - Pure Clinical Formulas for Pediatric Emergency Calculator
 * All calculations are pure functions, strictly typed, and isolated for safety.
 */

// --- 1. BODY SURFACE AREA (BSA / SCT) ---

/**
 * Calculates Body Surface Area (BSA / SCT) using the weight-based formula:
 * - If Weight < 10 kg: BSA = ((Weight * 4) + 9) / 100
 * - If Weight >= 10 kg: BSA = ((Weight * 4) + 7) / (Weight + 90)
 * Height (talla) is left as purely informative and does not affect the calculation.
 */
export function calculateBSA(weightKg: number, heightCm?: number): number {
  if (weightKg <= 0) return 0;
  let bsa = 0;
  if (weightKg < 10) {
    bsa = ((weightKg * 4) + 9) / 100;
  } else {
    bsa = ((weightKg * 4) + 7) / (weightKg + 90);
  }
  return parseFloat(bsa.toFixed(3));
}

// --- 2. MAINTENANCE FLUIDS ---

export interface HollidaySegarResult {
  dailyVolumeMl: number;
  hourlyRateMlh: number;
  dropsPerMin: number;
  microdropsPerMin: number;
}

/**
 * Calculates maintenance fluids using the Holliday-Segar method:
 * - <= 10 kg: 100 mL/kg/day
 * - 10-20 kg: 1000 mL + 50 mL/kg/day for each kg > 10
 * - 20-30 kg: 1500 mL + 20 mL/kg/day for each kg > 20
 */
export function calculateHollidaySegar(weightKg: number): HollidaySegarResult {
  if (weightKg <= 0) {
    return { dailyVolumeMl: 0, hourlyRateMlh: 0, dropsPerMin: 0, microdropsPerMin: 0 };
  }

  let dailyVolumeMl = 0;
  if (weightKg <= 10) {
    dailyVolumeMl = weightKg * 100;
  } else if (weightKg <= 20) {
    dailyVolumeMl = 1000 + (weightKg - 10) * 50;
  } else {
    dailyVolumeMl = 1500 + (weightKg - 20) * 20;
  }

  const hourlyRateMlh = dailyVolumeMl / 24;
  
  // Drops per minute (macrogoteo: 1 mL = 20 drops) -> (mL/h * 20) / 60 = mL/h / 3
  const dropsPerMin = hourlyRateMlh / 3;
  
  // Microdrops per minute (microgoteo: 1 mL = 60 microdrops) -> (mL/h * 60) / 60 = mL/h
  const microdropsPerMin = hourlyRateMlh;

  return {
    dailyVolumeMl: Math.round(dailyVolumeMl),
    hourlyRateMlh: parseFloat(hourlyRateMlh.toFixed(1)),
    dropsPerMin: parseFloat(dropsPerMin.toFixed(1)),
    microdropsPerMin: parseFloat(microdropsPerMin.toFixed(1)),
  };
}

export interface BsaMaintenanceResult {
  dailyVolumeMlMin: number;
  dailyVolumeMlMax: number;
  hourlyRateMlhMin: number;
  hourlyRateMlhMax: number;
}

/**
 * Calculates maintenance fluids based on Body Surface Area (BSA) for weight > 30 kg:
 * - Rango Inferior: 1500 mL/m2/day
 * - Rango Superior: 1800 mL/m2/day
 */
export function calculateBsaMaintenance(bsa: number): BsaMaintenanceResult {
  if (bsa <= 0) {
    return { dailyVolumeMlMin: 0, dailyVolumeMlMax: 0, hourlyRateMlhMin: 0, hourlyRateMlhMax: 0 };
  }

  const dailyVolumeMlMin = bsa * 1500;
  const dailyVolumeMlMax = bsa * 1800;
  const hourlyRateMlhMin = dailyVolumeMlMin / 24;
  const hourlyRateMlhMax = dailyVolumeMlMax / 24;

  return {
    dailyVolumeMlMin: Math.round(dailyVolumeMlMin),
    dailyVolumeMlMax: Math.round(dailyVolumeMlMax),
    hourlyRateMlhMin: parseFloat(hourlyRateMlhMin.toFixed(1)),
    hourlyRateMlhMax: parseFloat(hourlyRateMlhMax.toFixed(1)),
  };
}

// --- 3. BURNS (LUND-BROWDER, GALVESTON & PARKLAND MODIFICADO) ---

export type AgeGroup = 'under_1' | '1_4' | '5_9' | '10_14' | '15' | 'adult';

export interface LundBrowderValues {
  head: number;
  neck: number;
  antTrunk: number;
  postTrunk: number;
  rButtock: number;
  lButtock: number;
  genitalia: number;
  rUpperArm: number;
  lUpperArm: number;
  rLowerArm: number;
  lLowerArm: number;
  rHand: number;
  lHand: number;
  rThigh: number;
  lThigh: number;
  rLeg: number;
  lLeg: number;
  rFoot: number;
  lFoot: number;
}

export const LUND_BROWDER_CHART: Record<AgeGroup, LundBrowderValues> = {
  under_1: {
    head: 19, neck: 2, antTrunk: 13, postTrunk: 13, rButtock: 2.5, lButtock: 2.5, genitalia: 1,
    rUpperArm: 4, lUpperArm: 4, rLowerArm: 3, lLowerArm: 3, rHand: 2.5, lHand: 2.5,
    rThigh: 5.5, lThigh: 5.5, rLeg: 5, lLeg: 5, rFoot: 3.5, lFoot: 3.5
  },
  '1_4': {
    head: 17, neck: 2, antTrunk: 13, postTrunk: 13, rButtock: 2.5, lButtock: 2.5, genitalia: 1,
    rUpperArm: 4, lUpperArm: 4, rLowerArm: 3, lLowerArm: 3, rHand: 2.5, lHand: 2.5,
    rThigh: 6.5, lThigh: 6.5, rLeg: 5, lLeg: 5, rFoot: 3.5, lFoot: 3.5
  },
  '5_9': {
    head: 13, neck: 2, antTrunk: 13, postTrunk: 13, rButtock: 2.5, lButtock: 2.5, genitalia: 1,
    rUpperArm: 4, lUpperArm: 4, rLowerArm: 3, lLowerArm: 3, rHand: 2.5, lHand: 2.5,
    rThigh: 8, lThigh: 8, rLeg: 5.5, lLeg: 5.5, rFoot: 3.5, lFoot: 3.5
  },
  '10_14': {
    head: 11, neck: 2, antTrunk: 13, postTrunk: 13, rButtock: 2.5, lButtock: 2.5, genitalia: 1,
    rUpperArm: 4, lUpperArm: 4, rLowerArm: 3, lLowerArm: 3, rHand: 2.5, lHand: 2.5,
    rThigh: 8.5, lThigh: 8.5, rLeg: 6, lLeg: 6, rFoot: 3.5, lFoot: 3.5
  },
  '15': {
    head: 9, neck: 2, antTrunk: 13, postTrunk: 13, rButtock: 2.5, lButtock: 2.5, genitalia: 1,
    rUpperArm: 4, lUpperArm: 4, rLowerArm: 3, lLowerArm: 3, rHand: 2.5, lHand: 2.5,
    rThigh: 9, lThigh: 9, rLeg: 6.5, lLeg: 6.5, rFoot: 3.5, lFoot: 3.5
  },
  adult: {
    head: 7, neck: 2, antTrunk: 13, postTrunk: 13, rButtock: 2.5, lButtock: 2.5, genitalia: 1,
    rUpperArm: 4, lUpperArm: 4, rLowerArm: 3, lLowerArm: 3, rHand: 2.5, lHand: 2.5,
    rThigh: 9.5, lThigh: 9.5, rLeg: 7, lLeg: 7, rFoot: 3.5, lFoot: 3.5
  }
};

export function getAgeGroup(ageMonths: number): AgeGroup {
  if (ageMonths < 12) return 'under_1';
  if (ageMonths < 60) return '1_4';
  if (ageMonths < 120) return '5_9';
  if (ageMonths < 180) return '10_14';
  if (ageMonths < 192) return '15';
  return 'adult';
}

export interface BurnsResult {
  totalVolumeMl: number;
  firstEightHoursMl: number;
  firstEightHoursRateMlh: number;
  nextSixteenHoursMl: number;
  nextSixteenHoursRateMlh: number;
  sctM2: number;
  scqM2: number;
  maintenanceAddedMl?: number;
}

/**
 * Calculates burn fluid resuscitation according to Galveston or Parkland Modificado formulas:
 * - Galveston: (5000 * SCQ_m2) + (2000 * SCT_m2)
 * - Parkland Modificado:
 *   - Age >= 14 years (168 months): 2 * Weight * %SCQ
 *   - Age < 14 years:
 *     - Weight < 30 kg: (Constant * Weight * %SCQ) + Holliday-Segar
 *     - Weight >= 30 kg: Constant * Weight * %SCQ
 *   - Constant is 3.0 for Thermal burns, 4.0 for Inhalation burns.
 */
export function calculateBurns(
  weightKg: number,
  scqPercentage: number,
  formula: 'Galveston' | 'Parkland',
  ageMonths: number,
  burnType: 'thermal' | 'inhalation' = 'thermal'
): BurnsResult {
  const sctM2 = calculateBSA(weightKg);
  const scqM2 = sctM2 * (scqPercentage / 100);

  if (weightKg <= 0 || scqPercentage <= 0) {
    return {
      totalVolumeMl: 0,
      firstEightHoursMl: 0,
      firstEightHoursRateMlh: 0,
      nextSixteenHoursMl: 0,
      nextSixteenHoursRateMlh: 0,
      sctM2,
      scqM2: 0,
    };
  }

  let totalVolumeMl = 0;
  let maintenanceAddedMl = 0;

  if (formula === 'Galveston') {
    totalVolumeMl = (5000 * scqM2) + (2000 * sctM2);
  } else {
    // Parkland Modificado
    const ageYears = ageMonths / 12;
    const constant = burnType === 'inhalation' ? 4.0 : 3.0;

    if (ageYears >= 14) {
      totalVolumeMl = 2 * weightKg * scqPercentage;
    } else {
      // Pediatric (Age < 14)
      if (weightKg < 30) {
        const maintenance = calculateHollidaySegar(weightKg);
        maintenanceAddedMl = maintenance.dailyVolumeMl;
        totalVolumeMl = (constant * weightKg * scqPercentage) + maintenanceAddedMl;
      } else {
        totalVolumeMl = constant * weightKg * scqPercentage;
      }
    }
  }

  const firstEightHoursMl = totalVolumeMl / 2;
  const nextSixteenHoursMl = totalVolumeMl / 2;

  return {
    totalVolumeMl: Math.round(totalVolumeMl),
    firstEightHoursMl: Math.round(firstEightHoursMl),
    firstEightHoursRateMlh: parseFloat((firstEightHoursMl / 8).toFixed(1)),
    nextSixteenHoursMl: Math.round(nextSixteenHoursMl),
    nextSixteenHoursRateMlh: parseFloat((nextSixteenHoursMl / 16).toFixed(1)),
    sctM2,
    scqM2: parseFloat(scqM2.toFixed(3)),
    maintenanceAddedMl: maintenanceAddedMl > 0 ? maintenanceAddedMl : undefined,
  };
}

// --- 4. CETOACIDOSIS DIABÉTICA (CAD) ---

export interface DkaResult {
  bolus10VolumeMl: number;
  bolus20VolumeMl: number;
  dailyVolumeMlMin: number; // For weight > 30
  dailyVolumeMlMax: number; // For weight > 30
  hourlyRateMlhMin: number; // For weight > 30
  hourlyRateMlhMax: number; // For weight > 30
  totalVolumeMl48h?: number; // For weight <= 30
  hourlyRateMlh48h?: number; // For weight <= 30
  maintVolume24h?: number; // For weight <= 30
  deficitVolumeMl?: number; // For weight <= 30
  sctM2: number;
}

/**
 * Calculates Cetoacidosis Diabética (CAD) fluid management based on Excel formulas:
 * - Bolos: 10 mL/kg and 20 mL/kg (if conCompromiso is true)
 * - If Weight <= 30 kg:
 *   - Grado Deshidratación: Leve (50 mL/kg), Moderada (70 mL/kg), Grave (100 mL/kg)
 *   - Total 48h = (Holliday-Segar * basalVeces) + (Grado * Peso)
 *   - Hourly Rate = Total 48h / 48
 * - If Weight > 30 kg:
 *   - Rango Inferior 24h = 2500 * SCT
 *   - Rango Superior 24h = 3000 * SCT
 *   - Hourly Rate Inferior = Rango Inferior / 24
 *   - Hourly Rate Superior = Rango Superior / 24
 */
export function calculateDka(
  weightKg: number,
  severity: 'leve' | 'moderada' | 'grave',
  conCompromiso: boolean,
  basalVeces: number = 2.0
): DkaResult {
  const sctM2 = calculateBSA(weightKg);
  const bolus10VolumeMl = weightKg * 10;
  const bolus20VolumeMl = weightKg * 20;

  if (weightKg <= 0) {
    return {
      bolus10VolumeMl: 0,
      bolus20VolumeMl: 0,
      dailyVolumeMlMin: 0,
      dailyVolumeMlMax: 0,
      hourlyRateMlhMin: 0,
      hourlyRateMlhMax: 0,
      sctM2,
    };
  }

  const severityMlKg = {
    leve: 50,
    moderada: 70,
    grave: 100,
  };
  const gradoDeshidratacion = severityMlKg[severity];

  if (weightKg <= 30) {
    const maintVolume24h = calculateHollidaySegar(weightKg).dailyVolumeMl;
    const deficitVolumeMl = gradoDeshidratacion * weightKg;
    const totalVolumeMl48h = (maintVolume24h * basalVeces) + deficitVolumeMl;
    const hourlyRateMlh48h = totalVolumeMl48h / 48;

    return {
      bolus10VolumeMl: Math.round(bolus10VolumeMl),
      bolus20VolumeMl: Math.round(bolus20VolumeMl),
      dailyVolumeMlMin: 0,
      dailyVolumeMlMax: 0,
      hourlyRateMlhMin: 0,
      hourlyRateMlhMax: 0,
      totalVolumeMl48h: Math.round(totalVolumeMl48h),
      hourlyRateMlh48h: parseFloat(hourlyRateMlh48h.toFixed(1)),
      maintVolume24h,
      deficitVolumeMl,
      sctM2,
    };
  } else {
    // Weight > 30 kg
    const dailyVolumeMlMin = 2500 * sctM2;
    const dailyVolumeMlMax = 3000 * sctM2;
    const hourlyRateMlhMin = dailyVolumeMlMin / 24;
    const hourlyRateMlhMax = dailyVolumeMlMax / 24;

    return {
      bolus10VolumeMl: Math.round(bolus10VolumeMl),
      bolus20VolumeMl: Math.round(bolus20VolumeMl),
      dailyVolumeMlMin: Math.round(dailyVolumeMlMin),
      dailyVolumeMlMax: Math.round(dailyVolumeMlMax),
      hourlyRateMlhMin: parseFloat(hourlyRateMlhMin.toFixed(1)),
      hourlyRateMlhMax: parseFloat(hourlyRateMlhMax.toFixed(1)),
      sctM2,
    };
  }
}

// --- 5. ACUTE DIARRHEAL DISEASE (EDA) ---

export type DehydrationSeverity = 'none' | 'some' | 'severe';

export interface EdaAssessment {
  condition: 'alert' | 'irritable' | 'lethargic';
  eyes: 'normal' | 'sunken';
  thirst: 'normal' | 'thirsty' | 'unable_to_drink';
  skinPinch: 'immediate' | 'slow' | 'very_slow';
}

export interface EdaResult {
  severity: DehydrationSeverity;
  recommendedPlan: 'A' | 'B' | 'C';
  planDetails: string;
  fluidVolumeMl?: number;
  hourlyRates?: {
    phase1RateMlh?: number;
    phase1DurationH?: number;
    phase2RateMlh?: number;
    phase2DurationH?: number;
  };
  zincDoseMg?: number;
  boloVolumeMlMin?: number;
  boloVolumeMlMax?: number;
}

/**
 * Assesses dehydration severity based on clinical signs (WHO guidelines)
 */
export function assessDehydration(assessment: EdaAssessment): DehydrationSeverity {
  let severeSigns = 0;
  let someSigns = 0;

  if (assessment.condition === 'lethargic') severeSigns++;
  else if (assessment.condition === 'irritable') someSigns++;

  if (assessment.eyes === 'sunken') {
    severeSigns++;
    someSigns++;
  }

  if (assessment.thirst === 'unable_to_drink') severeSigns++;
  else if (assessment.thirst === 'thirsty') someSigns++;

  if (assessment.skinPinch === 'very_slow') severeSigns++;
  else if (assessment.skinPinch === 'slow') someSigns++;

  if (severeSigns >= 2) return 'severe';
  if (someSigns >= 2) return 'some';
  return 'none';
}

/**
 * Calculates rehydration requirements based on WHO Plans A, B, and C
 * - Plan A:
 *   - Age < 2 years: 50-100 mL after each stool
 *   - Age >= 2 years: 100-200 mL after each stool
 * - Plan B:
 *   - 25 mL/kg/h for 4 hours (Total 100 mL/kg)
 * - Plan C:
 *   - If conShock (Shock Hipovolémico): Bolo of 20-30 mL/kg, then Phase 1 and 2
 *   - If Deshidratación Grave (no shock): No bolo, Phase 1 and 2
 *   - Phase 1 and 2:
 *     - < 1 year (ageMonths < 12): Phase 1 (30 mL/kg in 1h), Phase 2 (70 mL/kg in 5h)
 *     - >= 1 year (ageMonths >= 12): Phase 1 (30 mL/kg in 30 min), Phase 2 (70 mL/kg in 2.5h)
 */
export function calculateEdaHydration(
  weightKg: number,
  ageMonths: number,
  severity: DehydrationSeverity,
  planCSubtype: 'deshidratacion_grave' | 'shock_hipovolemico' = 'deshidratacion_grave'
): EdaResult {
  if (weightKg <= 0) {
    return {
      severity,
      recommendedPlan: 'A',
      planDetails: 'Ingrese un peso válido para calcular los volúmenes.'
    };
  }

  const zincDoseMg = ageMonths < 6 ? 10 : 20;

  if (severity === 'none') {
    const ageYears = ageMonths / 12;
    const sroPerStool = ageYears < 2 ? '50 a 100 mL' : '100 a 200 mL';
    return {
      severity,
      recommendedPlan: 'A',
      zincDoseMg,
      planDetails: `Plan A (Tratamiento en el hogar): Dar sales de rehidratación oral (SRO) después de cada evacuación líquida: ${sroPerStool}. Continuar lactancia materna y alimentación habitual. Administrar Sulfato de Zinc (${zincDoseMg} mg al día) por 14 días.`
    };
  }

  if (severity === 'some') {
    // Plan B: 25 cc/kg/h over 4 hours (Total 100 mL/kg)
    const hourlyRate = weightKg * 25;
    const fluidVolumeMl = hourlyRate * 4;
    return {
      severity,
      recommendedPlan: 'B',
      fluidVolumeMl: Math.round(fluidVolumeMl),
      zincDoseMg,
      planDetails: `Plan B (Rehidratación oral en sala de urgencias): Administrar ${Math.round(hourlyRate)} mL de SRO cada hora durante 4 horas (Volumen total: ${Math.round(fluidVolumeMl)} mL). Evaluar continuamente. Si tolera y mejora, pasar a Plan A. Administrar Sulfato de Zinc (${zincDoseMg} mg al día) por 14 días.`,
      hourlyRates: {
        phase1RateMlh: parseFloat(hourlyRate.toFixed(1)),
        phase1DurationH: 4
      }
    };
  }

  // Plan C: 100 mL/kg IV (Ringer Lactato o Solución Salina 0.9%)
  const totalVolumeMl = weightKg * 100;
  const phase1VolumeMl = weightKg * 30;
  const phase2VolumeMl = weightKg * 70;
  const isUnder1 = ageMonths < 12;

  let boloDetails = '';
  let boloVolumeMlMin = undefined;
  let boloVolumeMlMax = undefined;

  if (planCSubtype === 'shock_hipovolemico') {
    boloVolumeMlMin = weightKg * 20;
    boloVolumeMlMax = weightKg * 30;
    boloDetails = `¡EMERGENCIA! Administrar Bolo inmediato de Ringer Lactato o Solución Salina 0.9% a ${boloVolumeMlMin}-${boloVolumeMlMax} mL (${weightKg * 20} a ${weightKg * 30} mL). `;
  }

  if (isUnder1) {
    const phase1RateMlh = phase1VolumeMl / 1; // 30 mL/kg over 1 hour
    const phase2RateMlh = phase2VolumeMl / 5; // 70 mL/kg over 5 hours
    return {
      severity,
      recommendedPlan: 'C',
      fluidVolumeMl: Math.round(totalVolumeMl),
      zincDoseMg,
      boloVolumeMlMin,
      boloVolumeMlMax,
      planDetails: `Plan C (${planCSubtype === 'shock_hipovolemico' ? 'Shock Hipovolémico' : 'Deshidratación Grave'} en lactantes < 12 meses): ${boloDetails}Disponer rehidratación IV de ${Math.round(totalVolumeMl)} mL en total. Fase 1: ${Math.round(phase1VolumeMl)} mL en 1 hora (${Math.round(phase1RateMlh)} mL/h). Fase 2: ${Math.round(phase2VolumeMl)} mL en 5 horas (${Math.round(phase2RateMlh)} mL/h). Reevaluar constantemente. Administrar Sulfato de Zinc (${zincDoseMg} mg al día) por 14 días.`,
      hourlyRates: {
        phase1RateMlh: parseFloat(phase1RateMlh.toFixed(1)),
        phase1DurationH: 1,
        phase2RateMlh: parseFloat(phase2RateMlh.toFixed(1)),
        phase2DurationH: 5
      }
    };
  } else {
    const phase1RateMlh = phase1VolumeMl / 0.5; // 30 mL/kg over 30 minutes (0.5h)
    const phase2RateMlh = phase2VolumeMl / 2.5; // 70 mL/kg over 2.5 hours
    return {
      severity,
      recommendedPlan: 'C',
      fluidVolumeMl: Math.round(totalVolumeMl),
      zincDoseMg,
      boloVolumeMlMin,
      boloVolumeMlMax,
      planDetails: `Plan C (${planCSubtype === 'shock_hipovolemico' ? 'Shock Hipovolémico' : 'Deshidratación Grave'} en niños >= 12 meses): ${boloDetails}Disponer rehidratación IV de ${Math.round(totalVolumeMl)} mL en total. Fase 1: ${Math.round(phase1VolumeMl)} mL en 30 minutos (${Math.round(phase1RateMlh)} mL/h). Fase 2: ${Math.round(phase2VolumeMl)} mL en 2.5 horas (${Math.round(phase2RateMlh)} mL/h). Reevaluar constantemente. Administrar Sulfato de Zinc (${zincDoseMg} mg al día) por 14 días.`,
      hourlyRates: {
        phase1RateMlh: parseFloat(phase1RateMlh.toFixed(1)),
        phase1DurationH: 0.5,
        phase2RateMlh: parseFloat(phase2RateMlh.toFixed(1)),
        phase2DurationH: 2.5
      }
    };
  }
}
