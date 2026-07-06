import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/bricolage-grotesque'
import '@fontsource-variable/plus-jakarta-sans'
import App from './App.jsx'
import AdminDashboard from './components/AdminDashboard.jsx'
import './index.css'

// Routing ringkas: ?admin pada URL buka Admin Dashboard (login), selain itu
// papar peraduan awam. URL tak berubah tanpa reload, jadi ini stabil.
const isAdminRoute = new URLSearchParams(window.location.search).has('admin')

createRoot(document.getElementById('root')).render(
  <StrictMode>{isAdminRoute ? <AdminDashboard /> : <App />}</StrictMode>,
)
