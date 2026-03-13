import { forwardRef } from 'react'

const Input = forwardRef(({ 
  className = '', 
  type = 'text',
  error = false,
  icon: Icon,
  ...props 
}, ref) => {
  return (
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Icon className="h-4 w-4" />
        </div>
      )}
      <input
        type={type}
        ref={ref}
        className={`
          input
          ${error ? 'input-error' : ''}
          ${Icon ? 'pl-10' : ''}
          ${className}
        `}
        {...props}
      />
    </div>
  )
})

Input.displayName = 'Input'

export { Input }