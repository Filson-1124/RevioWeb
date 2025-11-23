
import { useSearchParams, useNavigate, useOutletContext } from 'react-router-dom'
import { useState,useEffect } from 'react'

import { useAuth } from '../components/AuthContext'


export const useCreate= () =>{
const API_URL = import.meta.env.VITE_API_URL
    const [searchParams] = useSearchParams()
  const folderId = searchParams.get('folder')
  const type = searchParams.get('type')

  const [title, setTitle] = useState("")
  const [subTitle, setSubTitle] = useState("")
  const [createTitle, setCreateTitle] = useState("")
  const [createSubTitle, setCreateSubTitle] = useState("")
  const [info, setInfo] = useState("")
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileUrl, setFileUrl] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)
  const [isError,setIsError]=useState(false)
  const [errorMess,setErrorMess]=useState("")

  const { currentUser } = useAuth()
  const navigate = useNavigate()

  // ✅ Safe context access
  const outletContext = useOutletContext?.() || {}
  const setShowNav = typeof outletContext.setShowNav === 'function' ? outletContext.setShowNav : () => {}

  const handleCreateReviewer = async () => {
    if (!selectedFile || !currentUser) {
      alert("An error occurred. There was a problem processing the file.")
      return
    }

    setShowNav(false)
    setIsCreating(true)
    try {
      const idToken = await currentUser.getIdToken()
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('uid', currentUser.uid)
      formData.append('folderId', folderId)

      const routeMap = {
        acronym: "acronyms",
        terms: "terms",
        summarization: "summarize",
        ai: "explain",
      }

      const route = routeMap[type]
      if (!route) {
        alert("Invalid reviewer type.")
        setShowNav(true)
        return
      }

      const response = await fetch(`${API_URL}/feature/${route}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}` },
        body: formData,
      })

      if (!response.ok) throw new Error(await response.text())

      const data = await response.json()
      console.log("Reviewer created:", data)

      setIsDone(true)

      setTimeout(async () => {
        const reviewerId = data?.reviewers?.[0]?.id
        if (!reviewerId) {
          alert("Reviewer created, but no ID was returned.")
          setIsCreating(false)
          setShowNav(true)
          return
        }

        if (!folderId || folderId === 'null') {
          alert("Folder ID is missing — cannot navigate to reviewer display.")
          setIsCreating(false)
          setShowNav(true)
          return
        }

        await new Promise((resolve) => setTimeout(resolve, 1500))

        if (type === "terms") {
          navigate(`/Main/Library/TermsAndDefinitions/${reviewerId}`)
        } else if (type === "acronym") {
          navigate(`/Main/Library/AcronymMnemonics/${reviewerId}`)
        } else if (type === "summarization") {
          navigate(`/Main/Library/SummarizedReviewers/${reviewerId}`)
        } else if (type === "ai") {
          navigate(`/Main/Library/SummarizedAIReviewers/${reviewerId}`)
        }

        await new Promise((resolve) => setTimeout(resolve, 7000))

        setFadeOut(true)
        await new Promise((resolve) => setTimeout(resolve, 500))

        setIsCreating(false)
        setIsDone(false)
        setFadeOut(false)
        setShowNav(true)
      }, 1500)
    } catch (err) {
      console.error("Error creating reviewer:", err)
      const errText = err?.message || ""
      if (errText.includes("ERR_UPLOAD_FILE_CHANGED") || errText.includes("ERR_FAILED") || errText.includes("Failed to fetch")) {
       setIsError(true)
        setErrorMess("The selected file is from cloud storage. Please download it to your device first and try again.")
      } else if (errText.includes("text content is too long")) {
        setIsError(true)
        setErrorMess("The text content is too long. Please shorten it and try again.")
      } else if (errText.includes("Failed to generate content with AI")) {
       setIsError(true)
        setErrorMess("An error occurred while generating content with AI. Please try again.")
      } else if (errText.includes("meaningless") || errText.includes("No content")) {
        setErrorMess(errText)
        setIsError(true)
      } else {
        setIsError(true)
        setErrorMess("Failed to create reviewer. Please try again.")
      }
      setIsDone(true)
      setTimeout(() => {
        setIsCreating(false)
        setIsDone(false)
        setShowNav(true)
      }, 1500)
    }
  }

  useEffect(() => {
    switch (type) {
      case 'acronym':
        setTitle("Acronym Mnemonics")
        setInfo("Acronym mnemonics is a powerful tool that enhances memory and recall by associating information with memorable phrases or words.")
        setCreateTitle("Generating Acronym Flashcards...")
        setCreateSubTitle("Hang tight while we turn your file into mnemonic flashcards!")
        break
      case 'terms':
        setTitle("Terms and Definitions")
        setInfo("Revio will help you memorize terms and definitions using the Leitner spaced repetition technique.")
        setCreateTitle("Creating Term & Definition Set...")
        setCreateSubTitle("We’re organizing your key terms and definitions for easy recall.")
        break
      case 'summarization':
        setTitle("Reviewer Generator")
        setSubTitle("Standard Summarization")
        setInfo("Revio will summarize your files for you.")
        setCreateTitle("Summarizing Your Reviewer...")
        setCreateSubTitle("Revio is condensing your document into digestible notes!")
        break
      case 'ai':
        setTitle("Reviewer Generator")
        setSubTitle("Summarization + AI Explanation")
        setInfo("Revio will summarize and explain content with AI for deeper understanding.")
        setCreateTitle("AI Explanation in Progress...")
        setCreateSubTitle("Our AI is summarizing + explaining your material in detail.")
        break
      default:
        setTitle("")
        setSubTitle("")
        setInfo("")
        setCreateSubTitle("")
        setCreateTitle("")
    }
  }, [type])

 

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    console.log("Selected file before upload:", file)
    setSelectedFile(file)
    setFileUrl(URL.createObjectURL(file))
  }

  useEffect(() => {
    let prevUrl = fileUrl
    return () => {
      if (prevUrl) URL.revokeObjectURL(prevUrl)
    }
  }, [fileUrl])

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setFileUrl(null)
    document.getElementById('fileUpload').value = ""
  }

return {
  state: {
    title,
    subTitle,
    createTitle,
    createSubTitle,
    info,
    selectedFile,
    fileUrl,
    isCreating,
    isDone,
    fadeOut,
    folderId,
    type,
    isError,
    errorMess
  },
  actions: {
    setTitle,
    setSubTitle,
    setCreateTitle,
    setCreateSubTitle,
    setInfo,
    setSelectedFile,
    setFileUrl,
    setIsCreating,
    setIsDone,
    setFadeOut,
    handleCreateReviewer,
    handleFileChange,
    handleRemoveFile,
    setIsError
  }
}

}