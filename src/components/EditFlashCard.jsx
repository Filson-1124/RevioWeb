import React, { useState } from 'react'
import { useLoaderData } from 'react-router-dom'
import { LuPencil, LuTrash, LuPlus, LuArrowLeft } from "react-icons/lu";
import { FaSave } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";

const EditFlashCard = () => {
  const reviewer = useLoaderData()
  const navigate = useNavigate() 
  const [questions, setQuestions] = useState(reviewer.questions || [])
  const [content, setContent] = useState(reviewer.content || [])

  if (!reviewer) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[#2A2A3B] text-white">
        <h1 className="text-2xl font-poppinsbold">Reviewer not found</h1>
      </div>
    )
  }

  const isAcronym = reviewer.type === "acronym"
  const isTermDef = reviewer.type === "flashcard"

  const handleChange = (id, field, value) => {
    setQuestions(prev =>
      prev.map(q => q.id === id ? { ...q, [field]: value } : q)
    )
  }

  const handleAcronymChange = (contentId, index, field, value) => {
    setContent(prev =>
      prev.map(c =>
        c.id === contentId
          ? {
              ...c,
              contents: c.contents.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
              )
            }
          : c
      )
    )
  }

  const addLetter = (contentId) => {
    setContent(prev =>
      prev.map(c =>
        c.id === contentId
          ? {
              ...c,
              contents: [...c.contents, { letter: "", word: "" }]
            }
          : c
      )
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="w-full p-10 flex justify-between items-center relative">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-5 flex items-center gap-2 text-white bg-[#3F3F54] hover:bg-[#51516B] p-3 rounded-xl"
        >
          <LuArrowLeft size={20} />
          Back
        </button>

        <div className="w-full flex gap-[1.5rem] justify-center">
          <h1 className="text-white font-poppinsbold text-3xl">
            {reviewer.title}
          </h1>
          <LuPencil color="white" size={28} />
        </div>

        <button className="font-poppinsbold text-[#200448] bg-[#B5B5FF] text-lg flex gap-1 p-5 rounded-2xl place-self-end">
          <FaSave size={25} />
          Save
        </button>
      </div>

      {/* Conditional Render */}
      <div className="flex flex-col gap-10 p-10 w-full place-items-center">
        {/* TERM/DEF TYPE */}
        {isTermDef && questions?.length > 0 && (
          <>
            {questions.map((q, idx) => (
              <div
                key={q.id || idx}
                className="flex items-stretch bg-[#3F3F54] w-2xl pl-10 pr-0 gap-10 text-white rounded-xl"
              >
                <div className="flex flex-col w-full gap-10 my-10">
                  <section className="w-full">
                    <h4>Terms</h4>
                    <textarea
                      className="bg-[#51516B] w-full resize-none p-2 rounded-md"
                      value={q.question || q.term || ""}
                      onChange={(e) => handleChange(q.id || idx, "question", e.target.value)}
                    />
                  </section>
                  <section className="w-full">
                    <h4>Definition</h4>
                    <textarea
                      className="bg-[#51516B] w-full min-h-30 resize-none p-2 rounded-md"
                      value={q.answer || q.definition || ""}
                      onChange={(e) => handleChange(q.id || idx, "answer", e.target.value)}
                    />
                  </section>
                </div>
                <button className="flex w-[50px] justify-center items-center bg-[#373749] hover:bg-red-500">
                  <LuTrash />
                </button>
              </div>
            ))}
          </>
        )}

        {/* ACRONYM TYPE */}
        {isAcronym && content?.length > 0 && (
          <>
            {content.map((item) => (
              <div
                key={item.id}
                className="flex flex-col bg-[#3F3F54] w-2xl p-10 text-white gap-6 rounded-xl"
              >
                <h3 className="text-xl font-poppinsbold">{item.title}</h3>
                <div className="flex flex-col gap-4">
                  {item.contents.map((c, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 bg-[#51516B] p-3 rounded-lg"
                    >
                      <input
                        className="w-12 h-12 text-xl font-bold text-center bg-[#373749] rounded-md"
                        value={c.letter}
                        onChange={(e) =>
                          handleAcronymChange(item.id, index, "letter", e.target.value)
                        }
                      />
                      <textarea 
                        className="flex-1 bg-[#373749] p-2 rounded-md resize-none"
                        value={c.word}
                        onChange={(e) =>
                          handleAcronymChange(item.id, index, "word", e.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>
                <section>
                  <h4 className="mb-2">Key Phrase</h4>
                  <textarea 
                    className="bg-[#51516B] w-full p-3 rounded-lg min-h-20 resize-none"
                    value={item.keyPhrase}
                    readOnly
                  />
                </section>
                <button
                  onClick={() => addLetter(item.id)}
                  className="flex self-end w-[50px] justify-center items-center bg-green-500 hover:bg-green-600 p-3 rounded-full shadow-lg"
                >
                  <LuPlus />
                </button>
              </div>
            ))}
          </>
        )}

        {!isAcronym && !isTermDef && (
          <p className="text-gray-400">Unsupported reviewer type</p>
        )}
      </div>
    </div>
  )
}

export default EditFlashCard




// 👇 Loader function


export const editFlashCardLoader = async ({ params }) => {
  const { id: folderId, reviewerId } = params;

  const getUser = () =>
    new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        if (user && user.emailVerified) {
          resolve(user);
        } else {
          reject("Unauthorized");
        }
      });
    });

  try {
    const user = await getUser();

    // Get reviewer doc
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
    if (!reviewerSnap.exists())
      throw new Response("Reviewer not found", { status: 404 });

    const reviewerData = reviewerSnap.data();

    // Check reviewer type
    const type = reviewerData.type || "flashcard"; // fallback if type missing

    if (type === "flashcard") {
      // For Q/A flashcards
      const questionsRef = collection(reviewerRef, "questions");
      const questionsSnap = await getDocs(questionsRef);
      const questions = questionsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return {
        id: reviewerId,
        title: reviewerData.title,
        type: "flashcard",
        questions,
      };
    }

    if (type === "acronym") {
      // For Acronym Mnemonics
      const contentCollectionRef = collection(reviewerRef, "content");
      const contentSnap = await getDocs(contentCollectionRef);

      const content = await Promise.all(
        contentSnap.docs.map(async (contentDoc) => {
          const contentData = contentDoc.data();
          const contentsRef = collection(contentDoc.ref, "contents");
          const contentsSnap = await getDocs(contentsRef);
          const contents = contentsSnap.docs.map((doc) => doc.data());

          return {
            id: contentDoc.id,
            title: contentData.title,
            keyPhrase: contentData.keyPhrase,
            contents,
          };
        })
      );

      return {
        id: reviewerId,
        title: reviewerData.title,
        type: "acronym",
        content,
      };
    }

    throw new Response("Unsupported reviewer type", { status: 400 });
  } catch (error) {
    console.error("Loader error:", error);
    throw new Response("Failed to load reviewer", { status: 500 });
  }
};


