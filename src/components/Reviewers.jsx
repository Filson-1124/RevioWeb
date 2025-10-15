import React from 'react'
import { Link, useLoaderData } from 'react-router-dom'
import { TbCardsFilled } from "react-icons/tb";
import { LuStickyNote, LuArrowLeft } from "react-icons/lu";
import { FaWandMagicSparkles } from "react-icons/fa6";
import { TbPlayCardAFilled } from "react-icons/tb";
import { auth, db } from '../components/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from 'react-router-dom';

const Reviewers = () => {

  const folder = useLoaderData();
  const reviewers = folder.reviewers;
  const navigate = useNavigate();

  //this is where we load and dissect the api po
  //kung makikita nyo po we turn it into manageable pieces para po makapag dive in tayo sa laman ng API

  let headingText = "REVIEWERS";
  let revIcon = <TbCardsFilled color='white' size={80} />;

  if (folder.id === "TermsAndCondition") {
    headingText = "TERMS AND CONDITION";
    revIcon = <TbCardsFilled color='white' size={80} />;
  } else if (folder.id === "SummarizedReviewers") {
    headingText = "SUMMARIZED REVIEWERS";
    revIcon = <LuStickyNote color='white' size={80} />;
  } else if (folder.id === "AcronymMnemonics") {
    headingText = "ACRONYM MNEMONICS";
    revIcon = <TbPlayCardAFilled size={90} color='white' />;
  } else if (folder.id === "SummarizedAIReviewers") {
    headingText = "SUMMARIZED WITH AI REVIEWERS";
    revIcon = <FaWandMagicSparkles size={75} color='white' />;
  }

  return (
    <div>

      <div className='flex flex-col gap-7 p-5'>
         <div className="w-full p-10 flex justify-between items-center relative">
          <button
            onClick={() => navigate(-1)} // 👈 go back one page
            className="absolute left-5 flex items-center gap-2 text-white bg-[#3F3F54] hover:bg-[#51516B] p-3 rounded-xl"
          >
            <LuArrowLeft size={20} />
            Back
          </button>
        </div>
        <h1 className='text-white text-xl font-bold md:text-4xl lg:text-5xl font-poppinsbold'>{headingText}</h1>
        <hr className='text-white' />
       
      </div>

      <div className="mb-15 px-4 sm:px-6 md:px-10 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {reviewers.map((reviewer) => {
          // Dynamically adjust text size based on title length
          const isLongTitle = reviewer.title.length > 30;
          const textSize = isLongTitle
            ? 'text-xs sm:text-sm md:text-base' // smaller for long titles
            : 'text-sm sm:text-base md:text-lg'; // normal for short titles

          return (
            <Link
              key={reviewer.id}
              to={reviewer.id.toString()}
              className="w-full flex justify-start items-center gap-4 bg-[#20202C] p-4 sm:p-5 rounded-2xl duration-150 ease-in hover:scale-105"
            >
              {/* Keep icon size constant */}
              <div className="flex-shrink-0">
                {revIcon}
              </div>

              {/* Title adjusts size automatically if long */}
              <h4
                className={`text-white font-medium leading-snug break-words line-clamp-2 ${textSize}`}
                title={reviewer.title}
              >
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
