'use client';

import React, { useState } from 'react';
import { supabase, isSupabaseConfigured, getSiteURL } from '@/lib/supabase';
import { Activity, Mail, Lock, AlertCircle, CheckCircle2, UserPlus, LogIn, User, Stethoscope, Building2, ShieldCheck } from 'lucide-react';

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  
  // Additional profile details for registration
  const [fullName, setFullName] = useState<string>('');
  const [specialty, setSpecialty] = useState<string>('pediatria');
  const [hospital, setHospital] = useState<string>('');
  const [medicalLicense, setMedicalLicense] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (!supabase) {
      setError('Error de configuración: Supabase no está inicializado.');
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        // Sign up with additional metadata
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName.trim() || 'Médico Anónimo',
              specialty,
              hospital: hospital.trim(),
              medical_license: medicalLicense.trim(),
            },
            emailRedirectTo: getSiteURL(),
          }
        });

        if (signUpError) throw signUpError;

        if (data.user && data.session === null) {
          setMessage('¡Registro exitoso! Por favor, revisa tu correo electrónico para confirmar tu cuenta antes de iniciar sesión.');
        } else {
          setMessage('¡Registro exitoso! Iniciando sesión...');
        }
      } else {
        // Standard login
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      let errMsg = err.message || 'Ocurrió un error inesperado.';
      if (errMsg.includes('Invalid login credentials')) {
        errMsg = 'Credenciales de inicio de sesión inválidas. Por favor verifica tu correo y contraseña.';
      } else if (errMsg.includes('User already registered')) {
        errMsg = 'Este correo electrónico ya está registrado.';
      } else if (errMsg.includes('Password should be')) {
        errMsg = 'La contraseña debe tener al menos 6 caracteres.';
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);

    if (!supabase || !isSupabaseConfigured) {
      setError('Supabase no está configurado.');
      setGoogleLoading(false);
      return;
    }

    try {
      const { error: googleError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getSiteURL(),
        },
      });

      if (googleError) throw googleError;
    } catch (err: any) {
      console.error('Google Auth error:', err);
      setError(err.message || 'Error al conectar con Google.');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-8 md:p-10 rounded-3xl border border-slate-200 shadow-xl shadow-slate-100 transition-all duration-300">
        {/* Branding */}
        <div className="text-center">
          <div className="mx-auto bg-sky-600 text-white p-3.5 rounded-2xl shadow-lg shadow-sky-100 w-fit mb-4">
            <Activity className="h-8 w-8" />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            PediaCode
          </h2>
          <p className="mt-1.5 text-xs md:text-sm text-slate-500 font-medium">
            Calculadora Clínica de Urgencias Pediátricas
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-5" onSubmit={handleAuth}>
          {error && (
            <div className="flex gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-900 text-xs md:text-sm font-medium">
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="flex gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-900 text-xs md:text-sm font-medium">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Sign Up Fields (Only shown during registration) */}
            {isSignUp && (
              <div className="space-y-4 animate-fade-in">
                {/* Full Name */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Nombre Completo</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Dr(a). Nombre Apellido"
                      className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-sky-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-100 transition-all font-medium text-slate-900"
                    />
                  </div>
                </div>

                {/* Specialty */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Especialidad Médica</label>
                  <div className="relative">
                    <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                    <select
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-sky-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-100 transition-all font-semibold text-slate-900 cursor-pointer"
                    >
                      <option value="pediatria">Pediatría</option>
                      <option value="urgencias_pediatricas">Urgencias Pediátricas</option>
                      <option value="medicina_general">Medicina General</option>
                      <option value="residente_pediatria">Residente de Pediatría</option>
                      <option value="enfermeria_pediatrica">Enfermería Pediátrica</option>
                      <option value="otra">Otra Especialidad</option>
                    </select>
                  </div>
                </div>

                {/* Hospital / Clinic */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Hospital / Clínica</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={hospital}
                      onChange={(e) => setHospital(e.target.value)}
                      placeholder="Hospital Universitario / Clínica"
                      className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-sky-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-100 transition-all font-medium text-slate-900"
                    />
                  </div>
                </div>

                {/* Medical License */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Registro Médico / Tarjeta Profesional</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={medicalLicense}
                      onChange={(e) => setMedicalLicense(e.target.value)}
                      placeholder="Reg. 12345678"
                      className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-sky-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-100 transition-all font-mono text-slate-900"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@hospital.com"
                  className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-sky-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-100 transition-all font-medium text-slate-900"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-sky-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-100 transition-all font-mono text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white font-bold text-sm rounded-xl shadow-lg shadow-sky-100 hover:shadow-sky-200 disabled:shadow-none transition-all duration-200 cursor-pointer"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : isSignUp ? (
              <>
                <UserPlus className="h-4 w-4" />
                Crear Cuenta
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                Iniciar Sesión
              </>
            )}
          </button>
        </form>

        {/* Divider for Social Login */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-100"></div>
          <span className="flex-shrink mx-4 text-slate-400 text-[10px] uppercase font-bold tracking-wider">O continuar con</span>
          <div className="flex-grow border-t border-slate-100"></div>
        </div>

        {/* Google Login Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading || googleLoading}
          className="w-full flex items-center justify-center gap-3 px-6 py-2.5 bg-white hover:bg-slate-50 disabled:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-sm rounded-xl shadow-sm transition-all duration-200 cursor-pointer"
        >
          {googleLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-700"></div>
          ) : (
            <>
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-3.2 3.28-7.91 3.28-13.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </>
          )}
        </button>

        {/* Toggle Mode */}
        <div className="text-center pt-2 border-t border-slate-100">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              setMessage(null);
            }}
            className="text-xs font-bold text-sky-600 hover:text-sky-700 transition-colors cursor-pointer"
          >
            {isSignUp ? '¿Ya tienes una cuenta? Inicia Sesión' : '¿No tienes cuenta? Regístrate gratis'}
          </button>
        </div>
      </div>
    </div>
  );
}
