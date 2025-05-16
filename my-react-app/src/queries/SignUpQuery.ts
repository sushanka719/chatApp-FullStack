// hooks/loginQuery.ts
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:5000'

export interface SignupCredentials {
    email: string
    password: string
    username: string
}

export interface SignupResponse {
    user: {
        id: string
        email: string
        username: string
    }
}

export const signup = async (credentials: SignupCredentials): Promise<SignupResponse> => {
    console.log(credentials)
    const response = await axios.post(`${API_BASE_URL}/auth/signup`, credentials)
    return response.data
}

export const useSignUp = () =>
    useMutation<SignupResponse, Error, SignupCredentials>({
        mutationFn: signup,
    })
