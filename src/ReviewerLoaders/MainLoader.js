import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../components/firebase";
import { loadTermsAndCondition } from "./TDloader";
import { loadAcronymMnemonics } from "./ACloader";
import { loadSummarizedReviewers } from "./STDloader";
import { loadSummarizedAIReviewers } from "./AIloader";

const getUser = () =>
  new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      if (user && user.emailVerified) resolve(user);
      else reject("Unauthorized");
    });
  });

export const reviewerQuestionsLoader = async ({ params }) => {
  try {
    const user = await getUser();
    const { id: folderId } = params;

    const map = {
      TermsAndCondition: loadTermsAndCondition,
      AcronymMnemonics: loadAcronymMnemonics,
      SummarizedReviewers: loadSummarizedReviewers,
      SummarizedAIReviewers: loadSummarizedAIReviewers,
    };

    const loaderFn = map[folderId];
    if (!loaderFn) throw new Response("Unknown folder type", { status: 404 });

    return await loaderFn({ params, user });
  } catch (err) {
    console.error("reviewerQuestionsLoader error:", err);
    throw new Response("Failed to load reviewer", { status: 500 });
  }
};

export default reviewerQuestionsLoader;