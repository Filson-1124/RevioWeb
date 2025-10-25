
import { Link,useNavigate } from 'react-router-dom';

import { LuArrowLeft } from "react-icons/lu";
import { CiCirclePlus } from "react-icons/ci";

import { auth, db } from '../components/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from "firebase/auth";
import { useReviewer } from '../functions/useReviewer';



const Reviewers = () => {
  const navigate = useNavigate();
  const { state, actions } = useReviewer();
  const { headingText, IconComponent, iconSize, isFlashCard, extended, sortedReviewers } = state;

  return (
    <div className="min-h-screen pb-[20%] flex flex-col overflow-hidden">
      <div className="flex flex-col gap-7 p-5">
        <div className="w-full p-10 flex justify-between items-center relative">
          <button
            onClick={() => navigate(`/Main/Library`)}
            className="absolute left-0 flex items-center gap-2 text-white bg-[#3F3F54] hover:bg-[#51516B] p-3 rounded-xl"
          >
            <LuArrowLeft size={20} />
            Back
          </button>
        </div>

        <h1 className="text-white text-xl font-bold md:text-4xl lg:text-5xl font-poppinsbold">
          {headingText}
        </h1>

        {isFlashCard && (
          <div className="text-[#a5a2a2]">
            <p>Each reviewer has a progress indicator: </p>
            <div className="ml-3">
              <p>🟢 Fresh week just started </p>
              <p className={extended ? "block" : "hidden"}>🟡 Mid-week: review recommended soon </p>
              <p className={extended ? "block" : "hidden"}>🔴 Near or past milestone: review now</p>
              <p className={extended ? "block" : "hidden"}>✔️ All milestones completed</p>
              <p className={extended ? "block" : "hidden"}>
                ⚫ No start date yet (tap “Set Start Date” in the reviewer to begin)
              </p>
              <a
                onClick={() => actions.setExtended(!extended)}
                className="cursor-pointer text-[#ae57ff] hover:text-[#4b2370]"
              >
                {extended ? "see less..." : "see more..."}
              </a>
            </div>
          </div>
        )}
        <hr className="text-white" />
      </div>

      <div
        className={
          sortedReviewers && sortedReviewers.length > 0
            ? "mb-15 px-4 sm:px-6 md:px-10 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5"
            : "flex flex-col items-center"
        }
      >
        {sortedReviewers && sortedReviewers.length > 0 ? (
          sortedReviewers.map((reviewer) => {
            const isLongTitle = reviewer.title.length > 30;
            const textSize = isLongTitle ? "text-xs sm:text-sm md:text-base" : "text-sm sm:text-base md:text-lg";

            let color = "gray";
            let allDone = false;

            if (reviewer.startDate) {
              const startDate = reviewer.startDate?.toDate
                ? reviewer.startDate.toDate()
                : new Date(reviewer.startDate);
              const milestones = actions.calculateMilestones(startDate);
              color = actions.getMilestoneColor(milestones);
              allDone = actions.isAllMilestonesDone(milestones);
            }

            return (
              <Link
                key={reviewer.id}
                to={reviewer.id.toString()}
                className="relative w-full flex justify-start items-center gap-4 bg-[#20202C] p-4 sm:p-5 rounded-2xl duration-150 ease-in hover:scale-105"
              >
                {isFlashCard &&
                  (allDone ? (
                    <span className="absolute top-2 right-2 text-green-500 text-lg font-bold">✔</span>
                  ) : (
                    <span
                      className="absolute top-2 right-2 w-4 h-4 rounded-full"
                      style={{ backgroundColor: color || "gray" }}
                    ></span>
                  ))}
                <div className="flex-shrink-0">
                  <IconComponent size={iconSize} color="white" />
                </div>
                <h4
                  className={`text-white font-medium leading-snug break-words line-clamp-2 ${textSize}`}
                  title={reviewer.title}
                >
                  {reviewer.title}
                </h4>
              </Link>
            );
          })
        ) : (
          <div className="empty flex flex-col gap-2 w-full justify-center">
            <p className="text-center text-gray-400 mt-10">No reviewers yet</p>
            <button
              className="bg-[#B5B5FF] w-[200px] p-3 rounded-2xl place-self-center text-sm text-[#140538] font-bold cursor-pointer hover:bg-[#A3A3FF] justify-center place-items-center flex gap-3"
              onClick={() => navigate(`/Main/Create`)}
            >
              <CiCirclePlus size={30} />
              Create a Reviewer
            </button>
          </div>
        )}
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
