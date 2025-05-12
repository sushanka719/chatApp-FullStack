
import './App.css'
import Login from './pages/Login'
import { Routes, Route } from 'react-router-dom'
import Signup from './pages/Signup'
import VerifyEmail from './pages/VerifyEmail'
import Chatapp from './pages/ChatApp'

function App() {
  return (
    <div>
    <Routes>
      <Route path='/' element={<Login/>}/>
      <Route path='/chatapp' element={<Chatapp/>}/>
      <Route path='/signup' element={<Signup/>}/>
      <Route path='/verifyEmail' element={<VerifyEmail/>}/>
    </Routes>
    </div>
  )
}

export default App
