import { useState, useEffect } from 'react'
import { Plus, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import api from '../utils/api'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const Appointments = () => {
  const [appointments, setAppointments] = useState([])
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm()

  useEffect(() => {
    fetchAppointments()
    fetchPatients()
    fetchDoctors()
  }, [])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const response = await api.get('/appointments')
      setAppointments(response.data.data)
    } catch (error) {
      console.error('Failed to fetch appointments:', error)
      toast.error('Failed to fetch appointments')
    } finally {
      setLoading(false)
    }
  }

  const fetchPatients = async () => {
    try {
      const response = await api.get('/patients')
      setPatients(response.data.data)
    } catch (error) {
      console.error('Failed to fetch patients:', error)
    }
  }

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/doctors')
      setDoctors(response.data.data)
    } catch (error) {
      console.error('Failed to fetch doctors:', error)
    }
  }

  const onSubmit = async (data) => {
    try {
      await api.post('/appointments', data)
      toast.success('Appointment booked successfully')
      setShowModal(false)
      reset()
      fetchAppointments()
    } catch (error) {
      console.error('Failed to book appointment:', error)
      toast.error(error.response?.data?.message || 'Failed to book appointment')
    }
  }

  const updateStatus = async (appointmentId, status) => {
    try {
      await api.put(`/appointments/${appointmentId}/status`, { status })
      toast.success(`Appointment ${status} successfully`)
      fetchAppointments()
    } catch (error) {
      console.error('Failed to update appointment:', error)
      toast.error('Failed to update appointment')
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="badge badge-success">Approved</span>
      case 'rejected':
        return <span className="badge badge-danger">Rejected</span>
      default:
        return <span className="badge badge-warning">Pending</span>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600">Manage patient appointments and scheduling</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Book Appointment
        </button>
      </div>

      <div className="card">
        <div className="card-content p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doctor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.map((appointment) => (
                    <tr key={appointment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {appointment.patientId?.fullName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {appointment.patientId?.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          Dr. {appointment.doctorId?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {appointment.doctorId?.specialization}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(appointment.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          {appointment.time}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {appointment.reason}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(appointment.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {appointment.status === 'pending' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => updateStatus(appointment._id, 'approved')}
                              className="text-green-600 hover:text-green-900"
                              title="Approve"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => updateStatus(appointment._id, 'rejected')}
                              className="text-red-600 hover:text-red-900"
                              title="Reject"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {appointments.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No appointments found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowModal(false)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Book New Appointment
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Patient</label>
                      <select
                        {...register('patientId', { required: 'Patient is required' })}
                        className={`input mt-1 ${errors.patientId ? 'input-error' : ''}`}
                      >
                        <option value="">Select patient</option>
                        {patients.map((patient) => (
                          <option key={patient._id} value={patient._id}>
                            {patient.fullName} - {patient.phone}
                          </option>
                        ))}
                      </select>
                      {errors.patientId && (
                        <p className="mt-1 text-sm text-red-600">{errors.patientId.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Doctor</label>
                      <select
                        {...register('doctorId', { required: 'Doctor is required' })}
                        className={`input mt-1 ${errors.doctorId ? 'input-error' : ''}`}
                      >
                        <option value="">Select doctor</option>
                        {doctors.map((doctor) => (
                          <option key={doctor._id} value={doctor._id}>
                            Dr. {doctor.name} - {doctor.specialization}
                          </option>
                        ))}
                      </select>
                      {errors.doctorId && (
                        <p className="mt-1 text-sm text-red-600">{errors.doctorId.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Date</label>
                        <input
                          {...register('date', { required: 'Date is required' })}
                          type="date"
                          min={new Date().toISOString().split('T')[0]}
                          className={`input mt-1 ${errors.date ? 'input-error' : ''}`}
                        />
                        {errors.date && (
                          <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Time</label>
                        <input
                          {...register('time', { required: 'Time is required' })}
                          type="time"
                          className={`input mt-1 ${errors.time ? 'input-error' : ''}`}
                        />
                        {errors.time && (
                          <p className="mt-1 text-sm text-red-600">{errors.time.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Reason</label>
                      <textarea
                        {...register('reason', { required: 'Reason is required' })}
                        rows={3}
                        className={`input mt-1 ${errors.reason ? 'input-error' : ''}`}
                        placeholder="Reason for appointment"
                      />
                      {errors.reason && (
                        <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" className="btn-primary sm:ml-3">
                    Book Appointment
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-secondary mt-3 sm:mt-0"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Appointments