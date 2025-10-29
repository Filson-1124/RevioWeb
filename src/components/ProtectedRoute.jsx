import React from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "./AuthContext"

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth()
  const location = useLocation()

  // While checking Firebase auth, don't render anything yet
  if (isLoggedIn === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#12121A] text-white">
        Checking authentication...
      </div>
    )
  }

  // If not logged in, redirect to Login with the last attempted path
  if (!isLoggedIn) {
    return <Navigate to="/" state={{ from: location }} replace />
  }

  // Otherwise, allow access
  return children
}

export default ProtectedRoute
