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

export async function loadAcronymMnemonics({ params }) {
  const user = await getUser();
  const { reviewerId, id: folderId } = params;

  if (!user?.uid) throw new Error("User UID is undefined — check authentication.");
  if (!folderId) throw new Error("folderId is undefined — check your route path (:id param).");
  if (!reviewerId) throw new Error("reviewerId is undefined — check your route path (:reviewerId param).");

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

      const numericId = parseInt(contentDoc.id.match(/\d+/)?.[0] || 0, 10);

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
        .map((d) => {
          const rawId = d.data().id ?? d.id;
          const innerNumericId = parseInt(rawId.toString().match(/\d+/)?.[0] || 0, 10);
          return {
            id: innerNumericId,
            ...d.data(),
          };
        })
        .sort((a, b) => a.id - b.id);

      return {
        id: numericId, 
        title: contentData.title,
        keyPhrase: contentData.keyPhrase,
        contents,
      };
    })
  );

  const sortedContent = content.sort((a, b) => a.id - b.id);

  reviewerData.content = sortedContent;

  return {
    id: reviewerId,
    ...reviewerData,
  };
}

export default loadAcronymMnemonics;
