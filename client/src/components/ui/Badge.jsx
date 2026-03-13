import { forwardRef } from 'react'

const Badge = forwardRef(({ 
  className = '', 
  variant = 'secondary', 
  children, 
  ...props 
}, ref) => {
  const variants = {
    primary: 'badge-primary',
    secondary: 'badge-secondary',
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger'
  }
  
  return (
    <span
      ref={ref}
      className={`${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
})

Badge.displayName = 'Badge'

export { Badge }