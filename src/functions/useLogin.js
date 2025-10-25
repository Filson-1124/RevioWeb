import React, { useState, useEffect } from 'react'
import { signInWithEmailAndPassword, sendEmailVerification, onAuthStateChanged } from 'firebase/auth'
import { auth } from "../components/firebase";
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../components/AuthContext'

import 'react-toastify/dist/ReactToastify.css'

export const useLogin = () =>{
const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isVerified, setIsVerified] = useState(null)
  const [resendTimer, setResendTimer] = useState(0)
  const [isResendDisabled, setIsResendDisabled] = useState(false)
  const [showPass, setShowpass] = useState(false)
  const { setIsLoggedIn } = useAuth()
  const navigate = useNavigate()
  const [isLoggingIn, setIsLoggingIn] = useState(true)
  const [isDone, setIsDone] = useState(false)

  // check auth state
  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user && user.emailVerified) {
      setIsLoggedIn(true)
      setIsDone(true)
      localStorage.setItem('isLoggedInWeb', true)
      navigate('/Main/Library')
    } else {
      setIsLoggingIn(false)
    }
  })

  // failsafe: stop loading after 3 seconds if nothing happens
  const timeout = setTimeout(() => {
    setIsLoggingIn(false)
  }, 3000)

  return () => {
    clearTimeout(timeout)
    unsubscribe()
  }
}, [navigate, setIsLoggedIn])


  // resend timer countdown
  useEffect(() => {
    let interval
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1)
      }, 1000)
    } else {
      setIsResendDisabled(false)
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [resendTimer])

  const handleSubmit = async (e) => {
    e.preventDefault()
  
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      if (user.emailVerified) {
        setIsLoggingIn(true)
        setIsLoggedIn(true)
        setIsDone(true)
     
        
       
        toast.success("User logged in successfully");
        setTimeout(() => {
          localStorage.setItem('isLoggedInWeb', true)
          navigate('/Main/Library');
        }, 500); 
      } else {
        setIsVerified(false)
        toast.warning("Email not verified. Please check your inbox.")
        setIsLoggingIn(false)
      }
    } catch (error) {
      toast.error('Login failed. Check credentials.', { position: 'bottom-center' })
      setIsLoggingIn(false)
    }
  }

  const handleResend = async () => {
    try {
      const user = auth.currentUser
      if (user && !user.emailVerified) {
        await sendEmailVerification(user)
        toast.success('Verification email resent', { position: 'top-center' })
        setIsResendDisabled(true)
        setResendTimer(120)
      }
    } catch (error) {
      toast.error('Failed to resend email', { position: 'top-center' })
    }
  }

  return{
    state:{email,password,isVerified,resendTimer,isResendDisabled,showPass,isLoggingIn,isDone},
    actions:{setEmail,setPassword,setIsResendDisabled,setResendTimer,setShowpass,setIsLoggedIn,setIsLoggingIn,setIsDone,handleResend, handleSubmit}
  }

}