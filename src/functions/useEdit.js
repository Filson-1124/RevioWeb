import React, { useState, useEffect } from 'react'
import { useLoaderData, useNavigate } from 'react-router-dom'
import { auth, db } from "../components/firebase";
import { doc, getDoc, collection, getDocs, setDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { useParams } from "react-router-dom";

export const useEdit = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const reviewer = useLoaderData()
  const navigate = useNavigate()
  const { id: folderId, reviewerId } = useParams();

  const [isCreating, setIsCreating] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)

  const [title, setTitle] = useState(reviewer?.title || "")
  const [questions, setQuestions] = useState(() => reviewer?.questions || [])
  const [content, setContent] = useState(() => reviewer?.content || [])

  const [deletedLetters, setDeletedLetters] = useState([]);
  const [deletedItems, setDeletedItems] = useState([]);

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [isEmptySaved,setIsEmptySaved]=useState(false)
  const [modalMess, setModalMess]=useState("")
  const [modalTitle,setModalTitle]=useState("")
  const [isSaved,setIsSaved]=useState(false)
  const [isFailed,setIsFailed]=useState(false)
  const [loadingCountdown,setLoadingCountdown]=useState(5)

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

      if (!title || !title.trim()) {
        setIsEmptySaved(true)
        setModalTitle("Missing Title")
        setModalMess("Please enter a title for your reviewer before saving.")
        return
      }

      if (isAcronym) {
        for (const c of content) {
          if (!c.title || !c.title.trim()) {
            setIsEmptySaved(true)
            setModalTitle("Title Missing.")
            setModalMess("Each acronym flashcard must have a TITLE before saving.")
            return
          }
          for (const item of c.contents) {
            if (!item.letter.trim() || !item.word.trim()) {
              setIsEmptySaved(true)
              setModalTitle("Empty Fields.")
              setModalMess("Each acronym entry must have both a LETTER and a WORD before saving.")
              return
            }
          }
        }
      }

      if (isTermDef) {
        for (const q of questions) {
          if (!q.question.trim() || !q.answer.trim()) {
            setIsEmptySaved(true)
            setModalTitle("Empty Flash Card.")
            setModalMess("Each flashcard must have both a TERM and a DEFINITION before saving.")
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

      await updateDoc(reviewerRef, { title })

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

      for (const d of deletedItems.filter(x => x.type === "acronym")) {
        const contentRef = doc(reviewerRef, "content", d.id)
        const lettersSnap = await getDocs(collection(contentRef, "contents"))
        const deletePromises = lettersSnap.docs.map(letterDoc =>
          deleteDoc(letterDoc.ref)
        )
        await Promise.all(deletePromises)
        await deleteDoc(contentRef)
      }

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

          const existingDefs = Array.isArray(data?.definition) ? data.definition : (typeof data?.definition === "string" ? [{ text: data.definition, type: "correct" }] : [])
          const hasWrong = Array.isArray(existingDefs) && existingDefs.some(d => d && d.type === "wrong")
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
            }
          } catch (err) {
            console.error("Failed to call distractor API:", err)
          }
        }

        for (const q of questions) {
  const existing = existingById[q.id] || {}
  
  const existingTerms = Array.isArray(existing.terms) ? existing.terms.slice() : []

  // Update the correct term text
  const correctTermText = q.question.trim()
  const correctTermIndex = existingTerms.findIndex(t => t.type === "correct")
  if (correctTermIndex !== -1) {
    existingTerms[correctTermIndex].text = correctTermText
  } else {
    existingTerms.unshift({ text: correctTermText, type: "correct" })
  }

  // Update definitions
  let defs = Array.isArray(existing.definition) ? existing.definition.slice() : []
  // Update correct definition
  const correctDef = q.answer.trim()
  const correctDefIndex = defs.findIndex(d => d.type === "correct")
  if (correctDefIndex !== -1) {
    defs[correctDefIndex].text = correctDef
  } else {
    defs.unshift({ text: correctDef, type: "correct" })
  }

  const aiWrongs = Array.isArray(distractorMap[q.id]) ? distractorMap[q.id] : []
  for (const wrong of aiWrongs) {
    if (!wrong || !wrong.trim()) continue
    const trimmed = wrong.trim()
    if (!defs.some(d => d.text.trim() === trimmed)) {
      defs.push({ text: trimmed, type: "wrong" })
    }
  }

  const existingWrongs = Array.isArray(existing.definition) ? existing.definition.filter(d => d.type === "wrong") : []
  for (const w of existingWrongs) {
    if (!defs.some(d => d.text.trim() === w.text.trim())) {
      defs.push(w)
    }
  }

  const payload = {
    term: correctTermText,
    terms: existingTerms,
    defReal: correctDef,
    definition: defs,
  }

  const qRef = doc(reviewerRef, "questions", q.id)
  await setDoc(qRef, payload, { merge: true })
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

      setIsSaved(true)
      setLoadingCountdown(7)

    } catch (error) {
      console.error("Error saving:", error)
      setIsFailed(true)
    }
  }

  useEffect(() => {
    if (isSaved) {
      const timer = setInterval(() => {
        setLoadingCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            if (isAcronym) {
              navigate(`/Main/Library/AcronymMnemonics/${reviewerId}`);
            } else {
              navigate(`/Main/Library/TermsAndDefinitions/${reviewerId}`);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isSaved]);

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

  return {
    state: {
      title,
      questions,
      content,
      isCreating,
      isDone,
      fadeOut,
      deletedLetters,
      deletedItems,
      deleteTarget,
      isDeleting,
      isEmptySaved,
      modalMess,
      modalTitle,
      isSaved,
      isFailed,
      loadingCountdown,
      folderId,
      reviewerId,
      isAcronym,
      isTermDef,
    },
    actions: {
      setTitle,
      setQuestions,
      setContent,
      setIsCreating,
      setIsDone,
      setFadeOut,
      setDeletedLetters,
      setDeletedItems,
      setDeleteTarget,
      setIsDeleting,
      setIsEmptySaved,
      setModalMess,
      setModalTitle,
      setIsSaved,
      setIsFailed,
      setLoadingCountdown,
      handleChange,
      handleAcronymChange,
      addLetter,
      handleDeleteLetter,
      handleDeleteItem,
      confirmDelete,
      handleSave,
      handleAddTD,
      handleAddAC,
    }
  }
}
