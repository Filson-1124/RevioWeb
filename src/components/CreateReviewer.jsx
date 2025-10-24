import React, { useState, useEffect } from 'react'
import createLoadingScreen from '../assets/creationLoadingScreen.png'
import { useSearchParams, useNavigate, useOutletContext } from 'react-router-dom'
import { CiCirclePlus } from "react-icons/ci"
import { IoClose } from "react-icons/io5"
import { useAuth } from '../components/AuthContext'
import { LuArrowLeft } from "react-icons/lu"
import LoadingBar from './LoadingBar'

const API_URL = import.meta.env.VITE_API_URL

const CreateReviewer = () => {
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
        alert("The selected file is from cloud storage. Please download it to your device first and try again.")
      } else if (errText.includes("text content is too long")) {
        alert("The text content is too long. Please shorten it and try again.")
      } else if (errText.includes("Failed to generate content with AI")) {
        alert("An error occurred while generating content with AI. Please try again.")
      } else if (errText.includes("meaningless") || errText.includes("No content")) {
        alert(errText)
      } else {
        alert("Failed to create reviewer. Please try again.")
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

if (isCreating) {
  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col justify-center items-center text-center pb-[40%] md:pb-0 p-4 transition-opacity duration-700 bg-[#12121A] bg-opacity-95 pointer-events-auto ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <img
        src={createLoadingScreen}
        alt="creationLoadingScreen"
        className="w-40 sm:w-40 md:w-80 mb-6"
      />
      <p className="text-white font-poppinsbold text-sm sm:text-base md:text-lg mb-4">
        {isDone ? 'Reviewer Created — Preparing Display...' : createTitle}
      </p>
      <p className="w-full sm:w-40 md:w-80 text-[#ffffff3b] font-poppinsbold text-sm sm:text-base md:text-sm mb-4">
        {isDone ? '' : createSubTitle}
      </p>
      <LoadingBar isDone={isDone} />
      <p className="text-[10px] text-[#808080] p-2 w-full md:w-[50%] mt-2 rounded-2xl">
        <b>Disclaimer: </b>
        This feature uses AI to generate educational content from your materials.
        While designed for accuracy, please review and verify the results before academic use.
      </p>
    </div>
  );
}


  return (
    <div className="flex flex-col text-white w-full items-center h-screen px-4 pb-[45%] md:pb-0 sm:px-8 md:px-[5%] py-10 relative">
      <div className="w-full flex justify-between items-center absolute top-6 left-0 px-5">
        <button
          onClick={() => navigate(`/Main/Create`)}
          className=" cursor-pointer flex items-center gap-2 text-white bg-[#3F3F54] hover:bg-[#51516B] p-2 md:p-3 rounded-xl text-sm md:text-base"
        >
          <LuArrowLeft size={18} className="md:size-5" />
          Back
        </button>
      </div>

      <div className="flex flex-col items-center justify-center flex-1 w-full gap-10">
        <div className="w-full sm:w-[90%] md:w-[80%] text-start">
          {title ? (
            <>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">{title}</h1>
              {subTitle && (
                <h2 className="text-lg sm:text-xl font-semibold text-violet-300 mb-2">
                  {subTitle}
                </h2>
              )}
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                {info}
              </p>
            </>
          ) : (
            <p className="text-red-500">No reviewer type selected.</p>
          )}
        </div>

        <div className="bg-[#2E2E40] flex flex-col items-center text-center p-6 sm:p-10 rounded-xl gap-4 w-full sm:w-[80%] md:w-[60%]">
          <input
            id="fileUpload"
            type="file"
            className="hidden"
            accept=".docx,.pdf,.pptx"
            onChange={handleFileChange}
          />
          <label
            htmlFor="fileUpload"
            className={`inline-flex w-[12rem] sm:w-[14rem] md:w-[15rem] h-[4rem] sm:h-[5rem] items-center justify-center gap-2 px-6 py-3 ${
              selectedFile
                ? "bg-gray-500 cursor-not-allowed opacity-60"
                : "bg-[#B5B5FF] hover:bg-violet-700 cursor-pointer"
            } text-[#200448] rounded-xl font-poppinsbold shadow-md transition-all duration-200 active:scale-95`}
          >
            <CiCirclePlus size={30} className="sm:size-[35px]" />
            <span className="text-sm sm:text-base">
              {selectedFile ? "File Uploaded" : "Upload File"}
            </span>
          </label>

          <p className="text-[#ffffff46] text-xs sm:text-sm text-center">
            Please upload a file with .docx, .pdf, or .pptx
          </p>

          {selectedFile && (
            <div className="text-center mt-4 space-y-3 w-full">
              <p className="text-white text-sm sm:text-base font-medium break-words">
                {selectedFile.name}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer px-4 py-2 text-sm sm:text-base bg-violet-500 hover:bg-violet-600 rounded-md text-white font-semibold transition-all"
                >
                  View File
                </a>
                <button
                  onClick={handleRemoveFile}
                  className="cursor-pointer px-4 py-2 text-sm sm:text-base bg-red-500 hover:bg-red-600 rounded-md text-white font-semibold flex items-center gap-1 transition-all justify-center"
                >
                  <IoClose size={18} /> Remove File
                </button>
              </div>

              <button
                className="cursor-pointer mt-4 px-6 py-2 text-sm sm:text-base bg-green-500 hover:bg-green-600 text-white rounded-md font-semibold transition-all"
                onClick={handleCreateReviewer}
              >
                Create Reviewer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CreateReviewer
