import React, { useState, useEffect } from 'react'
import createLoadingScreen from '../assets/creationLoadingScreen.png'
import { useSearchParams } from 'react-router-dom'
import { CiCirclePlus } from "react-icons/ci"
import { IoClose } from "react-icons/io5"
import { useAuth } from '../components/AuthContext'
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

  const { currentUser } = useAuth()

  const handleCreateReviewer = async () => {
    if (!selectedFile || !currentUser) {
      alert("An error occured. There was a problem processing the file.")
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

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error)
      }

      const data = await response.json()
      console.log("Reviewer created:", data)
      setIsDone(true)

      setTimeout(() => {
        alert("Reviewer created successfully!")
        setIsCreating(false)
        setIsDone(false)
      }, 2000)

    } catch (err) {
      console.error("Error creating reviewer:", err)
      alert("Failed to create reviewer.")
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
        setSubTitle("")
        setInfo("Acronym mnemonics is a powerful tool that enhances memory and recall by associating information with memorable phrases or words, making learning easier and more efficient.")
        break
      case 'terms':
        setTitle("Terms and Definitions")
        setSubTitle("")
        setInfo("Revio will help you memorize terms and definitions. The study technique associated with flashcards is the Leitner study technique — a spaced repetition technique using flashcards.")
        break
      case 'summarization':
        setTitle("Reviewer Generator")
        setSubTitle("Standard Summarization")
        setInfo("Revio will summarize your files for you and provide a Pomodoro timer to help you stay focused.")
        break
      case 'ai':
        setTitle("Reviewer Generator")
        setSubTitle("Summarization + AI Explanation")
        setInfo("Revio will summarize your files and provide in-depth AI-powered explanations, plus a Pomodoro timer to boost your focus.")
        break
      default:
        setTitle("")
        setSubTitle("")
        setInfo("")
    }
  }, [type])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      setFileUrl(URL.createObjectURL(file))
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setFileUrl(null)
    document.getElementById('fileUpload').value = ""
  }

  return (
    isCreating ? (
      <div className="min-h-screen flex flex-col justify-center items-center text-center p-4">
        <img
          src={createLoadingScreen}
          alt="creationLoadingScreen"
          className="w-56 sm:w-72 md:w-80 mb-6"
        />
        <p className="text-[#9898D9] font-poppinsbold text-sm sm:text-base md:text-lg mb-4">
          {isDone ? "Reviewer Created, Happy Reviewing!" : "Revio is working on your reviewers, please wait."}
        </p>
        <LoadingBar isDone={isDone} />
      </div>
    ) : (
      <div className="flex flex-col text-white w-full items-center px-4 sm:px-8 md:px-[5%] py-10">
        <div className="w-full sm:w-[90%] md:w-[80%] text-center md:text-left mb-10">
          {title ? (
            <>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">{title}</h1>
              {subTitle && <h2 className="text-lg sm:text-xl font-semibold text-violet-300 mb-2">{subTitle}</h2>}
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">{info}</p>
            </>
          ) : (
            <p className="text-red-500">No reviewer type selected.</p>
          )}
        </div>

        {/* Upload Box */}
        <div className="bg-[#2E2E40] flex flex-col items-center text-center p-6 sm:p-10 rounded-xl gap-4 w-full sm:w-[80%] md:w-[60%]">
          <input
            id="fileUpload"
            type="file"
            className="hidden"
            accept=".docx,.pdf,.ppt,.pptx"
            onChange={handleFileChange}
          />

          <label
            htmlFor="fileUpload"
            className={`inline-flex w-[12rem] sm:w-[14rem] md:w-[15rem] h-[4rem] sm:h-[5rem] items-center justify-center gap-2 px-6 py-3 ${
              selectedFile ? 'bg-gray-500 cursor-not-allowed opacity-60' : 'bg-[#B5B5FF] hover:bg-violet-700 cursor-pointer'
            } text-[#200448] rounded-xl font-poppinsbold shadow-md transition-all duration-200 active:scale-95`}
          >
            <CiCirclePlus size={30} className="sm:size-[35px]" />
            <span className="text-sm sm:text-base">{selectedFile ? 'File Uploaded' : 'Upload File'}</span>
          </label>

          <p className="text-[#ffffff46] text-xs sm:text-sm text-center">
            Please upload a file with .docx, .pdf, or .ppt
          </p>

          {selectedFile && (
            <div className="text-center mt-4 space-y-3 w-full">
              <p className="text-white text-sm sm:text-base font-medium break-words">{selectedFile.name}</p>
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
                  <IoClose size={18} />
                  Remove File
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
    )
  )
}

export default CreateReviewer
