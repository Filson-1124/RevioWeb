import React, { useState, useEffect } from 'react'
import createLoadingScreen from '../assets/creationLoadingScreen.png'
import { useSearchParams } from 'react-router-dom'
import { CiCirclePlus } from "react-icons/ci"
import { IoClose } from "react-icons/io5"
import { useAuth } from '../components/AuthContext' // adjust path if needed --M.
import LoadingBar from './LoadingBar'
const API_URL = import.meta.env.VITE_API_URL; //M.

//M. Loading bar component


const CreateReviewer = () => {
  const [searchParams] = useSearchParams()
  const folderId = searchParams.get('folder'); // this gets the folderId from the URL --M.
  const type = searchParams.get('type')

  const [title, setTitle] = useState("")
  const [subTitle, setSubTitle] = useState("")
  const [info, setInfo] = useState("")

  const [selectedFile, setSelectedFile] = useState(null)
  const [fileUrl, setFileUrl] = useState(null)

  const [isCreating, setIsCreating] = useState(false) //M. default false
  const [isDone, setIsDone] = useState(false) //M. controls loading bar

  //M. Backend function
  const { currentUser } = useAuth()

  const handleCreateReviewer = async () => {
    if (!selectedFile || !currentUser) {
      alert("An error occured. There was a problem processing the file.")
      return
    }

    setIsCreating(true) //M. show loading screen

    try {
      // 1. Get Firebase ID token
      const idToken = await currentUser.getIdToken();

      // 2. Prepare form data
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('uid', currentUser.uid);         // pass UID from Firebase Auth
      formData.append('folderId', folderId);

      const routeMap = {
        acronym: "acronyms",
        terms: "terms",
        summarization: "summarize",
        ai: "explain",
      };

      const route = routeMap[type];
      if (!route) {
        alert("Invalid reviewer type.");
        return;
      }

      // 3. Call backend API
      const response = await fetch(`${API_URL}/feature/${route}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${idToken}`, // ✅ Pass token to backend
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error)
      }

      const data = await response.json()
      console.log("Reviewer created:", data)
  

      //M. trigger bar to 100%
      setIsDone(true)

      //M. wait 2s for bar animation before hiding loading screen
      setTimeout(() => {
         alert("Reviewer created successfully!")
        setIsCreating(false)
        setIsDone(false) // reset for next time
        
      }, 2000)
   
    } catch (err) {
  console.error("Error creating reviewer:", err)
  alert("Failed to create reviewer.")

  // show error state briefly before hiding screen
  setIsDone(true) // finish bar
  setTimeout(() => {
    setIsCreating(false) // hide loading screen
    setIsDone(false)     // reset bar
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
  //dito nagdynamic set of url depende sa feature type

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
    isCreating ?
      <div className="min-h-screen flex justify-center items-center flex-col">
        <img
          src={createLoadingScreen}
          alt="creationLoadingScreen"
          className="w-80"
        />
        <p className='text-[#9898D9] font-poppinsbold text-center'>
          {isDone?"Reviewer Created, Happy Reviewing!":"Revio is working on your reviewers, please wait."}
          
        </p>
        <LoadingBar isDone={isDone} /> {/* M. loading bar */}
      </div>
      : <div className="flex flex-col text-white w-full items-center p-[5%]">
      <div className="p-20 w-[80%]">
        {title ? (
          <>
            <h1 className="text-3xl font-bold">{title}</h1>
            {subTitle && <h2 className="text-xl font-semibold text-violet-300">{subTitle}</h2>}
            <p className="text-sm text-gray-300">{info}</p>
          </>
        ) : (
          <p className="text-red-500">No reviewer type selected.</p>
        )}
      </div>

      {/* Upload Box */}
      <div className="bg-[#2E2E40] flex flex-col p-10 px-30 rounded-xl items-center gap-4">
        <input
          id="fileUpload"
          type="file"
          className="hidden"
          accept=".docx,.pdf,.ppt,.pptx"
          onChange={handleFileChange}
        />

        <label
          htmlFor="fileUpload"
          className={`inline-flex h-[5rem] w-[15rem] items-center justify-center gap-2 px-6 py-3 ${
            selectedFile ? 'bg-gray-500 cursor-not-allowed opacity-60' : 'bg-[#B5B5FF] hover:bg-violet-700 cursor-pointer'
          } text-[#200448] rounded-xl font-poppinsbold shadow-md transition-all duration-200 active:scale-95`}
        >
          <CiCirclePlus size={35} />
          <span>{selectedFile ? 'File Uploaded' : 'Upload File'}</span>
        </label>

        <p className="text-[#ffffff46] text-sm text-center">
          Please upload a file with .docx, .pdf, or .ppt
        </p>

        
       {/* File Preview & Controls */}
{selectedFile && (
  <div className="text-center mt-4 space-y-2">
    <p className="text-white text-sm font-medium">Uploaded: {selectedFile.name}</p>
    <div className="flex gap-4 justify-center">
      <a
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="px-4 py-2 text-sm bg-violet-500 hover:bg-violet-600 rounded-md text-white font-semibold transition-all"
      >
        View File
      </a>
      <button
        onClick={handleRemoveFile}
        className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 rounded-md text-white font-semibold flex items-center gap-1 transition-all"
      >
        <IoClose size={18} />
        Remove File
      </button>
    </div>

    {/* Create Reviewer Button */}
    <button
      className="mt-4 px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md font-semibold transition-all"
      onClick={handleCreateReviewer} //M. edit
    >
      Create Reviewer
    </button>
  </div>
)}

      </div>
    </div>
    
   
  )
}

export default CreateReviewer