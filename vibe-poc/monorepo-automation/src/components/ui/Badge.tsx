import { HTMLAttributes } from 'react'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'error' | 'warning'
}

const variantClasses = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-green-100 text-green-700',
  error: 'bg-red-100 text-red-700',
  warning: 'bg-yellow-100 text-yellow-700',
}

export function Badge({ variant = 'default', className = '', children, ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}
