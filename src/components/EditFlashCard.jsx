import React, { useState, useEffect } from 'react'
import { useLoaderData, useNavigate } from 'react-router-dom'
import { LuPencil, LuTrash, LuPlus, LuArrowLeft } from "react-icons/lu";
import { FaSave } from "react-icons/fa";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, getDocs, setDoc, deleteDoc } from "firebase/firestore";
import editLoadingScreen from "../assets/editingLoadingScreen3.png"
import LoadingBar from './LoadingBar'

const API_URL = import.meta.env.VITE_API_URL;

const EditFlashCard = () => {
  const reviewer = useLoaderData()
  const navigate = useNavigate()
  const [isCreating,setIsCreating]=useState(false)
  const [isDone,setIsDone]=useState(false)
const [fadeOut, setFadeOut] = useState(false)
  // initialize state from loader but ensure sorting / stable shapes
  const [questions, setQuestions] = useState(() => reviewer?.questions || [])
  const [content, setContent] = useState(() => reviewer?.content || [])
    // track deleted acronym letters
  const [deletedLetters, setDeletedLetters] = useState([]);
  // track deleted items (terms or acronyms)
  const [deletedItems, setDeletedItems] = useState([]);

  useEffect(() => {
    // When loader data changes, set states with proper numeric sorting
    if (!reviewer) return;

    // sort questions numerically if IDs include numbers (q1, q2, q10)
    if (reviewer.questions && Array.isArray(reviewer.questions)) {
      const sortedQuestions = [...reviewer.questions].sort((a, b) => {
        const aNum = extractNumericId(a.id)
        const bNum = extractNumericId(b.id)
        return aNum - bNum
      })
      setQuestions(sortedQuestions)
    } else {
      setQuestions(reviewer.questions || [])
    }

    // sort acronym content's inner contents by numeric id
    if (reviewer.content && Array.isArray(reviewer.content)) {
      const sortedContent = reviewer.content.map(c => {
        if (Array.isArray(c.contents)) {
          const sortedContents = [...c.contents].sort((x, y) => {
            const xn = Number(x.id) || 0
            const yn = Number(y.id) || 0
            return xn - yn
          })
          return { ...c, contents: sortedContents }
        }
        return c
      })
      setContent(sortedContent)
    } else {
      setContent(reviewer.content || [])
    }
  }, [reviewer])

  if (!reviewer) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[#2A2A3B] text-white">
        <h1 className="text-2xl font-poppinsbold">Reviewer not found</h1>
      </div>
    )
  }

  const isAcronym = reviewer.type === "acronym"
  const isTermDef = reviewer.type === "terms"

//this is the og place of the 2 red useSatte, i just put it above with the othe rhooks to remive the red lines. im really bothered.
// still the edit title doesnt work.

  // helper: extract numeric part from ids like 'q1' or '1' or 'item12'
  const extractNumericId = (id) => {
    if (!id && id !== 0) return 0
    const match = String(id).match(/\d+/g)
    if (!match) return 0
    // if multiple numbers, join them (rare) but usually first is fine
    return Number(match.join("")) || 0
  }

  //used to get next ID for question items (will produce q{n})
  const getNextQuestionId = (items) => {
    if (!items || items.length === 0) return "q1";
    // items might have ids like q1, q2, 1, etc.
    const maxIdNum = Math.max(...items.map(item => extractNumericId(item.id)));
    return `q${maxIdNum + 1}`;
  };

  // used to get next ID for acronym content inner items (numeric strings)
  const getNextContentInnerId = (contents) => {
    if (!contents || contents.length === 0) return "1";
    const maxIdNum = Math.max(...contents.map(item => Number(item.id) || 0));
    return String(maxIdNum + 1);
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

  //Generate incremental numeric ID for new items (acronym inner entries)
  const addLetter = (contentId) => {
    setContent(prev =>
      prev.map(c => {
        if (c.id !== contentId) return c;

        // find the next numeric ID
        const nextId = getNextContentInnerId(c.contents)

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
       setIsCreating(true)
    

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
      const token = await user.getIdToken();

      // Fetch existing docs to know which need distractors
      const cardRefs = questions.map(q => doc(reviewerRef, "questions", q.id));
      const snaps = await Promise.all(cardRefs.map(ref => getDoc(ref)));

      const existingById = {};
      const needingDistractors = [];

      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const snap = snaps[i];
        const data = snap.exists() ? snap.data() : null;
        existingById[q.id] = data;

        const existingDefs = data?.definition || [];
        const hasWrong = Array.isArray(existingDefs) && existingDefs.some(d => d.type === "wrong");

        // Req only if no distractors
        if (!hasWrong) {
          needingDistractors.push({
            id: q.id,
            term: q.question,
            correctDefinition: q.answer,
          });
        }
      }

      // Call backend if missing distractors
      let distractorMap = {};
      if (needingDistractors.length > 0) {
        try {
          const resp = await fetch(`${API_URL}/api/distractors`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({
              items: needingDistractors,
              count: 3,
            }),
          });

          if (resp.ok) {
            const body = await resp.json();
            distractorMap = body?.distractors || {};
          } else {
            console.error("Distractor API error:", resp.status, await resp.text());
          }
        } catch (err) {
          console.error("Failed to call distractor API:", err);
        }
      }

      // Save all cards (merge with distractors)
      for (const q of questions) {
        const existing = existingById[q.id];
        let defs = Array.isArray(existing?.definition)
          ? existing.definition.slice()
          : [];

        const correctDef = q.answer.trim();
        const hasCorrect = defs.some(d => d.type === "correct");
        if (hasCorrect) {
          defs = defs.map(d => d.type === "correct" ? { ...d, text: correctDef } : d);
        } else {
          defs.push({ text: correctDef, type: "correct" });
        }

        const aiWrongs = Array.isArray(distractorMap[q.id]) ? distractorMap[q.id] : [];
        for (const wrong of aiWrongs) {
          if (!wrong || !wrong.trim()) continue;
          const trimmed = wrong.trim();
          const exists = defs.some(d => d.text.trim() === trimmed);
          if (!exists && trimmed !== correctDef) {
            defs.push({ text: trimmed, type: "wrong" });
          }
        }

        const qRef = doc(reviewerRef, "questions", q.id);
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
      setIsDone(true)
       setIsCreating(false)

      alert("Changes saved successfully!");
    } catch (error) {
      console.error("Error saving:", error);
      alert("Failed to save changes. Check console for details.");
    }
  };

  //Add new term flashcard
  const handleAddTD = () => {
    setQuestions(prev => {
      const nextId = getNextQuestionId(prev);
      return [
        ...prev,
        { id: nextId, question: "", answer: "" }
      ];
    });
  };

   if (isCreating) {
    return (
      <div
        className={`min-h-screen flex flex-col justify-center items-center text-center p-4 transition-opacity duration-700 ${
          fadeOut ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <img src={editLoadingScreen} alt="creationLoadingScreen" className="w-70 sm:w-72 md:w-110 mb-6" />
        <p className="text-[#9898D9] font-poppinsbold text-sm sm:text-base md:text-lg mb-4">
          {isDone ? "Editing Complete!" : "Revio is editing your reviewer, please wait..."}
        </p>
        <LoadingBar isDone={isDone} />
      </div>
    )
  }

  //Add new acronym flashcard
  const handleAddAC = () => {
    setContent(prev => {
      const newId = (() => {
        // attempt to find numeric postfix if existing content ids are q{n} or numeric
        if (!prev || prev.length === 0) return "q1";
        // find numeric portion of each content id and take max
        const maxNum = Math.max(...prev.map(p => extractNumericId(p.id)));
        // keep same id style as existing (if they used 'q' prefix or plain numeric)
        // If content ids look like "q1" keep 'q' prefix; otherwise use numeric string
        const useQPrefix = prev.some(p => /^q\d+$/i.test(String(p.id)));
        return useQPrefix ? `q${maxNum + 1}` : String(maxNum + 1);
      })();

      return [
        ...prev,
        { id: newId, title: "", keyPhrase: "", contents: [{ id: "1", letter: "", word: ""}] }
      ];
    });
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
            {/* inner-scroll area for the list of term flashcards */}
            <div className="w-full max-w-4xl overflow-auto max-h-[60vh] space-y-6">
              {questions.map((q, idx) => (
                <div
                  key={q.id || idx}
                  className="flex items-stretch bg-[#3F3F54] w-full pl-10 pr-0 gap-10 text-white rounded-xl"
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
            </div>

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

            {/* inner-scroll area for acronym cards */}
            <div className="w-full max-w-4xl overflow-auto max-h-[70vh] space-y-6">
              {content.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col bg-[#3F3F54] w-full p-10 text-white gap-6 rounded-xl"
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
            </div>

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

      // sort questions numerically before returning so UI receives ordered q1,q2,...
      const sortedQuestions = questions.sort((a, b) => {
        const aNum = Number(String(a.id).match(/\d+/)?.[0] || 0);
        const bNum = Number(String(b.id).match(/\d+/)?.[0] || 0);
        return aNum - bNum;
      });

      return {
        id: reviewerId,
        title: reviewerData.title,
        type: "terms",
        questions: sortedQuestions,
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
