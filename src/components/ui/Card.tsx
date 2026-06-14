import { HTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={clsx('rounded-xl p-6', className)}
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      {...props}
    >
      {children}
    </div>
  )
}
