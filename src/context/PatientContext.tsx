'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { calculateBSA } from '@/lib/formulas';
import { getConsultations, saveConsultation, PatientConsultation, deleteConsultation as deleteDbConsultation, supabase, isSupabaseConfigured } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface PatientState {
  name: string;
  ageMonths: number;
  weightKg: number;
  heightCm: number;
  bsa: number;
  activeTab: 'mantenimiento' | 'quemaduras' | 'cad' | 'eda' | 'historial';
  history: PatientConsultation[];
  isLoadingHistory: boolean;
  user: SupabaseUser | null;
  isAuthLoading: boolean;
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
  signOut: () => Promise<void>;
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

  // Auth state
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  // Listen to Auth changes
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setIsAuthLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsAuthLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsAuthLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Calculate BSA automatically whenever weight or height changes
  useEffect(() => {
    const calculatedBsa = calculateBSA(weightKg, heightCm);
    setBsa(calculatedBsa);
  }, [weightKg, heightCm]);

  // Fetch consultations history
  const refreshHistory = useCallback(async () => {
    if (isAuthLoading) return;
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
  }, [isAuthLoading]);

  // Fetch history when auth finishes loading or user changes
  useEffect(() => {
    refreshHistory();
  }, [refreshHistory, user]);

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

  // Sign out function
  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      // Clear history upon signout
      setHistory([]);
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
        user,
        isAuthLoading,
        setName,
        setAgeMonths,
        setWeightKg,
        setHeightCm,
        setActiveTab,
        saveCurrentConsultation,
        deleteConsultation,
        refreshHistory,
        signOut,
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
