import React, { useState, useEffect } from 'react'
import { useLoaderData, useNavigate, useParams } from 'react-router-dom'
import { auth, db } from "../components/firebase"
import { doc, deleteDoc, getDoc, updateDoc, collection, query, where, getDocs, serverTimestamp } from "firebase/firestore"



export const useReview=() =>{

 const reviewer = useLoaderData()

  // Sort the questions (terms) numerically based on their IDs
  const sortedQuestions = reviewer.questions
    ? [...reviewer.questions].sort((a, b) => {
        const numA = parseInt(a.id?.toString().match(/\d+/)?.[0] || 0, 10)
        const numB = parseInt(b.id?.toString().match(/\d+/)?.[0] || 0, 10)
        return numA - numB
      })
    : []

  // Sort acronym content numerically based on their IDs

  //reviewerDelete

      

  const sortedContent = reviewer.content
    ? [...reviewer.content].sort((a, b) => {
        const numA = parseInt(a.id?.toString().match(/\d+/)?.[0] || 0, 10)
        const numB = parseInt(b.id?.toString().match(/\d+/)?.[0] || 0, 10)
        return numA - numB
      })
    : []

  const [currentGroupIndex, setCurrentGroupIndex] = useState(0)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [message, setMessage] = useState('')
  const [isDeleting, setIsDeleting]=useState(false)
  const [deleting, setDeleting]=useState(false)
  const [fadeOut,setFadeOut]=useState(false)
  const [isDone,setIsDone]=useState(false)
  const [isDeletingSum, setIsDeletingSum]=useState(false)
  const isFlashcard = reviewer.id.startsWith('td') || reviewer.id.startsWith('ac')
  const isAcronymCard = reviewer.id.startsWith('ac')
  const [isMarked,setIsMarked]=useState(false)
  const [displayMarked,setDisplayMarked]=useState(false)
  const [markedCards,setMarkedCards]=useState([])
 

  const { id, reviewerId } = useParams()
  const navigate = useNavigate()


 

const handleSetStartDate = async (folderId, reviewerId) => {
  try {
    const uid = auth.currentUser?.uid
    if (!uid) return

    // Reference to your reviewer document (adjust path if needed)
    const reviewerRef = doc(db, `users/${uid}/folders/${folderId}/reviewers/${reviewerId}`)

    // Check if the document exists first
    const snap = await getDoc(reviewerRef)

    if (snap.exists()) {
      // ✅ Update or create the field if it already exists
      await updateDoc(reviewerRef, {
        startDate: serverTimestamp(), // uses Firebase server time
      })
      console.log("✅ startDate field updated!")
    } else {
      // ✅ Create the doc with startDate if it doesn't exist
      await setDoc(reviewerRef, {
        startDate: serverTimestamp(),
      })
      console.log("✅ Document created with startDate field!")
    }
  } catch (err) {
    console.error("❌ Error setting startDate:", err)
  }
}


  //muntik na idelete ang repo, nag kanda letche letche sa push pull 
const handleDelete = async (reviewerId) => {
  setIsDone(false)
  setDeleting(true)
  try {
    const uid = auth.currentUser?.uid
    if (!uid) throw new Error("User not authenticated")

    // ✅ Correct Firestore document reference with template literals
    const reviewerRef = doc(db, `users/${uid}/folders/${id}/reviewers/${reviewerId}`)
    await deleteDoc(reviewerRef)

    setIsDone(true)
    

    // ✅ Correct navigation with template literals
    navigate(`/Main/Library/${id}`)
  } catch (error) {
    console.error("Error deleting reviewer:", error)
    alert("Failed to delete reviewer. Please try again.")
    setDeleting(false)
  }
}


  const handleFlip = () => setFlipped(!flipped)



  useEffect(() => {
  const fetchMarkStatus = async () => {
    try {
      const uid = auth.currentUser?.uid
      if (!current?.id) return

      if (!uid || !current?.id) return

      // choose the right path depending on card type
      const reviewerRef = isAcronymCard
        ? doc(db, `users/${uid}/folders/${id}/reviewers/${reviewerId}/content/q${current.id}`)
        : doc(db, `users/${uid}/folders/${id}/reviewers/${reviewerId}/questions/${current.id}`)

      const snap = await getDoc(reviewerRef)

      if (snap.exists()) {
        const data = snap.data()
        setIsMarked(data.isMarked ?? false)
        console.log(data.isMarked)
      } else {
        setIsMarked(false)
      }
    } catch (err) {
      console.error("Error fetching marked status:", err)
    }
  }

  fetchMarkStatus()
}, [currentIndex, currentGroupIndex, displayMarked])
 

// --- MARK HANDLER ---
const handleMark = async (revId) => {
  try {
    const uid = auth.currentUser?.uid
    if (!uid || !current?.id) return

    const reviewerRef = isAcronymCard
      ? doc(db, `users/${uid}/folders/${id}/reviewers/${reviewerId}/content/q${revId}`)
      : doc(db, `users/${uid}/folders/${id}/reviewers/${reviewerId}/questions/${revId}`)

    await updateDoc(reviewerRef, { isMarked: !isMarked })
    setIsMarked(!isMarked)

    console.log("Marked status updated!")
  } catch (err) {
    console.error("Error updating mark status:", err)
  }
}


const clearEmptyIndexes = (arr) => arr.filter(item => item != null && item !== '')


// --- FETCH MARKED CARDS (fixed for acronym subcollections) ---
const getMarkedCards = async (folderId, reviewerId, isAcronymCard) => {
  try {
    const uid = auth.currentUser?.uid
    if (!uid) throw new Error("User not logged in")

    const path = isAcronymCard
      ? `users/${uid}/folders/${folderId}/reviewers/${reviewerId}/content`
      : `users/${uid}/folders/${folderId}/reviewers/${reviewerId}/questions`

    const cardsRef = collection(db, path)
    const q = query(cardsRef, where("isMarked", "==", true))
    const snapshot = await getDocs(q)

    const markedCards = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data()

        // ✅ Fetch nested subcollection for acronym cards (e.g., contents)
        let contents = []
        if (isAcronymCard) {
          const contentsRef = collection(
            db,
            `users/${uid}/folders/${folderId}/reviewers/${reviewerId}/content/${docSnap.id}/contents`
          )
          const contentsSnap = await getDocs(contentsRef)
          contents = contentsSnap.docs.map((c) => c.data())
        }

        return {
          id: docSnap.id,
          ...data,
          contents,
        }
      })
    )

    console.log("📦 Raw docs:", snapshot.docs.map((d) => d.data()))
    console.log("✅ Marked cards with contents:", markedCards)
    return markedCards
  } catch (err) {
    console.error("Error fetching marked cards:", err)
    return []
  }
}


