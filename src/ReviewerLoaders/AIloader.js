import { db } from "../components/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../components/firebase";

const getUser = () =>
  new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      if (user && user.emailVerified) resolve(user);
      else reject("Unauthorized");
    });
  });

export async function loadSummarizedAIReviewers({ params }) {
  const user = await getUser();
  const { reviewerId } = params;

  const folderId = "SummarizedAIReviewers";

  const reviewerRef = doc(
    db,
    "users",
    user.uid,
    "folders",
    folderId,
    "reviewers",
    reviewerId
  );


  let reviewerSnap;
  let retries = 0;
  const maxRetries = 8;
  const retryDelay = 1000; // 1 second delay between attempts

  // Retry fetching if reviewer not yet generated
  while (retries < maxRetries) {
    reviewerSnap = await getDoc(reviewerRef);
    if (reviewerSnap.exists()) break;

    console.warn(`Reviewer document not found yet (attempt ${retries + 1}/${maxRetries})`);
    retries++;
    await new Promise((resolve) => setTimeout(resolve, retryDelay));
  }


  const reviewerData = reviewerSnap.data();


  const reviewerContent = reviewerData.reviewers[0] || {};
  const sections = reviewerContent.sections || [];
  const title = reviewerContent.title || "Untitled Reviewer";


  return {
    id: reviewerId,
    title,
    sections,
  };
}

export default loadSummarizedAIReviewers;
