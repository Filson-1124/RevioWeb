import React from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "./AuthContext"

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth()
  const location = useLocation()

  if (isLoggedIn === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#12121A] text-white">
        Checking authentication...
      </div>
    )
  }

  
  if (!isLoggedIn) {
    return <Navigate to="/" state={{ from: location }} replace />
  }


  return children
}

export default ProtectedRoute
