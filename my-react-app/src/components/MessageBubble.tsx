import React from 'react'
interface MessageProps {
    content: string
    timestamp: string
    isOwn: boolean
    status?: 'sent' | 'delivered' | 'read'
}
export const MessageBubble: React.FC<MessageProps> = ({
    content,
    timestamp,
    isOwn,
    status = 'sent',
}) => {
    return (
        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
            <div
                className={`max-w-[70%] rounded-lg px-4 py-2 ${isOwn ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
            >
                <p className="text-sm">{content}</p>
                <div
                    className={`flex items-center gap-1 mt-1 text-xs ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}
                >
                    <span>{timestamp}</span>
                    {isOwn && (
                        <span>
                            {status === 'read' && '✓✓'}
                            {status === 'delivered' && '✓✓'}
                            {status === 'sent' && '✓'}
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}
