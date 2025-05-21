import { useMutation } from '@tanstack/react-query'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:5000'

export interface LogoutResponse {
    message: string
    success: boolean
}

export const logout = async (): Promise<LogoutResponse> => {
    const response = await axios.post(
        `${API_BASE_URL}/auth/logout`,
        {},
        { withCredentials: true }
    )
    return response.data
}

export const useLogout = () => {
    return useMutation<LogoutResponse, Error>({
        mutationFn: logout,
    })
}
