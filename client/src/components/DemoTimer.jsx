import { useState, useEffect } from 'react'
import { Clock, AlertTriangle } from 'lucide-react'

const DemoTimer = ({ onExpire }) => {
  const DEMO_DURATION = 3 * 60 * 60 * 1000 // 3 hours in milliseconds
  
  // Initialize timer with localStorage persistence
  const initializeTimer = () => {
    const savedStartTime = localStorage.getItem('demoStartTime')
    const now = Date.now()
    
    if (savedStartTime) {
      const elapsed = now - parseInt(savedStartTime)
      const remaining = DEMO_DURATION - elapsed
      return remaining > 0 ? remaining : 0
    } else {
      // First time - save start time
      localStorage.setItem('demoStartTime', now.toString())
      return DEMO_DURATION
    }
  }

  const [timeLeft, setTimeLeft] = useState(initializeTimer())
  const [isExpired, setIsExpired] = useState(timeLeft <= 0)

  useEffect(() => {
    if (isExpired) {
      onExpire()
      return
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1000) {
          setIsExpired(true)
          onExpire()
          return 0
        }
        return prev - 1000
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [onExpire, isExpired])

  const formatTime = (ms) => {
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((ms % (1000 * 60)) / 1000)
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const getWarningLevel = () => {
    const hoursLeft = timeLeft / (1000 * 60 * 60)
    if (hoursLeft <= 0.5) return 'critical' // Last 30 minutes
    if (hoursLeft <= 1) return 'warning' // Last hour
    return 'normal'
  }

  const warningLevel = getWarningLevel()

  if (isExpired) return null

  return (
    <div className={`
      fixed top-20 right-4 z-50 px-6 py-3 rounded-2xl shadow-2xl border-2 transition-all duration-300 backdrop-blur-sm
      ${warningLevel === 'critical' ? 'bg-red-50/90 border-red-300 animate-pulse shadow-red-500/25' : 
        warningLevel === 'warning' ? 'bg-amber-50/90 border-amber-300 shadow-amber-500/25' : 
        'bg-blue-50/90 border-blue-300 shadow-blue-500/25'}
    `}>
      <div className="flex items-center space-x-3">
        {warningLevel === 'critical' ? (
          <AlertTriangle className="h-6 w-6 text-red-600" />
        ) : (
          <Clock className="h-6 w-6 text-blue-600" />
        )}
        <div className="text-base">
          <div className={`font-bold text-lg ${
            warningLevel === 'critical' ? 'text-red-700' : 
            warningLevel === 'warning' ? 'text-amber-700' : 
            'text-blue-700'
          }`}>
            DEMO MODE
          </div>
          <div className={`font-mono text-xl font-bold ${
            warningLevel === 'critical' ? 'text-red-600' : 
            warningLevel === 'warning' ? 'text-amber-600' : 
            'text-blue-600'
          }`}>
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>
      {warningLevel === 'critical' && (
        <div className="text-sm text-red-600 mt-2 font-semibold text-center">
          ⚠️ Demo expires soon!
        </div>
      )}
    </div>
  )
}

export default DemoTimer