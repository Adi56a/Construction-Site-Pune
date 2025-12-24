// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import CreateSite from './pages/CreateSite'
import Site from './pages/Site'
import SiteDetails from './pages/SiteDetails'
import AddMaterialList from './pages/AddMaterialList'
import SiteMaterials from './pages/SiteMaterial'
import SiteMaterialDetails from './pages/SiteMaterialDetails'


function App() {
  return (
    <Router> {/* Wrap Routes in Router */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/site" element={<Site />} />
        <Route path="/create-site" element={<CreateSite />} />
        <Route path="/site-details" element={<SiteDetails />} />
        <Route path="/add-material-list" element={<AddMaterialList />} />
        <Route path="/site-material" element={<SiteMaterials />} />
        <Route path="/site-material-details" element={<SiteMaterialDetails />} />
        
        {/* Add other routes here */}
      </Routes>
    </Router>
  )
}

export default App
