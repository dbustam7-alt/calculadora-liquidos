'use client';

import React from 'react';
import { AlertTriangle, ShieldAlert, Info, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';

interface ClinicalAlertProps {
  type: 'info' | 'warning' | 'critical' | 'success';
  title: string;
  message: string;
  className?: string;
}

export default function ClinicalAlert({ type, title, message, className }: ClinicalAlertProps) {
  const icons = {
    info: <Info className="h-5 w-5 text-sky-600 dark:text-sky-400 shrink-0" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />,
    critical: <ShieldAlert className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />,
    success: <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />,
  };

  const styles = {
    info: 'bg-sky-50 dark:bg-sky-950/20 border-sky-200 dark:border-sky-900/40 text-sky-900 dark:text-sky-200',
    warning: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-200',
    critical: 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40 text-rose-900 dark:text-rose-200 animate-pulse-subtle',
    success: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200',
  };

  return (
    <div
      className={clsx(
        'flex gap-3 p-4 rounded-xl border text-sm shadow-sm transition-all duration-200',
        styles[type],
        className
      )}
    >
      {icons[type]}
      <div className="flex-1">
        <h4 className="font-semibold mb-0.5 leading-tight">{title}</h4>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs md:text-sm">{message}</p>
      </div>
    </div>
  );
}
