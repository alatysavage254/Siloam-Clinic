import { useState, useEffect } from 'react'
import { Plus, Download, DollarSign, FileText } from 'lucide-react'
import { useForm } from 'react-hook-form'
import api from '../utils/api'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const Billing = () => {
  const [billings, setBillings] = useState([])
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [services, setServices] = useState([{ name: '', cost: '' }])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm()

  const selectedAppointment = watch('appointmentId')

  useEffect(() => {
    fetchBillings()
    fetchPatients()
    fetchDoctors()
    fetchAppointments()
  }, [])

  const fetchBillings = async () => {
    try {
      setLoading(true)
      const response = await api.get('/billing')
      setBillings(response.data.data)
    } catch (error) {
      console.error('Failed to fetch billings:', error)
      toast.error('Failed to fetch billings')
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

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/appointments?status=approved')
      setAppointments(response.data.data)
    } catch (error) {
      console.error('Failed to fetch appointments:', error)
    }
  }

  const onSubmit = async (data) => {
    try {
      const billingData = {
        ...data,
        services: services.filter(service => service.name && service.cost)
      }

      await api.post('/billing', billingData)
      toast.success('Invoice created successfully')
      setShowModal(false)
      reset()
      setServices([{ name: '', cost: '' }])
      fetchBillings()
    } catch (error) {
      console.error('Failed to create invoice:', error)
      toast.error(error.response?.data?.message || 'Failed to create invoice')
    }
  }

  const downloadInvoice = async (billingId) => {
    try {
      const response = await api.get(`/billing/${billingId}/invoice`, {
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `invoice-${billingId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to download invoice:', error)
      toast.error('Failed to download invoice')
    }
  }

  const markAsPaid = async (billingId) => {
    const paymentMethod = prompt('Enter payment method (cash, card, mobile_money, bank_transfer):')
    if (!paymentMethod) return

    try {
      await api.put(`/billing/${billingId}/pay`, { paymentMethod })
      toast.success('Payment recorded successfully')
      fetchBillings()
    } catch (error) {
      console.error('Failed to record payment:', error)
      toast.error('Failed to record payment')
    }
  }

  const addService = () => {
    setServices([...services, { name: '', cost: '' }])
  }

  const removeService = (index) => {
    setServices(services.filter((_, i) => i !== index))
  }

  const updateService = (index, field, value) => {
    const updatedServices = [...services]
    updatedServices[index][field] = value
    setServices(updatedServices)
  }

  const getSelectedAppointment = () => {
    return appointments.find(apt => apt._id === selectedAppointment)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <span className="badge badge-success">Paid</span>
      case 'overdue':
        return <span className="badge badge-danger">Overdue</span>
      default:
        return <span className="badge badge-warning">Pending</span>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
          <p className="text-gray-600">Manage invoices and payments</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Create Invoice
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
                      Invoice
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doctor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
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
                  {billings.map((billing) => (
                    <tr key={billing._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {billing.invoiceNumber}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(billing.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {billing.patientId?.fullName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {billing.patientId?.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          Dr. {billing.doctorId?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {billing.doctorId?.specialization}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          KES {billing.totalAmount?.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(billing.paymentStatus)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => downloadInvoice(billing._id)}
                            className="text-primary-600 hover:text-primary-900"
                            title="Download Invoice"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          {billing.paymentStatus === 'pending' && (
                            <button
                              onClick={() => markAsPaid(billing._id)}
                              className="text-green-600 hover:text-green-900"
                              title="Mark as Paid"
                            >
                              <DollarSign className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {billings.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No invoices found</p>
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
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Create New Invoice
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Appointment</label>
                      <select
                        {...register('appointmentId', { required: 'Appointment is required' })}
                        className={`input mt-1 ${errors.appointmentId ? 'input-error' : ''}`}
                      >
                        <option value="">Select appointment</option>
                        {appointments.map((appointment) => (
                          <option key={appointment._id} value={appointment._id}>
                            {appointment.patientId?.fullName} - Dr. {appointment.doctorId?.name} - {new Date(appointment.date).toLocaleDateString()}
                          </option>
                        ))}
                      </select>
                      {errors.appointmentId && (
                        <p className="mt-1 text-sm text-red-600">{errors.appointmentId.message}</p>
                      )}
                    </div>

                    {selectedAppointment && (
                      <>
                        <input
                          {...register('patientId')}
                          type="hidden"
                          value={getSelectedAppointment()?.patientId?._id || ''}
                        />
                        <input
                          {...register('doctorId')}
                          type="hidden"
                          value={getSelectedAppointment()?.doctorId?._id || ''}
                        />
                      </>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Services</label>
                      {services.map((service, index) => (
                        <div key={index} className="flex space-x-2 mb-2">
                          <input
                            type="text"
                            placeholder="Service name"
                            value={service.name}
                            onChange={(e) => updateService(index, 'name', e.target.value)}
                            className="input flex-1"
                          />
                          <input
                            type="number"
                            placeholder="Cost"
                            value={service.cost}
                            onChange={(e) => updateService(index, 'cost', e.target.value)}
                            className="input w-32"
                          />
                          {services.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeService(index)}
                              className="btn-danger btn-sm"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addService}
                        className="btn-secondary btn-sm"
                      >
                        Add Service
                      </button>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total Amount:</span>
                        <span className="text-lg font-bold">
                          KES {services.reduce((total, service) => total + (parseFloat(service.cost) || 0), 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" className="btn-primary sm:ml-3">
                    Create Invoice
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

export default Billing