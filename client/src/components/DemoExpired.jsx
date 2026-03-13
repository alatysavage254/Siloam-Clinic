import { Clock, Lock, Mail, Phone } from 'lucide-react'

const DemoExpired = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Demo Expired</h1>
          <p className="text-gray-600">
            The demonstration period has ended. Thank you for your interest in our healthcare management system.
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-center mb-3">
            <Lock className="h-5 w-5 text-gray-500 mr-2" />
            <span className="text-sm font-medium text-gray-700">Access Restricted</span>
          </div>
          <p className="text-xs text-gray-500">
            This demo was designed to showcase our modern healthcare dashboard capabilities.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Interested in the full version?</h3>
          
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-center mb-2">
              <Phone className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-sm font-semibold text-blue-800">Call for More Information</span>
            </div>
            <a 
              href="tel:0746836004" 
              className="text-xl font-bold text-blue-600 hover:text-blue-800 transition-colors"
            >
              0746 836 004
            </a>
            <p className="text-xs text-blue-600 mt-1">Click to call directly</p>
          </div>

          <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-1" />
              <span>Email us</span>
            </div>
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-1" />
              <span>Schedule demo</span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            Siloam Dental & Eye Clinic Management System
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Professional Healthcare Solutions
          </p>
        </div>
      </div>
    </div>
  )
}

export default DemoExpired