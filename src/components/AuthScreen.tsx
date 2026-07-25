'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Activity, Mail, Lock, AlertCircle, CheckCircle2, UserPlus, LogIn } from 'lucide-react';

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
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
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) throw signUpError;

        if (data.user && data.session === null) {
          setMessage('¡Registro exitoso! Por favor, revisa tu correo electrónico para confirmar tu cuenta antes de iniciar sesión.');
        } else {
          setMessage('¡Registro exitoso! Iniciando sesión...');
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      // Translate common Supabase auth errors to Spanish
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 md:p-10 rounded-3xl border border-slate-200 shadow-xl shadow-slate-100">
        {/* Branding */}
        <div className="text-center">
          <div className="mx-auto bg-sky-600 text-white p-3.5 rounded-2xl shadow-lg shadow-sky-100 w-fit mb-4">
            <Activity className="h-8 w-8" />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            PediatriCode
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
            disabled={loading}
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
