import React, { useState, useEffect } from 'react'
import { useAuth } from '../components/AuthContext'
import { signOut, deleteUser } from 'firebase/auth'
import { auth, db } from '../components/firebase'
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { avatarOptions } from '../assets/3D Avatars/avatars'

const Settings = () => {
  const { setIsLoggedIn, isLoggedIn } = useAuth()
  const [user, setUser] = useState(null)
  const [username, setUsername] = useState('')
  const [profilePicId, setProfilePicId] = useState('')
  const [selectedAvatarId, setSelectedAvatarId] = useState('')
  const [profilePic, setProfilePic] = useState('')
  const navigate = useNavigate()

  // Fetch user data
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        const docRef = doc(db, 'users', firebaseUser.uid)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          const data = docSnap.data()
          setUsername(data.username)
          setProfilePicId(data.avatarId)
          setSelectedAvatarId(data.avatarId)
        }
      } else {
        setUser(null)
      }
    })
    return () => unsubscribe()
  }, [])

  // Delete Account
  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      'Are you sure you want to permanently delete your account?'
    )
    if (!confirmDelete) return

    const currentUser = auth.currentUser
    if (currentUser) {
      try {
        await deleteDoc(doc(db, 'users', currentUser.uid))
        await deleteUser(currentUser)
        alert('Your account has been permanently deleted.')
        navigate('/login')
      } catch (error) {
        console.error('Delete Account Error:', error)
        if (error.code === 'auth/requires-recent-login') {
          alert('Please log in again to delete your account.')
          navigate('/login')
        } else {
          alert('Could not delete account.')
        }
      }
    }
  }

  // Avatar display
  useEffect(() => {
    if (!profilePicId) return
    const selectedAvatar = avatarOptions.find(
      (avatar) => avatar.id === profilePicId
    )
    setProfilePic(selectedAvatar ? selectedAvatar.file : null)
  }, [profilePicId])

  // Confirm avatar change
  const handleConfirmAvatarChange = async () => {
    if (!user || !selectedAvatarId) return
    try {
      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, { avatarId: selectedAvatarId })
      setProfilePicId(selectedAvatarId)
      toast.success('Profile picture updated!')
    } catch (error) {
      console.error(error)
      toast.error('Failed to update profile picture.')
    }
  }

  // Logout
  const handleLogout = async () => {
    if (isLoggedIn) {
      await signOut(auth)
      localStorage.removeItem('isLoggedInWeb')
      setIsLoggedIn(false)
      toast.success('User Logged Out Successfully, see you soon!')
      navigate('/')
    }
  }

  if (!user)
    return <p className="text-white text-center py-20">Loading user data...</p>

  return (
    <div className="flex flex-col mb-10 gap-8 p-6 pb-[45%] sm:pb-[40%] sm:p-10 md:p-16 md:pb-0 lg:p-20">
      <h1 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-poppinsbold">
        SETTINGS
      </h1>

      {/* User Info + Avatar Section */}
      <div className="border border-[#565656] rounded-lg p-6 sm:p-10 flex flex-col lg:flex-row gap-10 bg-[#1E1E2E]">
        {/* User Info */}
        <div className="w-full lg:w-[40%] flex flex-col gap-4">
          <label className="text-white font-poppins text-sm sm:text-base">
            Username:
          </label>
          <input
            value={username}
            readOnly
            className="bg-[#252533] text-white p-2 rounded-md"
          />

          <label className="text-white font-poppins text-sm sm:text-base">
            Email:
          </label>
          <input
            value={user.email}
            readOnly
            className="bg-[#252533] text-white p-2 rounded-md"
          />

         

       
        </div>

        {/* Avatar Section */}
        <div className="w-full lg:w-[60%] flex flex-col gap-6 items-center">
          <div className="w-[6rem] h-[6rem] sm:w-[7rem] sm:h-[7rem] rounded-full overflow-hidden bg-white shadow-md">
            {profilePic && (
              <img
                src={profilePic}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          <p className="text-white font-poppins text-center text-sm sm:text-base">
            Select a new profile picture:
          </p>

          <ul className="flex flex-wrap gap-4 justify-center">
            {avatarOptions.map((avatar) => (
              <li
                key={avatar.id}
                onClick={() => setSelectedAvatarId(avatar.id)}
                className={`cursor-pointer w-[4rem] h-[4rem] sm:w-[5rem] sm:h-[5rem] rounded-full overflow-hidden border-4 ${
                  selectedAvatarId === avatar.id
                    ? 'border-[#B5B5FF]'
                    : 'border-transparent'
                } transition-all duration-200 hover:scale-105`}
              >
                <img
                  src={avatar.file}
                  alt={avatar.name}
                  className="w-full h-full object-cover"
                />
              </li>
            ))}
          </ul>

          <button
            onClick={handleConfirmAvatarChange}
            className="bg-[#B5B5FF] text-[#200448] font-poppins rounded-md py-2 px-4 mt-2 disabled:opacity-50 hover:opacity-90 transition"
            disabled={selectedAvatarId === profilePicId}
          >
            Confirm Change
          </button>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
       
        <button
          onClick={handleLogout}
          className="bg-[#B5B5FF] text-[#200448] font-poppins font-semibold py-2 px-6 rounded-md active:scale-95 hover:text-[#B5B5FF] hover:bg-[#200448] transition"
        >
          Logout
        </button>
        <button
          onClick={handleDeleteAccount}
          className="bg-[#CD3232] text-[#FFFFFF] font-poppins font-semibold py-2 px-6 rounded-md active:scale-95 hover:bg-[#8B1E1E] transition"
        >
          Delete Account
        </button>
      </div>
    </div>
  )
}

export default Settings
