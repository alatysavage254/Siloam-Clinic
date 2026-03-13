import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'

const Button = forwardRef(({ 
  className = '', 
  variant = 'primary', 
  size = 'md', 
  loading = false,
  disabled = false,
  children, 
  ...props 
}, ref) => {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    success: 'btn-success',
    warning: 'btn-warning',
    danger: 'btn-danger'
  }
  
  const sizes = {
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg'
  }
  
  return (
    <button
      ref={ref}
      className={`${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
})

Button.displayName = 'Button'

export { Button }