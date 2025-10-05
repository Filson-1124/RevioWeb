// EditFlashCard.jsx
import React, { useState } from 'react'
import { useLoaderData, useNavigate } from 'react-router-dom'
import { LuPencil, LuTrash, LuPlus, LuArrowLeft } from "react-icons/lu";
import { FaSave } from "react-icons/fa";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, getDocs, setDoc, deleteDoc } from "firebase/firestore";

/*
JM

-Need ng loading screen pag pinindot yung SAVE kase medj matagal since uupdate sa firestore
-Yung every flashcard diba naka id sya as q1,q2,q3,... si firebase kase auto sort nya yung mga id kaya pag may q10,q11.
  kay firestor ganto sya, q1,q10,q11,q2 kaya imbes na sa dulo yung mga inadd, mapupunta sa gitna.
  suggest ko dito, sa backend ni maria, if pwede mag add ng NUMERIC id field per flashcards. 
  sabi ni bff baka dahil stored as strings daw mga id natin which is tama (q1,q2,...)

update

- fixed save button with input validation
- TD delete button working
- added UI for delete sa acronym. (palitan nalang if pangit HAHA)
- added add flashcards. eto yung may probs sa rendering dahil sa id
- modify title sa acro

NOTE: aayusin kopa buong file nato, masyadong mahaba
*/

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
  const isTermDef = reviewer.type === "terms"

  const [deletedLetters, setDeletedLetters] = useState([])

  // used to get next ID based on the highest id stored
  const getNextId = (items) => {
    if (items.length === 0) return "q1"
    const maxIdNum = Math.max(...items.map(item => Number(item.id.replace("q", ""))))
    return `q${maxIdNum + 1}`
  }

  const handleChange = (id, field, value) => {
    setQuestions(prev =>
      prev.map(q => q.id === id ? { ...q, [field]: value } : q)
    )
  }

  const handleAcronymChange = (contentId, index, field, value) => {
    setContent(prev =>
      prev.map(c => {
        if (c.id !== contentId) return c
        if (index === null) {
          return { ...c, [field]: value }
        }
        return {
          ...c,
          contents: c.contents.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
          )
        }
      })
    )
  }

  // Generate incremental numeric ID for new items
  const addLetter = (contentId) => {
    setContent(prev =>
      prev.map(c => {
        if (c.id !== contentId) return c
        const nextId = c.contents.length > 0
          ? (Math.max(...c.contents.map(item => Number(item.id) || 0)) + 1).toString()
          : "1"
        return {
          ...c,
          contents: [
            ...c.contents,
            { id: nextId, letter: "", word: "" }
          ]
        }
      })
    )
  }

  // to delete letters/word in acro
  const handleDeleteLetter = (contentId, letterId) => {
    setDeletedLetters(prev => [...prev, { contentId, letterId }])
    setContent(prev =>
      prev.map(c =>
        c.id === contentId
          ? { ...c, contents: c.contents.filter(item => item.id !== letterId) }
          : c
      )
    )
  }

  // Save edited items to Firestore
  const handleSave = async () => {
    try {
      const user = auth.currentUser
      if (!user) {
        alert("Not logged in")
        return
      }

      if (isAcronym) {
        for (const c of content) {
          for (const item of c.contents) {
            if (!c.title || !c.title.trim()) {
              alert("Each acronym flashcard must have a TITLE before saving.")
              return
            }
            if (!item.letter.trim() || !item.word.trim()) {
              alert("Each acronym entry must have both a LETTER and a WORD before saving.")
              return
            }
          }

          const contentRef = doc(
            db, "users", user.uid,
            "folders", reviewer.folderId,
            "reviewers", reviewer.id,
            "content", c.id
          )

          await setDoc(contentRef, {
            title: c.title,
            keyPhrase: c.keyPhrase,
          })

          for (const d of deletedLetters.filter(dl => dl.contentId === c.id)) {
            const letterRef = doc(contentRef, "contents", d.letterId)
            await deleteDoc(letterRef)
          }

          for (const item of c.contents) {
            const itemRef = doc(contentRef, "contents", String(item.id))
            await setDoc(itemRef, {
              letter: item.letter,
              word: item.word,
            })
          }
        }
        setDeletedLetters([])
      }

      if (isTermDef) {
        for (const q of questions) {
          if (!q.question.trim() || !q.answer.trim()) {
            alert("Each flashcard must have both a TERM and a DEFINITION before saving.")
            return
          }
        }
      }

      alert("Changes saved successfully!")
    } catch (error) {
      console.error("Error saving:", error)
      alert("Failed to save changes. Check console for details.")
    }
  }

  // Add new term flashcard
  const handleAddTD = () => {
    setQuestions(prev => [...prev, { id: getNextId(prev), question: "", answer: "" }])
  }

  // Add new acronym flashcard
  const handleAddAC = () => {
    setContent(prev => [
      ...prev,
      { id: getNextId(prev), title: "", keyPhrase: "", contents: [{ id: "1", letter: "", word: "" }] }
    ])
  }

  // to delete the flashcard items
  const handleDeleteItem = async (id, type) => {
    if (!window.confirm(`Are you sure you want to delete this ${type === "terms" ? "term" : "acronym"}?`)) return
    try {
      const user = auth.currentUser
      if (!user) {
        alert("Not logged in")
        return
      }
      if (type === "terms") {
        setQuestions(prev => prev.filter(q => q.id !== id))
      } else {
        setContent(prev => prev.filter(c => c.id !== id))
      }
      alert("Deleted Successfully!")
    } catch (error) {
      console.error(`Error deleting ${type}:`, error)
    }
  }

  return (
    <div className="bg-[#2A2A3B] min-h-screen overflow-y-auto">
    
      {/* Header */}
<div className="w-full p-6 sm:p-8 md:p-10 flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#2A2A3B] sticky top-0 z-50">
  <button
    onClick={() => navigate(-1)}
    className="flex items-center gap-2 text-white bg-[#3F3F54] hover:bg-[#51516B] px-4 py-2 sm:px-5 sm:py-3 rounded-xl text-sm sm:text-base"
  >
    <LuArrowLeft size={18} /> Back
  </button>

  <div className="flex items-center gap-3 justify-center text-center">
    <h1 className="text-white font-poppinsbold text-2xl sm:text-3xl md:text-4xl">{reviewer.title}</h1>
    <LuPencil color="white" size={22} className="mt-1" />
  </div>

  <button
    onClick={handleSave}
    className="font-poppinsbold text-[#200448] bg-[#B5B5FF] text-sm sm:text-lg flex gap-2 items-center justify-center px-4 sm:px-6 py-2 sm:py-3 rounded-2xl"
  >
    <FaSave size={20} /> Save
  </button>
</div>


      {/* Flashcards */}
      <div className="flex flex-col gap-10 px-4 sm:px-6 md:px-10 pb-10 w-full place-items-center">
        {isTermDef && (
          <>
            {questions.map((q, idx) => (
              <div
                key={q.id || idx}
                className="flex flex-col md:flex-row items-stretch bg-[#3F3F54] w-full sm:w-[90%] lg:w-[75%] xl:w-[65%] overflow-hidden rounded-xl shadow-md"
              >
                <div className="flex flex-col w-full gap-6 p-6 text-white overflow-y-auto max-h-[65vh]">
                  <section>
                    <h4 className="font-semibold mb-1">Term</h4>
                    <textarea
                      className="bg-[#51516B] w-full resize-none p-3 rounded-md min-h-[80px]"
                      value={q.question || ""}
                      onChange={(e) => handleChange(q.id, "question", e.target.value)}
                    />
                  </section>
                  <section>
                    <h4 className="font-semibold mb-1">Definition</h4>
                    <textarea
                      className="bg-[#51516B] w-full resize-none p-3 rounded-md min-h-[100px]"
                      value={q.answer || ""}
                      onChange={(e) => handleChange(q.id, "answer", e.target.value)}
                    />
                  </section>
                </div>
                <button
                  className="flex md:w-[60px] w-full justify-center items-center bg-[#373749] hover:bg-red-500 p-3 md:p-0"
                  onClick={() => handleDeleteItem(q.id, "terms")}
                >
                  <LuTrash />
                </button>
              </div>
            ))}
            {questions.length > 0 && (
              <button
                onClick={handleAddTD}
                className="w-full sm:w-[80%] lg:w-[60%] bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl"
              >
                Add Flashcard
              </button>
            )}
          </>
        )}

        {isAcronym && (
          <>
            {content.map((item) => (
              <div
                key={item.id}
                className="flex flex-col bg-[#3F3F54] w-full sm:w-[90%] lg:w-[75%] xl:w-[65%] p-6 sm:p-8 text-white gap-6 rounded-xl shadow-md overflow-y-auto max-h-[100vh]"
              >
                <input
                  type="text"
                  placeholder="Enter title"
                  className="bg-[#51516B] w-full p-3 rounded-lg text-white font-poppinsbold text-lg sm:text-xl"
                  value={item.title ?? ""}
                  onChange={(e) => handleAcronymChange(item.id, null, "title", e.target.value)}
                />

                <div className="flex flex-col gap-4 overflow-y-auto">
                  {item.contents.map((c, index) => (
                    <div
                      key={c.id || index}
                      className="flex items-center gap-3 bg-[#51516B] p-3 rounded-lg"
                    >
                      <input
                        className="w-12 h-12 text-xl font-bold text-center bg-[#373749] rounded-md"
                        value={c.letter}
                        onChange={(e) => handleAcronymChange(item.id, index, "letter", e.target.value)}
                      />
                      <textarea
                        className="flex-1 bg-[#373749] p-2 rounded-md resize-none min-h-[60px]"
                        value={c.word}
                        onChange={(e) => handleAcronymChange(item.id, index, "word", e.target.value)}
                      />
                      <button
                        onClick={() => handleDeleteLetter(item.id, c.id)}
                        className="flex justify-center items-center bg-[#373749] hover:bg-red-500 rounded-md w-[40px] h-[40px]"
                      >
                        <LuTrash />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={() => addLetter(item.id)}
                    className="w-[45px] h-[45px] flex justify-center items-center bg-[#373749] hover:bg-green-500 rounded-full shadow-md transition-colors"
                  >
                    <LuPlus size={22} />
                  </button>
                </div>

                <section>
                  <h4 className="mb-2 font-semibold">Key Phrase</h4>
                  <textarea
                    className="bg-[#51516B] w-full p-3 rounded-lg min-h-[100px] resize-none text-white"
                    value={item.keyPhrase ?? ""}
                    onChange={(e) =>
                      setContent(prev =>
                        prev.map(c =>
                          c.id === item.id ? { ...c, keyPhrase: e.target.value } : c
                        )
                      )
                    }
                  />
                </section>

                <button
                  onClick={() => handleDeleteItem(item.id, "acronym")}
                  className="flex self-end w-[45px] h-[45px] justify-center items-center bg-red-500 hover:bg-red-700 rounded-full shadow-lg"
                >
                  <LuTrash />
                </button>
              </div>
            ))}
            {content.length > 0 && (
              <button
                onClick={handleAddAC}
                className="w-full sm:w-[80%] lg:w-[60%] bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl"
              >
                Add Flashcard
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default EditFlashCard


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

    //Detect type by folderId
    let type = "flashcard";
    if (folderId === "AcronymMnemonics") type = "acronym";
    else if (folderId === "TermsAndCondition") type = "terms";

    if (type === "terms") {
      const questionsRef = collection(reviewerRef, "questions");
      const questionsSnap = await getDocs(questionsRef);
      const questions = questionsSnap.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          question: data.term || "",
          answer: data.definition || "",
        };
      });

      return {
        id: reviewerId,
        title: reviewerData.title,
        type: "terms",
        questions,
        folderId,
      };
    }

    if (type === "acronym") {
      const contentCollectionRef = collection(reviewerRef, "content");
      const contentSnap = await getDocs(contentCollectionRef);

      const content = await Promise.all(
        contentSnap.docs.map(async (contentDoc) => {
          const contentData = contentDoc.data();
          const contentsRef = collection(contentDoc.ref, "contents");
          const contentsSnap = await getDocs(contentsRef);
          let contents = contentsSnap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }));

          //Sort by numeric ID
          contents = contents.sort((a, b) => Number(a.id) - Number(b.id));

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
        folderId,
      };
    }

    throw new Response("Unsupported reviewer type", { status: 400 });
  } catch (error) {
    console.error("Loader error:", error);
    throw new Response("Failed to load reviewer", { status: 500 });
  }
};
