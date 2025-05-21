import React from 'react';
import { Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '../stores/Features/authStore';
import { toast } from 'react-toastify';
import { useLogout } from '../queries/LogOutQuery';
import { useNavigate } from 'react-router-dom'; // import useNavigate

export const UserProfile: React.FC = () => {
    const user = useAuthStore((state) => state.user);
    const { mutate: logout } = useLogout();
    const navigate = useNavigate();  // initialize navigate

    const handleLogout = () => {
        logout(undefined, {
            onSuccess: () => {
                toast.success('Logged out successfully');
                navigate('/');  // redirect to login page
            },
            onError: (error) => {
                toast.error(error.message || 'Logout failed');
            }
        });
    };

    return (
        <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <img
                            src="https://randomuser.me/api/portraits/women/1.jpg"
                            alt="user avatar"
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <span className="absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full bg-green-500" />
                    </div>
                    <div className="max-w-[150px] overflow-hidden whitespace-nowrap text-ellipsis">
                        <h3 className="font-medium">{user?.username}</h3>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-full" aria-label="Settings">
                        <Settings className="w-5 h-5 text-gray-500" />
                    </button>
                    <button
                        className="p-2 hover:bg-gray-100 rounded-full"
                        aria-label="Log Out"
                        onClick={handleLogout}
                    >
                        <LogOut className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
            </div>
        </div>
    );
};
