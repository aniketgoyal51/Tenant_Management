import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './Pages/Home'
import AddTenant from './Pages/AddTenant'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add_Tenant" element={<AddTenant />} />
      </Routes>
    </>
  )
}

export default App
