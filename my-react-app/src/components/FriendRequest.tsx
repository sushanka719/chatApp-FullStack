import React from 'react'
import { Check, X } from 'lucide-react'
interface FriendRequestProps {
    request: {
        id: number
        name: string
        avatar: string
        timestamp: string
    }
    onAccept: (id: number) => void
    onReject: (id: number) => void
}
export const FriendRequest: React.FC<FriendRequestProps> = ({
    request,
    onAccept,
    onReject,
}) => {
    return (
        <div className="flex items-center justify-between p-3 hover:bg-gray-50">
            <div className="flex items-center gap-3">
                <img
                    src={request.avatar}
                    alt={request.name}
                    className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                    <h4 className="font-medium">{request.name}</h4>
                    <p className="text-sm text-gray-500">{request.timestamp}</p>
                </div>
            </div>
            <div className="flex gap-2">
                <button
                    onClick={() => onAccept(request.id)}
                    className="p-2 text-green-500 hover:bg-green-50 rounded-full"
                >
                    <Check className="w-5 h-5" />
                </button>
                <button
                    onClick={() => onReject(request.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    )
}
