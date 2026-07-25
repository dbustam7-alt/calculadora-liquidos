/**
 * PediatriCode - Pure Clinical Formulas for Pediatric Emergency Calculator
 * All calculations are pure functions, strictly typed, and isolated for safety.
 */

// --- 1. BODY SURFACE AREA (BSA) ---

/**
 * Calculates Body Surface Area (BSA) using the Mosteller formula:
 * BSA = sqrt((Height (cm) * Weight (kg)) / 3600)
 */
export function calculateBSA(weightKg: number, heightCm: number): number {
  if (weightKg <= 0 || heightCm <= 0) return 0;
  const bsa = Math.sqrt((weightKg * heightCm) / 3600);
  return parseFloat(bsa.toFixed(3));
}

// --- 2. MAINTENANCE FLUIDS & ELECTROLYTES ---

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
 * - > 20 kg: 1500 mL + 20 mL/kg/day for each kg > 20
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
  dailyVolumeMl: number;
  hourlyRateMlh: number;
  naTotalMeq: number;
  kTotalMeq: number;
}

/**
 * Calculates maintenance fluids and electrolytes based on Body Surface Area (BSA):
 * - Fluid requirement standard: 1200 - 1800 mL/m2/day (default 1500)
 * - Sodium (Na) requirement standard: 30 - 50 mEq/m2/day (default 40)
 * - Potassium (K) requirement standard: 20 - 40 mEq/m2/day (default 20)
 */
export function calculateBsaMaintenance(
  bsa: number,
  fluidReqM2: number = 1500,
  naReqM2: number = 40,
  kReqM2: number = 20
): BsaMaintenanceResult {
  if (bsa <= 0) {
    return { dailyVolumeMl: 0, hourlyRateMlh: 0, naTotalMeq: 0, kTotalMeq: 0 };
  }

  const dailyVolumeMl = bsa * fluidReqM2;
  const hourlyRateMlh = dailyVolumeMl / 24;
  const naTotalMeq = bsa * naReqM2;
  const kTotalMeq = bsa * kReqM2;

  return {
    dailyVolumeMl: Math.round(dailyVolumeMl),
    hourlyRateMlh: parseFloat(hourlyRateMlh.toFixed(1)),
    naTotalMeq: parseFloat(naTotalMeq.toFixed(1)),
    kTotalMeq: parseFloat(kTotalMeq.toFixed(1)),
  };
}

// --- 3. BURNS (LUND-BROWDER & PARKLAND) ---

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

/**
 * Lund-Browder body surface area percentages by age group
 */
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

export interface ParklandResult {
  totalVolumeMl: number;
  firstEightHoursMl: number;
  firstEightHoursRateMlh: number;
  nextSixteenHoursMl: number;
  nextSixteenHoursRateMlh: number;
  maintenanceDailyVolumeMl: number;
  maintenanceHourlyRateMlh: number;
  combinedFirstEightHoursRateMlh: number;
  combinedNextSixteenHoursRateMlh: number;
}

/**
 * Determines age group based on age in months
 */
export function getAgeGroup(ageMonths: number): AgeGroup {
  if (ageMonths < 12) return 'under_1';
  if (ageMonths < 60) return '1_4'; // 1-4 years (12 to 59 months)
  if (ageMonths < 120) return '5_9'; // 5-9 years (60 to 119 months)
  if (ageMonths < 180) return '10_14'; // 10-14 years (120 to 179 months)
  if (ageMonths < 192) return '15'; // 15 years (180 to 191 months)
  return 'adult'; // >= 16 years (192 months)
}

/**
 * Calculates burn fluid resuscitation using the Parkland formula:
 * Volume = 4 mL * Weight (kg) * %SCQ
 * plus Holliday-Segar maintenance fluids for pediatric patients.
 */
