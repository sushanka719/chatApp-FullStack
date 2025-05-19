
import './App.css'
import {Login} from './pages/Login'
import { Routes, Route } from 'react-router-dom'
import {Signup} from './pages/Signup'
import {VerifyEmail} from './pages/VerifyEmail'
import { ChatApp } from './components/ChatApp'
import { useEffect } from 'react'
import { useAuthStore } from './stores/Features/authStore'

function App() {
  const {
    user,
    isLoading,
    isAuthenticated,
    error,
    checkAuth,
  } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [])

  if (isLoading) {
    return <div>Checking authentication...</div>;
  }

  return (
    <div>
    <Routes>
      <Route path='/' element={<Login/>}/>
      <Route path='/signup' element={<Signup/>}/>
      <Route path='/verifyEmail' element={<VerifyEmail/>}/>
      <Route path='/chatApp' element={<ChatApp/>}/>
    </Routes>
    </div>
  )
}

export default App
