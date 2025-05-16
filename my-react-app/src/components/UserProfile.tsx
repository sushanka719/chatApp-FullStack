import React from 'react'
import { Settings, LogOut } from 'lucide-react'
interface UserProfileProps {
    user: {
        name: string
        avatar: string
        status: string
        email: string
    }
}
export const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
    return (
        <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <span className="absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full bg-green-500" />
                    </div>
                    <div>
                        <h3 className="font-medium">{user.name}</h3>
                        <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-full">
                        <Settings className="w-5 h-5 text-gray-500" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-full">
                        <LogOut className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
            </div>
        </div>
    )
}
