import { db } from "../components/firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";

export async function loadTermsAndCondition({ params, user }) {
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

  const questions = questionsSnap.docs.map((d) => ({
    id: d.id,
    definition: d.data().definition,
    term: d.data().term,
  }));

  return {
    id: reviewerId,
    title: reviewerData.title,
    questions,
  };
}

export default loadTermsAndCondition;
