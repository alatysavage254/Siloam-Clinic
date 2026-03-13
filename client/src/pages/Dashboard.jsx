import { useState, useEffect } from 'react'
import { 
  Users, 
  UserCheck, 
  Calendar, 
  DollarSign, 
  Clock, 
  TrendingUp,
  Activity,
  Heart
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import api from '../utils/api'
import LoadingSpinner from '../components/LoadingSpinner'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui'
import { Badge } from '../components/ui'

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/dashboard/stats')
      setStats(response.data.data)
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const statCards = [
    {
      name: 'Total Patients',
      value: stats?.overview?.totalPatients || 0,
      icon: Users,
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      growth: stats?.growth?.patientGrowth || 0,
      description: 'Registered patients'
    },
    {
      name: 'Total Doctors',
      value: stats?.overview?.totalDoctors || 0,
      icon: UserCheck,
      color: 'bg-gradient-to-r from-teal-500 to-teal-600',
      growth: 0,
      description: 'Active doctors'
    },
    {
      name: 'Today\'s Appointments',
      value: stats?.overview?.todayAppointments || 0,
      icon: Calendar,
      color: 'bg-gradient-to-r from-green-500 to-green-600',
      growth: 0,
      description: 'Scheduled today'
    },
    {
      name: 'Pending Appointments',
      value: stats?.overview?.pendingAppointments || 0,
      icon: Clock,
      color: 'bg-gradient-to-r from-amber-500 to-amber-600',
      growth: 0,
      description: 'Awaiting approval'
    },
    {
      name: 'Total Revenue',
      value: `KES ${(stats?.overview?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
      growth: stats?.growth?.revenueGrowth || 0,
      description: 'This month'
    },
    {
      name: 'Total Appointments',
      value: stats?.overview?.totalAppointments || 0,
      icon: Activity,
      color: 'bg-gradient-to-r from-purple-500 to-purple-600',
      growth: stats?.growth?.appointmentGrowth || 0,
      description: 'All time'
    }
  ]

  // Mock data for charts - replace with real data from API
  const appointmentTrends = [
    { name: 'Mon', appointments: 12 },
    { name: 'Tue', appointments: 19 },
    { name: 'Wed', appointments: 15 },
    { name: 'Thu', appointments: 22 },
    { name: 'Fri', appointments: 18 },
    { name: 'Sat', appointments: 8 },
    { name: 'Sun', appointments: 5 }
  ]

  const revenueData = [
    { name: 'Jan', revenue: 45000 },
    { name: 'Feb', revenue: 52000 },
    { name: 'Mar', revenue: 48000 },
    { name: 'Apr', revenue: 61000 },
    { name: 'May', revenue: 55000 },
    { name: 'Jun', revenue: 67000 }
  ]

  const serviceDistribution = [
    { name: 'Dental Checkup', value: 35, color: '#0ea5e9' },
    { name: 'Eye Examination', value: 25, color: '#14b8a6' },
    { name: 'Dental Cleaning', value: 20, color: '#22c55e' },
    { name: 'Eye Surgery', value: 15, color: '#f59e0b' },
    { name: 'Other', value: 5, color: '#ef4444' }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening at Siloam Clinic today.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Heart className="h-5 w-5 text-red-500" />
          <span className="text-sm text-gray-600">Healthcare Excellence</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.name} variant="stat" className="group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.description}</p>
                  {stat.growth !== 0 && (
                    <div className="flex items-center mt-2">
                      <TrendingUp className={`h-3 w-3 mr-1 ${stat.growth > 0 ? 'text-green-600' : 'text-red-600'}`} />
                      <span className={`text-xs font-medium ${stat.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.growth > 0 ? '+' : ''}{stat.growth}% from last month
                      </span>
                    </div>
                  )}
                </div>
                <div className={`stat-icon ${stat.color} group-hover:scale-110 transition-transform duration-200`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointment Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Appointment Trends</CardTitle>
            <CardDescription>Appointments scheduled this week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={appointmentTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Bar dataKey="appointments" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
            <CardDescription>Monthly revenue over the past 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value) => [`KES ${value.toLocaleString()}`, 'Revenue']}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#14b8a6" 
                  strokeWidth={3}
                  dot={{ fill: '#14b8a6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Appointments */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Appointments</CardTitle>
              <CardDescription>Latest appointment bookings and their status</CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.recentAppointments?.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{appointment.patient}</p>
                          <p className="text-sm text-gray-600">Dr. {appointment.doctor}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                          </p>
                        </div>
                      </div>
                      <Badge variant={
                        appointment.status === 'approved' ? 'success' :
                        appointment.status === 'pending' ? 'warning' :
                        'danger'
                      }>
                        {appointment.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No recent appointments</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Service Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Service Distribution</CardTitle>
            <CardDescription>Popular services breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={serviceDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {serviceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {serviceDistribution.map((service) => (
                <div key={service.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: service.color }}
                    />
                    <span className="text-gray-600">{service.name}</span>
                  </div>
                  <span className="font-medium text-gray-900">{service.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard