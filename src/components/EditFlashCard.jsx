// EditFlashCard.jsx
import React, { useState } from 'react'
import { useLoaderData, useNavigate } from 'react-router-dom'
import { LuPencil, LuTrash, LuPlus, LuArrowLeft } from "react-icons/lu";
import { FaSave } from "react-icons/fa";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, getDocs, setDoc, deleteDoc } from "firebase/firestore";

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

  // track deleted acronym letters
  const [deletedLetters, setDeletedLetters] = useState([]);
  // track deleted items (terms or acronyms)
  const [deletedItems, setDeletedItems] = useState([]);

  //used to get next ID based on the highest id stored
  const getNextId = (items) => {
    if (items.length === 0) return "q1";
    const maxIdNum = Math.max(...items.map(item => Number(item.id.replace("q", ""))));
    return `q${maxIdNum + 1}`;
  };

  const handleChange = (id, field, value) => {
    setQuestions(prev =>
      prev.map(q => q.id === id ? { ...q, [field]: value } : q)
    )
  }

  const handleAcronymChange = (contentId, index, field, value) => {
    setContent(prev =>
      prev.map(c => {
        if (c.id !== contentId) return c;
        if (index === null) {
          //return top-level fields like title and keyPhrase
          return { ...c, [field]: value };
        }
        return {
          ...c,
          contents: c.contents.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
          )
        };
      })
    );
  };

  //Generate incremental numeric ID for new items
  const addLetter = (contentId) => {
    setContent(prev =>
      prev.map(c => {
        if (c.id !== contentId) return c;

        // find the next numeric ID
        const nextId = c.contents.length > 0
          ? (Math.max(...c.contents.map(item => Number(item.id) || 0)) + 1).toString()
          : "1";

        return {
          ...c,
          contents: [
            ...c.contents,
            { id: nextId, letter: "", word: "" }
          ]
        };
      })
    );
  };

  //to delete letters/word in acronym (only local)
  const handleDeleteLetter = (contentId, letterId) => {
    // track for deletion on save
    setDeletedLetters(prev => [...prev, { contentId, letterId }]);

    // update local state
    setContent(prev =>
      prev.map(c =>
        c.id === contentId
          ? { ...c, contents: c.contents.filter(item => item.id !== letterId) }
          : c
      )
    );
  };

  //to delete the flashcard items (only local)
  const handleDeleteItem = (id, type) => {
    if (!window.confirm(`Are you sure you want to delete this ${type === "terms" ? "term" : "acronym"}?`)) {
      return;
    }

    // track for deletion on save
    setDeletedItems(prev => [...prev, { id, type }]);

    // update UI state locally
    if (type === "terms") {
      setQuestions(prev => prev.filter(q => q.id !== id));
    } else {
      setContent(prev => prev.filter(c => c.id !== id));
    }
  };

  //Save edited items to Firestore
  const handleSave = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        alert("Not logged in");
        return;
      }

      //Validate acronym cards
      if (isAcronym) {
        for (const c of content) {
          for (const item of c.contents) {
            if (!c.title || !c.title.trim()) {
              alert("Each acronym flashcard must have a TITLE before saving.");
              return;
            }
            if (!item.letter.trim() || !item.word.trim()) {
              alert("Each acronym entry must have both a LETTER and a WORD before saving.");
              return;
            }
          }
        }
      }

      //Validate term/definition cards
      if (isTermDef) {
        for (const q of questions) {
          if (!q.question.trim() || !q.answer.trim()) {
            alert("Each flashcard must have both a TERM and a DEFINITION before saving.");
            return;
          }
        }
      }

      const reviewerRef = doc(
        db,
        "users",
        user.uid,
        "folders",
        reviewer.folderId,
        "reviewers",
        reviewer.id
      );

      // Delete removed items in Firestore
      for (const d of deletedItems) {
        const collectionName = d.type === "terms" ? "questions" : "content";
        const itemRef = doc(reviewerRef, collectionName, d.id);
        await deleteDoc(itemRef);
      }
      setDeletedItems([]); // clear deleted items after save

      //Delete removed acronym letters in Firestore
      for (const d of deletedLetters) {
        const contentRef = doc(reviewerRef, "content", d.contentId);
        const letterRef = doc(contentRef, "contents", d.letterId);
        await deleteDoc(letterRef);
      }
      setDeletedLetters([]); //clear deleted letters

      // Save term/definition questions
      if (isTermDef) {
        for (const q of questions) {
          const qRef = doc(reviewerRef, "questions", q.id);

          const existingSnap = await getDoc(qRef);
          const existingData = existingSnap.exists() ? existingSnap.data() : null;

          //edit only the 'correct' one.
          let defs = [];
          if (existingData && Array.isArray(existingData.definition)) {
            defs = existingData.definition.slice();
          } else if (existingData && existingData.definition && typeof existingData.definition === "object") {
            defs = [existingData.definition];
          } else {
            defs = [];
          }

          let foundCorrect = false;
          defs = defs.map(d => {
            if (d && d.type === "correct") {
              foundCorrect = true;
              return { ...d, text: q.answer };
            }
            return d;
          });

          // add If there was no 'correct' definition previously
          if (!foundCorrect) {
            defs.unshift({ text: q.answer, type: "correct" });
          }

          // --- AI INSERTION POINT:
          // At this location you can call your AI function to generate wrong choices for the term.
          // Make sure any AI-generated wrong choices are appended/preserved as objects with `text` and `type: "wrong"`.
          // Merge update so other top-level fields are preserved; we're intentionally updating the 'definition' array only.

          await setDoc(qRef, {
            term: q.question,
            definition: defs,
          }, { merge: true });
        }
      }

      // Save acronym content
      if (isAcronym) {
        for (const c of content) {
          const contentRef = doc(reviewerRef, "content", c.id);
          await setDoc(contentRef, {
            title: c.title,
            keyPhrase: c.keyPhrase,
          }, { merge: true });
          for (const item of c.contents) {
            const itemRef = doc(contentRef, "contents", String(item.id));
            await setDoc(itemRef, {
              letter: item.letter,
              word: item.word,
            }, { merge: true });
          }
        }
      }

      alert("Changes saved successfully!");
    } catch (error) {
      console.error("Error saving:", error);
      alert("Failed to save changes. Check console for details.");
    }
  };

  //Add new term flashcard
  const handleAddTD = () => {
    setQuestions(prev => [
      ...prev,
      { id: getNextId(prev), question: "", answer: "" }
    ]);
  };

  //Add new acronym flashcard
  const handleAddAC = () => {
    setContent(prev => [
      ...prev,
      { id: getNextId(prev), title: "", keyPhrase: "", contents: [{ id: "1", letter: "", word: ""}] }
    ]);
  };

  return (
    <div>
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

        <button
          onClick={handleSave}
          className="font-poppinsbold text-[#200448] bg-[#B5B5FF] text-lg flex gap-1 p-5 rounded-2xl place-self-end"
        >
          <FaSave size={25} />
          Save
        </button>
      </div>

      <div className="flex flex-col gap-10 p-10 w-full place-items-center">
        {isTermDef && (
          <>
            {questions.length === 0 && <p className="text-gray-400">No questions yet.</p>}
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
                      value={q.question || ""}
                      onChange={(e) => handleChange(q.id, "question", e.target.value)}
                    />
                  </section>
                  <section className="w-full">
                    <h4>Definition</h4>
                    <textarea
                      className="bg-[#51516B] w-full min-h-30 resize-none p-2 rounded-md"
                      value={q.answer || ""}
                      onChange={(e) => handleChange(q.id, "answer", e.target.value)}
                    />
                  </section>
                </div>
                <button 
                  className="flex w-[50px] justify-center items-center bg-[#373749] hover:bg-red-500"
                  onClick={() => handleDeleteItem(q.id, "terms")}>
                  <LuTrash />
                </button>
              </div>
            ))}
            <button
              onClick={handleAddTD}
              className="w-full max-w-xl bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl"
            >
              Add Flashcard
            </button>
          </>
        )}

        {isAcronym && (
          <>
            {content.length === 0 && <p className="text-gray-400">No acronym content yet.</p>}
            {content.map((item) => (
              <div
                key={item.id}
                className="flex flex-col bg-[#3F3F54] w-2xl p-10 text-white gap-6 rounded-xl"
              >
                <input type="text" placeholder="Enter title" className="bg-[#51516B] w-full p-3 rounded-lg text-white font-poppinsbold text-xl" value={item.title ?? ""} 
                onChange={(e) => handleAcronymChange(item.id, null, "title", e.target.value)}/>
                
                <div className="flex flex-col gap-4">
                  {item.contents.map((c, index) => (
                    <div
                      key={c.id || index}
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
                      <button
                        onClick={() => handleDeleteLetter(item.id, c.id)}
                        className="flex w-[40px] h-[40px] justify-center items-center bg-[#373749] hover:bg-red-500 rounded-md"
                      >
                        <LuTrash />
                      </button>
                    </div>
                  ))}
                </div>
    
                <div className="flex justify-center">
                  <button
                    onClick={() => addLetter(item.id)}
                    className="w-[40px] h-[40px] flex justify-center items-center 
                              bg-[#373749] hover:bg-green-500 
                              rounded-full shadow-md transition-colors"
                  >
                    <LuPlus size={24} />
                  </button>
                </div>

                <section>
                  <h4 className="mb-2">Key Phrase</h4>
                  <textarea
                    className="bg-[#51516B] w-full p-3 rounded-lg min-h-20 resize-none text-white"
                    value={item.keyPhrase ?? ""}
                    onChange={(e) =>
                      setContent(prev =>
                        prev.map(c =>
                          c.id === item.id
                            ? { ...c, keyPhrase: e.target.value }
                            : c
                        )
                      )
                    }
                  />
                </section>

                <button
                  onClick={() => handleDeleteItem(item.id, "acronym")}
                  className="flex self-end w-[50px] justify-center items-center bg-red-500 hover:bg-red-700 p-3 rounded-full shadow-lg"
                >
                  <LuTrash />
                </button>
              </div>
            ))}
            <button
              onClick={handleAddAC}
              className="w-full max-w-xl bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl"
            >
              Add Flashcard
            </button>
          </>
        )}
      </div>
    </div>
  )
}


export default EditFlashCard;

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

        let answer = "";
        if (Array.isArray(data.definition)) {
          const correct = data.definition.find(d => d && d.type === "correct") || data.definition[0];
          answer = correct?.text ?? "";
        } else if (data.definition && typeof data.definition === "object") {
          // single map stored as definition
          answer = data.definition.text ?? "";
        } else if (typeof data.definition === "string") {
          answer = data.definition;
        }

        return {
          id: doc.id,
          question: data.term || "",
          answer,
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
