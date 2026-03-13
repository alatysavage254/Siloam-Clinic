import { useState, useEffect } from 'react'
import { Moon, Sun } from 'lucide-react'

const DarkModeToggle = () => {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // FORCE light mode as default - ignore system preference
    const stored = localStorage.getItem('darkMode')
    const shouldBeDark = stored === 'true'
    
    setIsDark(shouldBeDark)
    
    // Always start with light mode unless explicitly set to dark
    if (shouldBeDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
      // Force light mode
      localStorage.setItem('darkMode', 'false')
    }
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !isDark
    setIsDark(newDarkMode)
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('darkMode', 'true')
      console.log('✅ Switched to DARK mode')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('darkMode', 'false')
      console.log('☀️ Switched to LIGHT mode')
    }
    
    // Force a small delay to ensure DOM updates
    setTimeout(() => {
      console.log('Current theme:', document.documentElement.classList.contains('dark') ? 'DARK' : 'LIGHT')
    }, 100)
  }

  // Emergency light mode function
  const forceLightMode = () => {
    setIsDark(false)
    document.documentElement.classList.remove('dark')
    localStorage.setItem('darkMode', 'false')
    console.log('🚨 FORCED LIGHT MODE')
  }

  return (
    <div className="flex items-center space-x-2">
      {/* Emergency Light Mode Button */}
      <button
        onClick={forceLightMode}
        className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded border border-yellow-300 hover:bg-yellow-200"
        title="Force Light Mode"
      >
        💡 Light
      </button>
      
      {/* Regular Toggle */}
      <button
        onClick={toggleDarkMode}
        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 border border-gray-300 dark:border-gray-600"
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </button>
    </div>
  )
}

export default DarkModeToggle