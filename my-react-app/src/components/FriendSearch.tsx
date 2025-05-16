import React, { useState } from 'react'
import { Search, UserPlus, Check, X } from 'lucide-react'
interface SearchResult {
    id: number
    name: string
    avatar: string
    status: 'none' | 'pending' | 'accepted'
}
const demoSearchResults: SearchResult[] = [
    {
        id: 4,
        name: 'Alice Johnson',
        avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
        status: 'none',
    },
    {
        id: 5,
        name: 'Bob Smith',
        avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
        status: 'pending',
    },
]
export const FriendSearch: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('')
    const [results, setResults] = useState<SearchResult[]>([])
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value)
        // Simulate search results
        if (e.target.value.length > 0) {
            setResults(demoSearchResults)
        } else {
            setResults([])
        }
    }
    return (
        <div className="p-4 border-b border-gray-200">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                    type="text"
                    placeholder="Search for friends..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>
            {results.length > 0 && (
                <div className="mt-4 space-y-2">
                    {results.map((result) => (
                        <div
                            key={result.id}
                            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg"
                        >
                            <div className="flex items-center gap-3">
                                <img
                                    src={result.avatar}
                                    alt={result.name}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                                <span className="font-medium">{result.name}</span>
                            </div>
                            {result.status === 'none' && (
                                <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-full">
                                    <UserPlus className="w-5 h-5" />
                                </button>
                            )}
                            {result.status === 'pending' && (
                                <div className="flex gap-2">
                                    <button className="p-2 text-green-500 hover:bg-green-50 rounded-full">
                                        <Check className="w-5 h-5" />
                                    </button>
                                    <button className="p-2 text-red-500 hover:bg-red-50 rounded-full">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                            {result.status === 'accepted' && (
                                <span className="text-sm text-gray-500">Friends</span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