export function calculateParkland(weightKg: number, scqPercentage: number): ParklandResult {
  if (weightKg <= 0 || scqPercentage <= 0) {
    return {
      totalVolumeMl: 0,
      firstEightHoursMl: 0,
      firstEightHoursRateMlh: 0,
      nextSixteenHoursMl: 0,
      nextSixteenHoursRateMlh: 0,
      maintenanceDailyVolumeMl: 0,
      maintenanceHourlyRateMlh: 0,
      combinedFirstEightHoursRateMlh: 0,
      combinedNextSixteenHoursRateMlh: 0
    };
  }

  // Parkland Volume = 4 * weight * %SCQ
  const totalVolumeMl = 4 * weightKg * scqPercentage;
  const firstEightHoursMl = totalVolumeMl * 0.5;
  const nextSixteenHoursMl = totalVolumeMl * 0.5;

  const firstEightHoursRateMlh = firstEightHoursMl / 8;
  const nextSixteenHoursRateMlh = nextSixteenHoursMl / 16;

  // Pediatric patients require maintenance fluids as well
  const maintenance = calculateHollidaySegar(weightKg);
  const maintenanceDailyVolumeMl = maintenance.dailyVolumeMl;
  const maintenanceHourlyRateMlh = maintenance.hourlyRateMlh;

  const combinedFirstEightHoursRateMlh = firstEightHoursRateMlh + maintenanceHourlyRateMlh;
  const combinedNextSixteenHoursRateMlh = nextSixteenHoursRateMlh + maintenanceHourlyRateMlh;

  return {
    totalVolumeMl: Math.round(totalVolumeMl),
    firstEightHoursMl: Math.round(firstEightHoursMl),
    firstEightHoursRateMlh: parseFloat(firstEightHoursRateMlh.toFixed(1)),
    nextSixteenHoursMl: Math.round(nextSixteenHoursMl),
    nextSixteenHoursRateMlh: parseFloat(nextSixteenHoursRateMlh.toFixed(1)),
    maintenanceDailyVolumeMl,
    maintenanceHourlyRateMlh,
    combinedFirstEightHoursRateMlh: parseFloat(combinedFirstEightHoursRateMlh.toFixed(1)),
    combinedNextSixteenHoursRateMlh: parseFloat(combinedNextSixteenHoursRateMlh.toFixed(1))
  };
}

// --- 4. DIABETIC KETOACIDOSIS (CAD) ---

export interface DkaResult {
  correctedSodiumMeqL: number;
  bolusVolumeMl: number;
  insulinRateUiH: number;
  dehydrationDeficitMl: number;
  hourlyDeficitRateMlh: number;
  maintenanceHourlyRateMlh: number;
  totalHourlyFluidRateMlh: number;
}

/**
 * Calculates corrected sodium based on glucose levels:
 * Corrected Na = Measured Na + 1.6 * ((Glucose - 100) / 100)
 */
export function calculateCorrectedSodium(measuredNa: number, glucoseMgDl: number): number {
  if (measuredNa <= 0 || glucoseMgDl <= 0) return 0;
  if (glucoseMgDl <= 100) return measuredNa;
  const correctedNa = measuredNa + 1.6 * ((glucoseMgDl - 100) / 100);
  return parseFloat(correctedNa.toFixed(1));
}

/**
 * Calculates Diabetic Ketoacidosis (DKA) fluid and insulin management:
 * - Saline bolus: 10 - 20 mL/kg (default 10)
 * - Insulin rate: 0.05 - 0.1 UI/kg/h (default 0.1)
 * - Deficit correction: % Dehydration * Weight * 10, corrected over 48 hours.
 */
export function calculateDka(
  weightKg: number,
  measuredNa: number,
  glucoseMgDl: number,
  dehydrationPercentage: number, // e.g. 5, 10, 15
  bolusMlKg: number = 10,
  insulinUiKgH: number = 0.1,
  correctionHours: number = 48
): DkaResult {
  const correctedSodiumMeqL = calculateCorrectedSodium(measuredNa, glucoseMgDl);
  
  if (weightKg <= 0) {
    return {
      correctedSodiumMeqL,
      bolusVolumeMl: 0,
      insulinRateUiH: 0,
      dehydrationDeficitMl: 0,
      hourlyDeficitRateMlh: 0,
      maintenanceHourlyRateMlh: 0,
      totalHourlyFluidRateMlh: 0
    };
  }

  const bolusVolumeMl = weightKg * bolusMlKg;
  const insulinRateUiH = weightKg * insulinUiKgH;

  // Deficit volume = % Dehydration * Weight * 10
  const dehydrationDeficitMl = dehydrationPercentage * weightKg * 10;
  
  // Hourly deficit rate (subtracting bolus from deficit is standard to avoid volume overload)
  const netDeficitMl = Math.max(0, dehydrationDeficitMl - bolusVolumeMl);
  const hourlyDeficitRateMlh = netDeficitMl / correctionHours;

  // Maintenance fluids (Holliday-Segar)
  const maintenance = calculateHollidaySegar(weightKg);
  const maintenanceHourlyRateMlh = maintenance.hourlyRateMlh;

  const totalHourlyFluidRateMlh = hourlyDeficitRateMlh + maintenanceHourlyRateMlh;

  return {
    correctedSodiumMeqL,
    bolusVolumeMl: Math.round(bolusVolumeMl),
    insulinRateUiH: parseFloat(insulinRateUiH.toFixed(2)),
    dehydrationDeficitMl: Math.round(dehydrationDeficitMl),
    hourlyDeficitRateMlh: parseFloat(hourlyDeficitRateMlh.toFixed(1)),
    maintenanceHourlyRateMlh,
    totalHourlyFluidRateMlh: parseFloat(totalHourlyFluidRateMlh.toFixed(1))
  };
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

  // WHO rules:
  // - 2 or more signs of severe dehydration, including at least 1 key sign (lethargic/unconscious, unable to drink, very slow skin pinch) -> Severe
  // - 2 or more signs of some dehydration, including at least 1 key sign (irritable, thirsty, slow skin pinch) -> Some
  // - Otherwise -> None
  if (severeSigns >= 2) return 'severe';
  if (someSigns >= 2) return 'some';
  return 'none';
}

