


import { useMutation } from "@tanstack/react-query"
import axios from "axios"

const API_BASE_URL = 'http://localhost:5000'

export interface LoginCredentaials {
    email: string
    password: string
}

export interface LoginResponse {
    user: {
        message: string
        success: boolean
    }
}

export const login =  async ( credentials: LoginCredentaials): Promise<LoginResponse> => {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials, {withCredentials: true})
    return response.data
}

export const useLogin = () => {
    return useMutation<LoginResponse, Error, LoginCredentaials>({
        mutationFn: login
    })
}