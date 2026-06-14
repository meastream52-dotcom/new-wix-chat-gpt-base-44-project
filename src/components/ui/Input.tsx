'use client'

import { InputHTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function Input({ label, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</label>}
      <input
        className={clsx('rounded-lg px-3 py-2 outline-none transition-all', className)}
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
        {...props}
      />
    </div>
  )
}
