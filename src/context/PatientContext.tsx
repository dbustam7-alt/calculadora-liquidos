'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { calculateBSA } from '@/lib/formulas';
import { getConsultations, saveConsultation, PatientConsultation, deleteConsultation as deleteDbConsultation, supabase, isSupabaseConfigured } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface PatientState {
  ageMonths: number;
  weightKg: number;
  heightCm: number;
  bsa: number;
  activeTab: 'dashboard' | 'mantenimiento' | 'quemaduras' | 'cad' | 'eda' | 'equipamiento' | 'historial' | 'info';
  history: PatientConsultation[];
  isLoadingHistory: boolean;
  user: SupabaseUser | null;
  isAuthLoading: boolean;
  darkMode: boolean;
}

interface PatientContextType extends PatientState {
  setAgeMonths: (months: number) => void;
  setWeightKg: (weight: number) => void;
  setHeightCm: (height: number) => void;
  setActiveTab: (tab: 'dashboard' | 'mantenimiento' | 'quemaduras' | 'cad' | 'eda' | 'equipamiento' | 'historial' | 'info') => void;
  saveCurrentConsultation: (
    type: 'mantenimiento' | 'quemaduras' | 'cad' | 'eda',
    details: Record<string, any>
  ) => Promise<boolean>;
  deleteConsultation: (id: string) => Promise<boolean>;
  refreshHistory: () => Promise<void>;
  signOut: () => Promise<void>;
  toggleDarkMode: () => void;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export function PatientProvider({ children }: { children: React.ReactNode }) {
  // Patient basic details
  const [ageMonths, setAgeMonths] = useState<number>(12); // Default 1 year
  const [weightKg, setWeightKg] = useState<number>(10); // Default 10 kg
  const [heightCm, setHeightCm] = useState<number>(75); // Default 75 cm
  const [bsa, setBsa] = useState<number>(0);

  // App navigation
  const [activeTab, setActiveTab] = useState<'dashboard' | 'mantenimiento' | 'quemaduras' | 'cad' | 'eda' | 'equipamiento' | 'historial' | 'info'>('dashboard');

  // History state
  const [history, setHistory] = useState<PatientConsultation[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);

  // Auth state
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  // Theme / Dark Mode state
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Load initial theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
    setDarkMode(initialDark);
    if (initialDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem('theme', next ? 'dark' : 'light');
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

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

  // Calculate BSA automatically whenever weight changes (height is purely informative)
  useEffect(() => {
    const calculatedBsa = calculateBSA(weightKg);
    setBsa(calculatedBsa);
  }, [weightKg]);

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
        patient_name: 'Consulta',
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
        ageMonths,
        weightKg,
        heightCm,
        bsa,
        activeTab,
        history,
        isLoadingHistory,
        user,
        isAuthLoading,
        darkMode,
        setAgeMonths,
        setWeightKg,
        setHeightCm,
        setActiveTab,
        saveCurrentConsultation,
        deleteConsultation,
        refreshHistory,
        signOut,
        toggleDarkMode,
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
