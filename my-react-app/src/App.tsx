
import './App.css'
import {Login} from './pages/Login'
import { Routes, Route } from 'react-router-dom'
import {Signup} from './pages/Signup'
import {VerifyEmail} from './pages/VerifyEmail'
import { ChatApp } from './components/ChatApp'

function App() {
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
