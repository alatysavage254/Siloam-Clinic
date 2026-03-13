import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import api from '../utils/api'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const Doctors = () => {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm()

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      setLoading(true)
      const response = await api.get('/doctors')
      setDoctors(response.data.data)
    } catch (error) {
      console.error('Failed to fetch doctors:', error)
      toast.error('Failed to fetch doctors')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data) => {
    try {
      if (editingDoctor) {
        await api.put(`/doctors/${editingDoctor._id}`, data)
        toast.success('Doctor updated successfully')
      } else {
        await api.post('/doctors', data)
        toast.success('Doctor added successfully')
      }
      
      setShowModal(false)
      setEditingDoctor(null)
      reset()
      fetchDoctors()
    } catch (error) {
      console.error('Failed to save doctor:', error)
      toast.error(error.response?.data?.message || 'Failed to save doctor')
    }
  }

  const handleEdit = (doctor) => {
    setEditingDoctor(doctor)
    setValue('name', doctor.name)
    setValue('specialization', doctor.specialization)
    setValue('phone', doctor.phone)
    setValue('email', doctor.email)
    setValue('availableDays', doctor.availableDays)
    setShowModal(true)
  }

  const handleDelete = async (doctorId) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        await api.delete(`/doctors/${doctorId}`)
        toast.success('Doctor deleted successfully')
        fetchDoctors()
      } catch (error) {
        console.error('Failed to delete doctor:', error)
        toast.error('Failed to delete doctor')
      }
    }
  }

  const openModal = () => {
    setEditingDoctor(null)
    reset()
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingDoctor(null)
    reset()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Doctors</h1>
          <p className="text-gray-600">Manage doctor profiles and availability</p>
        </div>
        <button onClick={openModal} className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add Doctor
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
                      Doctor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Specialization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Available Days
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {doctors.map((doctor) => (
                    <tr key={doctor._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          Dr. {doctor.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`badge ${doctor.specialization === 'Dental' ? 'badge-primary' : 'badge-success'}`}>
                          {doctor.specialization}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{doctor.phone}</div>
                        <div className="text-sm text-gray-500">{doctor.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {doctor.availableDays.map((day) => (
                            <span key={day} className="badge badge-secondary text-xs">
                              {day.slice(0, 3)}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(doctor)}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(doctor._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {doctors.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No doctors found</p>
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
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeModal} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <input
                        {...register('name', { required: 'Name is required' })}
                        className={`input mt-1 ${errors.name ? 'input-error' : ''}`}
                        placeholder="Doctor's name"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Specialization</label>
                      <select
                        {...register('specialization', { required: 'Specialization is required' })}
                        className={`input mt-1 ${errors.specialization ? 'input-error' : ''}`}
                      >
                        <option value="">Select specialization</option>
                        <option value="Dental">Dental</option>
                        <option value="Eye">Eye</option>
                      </select>
                      {errors.specialization && (
                        <p className="mt-1 text-sm text-red-600">{errors.specialization.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <input
                          {...register('phone', { required: 'Phone is required' })}
                          className={`input mt-1 ${errors.phone ? 'input-error' : ''}`}
                          placeholder="Phone number"
                        />
                        {errors.phone && (
                          <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                          {...register('email', { 
                            required: 'Email is required',
                            pattern: {
                              value: /^\S+@\S+$/i,
                              message: 'Invalid email address'
                            }
                          })}
                          type="email"
                          className={`input mt-1 ${errors.email ? 'input-error' : ''}`}
                          placeholder="Email address"
                        />
                        {errors.email && (
                          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Available Days</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                          <label key={day} className="flex items-center">
                            <input
                              {...register('availableDays', { required: 'Select at least one day' })}
                              type="checkbox"
                              value={day}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">{day}</span>
                          </label>
                        ))}
                      </div>
                      {errors.availableDays && (
                        <p className="mt-1 text-sm text-red-600">{errors.availableDays.message}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" className="btn-primary sm:ml-3">
                    {editingDoctor ? 'Update' : 'Add'} Doctor
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
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

export default Doctors