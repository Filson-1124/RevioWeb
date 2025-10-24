import React from 'react';
import { Link, useLoaderData, useNavigate } from 'react-router-dom';
import { TbCardsFilled, TbPlayCardAFilled } from "react-icons/tb";
import { LuStickyNote, LuArrowLeft } from "react-icons/lu";
import { FaWandMagicSparkles } from "react-icons/fa6";
import { auth, db } from '../components/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from "firebase/auth";

const Reviewers = () => {
  const folder = useLoaderData();
  const reviewers = folder.reviewers;
  const navigate = useNavigate();

  let headingText = "REVIEWERS";
  let revIcon = <TbCardsFilled color='white' size={80} />;
  let isFlashCard=false;

  if (folder.id === "TermsAndDefinitions") {
    headingText = "TERMS AND DEFINITION";
    revIcon = <TbCardsFilled color='white' size={80} />;
    isFlashCard=true;
    
  } else if (folder.id === "SummarizedReviewers") {
    headingText = "SUMMARIZED REVIEWERS";
    revIcon = <LuStickyNote color='white' size={80} />;
    isFlashCard=false;
  } else if (folder.id === "AcronymMnemonics") {
    headingText = "ACRONYM MNEMONICS";
    revIcon = <TbPlayCardAFilled size={90} color='white' />;
    isFlashCard=true;
  } else if (folder.id === "SummarizedAIReviewers") {
    headingText = "SUMMARIZED AI REVIEWERS";
    revIcon = <FaWandMagicSparkles size={75} color='white' />;
    isFlashCard=false;
  }

  const sortedReviewers = [...reviewers].sort((a, b) =>
    b.id.localeCompare(a.id, undefined, { numeric: true })
  );

  // --- Milestone Functions ---
  const calculateMilestones = (startDate) => {
  const milestones = [];

  for (let i = 1; i <= 4; i++) {
    const milestone = new Date(startDate);
    milestone.setDate(startDate.getDate() + i * 7); // add 7, 14, 21, 28 days
    milestones.push(milestone);
  }

  return milestones;
};

const isAllMilestonesDone = (milestones) => {
  const today = new Date();
  // Check if the last milestone is in the past
  return today > milestones[milestones.length - 1];
};


  const getMilestoneColor = (milestones) => {
    const today = new Date();
    const nextMilestone = milestones.find(date => today <= date) || milestones[milestones.length - 1];

    const diffInDays = Math.floor((nextMilestone - today) / (1000 * 60 * 60 * 24));
  
    if (diffInDays <= 1) return "red";        // almost due
    if (diffInDays <= 3) return "yellow";     // middle of the week
    return "green";                            // week just started
  };

  return (
    <div className="min-h-screen pb-[20%] flex flex-col overflow-hidden">
      <div className='flex flex-col gap-7 p-5'>
        <div className="w-full p-10 flex justify-between items-center relative">
          <button
            onClick={() => navigate(`/Main/Library`)} // 👈 go back one page
            className="cursor-pointer absolute left-0 flex items-center gap-2 text-white bg-[#3F3F54] hover:bg-[#51516B] p-3 rounded-xl"
          >
            <LuArrowLeft size={20} />
            Back
          </button>
        </div>
        <h1 className='text-white text-xl font-bold md:text-4xl lg:text-5xl font-poppinsbold'>{headingText}</h1>
        <hr className='text-white' />
      </div>

      <div className="mb-15 px-4 sm:px-6 md:px-10 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {sortedReviewers.map((reviewer) => {
          const isLongTitle = reviewer.title.length > 30;
          const textSize = isLongTitle
            ? 'text-xs sm:text-sm md:text-base'
            : 'text-sm sm:text-base md:text-lg';

         // Convert Firestore timestamp to JS Date

          let color="gray"
          let allDone=false;

       if(reviewer.startDate){
         const startDate = reviewer.startDate?.toDate ? reviewer.startDate.toDate() : new Date(reviewer.startDate);
         const milestones = calculateMilestones(startDate);
         color = getMilestoneColor(milestones);
         allDone = isAllMilestonesDone(milestones);
       }
        
        



          return (
            <Link
              key={reviewer.id}
              to={reviewer.id.toString()}
              className="relative w-full flex justify-start items-center gap-4 bg-[#20202C] p-4 sm:p-5 rounded-2xl duration-150 ease-in hover:scale-105"
            >
              {/* Colored Dot */}
             {/* Colored Dot or Checkmark */}

                {isFlashCard?(allDone?(<span className="absolute top-2 right-2 text-green-500 text-lg font-bold">✔</span>): (<span
                  className={`absolute top-2 right-2 w-4 h-4 rounded-full`}
                  style={{ backgroundColor: color || "gray" }}
                ></span>)):""}

                
               


              <div className="flex-shrink-0">{revIcon}</div>
              <h4 className={`text-white font-medium leading-snug break-words line-clamp-2 ${textSize}`} title={reviewer.title}>
                {reviewer.title}
              </h4>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Reviewers;

// --- Loader ---
export const reviewersLoader = async ({ params }) => {
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
      const reviewerContent = (revData.reviewers && revData.reviewers[0]) || {};
      const title = revData.title || reviewerContent.title || "Untitled Reviewer";

      return {
        id: revDoc.id,
        title,
        ...revData,
      };
    });

    const sortedReviewers = reviewers.sort((a, b) =>
      b.id.localeCompare(a.id, undefined, { numeric: true })
    );

    return {
      id: folderId,
      ...folderData,
      reviewers: sortedReviewers,
    };
  } catch (error) {
    console.error("Reviewers loader error:", error);
    throw new Response("Unauthorized", { status: 401 });
  }
};
