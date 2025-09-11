import React, { useEffect, useState } from 'react'
import { useLoaderData } from 'react-router-dom'
import logo from '../assets/logo.png'
import gamifiedLogo from '../assets/gamifiedLogo.png'
import { auth, db } from '../components/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, collection, getDocs } from 'firebase/firestore'

const Gamified = () => {
  const reviewer = useLoaderData()
  const isAcronym = reviewer.id.startsWith('ac')
  const questions = isAcronym ? reviewer.content : reviewer.questions

  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(questions.length * 50000000)
  const [wrongAnswers, setWrongAnswers] = useState([])
  const [startTime] = useState(Date.now())
  const [showResults, setShowResults] = useState(false)
  const [isPressed,setIsPressed]=useState(false)

  const [showSplash, setShowSplash] = useState(true)
  const [countdown, setCountdown] = useState(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const[isCorrectAnimation,setIsCorrectAnimation]=useState()
  const[shuffledChoices,setShuffledChoices]=useState([])

  const[answers,setAnswers]=useState([])
  const[currentCorrectAnswers,setCurrentCorrectAnswers]=useState([])
  

  // This guards against index out-of-bounds
  const current = index < questions.length ? questions[index] : null


  //added functions for the updated gamified version
  const shuffle=(array) =>
  {
  let arr = [...array]; // copy so original isn’t modified
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

    useEffect(()=>{
    if(current&& current.definition){
  setShuffledChoices(shuffle(current.definition))
    }
    setIsPressed(false)


  },[current.definition])

   const findCorrectAnswer=(current)=>
    {
    const correctChoice = current.definition.find(c => c.type === "correct");
    return correctChoice.text
  }

  const checkAnswer=(isCorrectAnswer)=>{
    if(isCorrectAnswer=="correct"){
      handleCheck()
    }else{
      handleWrong()
    }
  }
  //hanggang dito po yung updated na gamified ng TD

  //gamified acro naman po here
  useEffect(()=>{
    if(current?.content){
        setAnswers(Array(current.contents.length).fill("")); 
    }
    if(isAcronym){ setCurrentCorrectAnswers(current.contents.map(c => c.word));}

  },[current])

  const handleChange = (index, value) => {
  const updatedAnswers = [...answers];  // copy current answers
  updatedAnswers[index] = value;        // update the correct slot
  setAnswers(updatedAnswers);           // save it
  console.log(updatedAnswers)
};

 const checkAcro=(answers,correctAnswers)=>{
  let perfect = true;
  let forReturn=""

for (let i = 0; i < correctAnswers.length; i++) {
  if (answers[i].toUpperCase() !== correctAnswers[i].toUpperCase()) {
    perfect = false;
    break; // stop early if one is wrong
  }
}
  perfect?forReturn="correct":forReturn="";
  setAnswers(Array(correctAnswers.length).fill(""));
  return forReturn
 }

  //hanggang here

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
                    <p><b>Q:</b> {item.term}</p>
                    <p><b>A:</b> {findCorrectAnswer(item)}</p>
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
      <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center text-white gap-[20px]">
        <img src={gamifiedLogo} alt="Logo" className="w-100 mb-6 animate-float-breathe" />

      <p className='w-[40%] text-[#9898D9] font-poppins text-center'><b className='font-poppinsbold'>Direction: </b><br />{isAcronym?"Fill in the blanks using the first letters shown. Type the complete word and press \"Submit\". You must double check your answers before submitting! ":" Choose the correct definition!"}</p>

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
    <div className="min-h-screen bg-[#121212] text-white w-full p-6 flex flex-col place-content-center items-center relative">
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
            <div className={`relative w-160 perspective mb-6 place-self-center ${isAcronym?'h-100':'h-80'}`}>
              <div
                className={`transition-transform duration-500 transform-style preserve-3d w-full h-full        
                  ${isAnimating ? isCorrectAnimation? 'pop-up':'shake' : ''}`}
              >
                <div className={isAcronym ? "mnemonics" : "flashcard-front"}>
                  {isAcronym ? (
                    <>
                    <div className="text-lg font-extrabold tracking-widest">
                    {current.contents.map((item, index) => (
                      <div key={index} className="flex gap-10">
                        <p className="text-md">{item.word.charAt(0)}</p>
                        <textarea
                          className="resize-none p-2 border-b-2 border-b-white bg-transparent text-white"
                          placeholder="answer here"
                          value={answers[index] || ""}                   // controlled value
                          onChange={(e) => handleChange(index, e.target.value)} // update state
                        />
                      </div>
                    ))}
                                        
                    </div>
                    
                    </>
                  ) : (
                    <p className="text-3xl font-semibold text-white">{current.term}</p>
                    
                  )}
                </div>
                {/*ganto mag access ng keyphrase at 
                <p><b>Words:</b> {current.contents.map(c => c.word).join(', ')}</p>
                      <p><b>Key Phrase:</b> {current.keyPhrase}</p>*/}
              </div>
            </div>
          )}
      

      {/*choices/submit button*/}
      {isAcronym?<>
  <p className="text-center">
    <b>Key Phrase: </b>{current.keyPhrase}
  </p>

  <div className="flex justify-center mt-4">
    <button
      onClick={() => checkAnswer(checkAcro(answers, currentCorrectAnswers))}
      className="bg-[#9898D9] text-[#200448] p-5 rounded-4xl font-poppinsbold hover:text-[#9898D9] hover:bg-[#200448] active:scale-90"
    >
      Submit Answer
    </button>
  </div>
</> 
      : <div className="grid grid-cols-2 gap-5 w-full max-w-4xl mx-auto">
          {shuffledChoices.map((choice, index) => (
            <div
              key={index}
            className={`min-h-[7rem] border-[#2e2e42] border-1 p-5 bg-[#20202C] rounded-2xl flex items-center justify-center text-center font-poppins cursor-pointer] 
            ${isPressed ? (choice.type === "correct" ? "choiceCorrect" : "choiceWrong") : ""}`}
          onClick={() => {checkAnswer(choice.type);
                              setIsPressed(true);
              }}
            >
              {choice.text}
            </div>
  ))}
</div>}
      
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
