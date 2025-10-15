import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth, db } from './firebase';
import { setDoc, doc, query, where, getDocs } from "firebase/firestore";
import { IoEyeSharp } from "react-icons/io5";
import { FaEyeSlash } from "react-icons/fa6";
import { collection } from 'firebase/firestore';
import 'react-toastify/dist/ReactToastify.css';

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [iniPassword, setIniPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [showPass, setShowpass] = useState(false);

  const [isUpCase, setIsUpperCase] = useState(false);
  const [isNumber, setIsNumber] = useState(false);
  const [isLength, setIsLength] = useState(false);

  const [isDisabled, setIsDisabled] = useState(true);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

  const isUpperCase = (char) => char === char.toUpperCase() && char !== char.toLowerCase();

  useEffect(() => {
    const hasLength = iniPassword.length >= 8;
    let hasUpper = false;
    let hasNumber = false;

    for (let i = 0; i < iniPassword.length; i++) {
      const char = iniPassword[i];
      if (isUpperCase(char)) hasUpper = true;
      if (!isNaN(char)) hasNumber = true;
    }

    setIsLength(hasLength);
    setIsUpperCase(hasUpper);
    setIsNumber(hasNumber);

    const passwordValid = hasUpper && hasNumber && hasLength;
    setIsDisabled(!passwordValid);

    const allValid =
      username.trim() !== "" &&
      email.trim() !== "" &&
      passwordValid &&
      rePassword.trim() !== "" &&
      iniPassword === rePassword;

    setIsSubmitDisabled(!allValid);
  }, [iniPassword, username, email, rePassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (iniPassword !== rePassword) {
      toast.error("Passwords don't match");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.toLowerCase(), iniPassword);
      const user = userCredential.user;

      await sendEmailVerification(user);

      const q = query(collection(db, 'users'), where('username', '==', username.toLowerCase()));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        toast.error("Username Taken, Please choose another one");
        await user.delete();
        return;
      }

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        username: username.toLowerCase()
      });

      toast.success("Account created! Verification email sent.");
    } catch (error) {
  console.error(error);
  
  switch (error.code) {
    case "auth/email-already-in-use":
      toast.error("This email is already registered. Try logging in instead.");
      break;

    case "auth/invalid-email":
      toast.error("Please enter a valid email address.");
      break;

    case "auth/weak-password":
      toast.error("Your password is too weak. Use at least 6 characters.");
      break;

    case "auth/missing-email":
      toast.error("Email field cannot be empty.");
      break;

    case "auth/missing-password":
      toast.error("Password field cannot be empty.");
      break;

    case "auth/network-request-failed":
      toast.error("Network error. Please check your internet connection.");
      break;

    case "auth/operation-not-allowed":
      toast.error("Email sign-up is currently disabled. Contact support.");
      break;

    case "auth/too-many-requests":
      toast.error("Too many attempts. Please try again later.");
      break;

    case "auth/internal-error":
      toast.error("Something went wrong on our end. Please try again.");
      break;

    case "auth/invalid-api-key":
      toast.error("Invalid API configuration. Please contact support.");
      break;

    case "auth/app-not-authorized":
      toast.error("This app is not authorized to use Firebase Authentication.");
      break;

    default:
      toast.error(error.message || "Something went wrong during registration.");
  }
}

  };

  return (
    <>
      <div className="flex justify-center items-center h-screen w-screen bg-[#12121A] p-4 sm:p-6 md:p-10">
        <div className="bg-[#1C1C26] w-full max-w-md sm:max-w-lg lg:max-w-xl p-6 sm:p-8 md:p-10 border border-[#5C5B5B] rounded-2xl shadow-lg">
          
          <h1 className="text-[#FFFBEF] text-2xl sm:text-3xl md:text-4xl font-poppins font-semibold mb-6 text-center md:text-left">
            Create Account
          </h1>

          <form className="flex flex-col text-[#FFFBEF] gap-3 sm:gap-4" onSubmit={handleSubmit}>
            
            <div className="flex flex-col">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                name="username"
                id="username"
                placeholder="Enter your Username"
                className="border border-[#5C5B5B] rounded-lg p-2 bg-[#21212C] text-sm sm:text-base"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Enter your Email"
                className="border border-[#5C5B5B] rounded-lg p-2 bg-[#21212C] text-sm sm:text-base"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="password">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  id="password"
                  name="password"
                  placeholder="Password"
                  value={iniPassword}
                  onChange={(e) => setIniPassword(e.target.value)}
                  className="w-full rounded-lg border border-[#9E9E9E] p-2 pr-10 text-white placeholder:text-[#9E9E9E] bg-transparent text-sm sm:text-base"
                />

                <div className="absolute inset-y-0 right-2 flex items-center">
                  {showPass ? (
                    <IoEyeSharp color="white" size={20} className="cursor-pointer" onClick={() => setShowpass(false)} />
                  ) : (
                    <FaEyeSlash color="white" size={20} className="cursor-pointer" onClick={() => setShowpass(true)} />
                  )}
                </div>
              </div>

              <ul className="text-[10px] sm:text-xs font-light font-poppins list-disc pl-5 mt-1">
                <li className={isUpCase ? 'text-white' : 'text-[#7E7C7C]'}>At least 1 uppercase</li>
                <li className={isNumber ? 'text-white' : 'text-[#7E7C7C]'}>At least 1 number</li>
                <li className={isLength ? 'text-white' : 'text-[#7E7C7C]'}>At least 8 characters</li>
              </ul>
            </div>

            <div className="flex flex-col">
              <label htmlFor="reEnterPassword">Re-enter password</label>
              <input
                disabled={isDisabled}
                type={showPass ? 'text' : 'password'}
                name="reEnterPassword"
                id="reEnterPassword"
                placeholder="Re-enter your Password"
                className="border border-[#5C5B5B] rounded-lg p-2 bg-[#21212C] disabled:cursor-not-allowed text-sm sm:text-base"
                value={rePassword}
                onChange={(e) => setRePassword(e.target.value)}
              />
            </div>

            <button
              disabled={isSubmitDisabled}
              className="
                bg-[#B5B5FF] text-[#200448] font-poppinsbold p-2 rounded-2xl border border-[#200448]
                w-[70%] sm:w-[60%] self-center mt-4
                active:scale-95 hover:text-[#B5B5FF] hover:bg-[#200448]
                disabled:bg-gray-400 disabled:cursor-not-allowed disabled:active:scale-100
              "
              type="submit"
            >
              Sign in
            </button>
          </form>

          <h4 className="text-[#7E7C7C] text-center mt-4 text-sm sm:text-base">
            Already have an account?{' '}
            <Link to="/">
              <span className="text-blue-600 underline cursor-pointer">Login</span>
            </Link>
          </h4>
        </div>
      </div>

      <ToastContainer position="bottom-center" />
    </>
  );
};

export default Register;
