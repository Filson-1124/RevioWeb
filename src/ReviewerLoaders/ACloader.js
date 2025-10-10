import { db } from "../components/firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../components/firebase";

// ✅ Ensure we have the authenticated user before loading data
const getUser = () =>
  new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      if (user && user.emailVerified) resolve(user);
      else reject("Unauthorized");
    });
  });

export async function loadAcronymMnemonics({ params }) {
  const user = await getUser();
  const { reviewerId, id: folderId } = params;

  console.log("🧭 Loader Params:", { reviewerId, folderId, user: user?.uid });

  // ✅ Guard checks
  if (!user?.uid) throw new Error("User UID is undefined — check authentication.");
  if (!folderId) throw new Error("folderId is undefined — check your route path (:id param).");
  if (!reviewerId) throw new Error("reviewerId is undefined — check your route path (:reviewerId param).");

  // ✅ Correct Firestore reference path
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
  if (!reviewerSnap.exists()) throw new Error("Reviewer document not found in Firestore.");

  const reviewerData = reviewerSnap.data();

  const contentCollectionRef = collection(
    db,
    "users",
    user.uid,
    "folders",
    folderId,
    "reviewers",
    reviewerId,
    "content"
  );

  const contentSnap = await getDocs(contentCollectionRef);

  const content = await Promise.all(
    contentSnap.docs.map(async (contentDoc) => {
      const contentData = contentDoc.data();

      const contentsRef = collection(
        db,
        "users",
        user.uid,
        "folders",
        folderId,
        "reviewers",
        reviewerId,
        "content",
        contentDoc.id,
        "contents"
      );

      const contentsSnap = await getDocs(contentsRef);

      const contents = contentsSnap.docs
        .map((d) => ({
          id: Number(d.data().id),
          ...d.data(),
        }))
        .sort((a, b) => a.id - b.id);

      return {
        id: Number(contentDoc.id),
        title: contentData.title,
        keyPhrase: contentData.keyPhrase,
        contents,
      };
    })
  );

  //Sort outer content numerically by id
  const sortedContent = content.sort((a, b) => a.id - b.id);

  reviewerData.content = sortedContent;
  return {
    id: reviewerId,
    ...reviewerData,
  };
}

export default loadAcronymMnemonics;
