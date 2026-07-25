import { createClient } from '@supabase/supabase-js';

// Define the Consultation schema
export interface PatientConsultation {
  id: string;
  patient_name: string;
  age_months: number;
  weight_kg: number;
  talla_cm: number;
  sc_m2: number;
  consultation_type: 'mantenimiento' | 'quemaduras' | 'cad' | 'eda';
  details: Record<string, any>;
  created_at: string;
  user_id?: string; // Tied to the authenticated user
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if Supabase credentials are provided
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Initialize Supabase client if configured, otherwise null
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    })
  : null;

// --- OFFLINE-FIRST LOCALSTORAGE FALLBACK SERVICE ---

const LOCAL_STORAGE_KEY = 'pediatricode_consultations';

/**
 * Gets all consultations from localStorage
 */
function getLocalConsultations(): PatientConsultation[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
}

/**
 * Saves a consultation to localStorage
 */
function saveLocalConsultation(consultation: PatientConsultation): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getLocalConsultations();
    const updated = [consultation, ...current];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

// --- GLOBAL CONSULTATION SERVICE ---

/**
 * Saves a new clinical consultation
 */
export async function saveConsultation(
  consultationData: Omit<PatientConsultation, 'id' | 'created_at'>
): Promise<{ data: PatientConsultation | null; error: Error | null }> {
  const newConsultation: PatientConsultation = {
    ...consultationData,
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
    created_at: new Date().toISOString(),
  };

  // Always save to localStorage as a local backup / offline fallback
  saveLocalConsultation(newConsultation);

  if (isSupabaseConfigured && supabase) {
    try {
      // Get current session to attach user_id
      const { data: { session } } = await supabase.auth.getSession();
      const user_id = session?.user?.id;

      const payload = user_id ? { ...newConsultation, user_id } : newConsultation;

      const { data, error } = await supabase
        .from('patient_consultations')
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.warn('Supabase insert failed, using local storage backup:', error);
        return { data: newConsultation, error: null };
      }

      return { data: data as PatientConsultation, error: null };
    } catch (err) {
      console.warn('Supabase connection error, using local storage backup:', err);
      return { data: newConsultation, error: null };
    }
  }

  return { data: newConsultation, error: null };
}

/**
 * Fetches all consultations (merges Supabase and localStorage if possible, or falls back to localStorage)
 */
export async function getConsultations(): Promise<{ data: PatientConsultation[]; error: Error | null }> {
  const localData = getLocalConsultations();

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('patient_consultations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase fetch failed, falling back to local storage:', error);
        return { data: localData, error: null };
      }

      // Merge local and remote consultations, removing duplicates by ID
      const merged = [...(data as PatientConsultation[])];
      const remoteIds = new Set(merged.map((c) => c.id));
      
      for (const local of localData) {
        if (!remoteIds.has(local.id)) {
          merged.push(local);
        }
      }

      // Sort merged by date descending
      merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      return { data: merged, error: null };
    } catch (err) {
      console.warn('Supabase connection error, falling back to local storage:', err);
      return { data: localData, error: null };
    }
  }

  return { data: localData, error: null };
}

/**
 * Deletes a consultation
 */
export async function deleteConsultation(id: string): Promise<{ success: boolean; error: Error | null }> {
  // Delete from localStorage
  if (typeof window !== 'undefined') {
    try {
      const current = getLocalConsultations();
      const updated = current.filter((c) => c.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error deleting from localStorage:', error);
    }
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('patient_consultations')
        .delete()
        .eq('id', id);

      if (error) {
        console.warn('Supabase delete failed:', error);
        return { success: false, error: new Error(error.message) };
      }
    } catch (err) {
      console.warn('Supabase connection error during delete:', err);
      return { success: false, error: err as Error };
    }
  }

  return { success: true, error: null };
}
