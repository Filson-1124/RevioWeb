import { db } from "../components/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function loadSummarizedReviewers({ params, user }) {
  const { reviewerId, id: folderId } = params;

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

  const reviewerData = reviewerSnap.data();
  
  const reviewerContent = (reviewerData.reviewers && reviewerData.reviewers[0]) || {};
  const sections = reviewerContent.sections || [];
  const title = reviewerContent.title || "Untitled Reviewer";

  return {
    id: reviewerData.id || reviewerId,
    title,
    sections,
  };
}

export default loadSummarizedReviewers;