/**
 * Calculates rehydration requirements based on WHO Plans A, B, and C
 */
export function calculateEdaHydration(
  weightKg: number,
  ageMonths: number,
  severity: DehydrationSeverity
): EdaResult {
  if (weightKg <= 0) {
    return {
      severity,
      recommendedPlan: 'A',
      planDetails: 'Ingrese un peso válido para calcular los volúmenes.'
    };
  }

  if (severity === 'none') {
    const sroPerStool = ageMonths < 24 ? '50-100 mL' : '100-200 mL';
    return {
      severity,
      recommendedPlan: 'A',
      planDetails: `Plan A (Tratamiento en el hogar): Dar sales de rehidratación oral (SRO) después de cada evacuación líquida: ${sroPerStool}. Continuar lactancia materna y alimentación habitual.`
    };
  }

  if (severity === 'some') {
    // Plan B: 75 mL/kg over 4 hours
    const fluidVolumeMl = weightKg * 75;
    const hourlyRate = fluidVolumeMl / 4;
    return {
      severity,
      recommendedPlan: 'B',
      fluidVolumeMl: Math.round(fluidVolumeMl),
      planDetails: `Plan B (Rehidratación oral en sala de urgencias): Administrar ${Math.round(fluidVolumeMl)} mL de SRO en 4 horas (${Math.round(hourlyRate)} mL/h). Evaluar continuamente. Si tolera y mejora, pasar a Plan A.`,
      hourlyRates: {
        phase1RateMlh: parseFloat(hourlyRate.toFixed(1)),
        phase1DurationH: 4
      }
    };
  }

  // Plan C: 100 mL/kg IV (Ringer Lactato o Solución Salina 0.9%)
  // Infants < 12 months: 30 mL/kg in 1h, then 70 mL/kg in 5h (Total 6h)
  // Children >= 12 months: 30 mL/kg in 30 min, then 70 mL/kg in 2.5h (Total 3h)
  const totalVolumeMl = weightKg * 100;
  const phase1VolumeMl = weightKg * 30;
  const phase2VolumeMl = weightKg * 70;

  if (ageMonths < 12) {
    const phase1RateMlh = phase1VolumeMl / 1; // 30 mL/kg over 1 hour
    const phase2RateMlh = phase2VolumeMl / 5; // 70 mL/kg over 5 hours
    return {
      severity,
      recommendedPlan: 'C',
      fluidVolumeMl: Math.round(totalVolumeMl),
      planDetails: `Plan C (Rehidratación intravenosa rápida para deshidratación grave en lactantes < 12 meses): Administrar un total de ${Math.round(totalVolumeMl)} mL IV. Fase 1: ${Math.round(phase1VolumeMl)} mL en 1 hora (${Math.round(phase1RateMlh)} mL/h). Fase 2: ${Math.round(phase2VolumeMl)} mL en 5 horas (${Math.round(phase2RateMlh)} mL/h). Evaluar pulso radial cada 15-30 min.`,
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
      planDetails: `Plan C (Rehidratación intravenosa rápida para deshidratación grave en niños >= 12 meses): Administrar un total de ${Math.round(totalVolumeMl)} mL IV. Fase 1: ${Math.round(phase1VolumeMl)} mL en 30 minutos (${Math.round(phase1RateMlh)} mL/h). Fase 2: ${Math.round(phase2VolumeMl)} mL en 2.5 horas (${Math.round(phase2RateMlh)} mL/h). Evaluar pulso radial cada 15-30 min.`,
      hourlyRates: {
        phase1RateMlh: parseFloat(phase1RateMlh.toFixed(1)),
        phase1DurationH: 0.5,
        phase2RateMlh: parseFloat(phase2RateMlh.toFixed(1)),
        phase2DurationH: 2.5
      }
    };
  }
}
