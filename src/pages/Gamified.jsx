import React, { useEffect, useState } from 'react'
import { useLoaderData } from 'react-router-dom'
import logo from '../assets/logo.png'
import { auth, db } from '../components/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, collection, getDocs } from 'firebase/firestore'

const Gamified = () => {
  const reviewer = useLoaderData()
  const isAcronym = reviewer.id.startsWith('ac')
  const questions = isAcronym ? reviewer.content : reviewer.questions

  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(questions.length * 10)
  const [flipped, setFlipped] = useState(false)
  const [wrongAnswers, setWrongAnswers] = useState([])
  const [startTime] = useState(Date.now())
  const [showResults, setShowResults] = useState(false)

  const [showSplash, setShowSplash] = useState(true)
  const [countdown, setCountdown] = useState(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const[isCorrectAnimation,setIsCorrectAnimation]=useState()

  // This guards against index out-of-bounds
  const current = index < questions.length ? questions[index] : null

  useEffect(() => {
    if (countdown === 0) {
      setCountdown(null)
    } else if (countdown > 0) {
      const timeout = setTimeout(() => setCountdown(prev => prev - 1), 1000)
      return () => clearTimeout(timeout)
    }
  }, [countdown])

  useEffect(() => {
    if (showResults || countdown !== null || showSplash) return
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleNext()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [index, showResults, countdown, showSplash])

  const handleStart = () => {
    setShowSplash(false)
    setCountdown(3)
  }

  const handleNext = () => {
    setFlipped(false)
    if (index >= questions.length - 1) {
      setShowResults(true)
    } else {
      setIndex(prev => Math.min(prev + 1, questions.length - 1))
    }
  }

  const triggerNextWithAnimation = (isCorrect) => {
    if (isAnimating || showResults) return
    setIsAnimating(true)
    setTimeout(() => {
      setIsAnimating(false)
      if (isCorrect) {
        setScore(prev => prev + 1)
      } else if (current) {
        setWrongAnswers(prev => [...prev, current])
      }
      handleNext()
    }, 500)
  }

  const handleCheck = () => {
    if (isAnimating || showResults || !current) return
    setIsCorrectAnimation(true)
    triggerNextWithAnimation(true)
  }

  const handleWrong = () => {
    if (isAnimating || showResults || !current) return
      setIsCorrectAnimation(false)
    triggerNextWithAnimation(false)
    
  }

  const renderResults = () => {
    const timeSpent = Math.ceil((Date.now() - startTime) / 1000)
    return (
      <div className="text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Results</h2>
        <p className="text-lg mb-2">Score: {score} / {questions.length}</p>
        <p className="text-lg mb-6">Time spent: {timeSpent} seconds</p>
        {wrongAnswers.length > 0 ? (
          <div className="text-left bg-[#1f1f1f] p-4 rounded-lg space-y-4">
            <h3 className="text-xl font-semibold mb-2">Wrong Answers:</h3>
            {wrongAnswers.map((item, i) => (
              <div key={i} className="p-3 border rounded-md">
                {isAcronym ? (
                  <div>
                    <p><b>Letters:</b> {item.contents.map(c => c.word.charAt(0)).join('')}</p>
                    <p><b>Words:</b> {item.contents.map(c => c.word).join(', ')}</p>
                    <p><b>Key Phrase:</b> {item.keyPhrase}</p>
                  </div>
                ) : (
                  <div>
                    <p><b>Q:</b> {item.definition}</p>
                    <p><b>A:</b> {item.term}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : <p>No mistakes! Well done 🎉</p>}
      </div>
    )
  }

  // Splash Screen
  if (showSplash) {
    return (
      <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center text-white">
        <img src={logo} alt="Logo" className="w-40 mb-6" />
        <button
          onClick={handleStart}
          className="px-6 py-3 bg-[#6A558D] hover:bg-[#8267B1] text-white text-xl rounded-full font-bold transition"
        >
          Start Intense Mode
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white p-6 flex flex-col items-center relative">
      {countdown !== null && (
        <div className="absolute inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center text-8xl font-bold text-white">
          {countdown}
        </div>
      )}

      {showResults ? (
        <div className="flex items-center justify-center w-full h-full">
          {renderResults()}
        </div>
      ) : (
        <div className={`w-full max-w-2xl transition-opacity ${countdown !== null ? 'opacity-30' : 'opacity-100'}`}>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold">Gamified Mode</h1>
            <span className="text-lg">Score: {score}</span>
          </div>
          <div className="mb-4 text-right text-sm text-gray-300">Time left: {timeLeft}s</div>

          {current && (
            <div className="relative w-160 h-80 perspective mb-6">
              <div
                className={`transition-transform duration-500 transform-style preserve-3d w-full h-full
                  ${flipped ? 'rotate-y-180' : ''} 
                  ${isAnimating ? isCorrectAnimation? 'tilt-right-fade-out':'tilt-left-fade-out' : ''}`}
                onClick={() => setFlipped(!flipped)}
              >
                <div className="absolute w-full h-full backface-hidden bg-[#8267B1] rounded-xl shadow-lg flex flex-col items-center justify-center p-6 text-center cursor-pointer">
                  {isAcronym ? (
                    <div className="text-5xl font-extrabold tracking-widest">
                      {current.contents.map(item => item.word.charAt(0)).join('')}
                    </div>
                  ) : (
                    <p className="text-3xl font-semibold text-white">{current.definition}</p>
                  )}
                </div>

                <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-[#FFF8AA] overflow-y-auto rounded-xl shadow-lg flex items-center justify-center text-center cursor-pointer">
                  {isAcronym ? (
                    <div className="text-[#6A558D] text-xl font-semibold space-y-2 text-left">
                      <p><b>Words:</b> {current.contents.map(c => c.word).join(', ')}</p>
                      <p><b>Key Phrase:</b> {current.keyPhrase}</p>
                    </div>
                  ) : (
                    <p className="text-3xl font-semibold text-[#6A558D]">{current.term}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4 justify-center">
           
            <button
              onClick={handleWrong}
              disabled={isAnimating || showResults || !current}
              className={`px-4 py-2 rounded-xl text-white font-semibold ${isAnimating ? 'bg-red-300' : 'bg-red-500'}`}
            >
              ❌ Wrong
            </button>
             <button
              onClick={handleCheck}
              disabled={isAnimating || showResults || !current}
              className={`px-4 py-2 rounded-xl text-white font-semibold ${isAnimating ? 'bg-green-300' : 'bg-green-500'}`}
            >
              ✅ Correct
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Gamified

export const gamifiedLoader = async ({ params }) => {
  const { id: folderId, reviewerId } = params;

  const getUser = () =>
    new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        if (user && user.emailVerified) {
          resolve(user);
        } else {
          reject("Unauthorized");
        }
      });
    });

  try {
    const user = await getUser();

    if (folderId === "TermsAndCondition") {
      const reviewerRef = doc(
        db,
        "users",
        user.uid,
        "folders",
        folderId,
        "reviewers",
        reviewerId
      );
      const reviewerSnap = await getDoc(reviewerRef);
      if (!reviewerSnap.exists()) 
        throw new Response("Reviewer not found", { status: 404 });

      const reviewerData = reviewerSnap.data();
      const questionsRef = collection(
        db,
        "users",
        user.uid,
        "folders",
        folderId,
        "reviewers",
        reviewerId,
        "questions"
      );
      const questionsSnap = await getDocs(questionsRef);
      const questions = questionsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return {
        id: reviewerId,
        title: reviewerData.title,
        questions,
      };
    }

    if (folderId === "AcronymMnemonics") {
      const reviewerRef = doc(
        db,
        "users",
        user.uid,
        "folders",
        folderId,
        "reviewers",
        reviewerId
      );
      const reviewerSnap = await getDoc(reviewerRef);
      if (!reviewerSnap.exists()) throw new Response("Reviewer not found", { status: 404 });

      const reviewerData = reviewerSnap.data();
      const contentCollectionRef = collection(
        db,
        "users",
        user.uid,
        "folders",
        folderId,
        "reviewers",
        reviewerId,
        "content"
      );
      const contentSnap = await getDocs(contentCollectionRef);

      const content = await Promise.all(
        contentSnap.docs.map(async (contentDoc) => {
          const contentData = contentDoc.data();
          const contentsRef = collection(
            db,
            "users",
            user.uid,
            "folders",
            folderId,
            "reviewers",
            reviewerId,
            "content",
            contentDoc.id,
            "contents"
          );
          const contentsSnap = await getDocs(contentsRef);
          const contents = contentsSnap.docs.map((doc) => doc.data());

          return {
            id: contentDoc.id,
            title: contentData.title,
            keyPhrase: contentData.keyPhrase,
            contents,
          };
        })
      );

      return {
        id: reviewerId,
        title: reviewerData.title,
        content,
      };
    }

    throw new Response("Invalid folder", { status: 400 });
  } catch (error) {
    console.error("Loader error:", error);
    throw new Response("Failed to load reviewer", { status: 500 });
  }
};
