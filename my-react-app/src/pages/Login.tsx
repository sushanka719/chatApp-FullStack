import React, { useEffect, useState } from 'react'
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { login, useLogin } from '../queries/LoginQuery'
interface LoginFormState {
    email: string
    password: string
}
interface LoginFormErrors {
    email?: string
    password?: string
}
export const Login: React.FC = () => {
    const [formState, setFormState] = useState<LoginFormState>({
        email: '',
        password: '',
    })
    const [errors, setErrors] = useState<LoginFormErrors>({})
    const [showPassword, setShowPassword] = useState<boolean>(false)

    const navigate = useNavigate()
    const { mutate: login, isPending, isSuccess, data } = useLogin();

    useEffect(() => {
        if (isSuccess) {
            
            navigate('/chatApp')
        }
    }, [isSuccess, navigate])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const { name, value, type, checked } = e.target
        setFormState({
            ...formState,
            [name]: type === 'checkbox' ? checked : value,
        })
        // Clear error when user starts typing
        if (errors[name as keyof LoginFormErrors]) {
            setErrors({
                ...errors,
                [name]: undefined,
            })
        }
    }
    const validateForm = (): boolean => {
        const newErrors: LoginFormErrors = {}
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
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }
    const handleSubmit = (e: React.FormEvent): void => {
        e.preventDefault()
        if (validateForm()) {
            login(formState)
        }
    }
    const togglePasswordVisibility = (): void => {
        setShowPassword(!showPassword)
    }
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Sign in to your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Or{' '}
                        <Link
                            to={'/signup'}
                            className="font-medium text-blue-600 hover:text-blue-500"
                        >
                            create a new account
                        </Link>
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md -space-y-px">
                        <div className="mb-4">
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Email address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MailIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
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
                        <div className="mb-4">
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <LockIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    value={formState.password}
                                    onChange={handleInputChange}
                                    className={`appearance-none block w-full pl-10 pr-10 py-2 border ${errors.password ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
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
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Sign in
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
