import React, { useState, useEffect } from 'react'
import { useLoaderData, useNavigate } from 'react-router-dom'
import { LuPencil, LuTrash, LuPlus, LuArrowLeft } from "react-icons/lu";
import { FaSave } from "react-icons/fa";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, getDocs, setDoc, deleteDoc, updateDoc } from "firebase/firestore";
import editLoadingScreen from "../assets/editingLoadingScreen3.png"
import LoadingBar from './LoadingBar'
import { useParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const EditFlashCard = () => {
  const reviewer = useLoaderData()
  const navigate = useNavigate()
  const { id: folderId, reviewerId } = useParams();

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

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (reviewer?.title) setTitle(reviewer.title)
  }, [reviewer])

  const isAcronym = reviewer.type === "acronym"
  const isTermDef = reviewer.type === "terms"

  //extract numeric part from ids 
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
    setDeleteTarget({ id, type })
    setIsDeleting(true)
  }

  const confirmDelete = () => {
    if (!deleteTarget) return

    const { id, type } = deleteTarget
    setDeletedItems(prev => [...prev, { id, type }])

    if (type === "terms") {
      setQuestions(prev => prev.filter(q => q.id !== id))
    } else {
      setContent(prev => prev.filter(c => c.id !== id))
    }

    setIsDeleting(false)
    setDeleteTarget(null)
  }

  const handleSave = async () => {
    try {
      const user = auth.currentUser
      if (!user) {
        alert("Not logged in")
        return
      }

      //validation
      if (isAcronym) {
        for (const c of content) {
          if (!c.title || !c.title.trim()) {
            alert("Each acronym flashcard must have a TITLE before saving.")
            return
          }
          for (const item of c.contents) {
            if (!item.letter.trim() || !item.word.trim()) {
              alert("Each acronym entry must have both a LETTER and a WORD before saving.")
              return
            }
          }
        }
      }

      if (isTermDef) {
        for (const q of questions) {
          if (!q.question.trim() || !q.answer.trim()) {
            alert("Each flashcard must have both a TERM and a DEFINITION before saving.")
            return
          }
        }
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

      // Update editable title
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

      // Save term/definition questions with distractors
      if (isTermDef) {
        const token = await user.getIdToken()

        const cardRefs = questions.map(q => doc(reviewerRef, "questions", q.id))
        const snaps = await Promise.all(cardRefs.map(ref => getDoc(ref)))

        const existingById = {}
        const needingDistractors = []

        for (let i = 0; i < questions.length; i++) {
          const q = questions[i]
          const snap = snaps[i]
          const data = snap.exists() ? snap.data() : null
          existingById[q.id] = data

          const existingDefs = data?.definition || []
          const hasWrong = Array.isArray(existingDefs) && existingDefs.some(d => d.type === "wrong")

          if (!hasWrong) {
            needingDistractors.push({
              id: q.id,
              term: q.question,
              correctDefinition: q.answer,
            })
          }
        }

        let distractorMap = {}
        if (needingDistractors.length > 0) {
          try {
            const resp = await fetch(`${API_URL}/api/distractors`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
              },
              body: JSON.stringify({ items: needingDistractors, count: 3 }),
            })

            if (resp.ok) {
              const body = await resp.json()
              distractorMap = body?.distractors || {}
            } else {
              console.error("Distractor API error:", resp.status, await resp.text())
            }
          } catch (err) {
            console.error("Failed to call distractor API:", err)
          }
        }

        for (const q of questions) {
          const existing = existingById[q.id]
          let defs = Array.isArray(existing?.definition)
            ? existing.definition.slice()
            : []

          const correctDef = q.answer.trim()
          const hasCorrect = defs.some(d => d.type === "correct")
          if (hasCorrect) {
            defs = defs.map(d => d.type === "correct" ? { ...d, text: correctDef } : d)
          } else {
            defs.push({ text: correctDef, type: "correct" })
          }

          const aiWrongs = Array.isArray(distractorMap[q.id]) ? distractorMap[q.id] : []
          for (const wrong of aiWrongs) {
            if (!wrong || !wrong.trim()) continue
            const trimmed = wrong.trim()
            const exists = defs.some(d => d.text.trim() === trimmed)
            if (!exists && trimmed !== correctDef) {
              defs.push({ text: trimmed, type: "wrong" })
            }
          }

          const qRef = doc(reviewerRef, "questions", q.id)
          await setDoc(qRef, { term: q.question, definition: defs }, { merge: true })
        }
      }

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

      setIsDone(true)
      setTimeout(() => {
        setFadeOut(true)
        setTimeout(() => {
          setIsCreating(false)
          setFadeOut(false)
        }, 1000)
      }, 2000)

      alert("Changes saved successfully!")
    } catch (error) {
      console.error("Error saving:", error)
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
      return [...prev, { id: newId, title: "", keyPhrase: "", contents: [{ id: "1", letter: "", word: "" }] }]
    })
  }

  if (isCreating) {
    return (
      <div className={` fixed inset-0 z-[9999] min-h-screen flex flex-col justify-center items-center text-center p-4 transition-opacity duration-700 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
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
           onClick={() => navigate(`/Main/Library/${folderId}/${reviewerId}`)}
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

      {/* === FLASHCARD AREA === */}
      <div className="flex flex-col pb-20 gap-10 p-3 md:p-5 w-full place-items-center">
        {isTermDef && (
          <>
            {questions.length === 0 && <p className="text-gray-400">No questions yet.</p>}
            <div className="w-full max-w-4xl overflow-auto max-h-[50vh] md:max-h-[65vh] space-y-6">
              {questions.map((q) => ( 
                <div key={q.id} className="relative flex flex-col md:flex-row items-stretch bg-[#3F3F54] w-full p-4 md:pl-10 md:p-0 gap-3 text-white rounded-xl">
                  <button
                    className="absolute top-3 right-3 w-[55px] h-[55px] flex justify-center items-center bg-[#373749] rounded-xl hover:bg-red-500 active:bg-red-600 transition-all md:hidden"
                    onClick={() => handleDeleteItem(q.id, 'terms')}
                  >
                    <LuTrash />
                  </button>

                  <div className="flex flex-col w-full gap-10 my-10">
                    <section>
                      <h4>Term</h4>
                      <textarea
                        className="bg-[#51516B] w-full resize-none p-2 rounded-md"
                        value={q.question || ''}
                        onChange={(e) => handleChange(q.id, 'question', e.target.value)}
                      />
                    </section>
                    <section>
                      <h4>Definition</h4>
                      <textarea
                        className="bg-[#51516B] w-full resize-none p-2 rounded-md h-50 md:h-auto"
                        value={q.answer || ''}
                        onChange={(e) => handleChange(q.id, 'answer', e.target.value)}
                      />
                    </section>
                  </div>

                  <button
                    className="hidden md:flex w-full rounded-xl md:rounded-none p-5 md:w-[50px] justify-center items-center bg-[#373749] hover:bg-red-500 active:bg-red-600 transition-all"
                    onClick={() => handleDeleteItem(q.id, 'terms')}
                  >
                    <LuTrash />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={handleAddTD}
              className="w-full max-w-xl bg-[#B5B5FF] hover:bg-green-700 text-white py-3 rounded-xl"
            >
              Add Flashcard
            </button>
          </>
        )}

        {isAcronym && (
          <>
            {content.length === 0 && <p className="text-gray-400">No acronym content yet.</p>}
            <div className="w-full max-w-5xl overflow-auto max-h-[60vh] space-y-6 p-2 md:p-10">
              {content.map((item) => (
                <div key={item.id} className="flex flex-col bg-[#3F3F54] w-full p-4 md:p-10 text-white gap-6 rounded-xl">
                  <input
                    type="text"
                    placeholder="Enter title"
                    className="bg-[#51516B] w-full p-3 rounded-lg text-white font-poppinsbold text-xl"
                    value={item.title ?? ""}
                    onChange={(e) => handleAcronymChange(item.id, null, "title", e.target.value)}
                  />
                  <section>
                    <h4 className="mb-2">Key Phrase</h4>
                    <textarea
                      className="bg-[#51516B] w-full p-3 rounded-lg min-h-20 resize-none text-white"
                      value={item.keyPhrase ?? ""}
                      onChange={(e) => handleAcronymChange(item.id, null, "keyPhrase", e.target.value)}
                    />
                  </section>

                  <div className="flex flex-col gap-4">
                    {item.contents.map((c, index) => (
                      <div key={c.id || index} className="flex items-center gap-4 bg-[#51516B] p-3 rounded-lg">
                        <input
                          className="w-12 h-12 text-xl font-bold text-center bg-[#373749] rounded-md"
                          value={c.letter}
                          onChange={(e) => handleAcronymChange(item.id, index, "letter", e.target.value)}
                        />
                        <textarea
                          className="flex-1 bg-[#373749] p-2 rounded-md resize-none"
                          value={c.word}
                          onChange={(e) => handleAcronymChange(item.id, index, "word", e.target.value)}
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
                      className="w-[40px] h-[40px] flex justify-center items-center bg-[#373749] hover:bg-green-500 rounded-full shadow-md transition-colors"
                    >
                      <LuPlus size={24} />
                    </button>
                  </div>

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
              className="w-full max-w-xl bg-[#B5B5FF] hover:text-[#B5B5FF] hover:bg-[#200448] text-[#200448] py-3 rounded-xl font-black"
            >
              {isAcronym?"Add Acronym Group":"Add Flashcard"}
            </button>
          </>
        )}

          {isDeleting && (
  <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
    <div className="bg-[#1E1E2E] rounded-2xl p-6 text-center w-[90%] sm:w-[400px] border border-[#B5B5FF] shadow-2xl">
      <h2 className="text-white text-lg font-bold mb-3">
        Delete Flashcard
      </h2>
      <p className="text-gray-400 text-sm mb-6">
        Are you sure you want to delete this flashcard? This action cannot be undone.
      </p>
      <div className="flex justify-center gap-4">
        <button
          onClick={() => {
            setIsDeleting(false)
            setDeleteTarget(null)
          }}
          className="px-4 py-2 rounded-xl bg-gray-600 hover:bg-gray-700 text-white font-semibold active:scale-95"
        >
          Cancel
        </button>
        <button
          onClick={confirmDelete}
          className="px-4 py-2 rounded-xl bg-[#E93209] hover:bg-[#C22507] text-white font-semibold active:scale-95"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
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
        if (user && user.emailVerified) resolve(user);
        else reject("Unauthorized");
      });
    });

  try {
    const user = await getUser();

    const reviewerRef = doc(db, "users", user.uid, "folders", folderId, "reviewers", reviewerId)
    const reviewerSnap = await getDoc(reviewerRef)
    if (!reviewerSnap.exists()) throw new Response("Reviewer not found", { status: 404 })
    const reviewerData = reviewerSnap.data()

    //Detect type by folderId
    let type = "flashcard"
    if (folderId === "AcronymMnemonics") type = "acronym"
    else if (folderId === "TermsAndDefinitions") type = "terms"

    if (type === "terms") {
      const questionsRef = collection(reviewerRef, "questions")
      const questionsSnap = await getDocs(questionsRef)
      const questions = questionsSnap.docs.map(doc => {
        const data = doc.data()
        let answer = ""
        if (Array.isArray(data.definition)) {
          const correct = data.definition.find(d => d && d.type === "correct") || data.definition[0]
          answer = correct?.text ?? ""
        } else if (data.definition && typeof data.definition === "object") {
          answer = data.definition.text ?? ""
        } else if (typeof data.definition === "string") {
          answer = data.definition
        }
        return { id: doc.id, question: data.term || "", answer }
      })

      const sortedQuestions = questions.sort((a, b) => {
        const aNum = Number(String(a.id).match(/\d+/)?.[0] || 0)
        const bNum = Number(String(b.id).match(/\d+/)?.[0] || 0)
        return aNum - bNum
      })

      return { id: reviewerId, title: reviewerData.title, type: "terms", questions: sortedQuestions, folderId }
    }

    if (type === "acronym") {
      const contentCollectionRef = collection(reviewerRef, "content")
      const contentSnap = await getDocs(contentCollectionRef)

      const content = await Promise.all(
        contentSnap.docs.map(async (contentDoc) => {
          const contentData = contentDoc.data()
          const contentsRef = collection(contentDoc.ref, "contents")
          const contentsSnap = await getDocs(contentsRef)
          let contents = contentsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
          contents = contents.sort((a, b) => Number(a.id) - Number(b.id))
          return { id: contentDoc.id, title: contentData.title, keyPhrase: contentData.keyPhrase, contents }
        })
      )

      return { id: reviewerId, title: reviewerData.title, type: "acronym", content, folderId }
    }

    throw new Response("Unsupported reviewer type", { status: 400 })
  } catch (error) {
    console.error("Loader error:", error)
    throw new Response("Failed to load reviewer", { status: 500 })
  }
}