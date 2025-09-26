import { db } from "../components/firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";

export async function loadAcronymMnemonics({ params, user }) {
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