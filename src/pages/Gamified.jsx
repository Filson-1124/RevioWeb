
import { useLoaderData, useNavigate } from 'react-router-dom'
import gamifiedLogo from '../assets/gamifiedLogo.png'
import gameOverLogo from '../assets/referee.png'
import { auth, db } from '../components/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, collection, getDocs } from 'firebase/firestore'
import { useParams } from "react-router-dom";
import { useGamified } from '../functions/useGamified'
import Lottie from 'lottie-react'
import confetti from '../assets/animation/CONFETTI.json'
import trophy from '../assets/animation/Trophy.json'
import { FaVolumeMute } from "react-icons/fa";
import { AiFillSound } from "react-icons/ai";
import { FaSignOutAlt } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion"

const Gamified = () => {
   const loaderData = useLoaderData();
   const { id: folderId, reviewerId } = useParams();
   const isAcronym = !!loaderData.content;
  const questions = isAcronym ? loaderData.content : loaderData.questions;
  const { state, actions } = useGamified({ questions: questions || content || [], isAcronym });
  

 
   
   const {
    score,
    timeLeft,
    wrongAnswers,
    startTime,
    showResults,
    answeredQuestions,
    userAnswer,
    isPressed,
    showSplash,
    countdown,
    isAnimating,
    isCorrectAnimation,
    shuffledChoices,
    answers,
    currentCorrectAnswers,
    timeUp,active,
    current,trophyDone,isPlus,isMuted,isPerfect,isQuitting}=state

    const{ 
    setIsPressed,
    handleStart,
    handleChange,
    checkAcro,setActive,
    checkAnswer,toggleMute,setIsQuitting
  }=actions

  const navigate = useNavigate()

 




const renderResults = () => {
  const totalSeconds = Math.ceil((Date.now() - startTime) / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const timeDisplay = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`
  const totalAnswered = answeredQuestions.length
 

  const correctList = answeredQuestions.filter(q => q.isCorrect)
  const wrongList = answeredQuestions.filter(q => !q.isCorrect)

console.log("sa UI: "+isPerfect)
return (

  
  <div className="text-center text-white w-full max-w-4xl mx-auto flex flex-col items-center ">
     {/* Title and summary */}
      <div className="z-10 bg-[#101010] ">
        <h2 className="text-3xl font-bold mt-2">Results</h2>
        <p className="text-lg">Score: {score} / {questions.length}</p>
        <p className="text-sm text-gray-400 mb-4">Time spent: {timeDisplay}</p>
      </div>
    {/* Scroll Container */}
    <div className="w-full h-[45vh] md:h-[60vh] overflow-y-auto custom-scroll p-2 pb-[40%] md:pb-[10%] bg-[#101010] rounded-2xl shadow-lg border border-[#2a2a2a]">
       { console.log("correct: "+correctList.length)}
     {correctList.length > 0 &&
     (
     
      <Lottie
          animationData={confetti}
          loop={false}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'transparent',
            pointerEvents: 'none',
            zIndex: 1000
          }}
        />
     )}

      {/* Perfect animation */}
      {isPerfect && !trophyDone &&(
        <Lottie
          animationData={trophy}
          loop={false}
        
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'transparent',
            pointerEvents: 'none',
            zIndex: 1000
          }}
        />
      )}

      {/* CORRECTLY ANSWERED */}
      <div className="w-full bg-[#161616] border border-green-700 rounded-lg p-4 text-left shadow-md mb-6">
        <h3 className="text-xl font-semibold text-green-400 mb-3">Correctly Answered:</h3>
        {correctList.length === 0 ? (
          <p className="text-gray-400 text-sm italic">No correct answers yet.</p>
        ) : (
          correctList.map((item, i) => (
            <div
              key={i}
              className="border border-green-800 bg-[#1e1e1e] p-4 rounded-lg mb-3 hover:scale-102 transition-all duration-100 cursor-default"
            >
              {isAcronym ? (
                <>
                  <p className="text-sm mb-2">
                    <b>Letters:</b>{" "}
                    {(item.question?.contents || [])
                      .map(c => c.word?.charAt(0) || '')
                      .join('')}
                  </p>
                  <p className="text-sm mb-1 font-semibold text-green-400">Correct Words:</p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {item.correctAnswers.map((word, idx) => (
                      <span
                        key={idx}
                        className="bg-[#2b2b2b] hover:scale-105 rounded px-2 py-1 text-green-400 font-semibold break-words"
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                  {item.question?.keyPhrase && (
                    <p className="text-xs italic text-gray-500">
                      Key Phrase: {item.question.keyPhrase}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p><b>Q:</b> {item.question?.term || item.question?.definitionText || '(unknown question)'}</p>
                  <p className="text-green-400 hover:scale-102 transition-all duration-100 cursor-default">
                    <b>Answer:</b> {item.correctAnswers[0]}
                  </p>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* WRONG ANSWERS */}
      <div className="w-full bg-[#161616] border border-purple-700 rounded-lg p-4 text-left shadow-md mb-4">
        <h3 className="text-xl font-semibold text-red-400 mb-3">Wrong Answers:</h3>
        {wrongList.length === 0 ? (
          <p className="text-gray-400 text-sm italic">No wrong answers 🎉</p>
        ) : (
          wrongList.map((item, i) => (
            <div
              key={i}
              className="border border-purple-800 bg-[#1e1e1e] p-4 rounded-lg mb-3 hover:scale-102 transition-all duration-100 cursor-default"
            >
              {isAcronym ? (
                <>
                  <p className="text-sm mb-2">
                    <b>Letters:</b>{" "}
                    {(item.question?.contents || [])
                      .map(c => c.word?.charAt(0) || '')
                      .join('')}
                  </p>
                  <p className="text-sm mb-1 font-semibold text-purple-400 ">Expected Words:</p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {item.correctAnswers.map((word, idx) => {
                      const userWord = item.userAnswers?.[idx] || ''
                      const isRight =
                        userWord.trim().toUpperCase() === word.trim().toUpperCase()
                      return (
                        <span
                          key={idx}
                          className={`rounded px-2 py-1 font-semibold break-words hover:scale-105  transition-all duration-100 cursor-default ${
                            isRight ? 'text-green-400' : 'text-red-400'
                          } bg-[#2b2b2b]`}
                        >
                          {word}
                        </span>
                      )
                    })}
                  </div>
                  <p className="text-sm text-gray-400 mb-1">Your Answers:</p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {item.userAnswers.map((ans, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 rounded bg-[#292929] text-white break-words"
                      >
                        {ans || '(blank)'}
                      </span>
                    ))}
                  </div>
                  {item.question?.keyPhrase && (
                    <p className="text-xs italic text-gray-500">
                      Key Phrase: {item.question.keyPhrase}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p><b>Q:</b> {active==="term"?item.question?.defReal:item.question?.term}</p>
                  <p className="text-red-400">
                    <b>Correct:</b> {item.correctAnswers[0]}
                  </p>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  </div>
)

}




 
  if (showSplash && !showResults) {
    return (
      <div className="h-[100%] bg-[#121212] flex flex-col items-center justify-center text-white px-6 text-center lg:pb-30">
        {timeUp ? (
          <>
            <img src={gameOverLogo} alt="Logo" className="w-65 sm:w-80 mb-6 animate-pulse" />
            <h1 className="text-3xl font-bold text-yellow-400 mb-2">Time’s Up!</h1>
            <p className="text-[#9898D9] text-lg">Game Over ⏰</p>
          </>
        ) : (
          <>
            <img src={gamifiedLogo} alt="Logo" className="w-65 sm:w-80 mb-6 animate-float-breathe" />
            <p className="max-w-md sm:max-w-lg text-[#9898D9] font-poppins text-sm sm:text-base mb-6">
              <b className="font-poppinsbold">How to Play</b><br />
              {isAcronym ? (
                <> Fill in the blanks using the first letters shown. Type the complete word and press 'Submit Answer.' <br /> You must <b>double check</b> your answers before submitting!</>
              ) : (  
                active=== "term"?"Choose the correct Term":"Choose the correct Definition"  
              )}

           
                
              <br />
              WARNING: Leaving the page will reset your progress.
            </p>
               {!isAcronym&&(<div className="relative w-60 bg-[#ffffff2b] rounded-full flex p-1 place-self-center mb-3">
                      
                      {/* Sliding highlight */}
                       <div className={`absolute inset-y-1 left-1 w-1/2 bg-[#6A558D] rounded-full transition-transform duration-300 ${
      active === "term" ? "translate-x-0" : "translate-x-[94%]"
    }`}
  />
                      {/* Buttons */}
                      <button
                        onClick={() => setActive("term")}
                        className={`relative z-10 w-1/2 text-center py-2 transition ${
                          active === "term" ? "text-white" : "text-[#5300da]"
                        }`}
                      >
                        Term
                      </button>

                      <button
                        onClick={() => setActive("definition")}
                        className={`relative z-10 w-1/2 text-center py-2 transition ${
                          active === "definition" ? "text-white" : "text-[#5300da]"
                        }`}
                      >
                        Definition
                      </button>
                    </div>)}
           
            <button
              onClick={handleStart}
              className=" transition-all duration-100 active:scale-95 cursor-pointer px-6 py-3 bg-[#6A558D] hover:bg-[#8267B1] text-white text-lg sm:text-xl rounded-full font-bold  w-[80%] sm:w-auto"
            >
              Start Game
            </button>
           
            <button
              onClick={() => navigate(`/Main/Library/${folderId}/${reviewerId}`)}
              className=" transition-all duration-100 active:scale-95 cursor-pointer mt-3 left-2 top-2 md:left-5 flex items-center gap-2 text-white hover:bg-[#51516B] p-2 md:p-3 rounded-xl text-sm md:text-base font-black"
            >
              Back
            </button>
          </>
        )}
      </div>
      
    )
  }

 
  return (
    
    <div className="h-full bg-[#121212] text-white w-full pb-40 pt-20 p-5 flex flex-col items-center relative overflow-x-hidden">
      {isQuitting && (
  <div className="fixed inset-0 bg-[#0c0b0b35] bg-opacity-70 flex justify-center items-center z-50">
    <AnimatePresence>
      <motion.div
        key="quit-modal"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 15,
        }}
        className="bg-[#2E2E40] rounded-2xl p-6 text-center w-[90%] sm:w-[400px] border border-[#B5B5FF] shadow-2xl"
      >
        <h2 className="text-white text-lg font-bold mb-3">
          Leaving Game?
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          Are you sure you want to go back? Your progress won't be saved.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setIsQuitting(false)}
            className="transition-all duration-75 cursor-pointer px-4 py-2 rounded-xl bg-[#51516B] hover:bg-gray-700 text-white font-semibold active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              setIsQuitting(false);
              navigate(`/Main/Library/${folderId}/${reviewerId}`);
            }}
            className="transition-all duration-75 cursor-pointer px-4 py-2 rounded-xl bg-[#B5B5FF] hover:bg-[#C22507] text-white font-semibold active:scale-95"
          >
            Leave
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  </div>
)}
 
        <button
       onClick={() => setIsQuitting(true) }
          className="transition-all duration-100 active:scale-95 cursor-pointer md:absolute left-2 top-5 md:left-5 flex items-center gap-2 text-white bg-[#3F3F54] hover:bg-[#51516B] p-2 md:p-3 rounded-xl text-sm md:text-base"
        >
         
          <FaSignOutAlt size={18} className="md:size-5"  style={{ transform: 'scaleX(-1)' }}  />
     
        </button>
 

      {countdown !== null && (
       <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center text-6xl sm:text-8xl font-bold text-white">
  {countdown}
</div>
      )}

      {showResults ? (
        <div className="flex items-center justify-center w-full h-full">{renderResults()}</div>
      ) : (
        <div className={`w-full max-w-4xl transition-opacity ${countdown !== null ? 'opacity-30' : 'opacity-100'}`}>
          <div className="relative justify-between items-center mb-4 text-sm sm:text-base">
            <h1 className="font-bold">Gamified Mode</h1>
            <span className='absolute right-0'>Score: {score}</span>
             <span
  className={`text-[#0adf31] absolute right-0 transition-all duration-200
    ${isPlus 
      ? 'opacity-100 top-1 scale-125 -translate-y-2' 
      : 'opacity-0 scale-75 translate-y-0'}
  `}
>
  +1
</span>
            <button onClick={()=> toggleMute()} className='hover:text-red-500 text-lg'> {isMuted? <FaVolumeMute color='red' /> : <AiFillSound />} </button>
          </div>

          <div className="mb-4 text-right text-xs sm:text-sm text-gray-300">
            Total Time: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
          </div>

          {current && (
            <div
              className={`relative w-full mb-6 flex justify-center ${
                isAcronym ? 'h-[50vh] sm:h-[55vh] md:h-[60vh]' : 'h-64 sm:h-72'
              }`}
            >
              <div
                className={`transition-transform duration-500 w-full h-full flex justify-center items-center ${
                  isAnimating ? (isCorrectAnimation ? 'pop-up' : 'shake') : ''
                }`}
              >
                <div
                  className={`${
                    isAcronym ? 'mnemonics' : 'flashcard-front'
                  } w-[90%] sm:w-[80%] lg:w-[60%] p-4 sm:p-6 rounded-2xl bg-[#20202C] flex flex-col justify-center`}
                >
                  {isAcronym ? (
                    <div className="text-base sm:text-lg font-bold tracking-widest space-y-3 overflow-y-auto max-h-[45vh] sm:max-h-[50vh] w-full px-2">
                      <h1>{current.title}</h1>
                      {current.contents.map((item, i) => (
                        <div key={i} className="flex gap-4 items-center justify-between">
                          <p className="text-md sm:text-lg text-[#c7c7ffff]">{item.word.charAt(0)}</p>
                          <textarea
                            className="resize-none p-2 border-2 bg-[#51516B] rounded-xl text-white w-[90%] focus:outline-none"
                            placeholder="Type the word"
                            value={answers[i] || ''}
                            onChange={(e) => handleChange(i, e.target.value)}
                            rows={1}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-2xl sm:text-3xl font-semibold text-center text-white">
                      
                      {active === "term"? current.defReal :current.term}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {isAcronym ? (
            <>
              <p className="text-center text-sm sm:text-base mb-4 bg-[#171720] p-5 text-[#9898D9] rounded-md">
                <b>Key Phrase:</b> {current.keyPhrase}
              </p>
              <div className="flex justify-center">
                <button
                  onClick={() => checkAnswer(checkAcro(answers, currentCorrectAnswers))}
                  className="bg-[#9898D9] text-[#200448] px-6 py-3 rounded-3xl font-bold hover:text-[#9898D9] hover:bg-[#200448] active:scale-90 w-[80%] sm:w-auto"
                >
                  Submit Answer
                </button>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-4xl mx-auto">
              {shuffledChoices.map((choice, i) => (
                <div
                  key={i}
                  className={`min-h-[5rem] sm:min-h-[7rem] border border-[#2e2e42] p-4 sm:p-5 bg-[#20202C] rounded-2xl flex items-center justify-center text-center cursor-pointer text-sm sm:text-base hover:bg-[#3c3c50] transition-all duration-100
                    ${isPressed ? (choice.type === 'correct' ? 'choiceCorrect' : 'choiceWrong') : ''}`}
                  onClick={() => { checkAnswer(choice.type); setIsPressed(true) }}
                >
                  {active==="term"? choice.term : choice.text}
                </div>
              ))}
            </div>
          )}
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

    if (folderId === "TermsAndDefinitions") {
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