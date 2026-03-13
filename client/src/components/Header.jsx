import { useState } from 'react'
import { Menu, Bell, Search, Calendar, Clock, Info } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { Badge } from './ui'

const Header = ({ setSidebarOpen }) => {
  const [searchFocus, setSearchFocus] = useState(false)
  const { user } = useAuth()

  // Get current date and time
  const now = new Date()
  const currentDate = now.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
  const currentTime = now.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })

  return (
    <>
      {/* Demo Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-teal-600 to-blue-600 text-white px-4 py-3 text-center relative overflow-hidden">
        {/* Animated background effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
        
        {/* Main content */}
        <div className="relative z-10">
          <div className="flex items-center justify-center space-x-3 mb-1">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
              <span className="text-lg font-bold tracking-wider uppercase bg-red-500 px-3 py-1 rounded-full text-white shadow-lg">
                🎯 DEMO MODE
              </span>
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
            </div>
          </div>
          
          {/* Scrolling text effect */}
          <div className="overflow-hidden whitespace-nowrap">
            <div className="inline-block animate-pulse">
              <span className="text-base font-semibold text-yellow-200 drop-shadow-lg">
                Siloam Clinic Healthcare Management System Showcase
              </span>
            </div>
          </div>
          
          {/* Breaking news style underline */}
          <div className="mt-2 flex justify-center">
            <div className="h-1 w-32 bg-gradient-to-r from-yellow-400 via-red-400 to-yellow-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      <div className="sticky top-0 z-40 flex h-20 items-center gap-x-6 border-b border-gray-200 bg-white/80 backdrop-blur-md px-4 shadow-sm sm:px-6 lg:px-8">
        {/* Mobile menu button */}
        <button
          type="button"
          className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          onClick={() => setSidebarOpen(true)}
        >
          <span className="sr-only">Open sidebar</span>
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="flex flex-1 items-center justify-between">
          {/* Left section - Welcome message and date/time */}
          <div className="flex items-center space-x-6">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Good {now.getHours() < 12 ? 'Morning' : now.getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.username || 'Admin'}!
              </h1>
              <div className="flex items-center space-x-4 mt-1">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-1" />
                  {currentDate}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-1" />
                  {currentTime}
                </div>
              </div>
            </div>
          </div>

          {/* Right section - Search and notifications */}
          <div className="flex items-center space-x-4">
            {/* Search bar */}
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search patients, doctors..."
                  className={`
                    w-80 pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-xl
                    bg-white placeholder-gray-500 transition-all duration-200
                    focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none
                    ${searchFocus ? 'shadow-md' : 'shadow-sm'}
                  `}
                  onFocus={() => setSearchFocus(true)}
                  onBlur={() => setSearchFocus(false)}
                />
              </div>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                type="button"
                className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors relative"
              >
                <Bell className="h-5 w-5" />
                <Badge 
                  variant="danger" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0 min-w-0"
                >
                  3
                </Badge>
              </button>
            </div>

            {/* User profile */}
            <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">{user?.username || 'Admin'}</p>
                <p className="text-xs text-gray-600 capitalize">{user?.role || 'admin'} User</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center shadow-md">
                <span className="text-sm font-bold text-white">
                  {user?.username?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Header