import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react'
import { useForm } from 'react-hook-form'
import api from '../utils/api'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const Patients = () => {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPatient, setEditingPatient] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm()

  useEffect(() => {
    fetchPatients()
  }, [currentPage, searchTerm])

  const fetchPatients = async () => {
    try {
      setLoading(true)
      const response = await api.get('/patients', {
        params: {
          page: currentPage,
          limit: 10,
          search: searchTerm
        }
      })
      setPatients(response.data.data)
      setTotalPages(response.data.pages)
    } catch (error) {
      console.error('Failed to fetch patients:', error)
      toast.error('Failed to fetch patients')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data) => {
    try {
      if (editingPatient) {
        await api.put(`/patients/${editingPatient._id}`, data)
        toast.success('Patient updated successfully')
      } else {
        await api.post('/patients', data)
        toast.success('Patient registered successfully')
      }
      
      setShowModal(false)
      setEditingPatient(null)
      reset()
      fetchPatients()
    } catch (error) {
      console.error('Failed to save patient:', error)
      toast.error(error.response?.data?.message || 'Failed to save patient')
    }
  }

  const handleEdit = (patient) => {
    setEditingPatient(patient)
    setValue('fullName', patient.fullName)
    setValue('phone', patient.phone)
    setValue('email', patient.email)
    setValue('dateOfBirth', patient.dateOfBirth.split('T')[0])
    setValue('gender', patient.gender)
    setValue('address', patient.address)
    setValue('nationalId', patient.nationalId)
    setValue('medicalNotes', patient.medicalNotes || '')
    setShowModal(true)
  }

  const handleDelete = async (patientId) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        await api.delete(`/patients/${patientId}`)
        toast.success('Patient deleted successfully')
        fetchPatients()
      } catch (error) {
        console.error('Failed to delete patient:', error)
        toast.error('Failed to delete patient')
      }
    }
  }

  const openModal = () => {
    setEditingPatient(null)
    reset()
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingPatient(null)
    reset()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Patients</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage patient records and information</p>
        </div>
        <button onClick={openModal} className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add Patient
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search patients..."
            className="input pl-10"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
          />
        </div>
      </div>

      {/* Patients Table */}
      <div className="card">
        <div className="card-content p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Age/Gender
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      National ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {patients.map((patient) => (
                    <tr key={patient._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {patient.fullName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Registered: {new Date(patient.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">{patient.phone}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{patient.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">{patient.age} years</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{patient.gender}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {patient.nationalId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(patient)}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(patient._id)}
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

              {patients.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">No patients found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="btn-secondary disabled:opacity-50"
          >
            Previous
          </button>
          <span className="flex items-center px-4 py-2 text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="btn-secondary disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeModal} />
            
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                    {editingPatient ? 'Edit Patient' : 'Add New Patient'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                      <input
                        {...register('fullName', { required: 'Full name is required' })}
                        className={`input mt-1 ${errors.fullName ? 'input-error' : ''}`}
                        placeholder="Enter full name"
                      />
                      {errors.fullName && (
                        <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
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

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                        <input
                          {...register('dateOfBirth', { required: 'Date of birth is required' })}
                          type="date"
                          className={`input mt-1 ${errors.dateOfBirth ? 'input-error' : ''}`}
                        />
                        {errors.dateOfBirth && (
                          <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Gender</label>
                        <select
                          {...register('gender', { required: 'Gender is required' })}
                          className={`input mt-1 ${errors.gender ? 'input-error' : ''}`}
                        >
                          <option value="">Select gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                        {errors.gender && (
                          <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Address</label>
                      <textarea
                        {...register('address', { required: 'Address is required' })}
                        rows={2}
                        className={`input mt-1 ${errors.address ? 'input-error' : ''}`}
                        placeholder="Enter address"
                      />
                      {errors.address && (
                        <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">National ID</label>
                      <input
                        {...register('nationalId', { required: 'National ID is required' })}
                        className={`input mt-1 ${errors.nationalId ? 'input-error' : ''}`}
                        placeholder="National ID number"
                      />
                      {errors.nationalId && (
                        <p className="mt-1 text-sm text-red-600">{errors.nationalId.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Medical Notes (Optional)</label>
                      <textarea
                        {...register('medicalNotes')}
                        rows={3}
                        className="input mt-1"
                        placeholder="Any medical notes or conditions"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" className="btn-primary sm:ml-3">
                    {editingPatient ? 'Update' : 'Register'} Patient
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

export default Patients