// --- RESET & LOAD MARKED CARDS ---
useEffect(() => {
  const fetchMarked = async () => {
    if (displayMarked) {
      const cards = await getMarkedCards(id, reviewerId, isAcronymCard)
      setMarkedCards(cards)
      setCurrentIndex(0)
      setCurrentGroupIndex(0)
    } else {
      setCurrentIndex(0)
      setCurrentGroupIndex(0)
    }
  }

  fetchMarked()
}, [displayMarked])

useEffect(() => {
  if (displayMarked) {
    const fetchMarked = async () => {
      const cards = await getMarkedCards(id, reviewerId, isAcronymCard)
      setMarkedCards(cards)
      console.log(markedCards)
      setCurrentIndex(0) // ✅ reset index
    }
    fetchMarked()
  } else {
    setCurrentIndex(0) // also reset when returning to normal
  }
}, [displayMarked])
useEffect(() => {
  if (displayMarked && markedCards.length > 0) {
    setCurrentIndex(0)
  } else if (!displayMarked) {
    setCurrentIndex(0)
  }
}, [displayMarked, markedCards.length])


useEffect(() => {
  const fetchMarked = async () => {
    const cards = await getMarkedCards(id, reviewerId, isAcronymCard)
    setMarkedCards(cards)
  }

  if (displayMarked) {
    fetchMarked()
  }
}, [displayMarked])


 const handleNext = () => {
  setFlipped(false)

  if (isAcronymCard) {
    setCurrentGroupIndex(prev => {
      const next = prev + 1
      if (next >= activeCards.length) {
        setMessage("You've reached the last card")
        return prev
      }
      return next
    })
  } else {
    setCurrentIndex(prev => {
      const next = prev + 1
      if (next >= activeCards.length) {
        setMessage("You've reached the last card")
        return prev
      }
      return next
    })
  }
}

const handlePrev = () => {
  setFlipped(false)

  if (isAcronymCard) {
    setCurrentGroupIndex(prev => {
      if (prev <= 0) {
        setMessage("This is the first card")
        return prev
      }
      return prev - 1
    })
  } else {
    setCurrentIndex(prev => {
      if (prev <= 0) {
        setMessage("This is the first card")
        return prev
      }
      return prev - 1
    })
  }
}
  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.code) {
        case "ArrowLeft":
          handlePrev();
          break;
        case "ArrowRight":
          handleNext();
          break;
        case "Space":
          event.preventDefault();
          handleFlip();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleFlip, handleNext, handlePrev]); 


  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 2000)
      return () => clearTimeout(timer)
    }
  }, [message])

const activeCards = displayMarked
  ? markedCards
  : isAcronymCard
    ? sortedContent
    : sortedQuestions

const current = isAcronymCard
  ? activeCards?.[currentGroupIndex] || {}
  : activeCards?.[currentIndex] || {}


  const correctChoice = !isAcronymCard && current?.definition?.find(c => c.type === "correct")
  const currentAcronym = isAcronymCard ? current : null
  const currentTitle = isAcronymCard ? currentAcronym?.title : reviewer.title


return {
  state: {
    reviewer,
    id,
    reviewerId,
    sortedQuestions,
    sortedContent,
    currentIndex,
    currentGroupIndex,
    flipped,
    message,
    isDeleting,
    deleting,
    fadeOut,
    isDone,
    isDeletingSum,
    isFlashcard,
    isAcronymCard,
    isMarked,
    displayMarked,
    markedCards,
    activeCards,
    current,
    correctChoice,
    currentAcronym,
    currentTitle,activeCards,currentIndex
  },
  actions: {
    setCurrentIndex,
    setCurrentGroupIndex,
    setFlipped,
    setMessage,
    setIsDeleting,
    setDeleting,
    setFadeOut,
    setIsDone,
    setIsDeletingSum,
    setIsMarked,
    setDisplayMarked,
    setMarkedCards,
    handleFlip,
    handleNext,
    handlePrev,
    handleMark,
    handleDelete,
    handleSetStartDate,
    clearEmptyIndexes
  }
};


}