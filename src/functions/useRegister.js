import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth, db } from "../components/firebase";
import { setDoc, doc, query, where, getDocs, collection } from "firebase/firestore";
import 'react-toastify/dist/ReactToastify.css';


export const useRegister = () =>{
     // Toggle this to simulate loading without Firebase
  const TEST_MODE = false;

  // Form fields
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [iniPassword, setIniPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [showPass, setShowpass] = useState(false);

  // Password rules
  const [isUpCase, setIsUpperCase] = useState(false);
  const [isNumber, setIsNumber] = useState(false);
  const [isLength, setIsLength] = useState(false);

  // Button states
  const [isDisabled, setIsDisabled] = useState(true);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

  // Loading screen states
  const [isCreating, setIsCreating] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  // Password Field state

  const [isEmailVerified,setIsEmailVerified]=useState(false)

  const isUpperCase = (char) => char === char.toUpperCase() && char !== char.toLowerCase();

  // Password validation + button enable
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

  // Handle Sign-up
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (iniPassword !== rePassword) {
      toast.error("Passwords don't match");
      return;
    }

    setIsCreating(true); // Show loading screen

    try {
      // TEST MODE — no Firebase involved
      if (TEST_MODE) {
        await new Promise((res) => setTimeout(res, 2500)); // simulate delay
        setIsDone(true);
        setTimeout(() => setFadeOut(true), 1000);
        setTimeout(() => setIsCreating(false), 1800);
        toast.success("Simulated: Account created successfully!");
        return;
      }

      // REAL MODE — actual Firebase registration
      const userCredential = await createUserWithEmailAndPassword(auth, email.toLowerCase(), iniPassword);
      const user = userCredential.user;

      await sendEmailVerification(user);

      const q = query(collection(db, 'users'), where('username', '==', username.toLowerCase()));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        toast.error("Username Taken, Please choose another one");
        await user.delete();
        setIsCreating(false);
        return;
      }

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        username: username.toLowerCase()
      });

      await Promise.all([
        setDoc(doc(db, `users/${user.uid}/folders`, 'AcronymMnemonics'), {
          id: 'AcronymMnemonics',
          title: 'Acronym Mnemonics Flashcards',
          Desc: 'This folder contains flashcards using acronyms + key phrases'
        }),
        setDoc(doc(db, `users/${user.uid}/folders`, 'TermsAndDefinitions'), {
          id: 'TermsAndDefinitions',
          title: 'Terms and Definitions Flashcards',
          Desc: 'This folder contains flashcards using Terms and Definitions'
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
        }),
      ]);

      setIsDone(true);
      setTimeout(() => setFadeOut(true), 1000);
      setTimeout(() => setIsCreating(false), 1800);
      toast.success("Account created! Verification email sent.");
    } catch (error) {
      console.error(error);
      setIsCreating(false);

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
        case "auth/network-request-failed":
          toast.error("Network error. Please check your internet connection.");
          break;
        default:
          toast.error(error.message || "Something went wrong during registration.");
      }
    }
  };

  const doesEmailExist = () =>{
    //gamitin yung email variable para makuha yung email input
    //lagay ng function dito for the api

    //iset mo na truet etong function sa baba pag true yung email flase if false okay?
    setIsEmailVerified(true)
  }

  return{
    state:{username,email,iniPassword,rePassword,showPass,isUpCase,isNumber,isLength,isDisabled,isSubmitDisabled,isCreating,isDone,fadeOut, isUpperCase, isEmailVerified},
    actions:{setUsername,setEmail,setIniPassword,setRePassword,setShowpass,setIsUpperCase,setIsNumber,setIsLength,setIsDisabled,setIsSubmitDisabled,setIsCreating,setIsDone,setFadeOut,handleSubmit,doesEmailExist}
  }
}