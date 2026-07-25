'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { calculateBSA } from '@/lib/formulas';
import { getConsultations, saveConsultation, PatientConsultation, deleteConsultation as deleteDbConsultation } from '@/lib/supabase';

interface PatientState {
  name: string;
  ageMonths: number;
  weightKg: number;
  heightCm: number;
  bsa: number;
  activeTab: 'mantenimiento' | 'quemaduras' | 'cad' | 'eda' | 'historial';
  history: PatientConsultation[];
  isLoadingHistory: boolean;
}

interface PatientContextType extends PatientState {
  setName: (name: string) => void;
  setAgeMonths: (months: number) => void;
  setWeightKg: (weight: number) => void;
  setHeightCm: (height: number) => void;
  setActiveTab: (tab: 'mantenimiento' | 'quemaduras' | 'cad' | 'eda' | 'historial') => void;
  saveCurrentConsultation: (
    type: 'mantenimiento' | 'quemaduras' | 'cad' | 'eda',
    details: Record<string, any>
  ) => Promise<boolean>;
  deleteConsultation: (id: string) => Promise<boolean>;
  refreshHistory: () => Promise<void>;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export function PatientProvider({ children }: { children: React.ReactNode }) {
  // Patient basic details
  const [name, setName] = useState<string>('');
  const [ageMonths, setAgeMonths] = useState<number>(12); // Default 1 year
  const [weightKg, setWeightKg] = useState<number>(10); // Default 10 kg
  const [heightCm, setHeightCm] = useState<number>(75); // Default 75 cm
  const [bsa, setBsa] = useState<number>(0);

  // App navigation
  const [activeTab, setActiveTab] = useState<'mantenimiento' | 'quemaduras' | 'cad' | 'eda' | 'historial'>('mantenimiento');

  // History state
  const [history, setHistory] = useState<PatientConsultation[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);

  // Calculate BSA automatically whenever weight or height changes
  useEffect(() => {
    const calculatedBsa = calculateBSA(weightKg, heightCm);
    setBsa(calculatedBsa);
  }, [weightKg, heightCm]);

  // Fetch consultations history
  const refreshHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const { data, error } = await getConsultations();
      if (!error && data) {
        setHistory(data);
      }
    } catch (err) {
      console.error('Error fetching consultations history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  // Fetch history on mount
  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  // Save current consultation
  const saveCurrentConsultation = async (
    type: 'mantenimiento' | 'quemaduras' | 'cad' | 'eda',
    details: Record<string, any>
  ): Promise<boolean> => {
    try {
      const { data, error } = await saveConsultation({
        patient_name: name.trim() || 'Paciente Anónimo',
        age_months: ageMonths,
        weight_kg: weightKg,
        talla_cm: heightCm,
        sc_m2: bsa,
        consultation_type: type,
        details,
      });

      if (!error && data) {
        // Refresh history to include the new consultation
        await refreshHistory();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error saving consultation:', err);
      return false;
    }
  };

  // Delete consultation
  const deleteConsultation = async (id: string): Promise<boolean> => {
    try {
      const { success, error } = await deleteDbConsultation(id);
      if (success && !error) {
        await refreshHistory();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting consultation:', err);
      return false;
    }
  };

  return (
    <PatientContext.Provider
      value={{
        name,
        ageMonths,
        weightKg,
        heightCm,
        bsa,
        activeTab,
        history,
        isLoadingHistory,
        setName,
        setAgeMonths,
        setWeightKg,
        setHeightCm,
        setActiveTab,
        saveCurrentConsultation,
        deleteConsultation,
        refreshHistory,
      }}
    >
      {children}
    </PatientContext.Provider>
  );
}

export function usePatient() {
  const context = useContext(PatientContext);
  if (context === undefined) {
    throw new Error('usePatient must be used within a PatientProvider');
  }
  return context;
}
