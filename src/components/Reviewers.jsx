import React from 'react'
import { Link, useLoaderData } from 'react-router-dom'
import { TbCardsFilled } from "react-icons/tb";
import { LuStickyNote, LuArrowLeft } from "react-icons/lu";
import { CiCirclePlus } from "react-icons/ci";
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

  if (folder.id === "TermsAndDefinitions") {
    headingText = "TERMS AND DEFINITION";
    revIcon = <TbCardsFilled color='white' size={80} />;
  } else if (folder.id === "SummarizedReviewers") {
    headingText = "SUMMARIZED REVIEWERS";
    revIcon = <LuStickyNote color='white' size={80} />;
  } else if (folder.id === "AcronymMnemonics") {
    headingText = "ACRONYM MNEMONICS";
    revIcon = <TbPlayCardAFilled size={90} color='white' />;
  } else if (folder.id === "SummarizedAIReviewers") {
    headingText = "SUMMARIZED AI REVIEWERS";
    revIcon = <FaWandMagicSparkles size={75} color='white' />;
  }

  //Sort reviewers by numerically desc
  //
  const sortedReviewers = [...reviewers].sort((a, b) =>
    b.id.localeCompare(a.id, undefined, { numeric: true })
  );

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
      {sortedReviewers && sortedReviewers.length > 0 ? (
  <div className="mb-15 px-4 sm:px-6 md:px-10 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
    {sortedReviewers.map((reviewer) => {
      const isLongTitle = reviewer.title.length > 30;
      const textSize = isLongTitle
        ? 'text-xs sm:text-sm md:text-base'
        : 'text-sm sm:text-base md:text-lg';

      return (
        <Link
          key={reviewer.id}
          to={reviewer.id.toString()}
          className="w-full flex justify-start items-center gap-4 bg-[#20202C] p-4 sm:p-5 rounded-2xl duration-150 ease-in hover:scale-105"
        >
          <div className="flex-shrink-0">
            {revIcon}
          </div>

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
) : (
  <div className='flex flex-col gap-2'> 
   <p className="text-center text-gray-400 mt-10">No reviewers yet</p>
     <button className='bg-[#B5B5FF] w-[200px] p-3 rounded-2xl place-self-center text-sm text-[#140538] font-bold cursor-pointer hover:bg-[#A3A3FF] justify-center place-items-center flex gap-3' onClick={()=> navigate(`/Main/Create`)}>  <CiCirclePlus size={30} />Create a Reviewer</button>

    </div>
 
)}


    </div>
  );
};

export default Reviewers;

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
