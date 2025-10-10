import { db } from "../components/firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
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

export async function loadTermsAndCondition({ params }) {
  const user = await getUser();
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
