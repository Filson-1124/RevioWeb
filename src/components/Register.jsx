import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth, db } from './firebase';
import { setDoc, doc, query, where, getDocs, deleteDoc } from "firebase/firestore";
import { IoEyeSharp } from "react-icons/io5";
import { FaEyeSlash } from "react-icons/fa6";
import { collection } from 'firebase/firestore';

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [iniPassword, setIniPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [showPass, setShowpass] = useState(false);

  const [isUpCase, setIsUpperCase] = useState(false);
  const [isNumber, setIsNumber] = useState(false);
  const [isLength, setIsLength] = useState(false);

  const [isDisabled, setIsDisabled] = useState(true);           // for re-enter password input
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true); // for sign in button

  const isUpperCase = (char) => char === char.toUpperCase() && char !== char.toLowerCase();

  useEffect(() => {
    // Validate password rules
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
      // 🧑‍💻 Step 1: Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email.toLowerCase(), iniPassword);
      const user = userCredential.user;

      // 📨 Send verification email
      await sendEmailVerification(user);

      // 🔍 Step 2: Now check if username is already taken
      const q = query(collection(db, 'users'), where('username', '==', username.toLowerCase()));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        toast.error("Username Taken, Please choose another one");
        await user.delete(); // cleanup newly created account
        return;
      }

      // ✅ Step 3: Save user data
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        username: username.toLowerCase()
      });

      // 🗂️ Step 4: Pre-create default folders
      await Promise.all([
        setDoc(doc(db, `users/${user.uid}/folders`, 'AcronymMnemonics'), {
          id: 'AcronymMnemonics',
          title: 'Acronym Mnemonics Flashcards',
          Desc: 'This folder contains flashcards using acronyms + key phrases'
        }),
        setDoc(doc(db, `users/${user.uid}/folders`, 'TermsAndCondition'), {
          id: 'TermsAndCondition',
          title: 'Terms and Conditions Flashcards',
          Desc: 'This folder contains flashcards using Terms and Conditions'
        }),
        setDoc(doc(db, `users/${user.uid}/folders`, 'SummarizedReviewers'), {
          id: 'SummarizedReviewers',
          title: 'Summarized Reviewers',
          Desc: 'This folder contains Standard Summarized Reviewers'
        }),
        setDoc(doc(db, `users/${user.uid}/folders`, 'SummarizedAIReviewers'), {
          id: 'SummarizedAIReviewers',
          title: 'Summarized AI Reviewers',
          Desc: 'This folder contains Summarized Reviewers with AI explanation'
        })
      ]);

      toast.success("Account created! Verification email sent.");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Something went wrong during registration.");
    }
  };

  return (
    <>
      <div className='flex h-screen w-screen justify-center place-items-center border-0'>
        <div className='bg-[#1C1C26] p-10 nd:p-20 lg:p-30 border-1 border-[#5C5B5B] rounded-lg'>           
          <h1 className='text-[#FFFBEF] text-4xl font-poppins font-semibold place-self-start'>Create Account</h1>
          <form className='flex flex-col text-[#FFFBEF] gap-2' onSubmit={handleSubmit}>
            
            <div className='flex flex-col'>
              <label htmlFor='username'>Username</label>
              <input
                type="text"
                name='username'
                id='username'
                placeholder='Enter your Username'
                className='border-1 border-[#5C5B5B] rounded-lg p-1.5 bg-[#21212C]'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className='flex flex-col gap-1'>
              <label htmlFor='email'>Email</label>
              <input
                type="email"
                name='email'
                id='email'
                placeholder='Enter your Email'
                className='border-1 border-[#5C5B5B] rounded-lg p-1.5 bg-[#21212C]'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className='flex flex-col'>
              <label htmlFor='password'>Password</label>
              <div className="relative w-sm">
                <input
                  type={showPass ? 'text' : 'password'}
                  id="password"
                  name="password"
                  placeholder="Password"
                  value={iniPassword}
                  onChange={(e) => setIniPassword(e.target.value)}
                  className="w-full rounded-lg border border-[#9E9E9E] p-2 pr-10 text-white placeholder:text-[#9E9E9E] bg-transparent"
                />

                <div className="absolute inset-y-0 right-2 flex items-center">
                  {showPass ? (
                    <IoEyeSharp color="white" size={20} className="cursor-pointer" onClick={() => setShowpass(false)} />
                  ) : (
                    <FaEyeSlash color="white" size={20} className="cursor-pointer" onClick={() => setShowpass(true)} />
                  )}
                </div>
              </div>

              <ul className='text-[10px] font-extralight font-poppins list-disc pl-5'>
                <li className={isUpCase ? 'text-white' : 'text-[#7E7C7C]'}>At least 1 uppercase</li>
                <li className={isNumber ? 'text-white' : 'text-[#7E7C7C]'}>At least 1 number</li>
                <li className={isLength ? 'text-white' : 'text-[#7E7C7C]'}>At least 8 characters</li>
              </ul>
            </div>

            <div className='flex flex-col'>
              <label htmlFor='reEnterPassword'>Re-enter password</label>
              <input
                disabled={isDisabled}
                type={showPass ? 'text' : 'password'}
                name='reEnterPassword'
                id='reEnterPassword'
                placeholder='Enter your Password'
                className='border-1 border-[#5C5B5B] rounded-lg p-1.5 bg-[#21212C] disabled:cursor-not-allowed'
                value={rePassword}
                onChange={(e) => setRePassword(e.target.value)}
              />
            </div>

            <button
              disabled={isSubmitDisabled}
              className='
                bg-[#B5B5FF] text-[#200448] font-poppinsbold p-2 rounded-2xl border-1 border-[#200448]
                w-[60%] place-self-center active:scale-95 hover:text-[#B5B5FF] hover:bg-[#200448]
                disabled:bg-gray-400 disabled:cursor-not-allowed disabled:active:bg-gray-400 disabled:active:scale-100
              '
              type='submit'
            >
              Sign in
            </button>
          </form>

          <h4 className='text-[#7E7C7C] place-self-center'>
            Already have an account?{' '}
            <Link to="/">
              <span className='text-blue-600 underline cursor-pointer'>Login</span>
            </Link>
          </h4>
        </div>
      </div>
      <ToastContainer position='bottom-center' />
    </>
  );
};

export default Register;
