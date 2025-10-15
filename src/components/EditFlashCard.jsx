import React, { useState, useEffect } from 'react'
import { useLoaderData, useNavigate } from 'react-router-dom'
import { LuPencil, LuTrash, LuPlus, LuArrowLeft } from "react-icons/lu";
import { FaSave } from "react-icons/fa";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, getDocs, setDoc, deleteDoc, updateDoc } from "firebase/firestore";
import editLoadingScreen from "../assets/editingLoadingScreen3.png"
import LoadingBar from './LoadingBar'

const API_URL = import.meta.env.VITE_API_URL;

const EditFlashCard = () => {
  const reviewer = useLoaderData()
  const navigate = useNavigate()

  const [isCreating, setIsCreating] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)

  // editable title state
  const [title, setTitle] = useState(reviewer?.title || "")

  // initialize state from loader
  const [questions, setQuestions] = useState(() => reviewer?.questions || [])
  const [content, setContent] = useState(() => reviewer?.content || [])

  // track deleted acronym letters & items
  const [deletedLetters, setDeletedLetters] = useState([]);
  const [deletedItems, setDeletedItems] = useState([]);

  useEffect(() => {
    if (reviewer?.title) setTitle(reviewer.title)
  }, [reviewer])

  const isAcronym = reviewer.type === "acronym"
  const isTermDef = reviewer.type === "terms"

  const extractNumericId = (id) => {
    if (!id && id !== 0) return 0
    const match = String(id).match(/\d+/g)
    return match ? Number(match.join("")) : 0
  }

  const getNextQuestionId = (items) => {
    if (!items || items.length === 0) return "q1"
    const maxIdNum = Math.max(...items.map(item => extractNumericId(item.id)))
    return `q${maxIdNum + 1}`
  }

  const getNextContentInnerId = (contents) => {
    if (!contents || contents.length === 0) return "1"
    const maxIdNum = Math.max(...contents.map(item => Number(item.id) || 0))
    return String(maxIdNum + 1)
  }

  const handleChange = (id, field, value) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, [field]: value } : q))
  }

  const handleAcronymChange = (contentId, index, field, value) => {
    setContent(prev =>
      prev.map(c => {
        if (c.id !== contentId) return c
        if (index === null) return { ...c, [field]: value }
        return {
          ...c,
          contents: c.contents.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
          )
        }
      })
    )
  }

  const addLetter = (contentId) => {
    setContent(prev =>
      prev.map(c => {
        if (c.id !== contentId) return c
        const nextId = getNextContentInnerId(c.contents)
        return { ...c, contents: [...c.contents, { id: nextId, letter: "", word: "" }] }
      })
    )
  }

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

  const handleDeleteItem = (id, type) => {
    if (!window.confirm(`Delete this ${type === "terms" ? "term" : "acronym"}?`)) return
    setDeletedItems(prev => [...prev, { id, type }])
    if (type === "terms") setQuestions(prev => prev.filter(q => q.id !== id))
    else setContent(prev => prev.filter(c => c.id !== id))
  }

  const handleSave = async () => {
    try {
      const user = auth.currentUser
      if (!user) {
        alert("Not logged in")
        return
      }

      setIsCreating(true)
      setIsDone(false)

      const reviewerRef = doc(
        db,
        "users",
        user.uid,
        "folders",
        reviewer.folderId,
        "reviewers",
        reviewer.id
      )

      // ✅ Save title
      await updateDoc(reviewerRef, { title })

      // Delete removed items
      for (const d of deletedItems) {
        const collectionName = d.type === "terms" ? "questions" : "content"
        const itemRef = doc(reviewerRef, collectionName, d.id)
        await deleteDoc(itemRef)
      }

      for (const d of deletedLetters) {
        const contentRef = doc(reviewerRef, "content", d.contentId)
        const letterRef = doc(contentRef, "contents", d.letterId)
        await deleteDoc(letterRef)
      }

      // Save term/definition questions
      if (isTermDef) {
        for (const q of questions) {
          const qRef = doc(reviewerRef, "questions", q.id)
          await setDoc(qRef, {
            term: q.question,
            definition: [{ text: q.answer, type: "correct" }]
          }, { merge: true })
        }
      }

      // Save acronym content
      if (isAcronym) {
        for (const c of content) {
          const contentRef = doc(reviewerRef, "content", c.id)
          await setDoc(contentRef, {
            title: c.title,
            keyPhrase: c.keyPhrase,
          }, { merge: true })
          for (const item of c.contents) {
            const itemRef = doc(contentRef, "contents", String(item.id))
            await setDoc(itemRef, {
              letter: item.letter,
              word: item.word,
            }, { merge: true })
          }
        }
      }

      //Finish loading
      setIsDone(true)
      setTimeout(() => {
        setIsCreating(false)
        setIsDone(false)

        // ✅ Navigate correctly based on reviewer type
        if (isAcronym) {
          navigate(`/Main/review/acronym/${reviewer.folderId}/${reviewer.id}`)
        } else if (isTermDef) {
          navigate(`/Main/review/terms/${reviewer.folderId}/${reviewer.id}`)
        } else {
          // fallback route if type is neither
          navigate(`/review/${reviewer.folderId}/${reviewer.id}`)
        }

      }, 800)

    } catch (error) {
      console.error("Error saving:", error)
      setIsCreating(false)
      setIsDone(false)
      alert("Failed to save changes. Check console for details.")
    }
  }

  const handleAddTD = () => {
    setQuestions(prev => {
      const nextId = getNextQuestionId(prev)
      return [...prev, { id: nextId, question: "", answer: "" }]
    })
  }

  const handleAddAC = () => {
    setContent(prev => {
      const maxNum = prev.length ? Math.max(...prev.map(p => extractNumericId(p.id))) : 0
      const newId = `q${maxNum + 1}`
      return [
        ...prev,
        { id: newId, title: "", keyPhrase: "", contents: [{ id: "1", letter: "", word: "" }] }
      ]
    })
  }

  if (isCreating) {
    return (
      <div className={`min-h-screen flex flex-col justify-center items-center text-center p-4 transition-opacity duration-700 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
        <img src={editLoadingScreen} alt="creationLoadingScreen" className="w-70 sm:w-72 md:w-110 mb-6" />
        <p className="text-[#9898D9] font-poppinsbold text-sm sm:text-base md:text-lg mb-4">
          {isDone ? "Editing Complete!" : "Revio is editing your reviewer, please wait..."}
        </p>
        <LoadingBar isDone={isDone} />
      </div>
    )
  }

  return (
    <div>
      <div className="w-full p-5 md:p-10 flex flex-col md:flex-row justify-between gap-10 items-start md:items-center relative">
        <button
          onClick={() => navigate(-1)}
          className="static md:absolute left-5 flex items-center gap-2 text-white bg-[#3F3F54] hover:bg-[#51516B] p-3 rounded-xl"
        >
          <LuArrowLeft size={20} />
          Back
        </button>

        {/* Editable title */}
        <div className="w-full flex gap-[1.5rem] justify-center items-center">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className=" w-[70%] text-white font-poppinsbold text-xl md:text-2xl bg-transparent border-b-2 border-[#9898D9] focus:outline-none text-center"
          />
          <LuPencil color="white" size={28} />
        </div>

        <button
          onClick={handleSave}
          className="w-full place-content-center md:w-auto font-poppinsbold text-white bg-[#6ada6dff] text-lg flex gap-1 p-5 rounded-2xl place-self-start md:place-self-end"
        >
          <FaSave size={25} />
          Save
        </button>
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
