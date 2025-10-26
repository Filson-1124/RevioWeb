
import { useLoaderData, useNavigate } from 'react-router-dom'
import gamifiedLogo from '../assets/gamifiedLogo.png'
import gameOverLogo from '../assets/referee.png'
import { auth, db } from '../components/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, collection, getDocs } from 'firebase/firestore'
import { LuArrowLeft } from "react-icons/lu"
import { useParams } from "react-router-dom";
import { useGamified } from '../functions/useGamified'
import Lottie from 'lottie-react'
import confetti from '../assets/animation/CONFETTI.json'
import trophy from '../assets/animation/Trophy.json'

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
    isPressed,
    showSplash,
    countdown,
    isAnimating,
    isCorrectAnimation,
    shuffledChoices,
    answers,
    currentCorrectAnswers,
    timeUp,
    current,trophyDone}=state

    const{ 
    setIsPressed,
    handleStart,
    handleChange,
    checkAcro,
    checkAnswer,findCorrectAnswer
  }=actions

  const navigate = useNavigate()

 



  // Results screen
 const renderResults = () => {
  const totalSeconds = Math.ceil((Date.now() - startTime) / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const timeDisplay = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`
  const totalAnswered = score + wrongAnswers.length
  const isPerfect = wrongAnswers.length === 0 && totalAnswered > 0


  

  return (
    <div className=" text-center text-white w-full max-w-2xl px-4 flex flex-col items-center justify-center">
      {/* 🎉 Confetti animation — transparent background */}
      {wrongAnswers.length === 0 && totalAnswered > 0 && (
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
            pointerEvents: 'none', // ensures it doesn't block clicks
            zIndex: 100
          }}
        />
      )}
      

      {isPerfect && !trophyDone && (
       
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
            pointerEvents: 'none', // ensures it doesn't block clicks
            zIndex: 100
          }}
          
        />
      )}

      <h2 className="text-2xl sm:text-3xl font-bold mb-4 z-20">Results</h2>
      <p className="text-base sm:text-lg mb-2 z-20">
        Score: {score} / {questions.length}
      </p>
      <p className="text-base sm:text-lg mb-6 z-20">Time spent: {timeDisplay}</p>

      {totalAnswered === 0 ? (
        <p className="text-lg text-yellow-400 z-20">
          You didn’t answer any questions ⏰
        </p>
      ) : wrongAnswers.length > 0 ? (
        <div className="text-left bg-[#1f1f1f] p-4 rounded-lg space-y-3 overflow-y-auto max-h-[60vh] z-20">
          <h3 className="text-lg sm:text-xl font-semibold mb-2">Wrong Answers:</h3>
          {wrongAnswers.map((item, i) => (
            <div
              key={i}
              className="p-3 border-2 border-[#672c93] rounded-md text-sm sm:text-base text-[#492f6b] bg-[#fefff7] font-bold"
            >
              {isAcronym ? (
                <>
                  <p><b>Letters:</b> {item.contents.map(c => c.word.charAt(0)).join('')}</p>
                  <p><b>Words:</b> {item.contents.map(c => c.word).join(', ')}</p>
                  <p><b>Key Phrase:</b> {item.keyPhrase}</p>
                </>
              ) : (
                <>
                  <p><b>Q:</b> {item.term}</p>
                  <p><b>A:</b> {findCorrectAnswer(item)}</p>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-lg z-20">No mistakes! 🎉</p>
      )}
    </div>
  )
}

 

  // Splash screen
  if (showSplash && !showResults) {
    return (
      <div className="h-[100%] bg-[#121212] flex flex-col items-center justify-center text-white px-6 text-center">
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
                "Choose the correct definition!"
              )}
            </p>
            <button
              onClick={handleStart}
              className=" cursor-pointer px-6 py-3 bg-[#6A558D] hover:bg-[#8267B1] text-white text-lg sm:text-xl rounded-full font-bold transition w-[80%] sm:w-auto"
            >
              Start Game
            </button>
           
            <button
              onClick={() => navigate(`/Main/Library/${folderId}/${reviewerId}`)}
              className="cursor-pointer mt-3 left-2 top-2 md:left-5 flex items-center gap-2 text-white hover:bg-[#51516B] p-2 md:p-3 rounded-xl text-sm md:text-base font-black"
            >
              Back
            </button>
          </>
        )}
      </div>
      
    )
  }

  // Main game screen
  return (
    <div className="h-full bg-[#121212] text-white w-full pb-20 p-5 flex flex-col items-center relative overflow-x-hidden">
      <div className="w-full flex justify-between items-center relative mb-6">
        <button
       onClick={() => navigate(`/Main/Library/${folderId}/${reviewerId}`)}
          className="cursor-pointer md:absolute left-2 top-2 md:left-5 flex items-center gap-2 text-white bg-[#3F3F54] hover:bg-[#51516B] p-2 md:p-3 rounded-xl text-sm md:text-base"
        >
          <LuArrowLeft size={18} className="md:size-5" />
          Back
        </button>
      </div>

      {countdown !== null && (
       <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center text-6xl sm:text-8xl font-bold text-white">
  {countdown}
</div>
      )}

      {showResults ? (
        <div className="flex items-center justify-center w-full h-full">{renderResults()}</div>
      ) : (
        <div className={`w-full max-w-4xl transition-opacity ${countdown !== null ? 'opacity-30' : 'opacity-100'}`}>
          <div className="flex justify-between items-center mb-4 text-sm sm:text-base">
            <h1 className="font-bold">Gamified Mode</h1>
            <span>Score: {score}</span>
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
                      {current.term}
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
                  className={`min-h-[5rem] sm:min-h-[7rem] border border-[#2e2e42] p-4 sm:p-5 bg-[#20202C] rounded-2xl flex items-center justify-center text-center cursor-pointer text-sm sm:text-base 
                    ${isPressed ? (choice.type === 'correct' ? 'choiceCorrect' : 'choiceWrong') : ''}`}
                  onClick={() => { checkAnswer(choice.type); setIsPressed(true) }}
                >
                  {choice.text}
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