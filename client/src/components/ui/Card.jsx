import { forwardRef } from 'react'

const Card = forwardRef(({ className = '', children, variant = 'default', ...props }, ref) => {
  const variants = {
    default: 'card',
    medical: 'card-medical',
    stat: 'stat-card'
  }
  
  return (
    <div
      ref={ref}
      className={`${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
})

const CardHeader = forwardRef(({ className = '', children, ...props }, ref) => (
  <div ref={ref} className={`card-header ${className}`} {...props}>
    {children}
  </div>
))

const CardTitle = forwardRef(({ className = '', children, ...props }, ref) => (
  <h3 ref={ref} className={`card-title ${className}`} {...props}>
    {children}
  </h3>
))

const CardDescription = forwardRef(({ className = '', children, ...props }, ref) => (
  <p ref={ref} className={`card-description ${className}`} {...props}>
    {children}
  </p>
))

const CardContent = forwardRef(({ className = '', children, ...props }, ref) => (
  <div ref={ref} className={`card-content ${className}`} {...props}>
    {children}
  </div>
))

const CardFooter = forwardRef(({ className = '', children, ...props }, ref) => (
  <div ref={ref} className={`card-footer ${className}`} {...props}>
    {children}
  </div>
))

Card.displayName = 'Card'
CardHeader.displayName = 'CardHeader'
CardTitle.displayName = 'CardTitle'
CardDescription.displayName = 'CardDescription'
CardContent.displayName = 'CardContent'
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }