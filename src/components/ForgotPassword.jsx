import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from './firebase';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ForgotPassword = () => {

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailVal = e.target.email.value;

    try {
      await sendPasswordResetEmail(auth, emailVal);
      toast.success("If the email is registered, you'll receive a reset link.");
    } catch (err) {
      console.error(err);

      if (err.code === 'auth/user-not-found') {
        toast.error("Unregistered email");
      } else if (err.code) {
        toast.error(err.code);
      } else {
        toast.error("An error occurred");
      }
    }
  };

  return (
    <div className='p-20 flex justify-center align-middle font-poppins'>
      <div className='bg-[#1C1C26] w-200 p-10 border-1 border-[#5C5B5B] rounded-2xl place-items-center text-center'>
        <img src={logo} alt="Revio Logo" className='size-[15rem]' />
        <h1 className='text-white text-3xl font-poppinsbold'>Reset Password</h1>
        <p className='text-[.7rem] mx-50 text-[#ffffff59]'>
          Note: Use the email you registered with. Revio will send a password reset link—check your inbox.
        </p>

        <form className='flex flex-col gap-10' onSubmit={handleSubmit}>
          <div className='flex flex-col gap-2 text-start'>
            <label htmlFor='email' className='text-white text-md'>Email</label>
            <input
              type="email"
              name='email'
              id='email'
              placeholder='Enter your Email'
              className='rounded-lg border-1 border-[#9E9E9E] p-2 text-white placeholder:text-[#9E9E9E] bg-none w-sm'
              required
            />
          </div>
          <button
            type="submit"
            className='bg-[#B5B5FF] text-[#200448] font-poppins font-semibold p-2 w-50 rounded-4xl self-center active:scale-95 hover:text-[#B5B5FF] hover:bg-[#200448]'
          >
            Send Email
          </button>
        </form>

        <Link to="/">
          <p className='text-[#B5B5FF] p-1 w-45 rounded-4xl font-poppins text-sm font-semibold place-self-center hover:text-[#200448]'>
            Back to Login
          </p>
        </Link>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ForgotPassword;
