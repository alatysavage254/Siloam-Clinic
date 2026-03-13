import { createContext, useContext, useReducer, useEffect } from 'react'
import api from '../utils/api'
import toast from 'react-hot-toast'

const AuthContext = createContext()

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  error: null
}

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      }
    case 'LOGIN_SUCCESS':
      localStorage.setItem('token', action.payload.token)
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null
      }
    case 'LOGIN_FAILURE':
      localStorage.removeItem('token')
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: action.payload
      }
    case 'LOGOUT':
      localStorage.removeItem('token')
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: null
      }
    case 'LOAD_USER_SUCCESS':
      return {
        ...state,
        user: action.payload,
        loading: false,
        error: null
      }
    case 'LOAD_USER_FAILURE':
      localStorage.removeItem('token')
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: action.payload
      }
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      }
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      }
    default:
      return state
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Load user on app start
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token')
      
      if (!token) {
        dispatch({ type: 'SET_LOADING', payload: false })
        return
      }

      try {
        const response = await api.get('/auth/profile')
        dispatch({ type: 'LOAD_USER_SUCCESS', payload: response.data.data })
      } catch (error) {
        console.error('Failed to load user:', error)
        dispatch({ type: 'LOAD_USER_FAILURE', payload: error.response?.data?.message || 'Failed to load user' })
      }
    }

    loadUser()
  }, [])

  // Login function
  const login = async (credentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const response = await api.post('/auth/login', credentials)
      
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: {
          user: response.data.user,
          token: response.data.token
        }
      })
      
      toast.success('Login successful!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      dispatch({ type: 'LOGIN_FAILURE', payload: message })
      toast.error(message)
      return { success: false, error: message }
    }
  }

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const response = await api.post('/auth/register', userData)
      
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: {
          user: response.data.user,
          token: response.data.token
        }
      })
      
      toast.success('Registration successful!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed'
      dispatch({ type: 'LOGIN_FAILURE', payload: message })
      toast.error(message)
      return { success: false, error: message }
    }
  }

  // Logout function
  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      dispatch({ type: 'LOGOUT' })
      toast.success('Logged out successfully')
    }
  }

  // Update profile function
  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData)
      
      dispatch({ type: 'UPDATE_USER', payload: response.data.data })
      toast.success('Profile updated successfully!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  // Update password function
  const updatePassword = async (passwordData) => {
    try {
      await api.put('/auth/password', passwordData)
      toast.success('Password updated successfully!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Password update failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const value = {
    user: state.user,
    token: state.token,
    loading: state.loading,
    error: state.error,
    login,
    register,
    logout,
    updateProfile,
    updatePassword,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}