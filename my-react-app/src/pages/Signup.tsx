import React, { useEffect, useState } from 'react'
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon, UserIcon } from 'lucide-react'
import { useSignUp } from '../queries/SignUpQuery'
import { useNavigate } from 'react-router-dom'
interface SignupFormState {
  username: string
  email: string
  password: string
  confirmPassword: string
}
interface SignupFormErrors {
  username?: string
  email?: string
  password?: string
  confirmPassword?: string
}
export const Signup: React.FC = () => {
  const [formState, setFormState] = useState<SignupFormState>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<SignupFormErrors>({})
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target
    setFormState({
      ...formState,
      [name]: value,
    })
    // Clear error when user starts typing
    if (errors[name as keyof SignupFormErrors]) {
      setErrors({
        ...errors,
        [name]: undefined,
      })
    }
  }

  const navigate = useNavigate();
  const {mutate: signup, isPending, error, isSuccess, data} = useSignUp()

  useEffect(() => {
    if (isSuccess) {
      navigate('/verifyEmail');
    }
  }, [isSuccess, navigate]);

  const validateForm = (): boolean => {
    const newErrors: SignupFormErrors = {}
    if (!formState.username) {
      newErrors.username = 'Username is required'
    } else if (formState.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    }
    if (!formState.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formState.email)) {
      newErrors.email = 'Email is invalid'
    }
    if (!formState.password) {
      newErrors.password = 'Password is required'
    } else if (formState.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    if (!formState.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formState.confirmPassword !== formState.password) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    if (validateForm()) {
      const {email, password, username} = formState;
      signup({ email, password, username });
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <a
              href="#"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              sign in to your existing account
            </a>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formState.username}
                  onChange={handleInputChange}
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border ${errors.username ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  placeholder="johndoe"
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MailIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formState.email}
                  onChange={handleInputChange}
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formState.password}
                  onChange={handleInputChange}
                  className={`appearance-none block w-full pl-10 pr-10 py-2 border ${errors.password ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formState.confirmPassword}
                  onChange={handleInputChange}
                  className={`appearance-none block w-full pl-10 pr-10 py-2 border ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOffIcon className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign up
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
