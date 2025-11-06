
import logo from '../assets/logo.png'
import createLoadingScreen from '../assets/creationLoadingScreen.png'
import { Link} from 'react-router-dom'
import { IoEyeSharp } from "react-icons/io5"
import { FaEyeSlash } from "react-icons/fa6"
import LoadingBar from './LoadingBar'
import { useLogin } from '../functions/useLogin'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'


const Login = () => {

  const {state,actions}=useLogin();
  const {email,password,isVerified,resendTimer,isResendDisabled,showPass,isLoggingIn,isDone}=state;
  const {setEmail,setPassword,setShowpass,handleResend, handleSubmit}=actions
  
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

            <button className=" cursor-pointer bg-[#B5B5FF] text-[#200448] font-poppins font-semibold p-2 rounded-full active:scale-95 hover:text-[#B5B5FF] hover:bg-[#200448] transition-all w-full self-center">
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
            <button className="cursor-pointer transition-all duration-75 border border-[#B1B1B1] text-[#B5B5FF] p-2 w-full rounded-full font-poppins text-sm sm:text-base font-semibold active:scale-95">
              Sign Up
            </button>
          </Link>
        </div>
      </div>
       
    </div>
  )
}

export default Login
