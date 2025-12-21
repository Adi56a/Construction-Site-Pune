// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import CreateSite from './pages/CreateSite'
import Site from './pages/Site'

function App() {
  return (
    <Router> {/* Wrap Routes in Router */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/site" element={<Site />} />
        <Route path="/create-site" element={<CreateSite />} />
        {/* Add other routes here */}
      </Routes>
    </Router>
  )
}

export default App
