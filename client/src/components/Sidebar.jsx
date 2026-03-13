import { NavLink } from 'react-router-dom'
import {
  X,
  Home,
  Users,
  UserCheck,
  Calendar,
  CreditCard,
  Stethoscope,
  Heart,
  Settings,
  LogOut
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Patients', href: '/patients', icon: Users },
  { name: 'Doctors', href: '/doctors', icon: UserCheck },
  { name: 'Appointments', href: '/appointments', icon: Calendar },
  { name: 'Billing', href: '/billing', icon: CreditCard },
]

const Sidebar = ({ open, setOpen }) => {
  const { user, logout } = useAuth()

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-white border-r border-gray-200 shadow-lg">
      {/* Logo Section */}
      <div className="flex h-20 items-center px-6 border-b border-gray-100">
        <div className="flex items-center">
          <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-2.5 rounded-xl shadow-md">
            <Stethoscope className="h-7 w-7 text-white" />
          </div>
          <div className="ml-3">
            <h1 className="text-xl font-bold text-gray-900">Siloam Clinic</h1>
            <div className="flex items-center">
              <Heart className="h-3 w-3 text-red-500 mr-1" />
              <p className="text-xs text-gray-500 font-medium">Healthcare Excellence</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `group flex items-center gap-x-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-50 to-teal-50 text-blue-700 border border-blue-200 shadow-sm'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50 hover:shadow-sm'
              }`
            }
            onClick={() => setOpen(false)}
          >
            <item.icon
              className={`h-5 w-5 shrink-0 transition-colors ${
                ({ isActive }) => isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-500'
              }`}
              aria-hidden="true"
            />
            {item.name}
          </NavLink>
        ))}
      </nav>
      
      {/* User Profile Section */}
      <div className="border-t border-gray-100 p-4">
        <div className="rounded-xl bg-gradient-to-r from-gray-50 to-blue-50/30 p-4 mb-3">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center shadow-md">
                <span className="text-sm font-bold text-white">
                  {user?.username?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-semibold text-gray-900">{user?.username || 'Admin'}</p>
              <p className="text-xs text-gray-600 capitalize">{user?.role || 'admin'} User</p>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Settings className="h-4 w-4" />
            Settings
          </button>
          <button 
            onClick={logout}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile sidebar overlay */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" 
            onClick={() => setOpen(false)} 
          />
          <div className="fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out">
            <div className="absolute right-4 top-4 z-10">
              <button
                type="button"
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/80 rounded-lg transition-colors"
                onClick={() => setOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <SidebarContent />
      </div>
    </>
  )
}

export default Sidebar