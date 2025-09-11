import React, { useState, useEffect } from 'react'
import logo from '../assets/logo.png'
import { signInWithEmailAndPassword, sendEmailVerification, onAuthStateChanged } from 'firebase/auth';
import createLoadingScreen from '../assets/creationLoadingScreen.png'
import { auth } from "./firebase"
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import { IoEyeSharp } from "react-icons/io5";
import { FaEyeSlash } from "react-icons/fa6";
import { useAuth } from './AuthContext';
import LoadingBar from './LoadingBar';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [isVerified,setIsVerified] = useState(null)
  const [resendTimer, setResendTimer] = useState(0);
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [showPass,setShowpass] = useState(false)
  const { setIsLoggedIn, isLoggedIn }= useAuth();
  const navigate = useNavigate()
  const [isLoggingIn,setIsLoggingIn]= useState(true) // start with loading screen
  const [isDone,setIsDone]= useState(false)

  // check if user is already logged in when component mounts
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.emailVerified) {
        setIsLoggedIn(true);
        setIsDone(true);
        localStorage.setItem('isLoggedInWeb',true);
        navigate('/Main/Library');
      } else {
        setIsLoggingIn(false); // show login form only when not logged in
      }
    });

    return () => unsubscribe();
  }, [navigate, setIsLoggedIn]);

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setIsResendDisabled(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user.emailVerified) {
        setIsLoggedIn(true);
        setIsDone(true);
        toast.success("User logged in successfully");
        localStorage.setItem('isLoggedInWeb',true);
        navigate('/Main/Library');
      } else {
        setIsVerified(false);
        toast.warning("Email not verified. Please check your inbox.");
        setIsLoggingIn(false);
      }

    } catch (error) {
      console.log(error.message);
      toast.error('Login failed. Check credentials.', { position: 'bottom-center' });
      setIsLoggingIn(false);
    }
  };

  const handleResend = async () => {
    try {
      const user = auth.currentUser;
      if (user && !user.emailVerified) {
        await sendEmailVerification(user);
        toast.success('Verification email resent', { position: 'top-center' });
        setIsResendDisabled(true);
        setResendTimer(120);
      }
    } catch (error) {
      console.error(error)
      toast.error('Failed to resend email', { position: 'top-center' });
    }
  };

  // LOADING SCREEN
  if (isLoggingIn) {
    return (
      <div className="min-h-screen flex justify-center items-center flex-col">
        <img src={createLoadingScreen} alt="creationLoadingScreen" className="w-80" />
        <p className='text-[#9898D9] font-poppinsbold text-center'>
          {isDone ? "Logging In..." : "Checking Your Credentials"}
        </p>
        <LoadingBar isDone={isDone} />
      </div>
    );
  }

  // LOGIN FORM
  return (
    <div className='flex h-screen w-screen justify-center place-items-center'>
      <div className='bg-[#1C1C26] w-200 p-10 border-1 border-[#5C5B5B] rounded-2xl place-items-center'>
        <form onSubmit={handleSubmit}>
          <img src={logo} alt="" className='size-40 self-center place-self-center'/>
          <h1 className='text-white text-center font-bold font-poppins text-xl'>Revio</h1>
          <div className='flex flex-col gap-2 place-items-center'>
            <div className='flex flex-col gap-2'>
              <label htmlFor="email" className='text-white text-sm'>Enter your Email:</label>
              <input type="email" id="email" name="email" placeholder='Email' 
                value={email} onChange={(e)=> setEmail(e.target.value)} 
                className='rounded-lg border-1 border-[#9E9E9E] p-2 text-white placeholder:text-[#9E9E9E] bg-none w-sm'/>
            </div>
            <div className='flex flex-col gap-2'>
              <label htmlFor="password" className='text-white text-sm'>Enter your Password:</label>
              <div className="relative w-sm">
                <input type={showPass ? 'text' : 'password'} id="password" name="password" placeholder="Password" 
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-[#9E9E9E] p-2 pr-10 text-white placeholder:text-[#9E9E9E] bg-transparent"/>
                <div className="absolute inset-y-0 right-2 flex items-center">
                  {showPass 
                    ? <IoEyeSharp color="white" size={20} className="cursor-pointer" onClick={() => setShowpass(false)}/> 
                    : <FaEyeSlash color="white" size={20} className="cursor-pointer" onClick={() => setShowpass(true)}/>}
                </div>
              </div>
            </div>
            <button className='bg-[#B5B5FF] text-[#200448] font-poppins font-semibold p-2 w-50 rounded-4xl self-center active:scale-95 hover:text-[#B5B5FF] hover:bg-[#200448]'>
              Login
            </button>
          </div>
        </form>

        <div className='mt-2'>
          <Link to="/ResetPassword">
            <h3 className='place-self-center text-[#FEFEFF] text-sm'>
              Forgot Password? <span className='text-blue-600 underline cursor-pointer'>Click here</span>
            </h3>
          </Link>
        </div>
        <hr className='text-[#BFBDC6] w-100 my-3' />

        <div className='flex flex-col gap-5'>
          {isVerified === false && (
            <button
              onClick={handleResend}
              disabled={isResendDisabled}
              className={`text-[#200448] text-sm font-poppins font-semibold p-2 w-50 rounded-4xl self-center transition-all duration-200 ${
                isResendDisabled ? 'bg-[#8888cc] cursor-not-allowed' : 'bg-[#B5B5FF] hover:bg-[#a0a0f0]'
              }`}
            >
              {isResendDisabled 
                ? `Wait ${Math.floor(resendTimer / 60).toString().padStart(2, '0')}:${(resendTimer % 60).toString().padStart(2, '0')}` 
                : 'Re-Send Email Verification'}
            </button>
          )}
          <h3 className='text-[#FEFEFF]'>Do you have an account?</h3>
          <Link to="/Register">
            <button className='border-1 border-[#B1B1B1] text-[#B5B5FF] p-1 w-45 rounded-4xl font-poppins text-sm font-semibold active:scale-90'>
              Sign Up
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
