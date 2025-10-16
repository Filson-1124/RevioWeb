import React, { useState, useEffect } from 'react'
import createLoadingScreen from '../assets/creationLoadingScreen.png'
import { useSearchParams, useNavigate } from 'react-router-dom'
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
  const [info, setInfo] = useState("")
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileUrl, setFileUrl] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)

  const { currentUser } = useAuth()
  const navigate = useNavigate()

  const handleCreateReviewer = async () => {
    if (!selectedFile || !currentUser) {
      alert("An error occurred. There was a problem processing the file.")
      return
    }

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

      // Wait for backend and Firestore sync
      setTimeout(async () => {
        const reviewerId = data?.reviewers?.[0]?.id
        if (!reviewerId) {
          alert("Reviewer created, but no ID was returned.")
          setIsCreating(false)
          return
        }

        if (!folderId || folderId === 'null') {
          alert("Folder ID is missing — cannot navigate to reviewer display.")
          setIsCreating(false)
          return
        }

        await new Promise((resolve) => setTimeout(resolve, 1500))

        //To display upon create
        if (type === "terms") {
          navigate(`/Main/review/terms/${folderId}/${reviewerId}`)
        } else if (type === "acronym") {
          navigate(`/Main/review/acronym/${folderId}/${reviewerId}`)
        } else if (type === "summarization") {
          navigate(`/Main/review/summarized/${folderId}/${reviewerId}`)
        } else if (type === "ai") {
          navigate(`/Main/review/ai/${folderId}/${reviewerId}`)
        }

        await new Promise((resolve) => setTimeout(resolve, 7000))

        setFadeOut(true)
        await new Promise((resolve) => setTimeout(resolve, 500))

        setIsCreating(false)
        setIsDone(false)
        setFadeOut(false)
      }, 1500)
    } catch (err) {
     console.error("Error creating reviewer:", err)
      const errText = err?.message || ""
      // Added backend error handling
      if (errText.includes("text content is too long")) {
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
      }, 1500)
    }
  }

  useEffect(() => {
    switch (type) {
      case 'acronym':
        setTitle("Acronym Mnemonics")
        setInfo("Acronym mnemonics is a powerful tool that enhances memory and recall by associating information with memorable phrases or words.")
        break
      case 'terms':
        setTitle("Terms and Definitions")
        setInfo("Revio will help you memorize terms and definitions using the Leitner spaced repetition technique.")
        break
      case 'summarization':
        setTitle("Reviewer Generator")
        setSubTitle("Standard Summarization")
        setInfo("Revio will summarize your files for you.")
        break
      case 'ai':
        setTitle("Reviewer Generator")
        setSubTitle("Summarization + AI Explanation")
        setInfo("Revio will summarize and explain content with AI for deeper understanding.")
        break
      default:
        setTitle("")
        setSubTitle("")
        setInfo("")
    }
  }, [type])

  
  const handleFileChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const buffer = await file.arrayBuffer();
    const fixedFile = new File([buffer], file.name, { type: file.type });

    setSelectedFile(fixedFile);
    setFileUrl(URL.createObjectURL(fixedFile));
  } catch (err) {
    alert("Failed to read file. Please try again.");
  }
};

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setFileUrl(null)
    document.getElementById('fileUpload').value = ""
  }


  if (isCreating) {
    return (
      <div
        className={`min-h-screen flex flex-col justify-center items-center text-center p-4 transition-opacity duration-700 ${
          fadeOut ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <img src={createLoadingScreen} alt="creationLoadingScreen" className="w-40 sm:w-40 md:w-80 mb-6" />
        <p className="text-[#9898D9] font-poppinsbold text-sm sm:text-base md:text-lg mb-4">
          {isDone ? "Reviewer Created — Preparing Display..." : "Revio is generating your reviewer, please wait..."}
        </p>
        <LoadingBar isDone={isDone} />

        <p className=' text-[10px] text-[#808080] p-2 w-full md:w-[50%] mt-2 rounded-2xl'><b>Disclaimer: </b>This feature uses AI to generate educational content from your materials. While designed for accuracy, please review and verify the results before academic use.</p>
      </div>
    )
  }

  return (
  <div className="flex flex-col text-white w-full items-center h-screen px-4 sm:px-8 md:px-[5%] py-10 relative">
  {/* Back button */}
  <div className="w-full flex justify-between items-center absolute top-6 left-0 px-5">
    <button
      onClick={() => navigate(-1)}
      className="flex items-center gap-2 text-white bg-[#3F3F54] hover:bg-[#51516B] p-2 md:p-3 rounded-xl text-sm md:text-base"
    >
      <LuArrowLeft size={18} className="md:size-5" />
      Back
    </button>
  </div>

  {/* Centered content */}
  <div className="flex flex-col items-center justify-center flex-1 w-full gap-10">
    {/* Second div (title/info) */}
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

    {/* Third div (upload section) */}
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
              className="px-4 py-2 text-sm sm:text-base bg-violet-500 hover:bg-violet-600 rounded-md text-white font-semibold transition-all"
            >
              View File
            </a>
            <button
              onClick={handleRemoveFile}
              className="px-4 py-2 text-sm sm:text-base bg-red-500 hover:bg-red-600 rounded-md text-white font-semibold flex items-center gap-1 transition-all justify-center"
            >
              <IoClose size={18} /> Remove File
            </button>
          </div>

          <button
            className="mt-4 px-6 py-2 text-sm sm:text-base bg-green-500 hover:bg-green-600 text-white rounded-md font-semibold transition-all"
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
