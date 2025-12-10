import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  updatePassword
} from 'firebase/auth';
import { auth, db } from "../components/firebase";
import {
  setDoc, doc, query, where, getDocs, collection
} from "firebase/firestore";

export const useRegister = () => {

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

  const [isDisabled, setIsDisabled] = useState(true);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

  // Loading screen states
  const [isCreating, setIsCreating] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  const [isEmailVerified, setIsEmailVerified] = useState(false);

  const defaultPassword = "Revio123";

  // Password validation
  useEffect(() => {
    const hasLength = iniPassword.length >= 8;
    let hasUpper = false;
    let hasNumber = false;

    for (let c of iniPassword) {
      if (c === c.toUpperCase() && c !== c.toLowerCase()) hasUpper = true;
      if (!isNaN(c)) hasNumber = true;
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
      iniPassword === rePassword &&
      isEmailVerified;

    setIsSubmitDisabled(!allValid);
  }, [iniPassword, rePassword, username, email, isEmailVerified]);

  const doesEmailExist = async () => {
    if (!email) return toast.error("Please Enter an email first");

    try {
      await createUserWithEmailAndPassword(
        auth,
        email.toLowerCase(),
        defaultPassword
      );

      toast.success("Email available & verified!");
    } catch (err) {

      if (err.code === "auth/email-already-in-use") {
        toast.info("Email already exists.");
      } else {
        toast.error("Invalid email. Cannot continue.");
        return;
      }
    }

    setIsEmailVerified(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (iniPassword !== rePassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsCreating(true);

    try {
      const userCred = await signInWithEmailAndPassword(
        auth,
        email.toLowerCase(),
        defaultPassword
      );

      const user = userCred.user;

      await updatePassword(user, iniPassword);

      const q = query(
        collection(db, 'users'),
        where('username', '==', username.toLowerCase())
      );
      const snap = await getDocs(q);

      if (!snap.empty) {
        toast.error("Username taken");
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
        })
      ]);

      await sendEmailVerification(user);

      toast.success("Account created! Verification email sent.");

      setIsDone(true);
      setTimeout(() => setFadeOut(true), 1000);
      setTimeout(() => setIsCreating(false), 1800);

    } catch (error) {
      toast.error(error.message);
      console.error(error);
      setIsCreating(false);
    }
  };

  return {
    state: {
      username, email, iniPassword, rePassword, showPass,
      isUpCase, isNumber, isLength, isDisabled,
      isSubmitDisabled, isCreating, isDone, fadeOut,
      isEmailVerified
    },
    actions: {
      setUsername, setEmail, setIniPassword, setRePassword,
      setShowpass, handleSubmit, doesEmailExist
    }
  };
};
