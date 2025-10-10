import React from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from './firebase'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const ForgotPassword = () => {
  const handleSubmit = async (e) => {
    e.preventDefault()
    const emailVal = e.target.email.value

    try {
      await sendPasswordResetEmail(auth, emailVal)
      toast.success("If the email is registered, you'll receive a reset link.")
    } catch (err) {
      console.error(err)
      if (err.code === 'auth/user-not-found') {
        toast.error('Unregistered email')
      } else if (err.code) {
        toast.error(err.code)
      } else {
        toast.error('An error occurred')
      }
    }
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-[#12121A] font-poppins p-6 sm:p-10">
      <div className="bg-[#1C1C26] w-full max-w-md sm:max-w-lg md:max-w-xl p-8 sm:p-10 border border-[#5C5B5B] rounded-2xl flex flex-col items-center text-center shadow-xl">
        {/* Logo */}
        <img
          src={logo}
          alt="Revio Logo"
          className="w-32 sm:w-44 md:w-56 mb-4"
        />

        {/* Title */}
        <h1 className="text-white text-2xl sm:text-3xl font-poppinsbold mb-2">
          Reset Password
        </h1>

        {/* Description */}
        <p className="text-[#ffffff80] text-xs sm:text-sm mb-8 max-w-sm leading-relaxed">
          Note: Use the email you registered with. Revio will send a password
          reset link — check your inbox.
        </p>

        {/* Form */}
        <form className="flex flex-col gap-6 w-full" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2 text-left">
            <label
              htmlFor="email"
              className="text-white text-sm sm:text-base font-medium"
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Enter your Email"
              className="rounded-lg border border-[#9E9E9E] p-2 text-white placeholder:text-[#9E9E9E] bg-transparent w-full focus:outline-none focus:border-[#B5B5FF] transition"
              required
            />
          </div>

          <button
            type="submit"
            className="bg-[#B5B5FF] text-[#200448] font-poppins font-semibold py-2 rounded-full self-center w-full sm:w-3/4 active:scale-95 hover:text-[#B5B5FF] hover:bg-[#200448] transition-all"
          >
            Send Email
          </button>
        </form>

        {/* Back to login */}
        <Link to="/" className="mt-6">
          <p className="text-[#B5B5FF] text-sm font-semibold hover:text-[#200448] transition">
            Back to Login
          </p>
        </Link>
      </div>

      <ToastContainer position="bottom-center" autoClose={3000} theme="dark" />
    </div>
  )
}

export default ForgotPassword
