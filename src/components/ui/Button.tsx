'use client'

import { ButtonHTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed',
        {
          'text-white': variant === 'primary',
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-4 py-2 text-base': size === 'md',
          'px-6 py-3 text-lg': size === 'lg',
        },
        className
      )}
      style={variant === 'primary' ? { background: 'var(--accent)', color: 'white' } :
             variant === 'secondary' ? { background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' } :
             { color: 'var(--text-secondary)' }}
      {...props}
    >
      {children}
    </button>
  )
}
