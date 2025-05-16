import React, { useState } from 'react'
import { MailIcon, RefreshCwIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
interface VerifyEmailProps {
  email?: string
}
export const VerifyEmail: React.FC<VerifyEmailProps> = ({
  email = 'your email',
}) => {
  const [isResending, setIsResending] = useState(false)
  const [resendStatus, setResendStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle')
  const handleResendVerification = async () => {
    setIsResending(true)
    setResendStatus('idle')
    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setResendStatus('success')
    } catch (error) {
      setResendStatus('error')
    } finally {
      setIsResending(false)
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md text-center">
        <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-blue-100">
          <MailIcon className="h-8 w-8 text-blue-600" />
        </div>
        <div className="mt-4">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Check your email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We sent a verification link to
          </p>
          <p className="mt-1 text-lg font-medium text-gray-900">{email}</p>
        </div>
        <div className="mt-4 space-y-4">
          <p className="text-sm text-gray-500">
            Click the link in the email to verify your account. If you don't see
            the email, check your spam folder.
          </p>
          <div className="border-t border-b border-gray-200 py-4">
            <button
              onClick={handleResendVerification}
              disabled={isResending}
              className={`flex items-center justify-center w-full px-4 py-2 text-sm font-medium rounded-md ${isResending ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
            >
              {isResending ? (
                <RefreshCwIcon className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCwIcon className="w-4 h-4 mr-2" />
              )}
              Resend verification email
            </button>
            {resendStatus === 'success' && (
              <p className="mt-2 text-sm text-green-500">
                Verification email has been resent!
              </p>
            )}
            {resendStatus === 'error' && (
              <p className="mt-2 text-sm text-red-500">
                Failed to resend. Please try again.
              </p>
            )}
          </div>
          <p className="text-sm text-gray-500">
            Go back to login?{' '}
            <Link
              to={'/'}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
