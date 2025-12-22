import React from 'react'
import { Link } from 'react-router-dom'
import { TbListLetters, TbNotes } from "react-icons/tb"
import { PiCardsFill } from "react-icons/pi"
import { HiSparkles } from "react-icons/hi"
import {motion, scale} from 'framer-motion'
import { IonContent, IonPage, IonText, IonTitle } from '@ionic/react'

const StudyToolsMenu = () => {

  const linkVariants={
    hidden:{opacity:0, scale:0.9},
    visible:{
      opacity:1,
      x:0,
      scale:1,
      transition:{
        type:'spring',
        stiffness:300,
        damping:15,
      }
    }
  }
    const titleVariants = {
    hidden: { opacity: 0, y: -100 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 15,
      },
    },
  }

  return (
    <IonPage className="ion-no-padding bg-[#12121A]">
      <IonContent className='pb-[25%] md:pb-0'>
        <div className="flex flex-col gap-5 p-6 sm:p-10 md:p-20 text-center">
        <motion.IonTitle variants={titleVariants} initial="hidden" animate="visible" className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-poppinsbold">
          
              STUDY TOOLS
        
              </motion.IonTitle>
          <hr className="border-gray-600 w-full md:w-3/4 mx-auto" />
        </div>

        <div className="px-6 pb-40 sm:px-10 md:px-20 grid grid-cols-1 sm:grid-cols-2 gap-10 ">

          <div className="sm:col-span-2 text-center">
            <IonText className="text-white text-2xl sm:text-3xl font-poppinsbold">Flashcards Maker</IonText>
          </div>

  <motion.div variants={linkVariants}
      initial="hidden"
      animate="visible"
  > 
    <Link to="/Main/Create/Submit?type=acronym&folder=AcronymMnemonics">
            <div className="p-8 sm:p-10 border border-[#565656] bg-[#2E2E40] text-white font-poppins rounded-xl text-center hover:border-[#B5B5FF] transition-all hover:scale-105">
              <TbListLetters size={70} className="mx-auto mb-4 text-white" />
              <IonTitle>
                <h3 className="font-bold text-lg">Acronym Mnemonics</h3>
              </IonTitle>
              <IonText>
              <p className="text-sm text-gray-300">Using mnemonics helps you memorize faster</p>
              </IonText>
            </div>
          </Link>
  </motion.div>
          <motion.div variants={linkVariants}
              initial="hidden"
              animate="visible"
          > 
            <Link to="/Main/Create/Submit?type=terms&folder=TermsAndDefinitions">
            <div className="p-8 sm:p-10 border border-[#565656] bg-[#2E2E40] text-white font-poppins rounded-xl text-center hover:border-[#B5B5FF] transition-all hover:scale-105">
              <PiCardsFill size={70} className="mx-auto mb-4 text-white" />
              <IonTitle>
                <h3 className="font-bold text-lg">Terms and Definition</h3>
              </IonTitle>
              <IonText>
                <p className="text-sm text-gray-300">Utilize Leitner technique in studying</p>
              </IonText>
            </div>
          </Link>
  </motion.div>
          <div className="sm:col-span-2 text-center">
            <IonTitle>
              <h2 className="text-white text-2xl sm:text-3xl font-poppinsbold">Reviewer Generator</h2>
            </IonTitle>
          </div>

          <motion.div variants={linkVariants}
              initial="hidden"
              animate="visible"
          >
            <Link to="/Main/Create/Submit?type=summarization&folder=SummarizedReviewers">
            <div className="p-8 sm:p-10 border border-[#565656] bg-[#2E2E40] text-white font-poppins rounded-xl text-center hover:border-[#B5B5FF] transition-all hover:scale-105">
              <TbNotes size={70} className="mx-auto mb-4 text-white" />
              <IonTitle>
                <h3 className="font-bold text-lg">Standard Summarization</h3>
              </IonTitle>
              <IonText>
                <p className="text-sm text-gray-300">Summarize key ideas, terms, and takeaways for quick review.  </p>
              </IonText>
            </div>
          </Link> 
      </motion.div>
          <motion.div variants={linkVariants}
              initial="hidden"
              animate="visible"
          >
            <Link to="/Main/Create/Submit?type=ai&folder=SummarizedWithAI">
            <div className="p-8 sm:p-10 border border-[#565656] bg-[#2E2E40] text-white font-poppins rounded-xl text-center hover:border-[#B5B5FF] transition-all hover:scale-105">
              <HiSparkles size={70} className="mx-auto mb-4 text-white" />
              <IonTitle>
                <h3 className="font-bold text-lg">Summarization + AI Explanation</h3>
              </IonTitle>
              <IonText>
                <p className="text-sm text-gray-300">Use AI to explain concepts with analogies and key insights. </p>
              </IonText>
            </div>
          </Link>
  </motion.div> 
        </div>
      </IonContent>
    </IonPage>
  )
}

export default StudyToolsMenu
