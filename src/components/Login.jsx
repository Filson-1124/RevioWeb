import React, { useState, useEffect } from 'react'
import logo from '../assets/logo.png'
import { signInWithEmailAndPassword, sendEmailVerification, onAuthStateChanged } from 'firebase/auth'
import createLoadingScreen from '../assets/creationLoadingScreen.png'
import { auth } from "./firebase"
import { toast } from 'react-toastify'
import { Link, useNavigate } from 'react-router-dom'
import { IoEyeSharp } from "react-icons/io5"
import { FaEyeSlash } from "react-icons/fa6"
import { useAuth } from './AuthContext'
import LoadingBar from './LoadingBar'
import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify';

const Login = () => {
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

  // LOADING SCREEN
  if (isLoggingIn) {
    return (
      <div className="min-h-screen flex justify-center items-center flex-col bg-[#12121A] p-4">
        <img src={createLoadingScreen} alt="creationLoadingScreen" className="w-48 sm:w-60 md:w-80" />
        <p className='text-[#9898D9] font-poppinsbold text-center text-sm sm:text-base mt-4'>
          {isDone ? "Logging In..." : "Checking Your Credentials"}
        </p>
        <LoadingBar isDone={isDone} />
      </div>
    )
  }

  // LOGIN FORm
  return (
    <div className="overflow-y-hidden flex justify-center items-center min-h-screen bg-[#12121A] p-4 sm:p-6 md:p-10">
      <div className="bg-[#1C1C26] border border-[#5C5B5B] rounded-2xl w-full max-w-[500px] p-6 sm:p-8 md:p-10">
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
          <img src={logo} alt="App Logo" className="w-20 sm:w-28 md:w-40 mb-2" />
          <h1 className="text-white text-center font-bold font-poppins text-lg sm:text-xl md:text-2xl mb-3">Revio</h1>

          <div className="w-full flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-white text-sm sm:text-base">Enter your Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-lg border border-[#9E9E9E] p-2 text-white placeholder:text-[#9E9E9E] bg-transparent w-full"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-white text-sm sm:text-base">Enter your Password:</label>
              <div className="relative w-full">
                <input
                  type={showPass ? 'text' : 'password'}
                  id="password"
                  name="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-[#9E9E9E] p-2 pr-10 text-white placeholder:text-[#9E9E9E] bg-transparent"
                />
                <div className="absolute inset-y-0 right-2 flex items-center">
                  {showPass
                    ? <IoEyeSharp color="white" size={20} className="cursor-pointer" onClick={() => setShowpass(false)} />
                    : <FaEyeSlash color="white" size={20} className="cursor-pointer" onClick={() => setShowpass(true)} />}
                </div>
              </div>
            </div>

            <button className="bg-[#B5B5FF] text-[#200448] font-poppins font-semibold p-2 rounded-full active:scale-95 hover:text-[#B5B5FF] hover:bg-[#200448] transition-all w-full self-center">
              Login
            </button>
          </div>
        </form>

        <div className="mt-4 text-center">
          <Link to="/ResetPassword">
            <p className="text-[#FEFEFF] text-sm sm:text-base">
              Forgot Password? <span className="text-blue-600 underline cursor-pointer">Click here</span>
            </p>
          </Link>
        </div>

        <hr className="border-[#BFBDC6] my-4" />

        <div className="flex flex-col items-center gap-3">
          {isVerified === false && (
            <button
              onClick={handleResend}
              disabled={isResendDisabled}
              className={`text-[#200448] text-sm sm:text-base font-poppins font-semibold p-2 rounded-full transition-all duration-200 w-full ${
                isResendDisabled ? 'bg-[#8888cc] cursor-not-allowed' : 'bg-[#B5B5FF] hover:bg-[#a0a0f0]'
              }`}
            >
              {isResendDisabled
                ? `Wait ${Math.floor(resendTimer / 60).toString().padStart(2, '0')}:${(resendTimer % 60)
                    .toString()
                    .padStart(2, '0')}`
                : 'Re-Send Email Verification'}
            </button>
          )}

          <p className="text-[#FEFEFF] text-sm sm:text-base">Do you have an account?</p>
          <Link to="/Register" className="w-full">
            <button className="border border-[#B1B1B1] text-[#B5B5FF] p-2 w-full rounded-full font-poppins text-sm sm:text-base font-semibold active:scale-95">
              Sign Up
            </button>
          </Link>
        </div>
      </div>
       
    </div>
  )
}

export default Login
