import React from 'react'
import { Link, useLoaderData } from 'react-router-dom'
import { TbCardsFilled } from "react-icons/tb";
import { LuStickyNote } from "react-icons/lu";
import { LuArrowLeft } from "react-icons/lu";
import { FaWandMagicSparkles } from "react-icons/fa6";
import { TbPlayCardAFilled } from "react-icons/tb";
import { auth, db } from '../components/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from 'react-router-dom';

const Reviewers = () => {

const folder= useLoaderData()
const reviewers= folder.reviewers;
const navigate= useNavigate();
//this is where we load and disect the api po
//kung makikita nyopo we turn it into managable pieces para po makapag dive in tayo sa laman ng API

  let headingText = "REVIEWERS";
  let revIcon= <TbCardsFilled color='white' size={80}/>

  if (folder.id === "TermsAndCondition") {
    headingText = "TERMS AND CONDITION";
    revIcon= <TbCardsFilled color='white' size={80}/>
  } else if (folder.id === "SummarizedReviewers") {
    headingText = "SUMMARIZED REVIEWERS";
    revIcon=<LuStickyNote color='white' size={80} />
  } else if (folder.id === "AcronymMnemonics") {
    headingText = "ACRONYM MNEMONICS";
    revIcon=<TbPlayCardAFilled size={90} color='white' />
  } else if (folder.id === "SummarizedWithAI"){
    headingText = "SUMMARIZED WITH AI REVIEWERS"
    revIcon=<FaWandMagicSparkles size={90} color='white' />
  }



  return (

    <div>

  <div className=' flex flex-col gap-7 p-20'>
      <h1 className='text-white text-xl font-bold md:text-4xl lg:text-5xl font-poppinsbold'>{headingText}</h1>
      <hr className='text-white' />
      <div className="w-full p-10 flex justify-between items-center relative">
              <button
                    onClick={() => navigate(-1)} // 👈 go back one page
                    className="absolute left-5 flex items-center gap-2 text-white bg-[#3F3F54] hover:bg-[#51516B] p-3 rounded-xl"
                  >
                    <LuArrowLeft size={20} />
                    Back
                  </button>
          </div>
    </div>
    <div className='px-20 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-15'>
      {reviewers.map((reviewer)=>{
        //this is where the reviewers within a folder are getting rendered, eto po yung makikita na natin yung mga reviewers
        console.log(reviewer.questions)
        //dont mind this console log it is just for my checking po
        return <Link key={reviewer.id} className='flex w-70 justify-center gap-10 bg-[#20202C] p-5 rounded-2xl duration-150 ease-in hover:scale-105' to={reviewer.id.toString()}>
         {revIcon}
          <h4 className='text-white self-center text-sm'>
            {reviewer.title}

          </h4>
         
        </Link>
      })}
    </div>
    </div>
  )
}

export default Reviewers

export const reviewersLoader = async ({ params }) => {
  // Wrap onAuthStateChanged in a Promise
  const getUser = () => {
    return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        if (user && user.emailVerified) {
          resolve(user);
        } else {
          reject("Unauthorized");
        }
      });
    });
  };

  try {
    const user = await getUser();
    const uid = user.uid;
    const folderId = params.id;

    const folderRef = doc(db, 'users', uid, 'folders', folderId);
    const folderSnap = await getDoc(folderRef);

    if (!folderSnap.exists()) {
      throw new Error('Folder not found.');
    }

    const folderData = folderSnap.data();

    const reviewersRef = collection(folderRef, 'reviewers');
    const reviewersSnap = await getDocs(reviewersRef);

    const reviewers = reviewersSnap.docs.map((revDoc) => {
      const revData = revDoc.data();

      // If it's Summary or AI Summary, title is inside reviewers[0]
      const reviewerContent = (revData.reviewers && revData.reviewers[0]) || {};
      const title = revData.title || reviewerContent.title || "Untitled Reviewer";

      return {
        id: revDoc.id,
        title,
        ...revData,
      };
    });

    return {
      id: folderId,
      ...folderData,
      reviewers,
    };
  } catch (error) {
    console.error("Reviewers loader error:", error);
    throw new Response("Unauthorized", { status: 401 });
  }
};