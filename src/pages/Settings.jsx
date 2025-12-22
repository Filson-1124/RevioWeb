import React, { useState, useEffect } from 'react'
import { useAuth } from '../components/AuthContext'
import {
  signOut,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth'
import { auth, db } from '../components/firebase'
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { avatarOptions } from '../assets/3D Avatars/avatars'
import accountDeleteImage from '../assets/deleteAccount.png'
import { motion } from 'motion/react'
import { IonButton, IonContent, IonLabel, IonText } from '@ionic/react'

const Settings = () => {
  const { setIsLoggedIn, isLoggedIn } = useAuth()
  const [user, setUser] = useState(null)
  const [username, setUsername] = useState('')
  const [profilePicId, setProfilePicId] = useState('')
  const [selectedAvatarId, setSelectedAvatarId] = useState('')
  const [profilePic, setProfilePic] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')

  const navigate = useNavigate()

 
  const titleVariants = {
    hidden: { opacity: 0, x: 100 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: 'spring', stiffness: 300, damping: 15 },
    },
  }

  const inputContainerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  }

  const inputVariants = {
    hidden: { opacity: 0, x: 100 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: 'spring', stiffness: 300, damping: 15 },
    },
  }

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  }

  const contentVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 15 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 220, damping: 20 },
    },
    exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.2 } },
  }

 
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

  const handleDeleteAccount = () => {
    setIsDeleting(true)
  }

 
  const openPasswordModal = () => {
    setIsDeleting(false)
    setIsPasswordModalOpen(true)
  }

  const confirmDeleteAccount = async () => {
    const currentUser = auth.currentUser
    if (!currentUser) return

    if (!deletePassword) {
      toast.error('Please enter your password.')
      return
    }

    try {
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        deletePassword
      )

      await reauthenticateWithCredential(currentUser, credential)

      await deleteDoc(doc(db, 'users', currentUser.uid))
      await deleteUser(currentUser)

      toast.success('Your account has been permanently deleted.')
      navigate('/login')
    } catch (error) {
      console.error(error)

      if (error.code === 'auth/wrong-password') {
        toast.error('Incorrect password.')
      } else if (error.code === 'auth/too-many-requests') {
        toast.error('Too many attempts, try again later.')
      } else {
        toast.error('Could not delete account.')
      }
    }
  }

 
  useEffect(() => {
    if (!profilePicId) return
    const selectedAvatar = avatarOptions.find((a) => a.id === profilePicId)
    setProfilePic(selectedAvatar ? selectedAvatar.file : null)
  }, [profilePicId])

  const handleConfirmAvatarChange = async () => {
    if (!user || !selectedAvatarId) return
    try {
      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, { avatarId: selectedAvatarId })
      setProfilePicId(selectedAvatarId)
      toast.success('Profile picture updated!')
    } catch (err) {
      toast.error('Failed to update.')
    }
  }

  const handleLogout = async () => {
    if (isLoggedIn) {
      await signOut(auth)
      localStorage.removeItem('isLoggedInWeb')
      setIsLoggedIn(false)
      toast.success('Logged out!')
      navigate('/')
    }
  }

  if (!user)
    return (
      <p className="text-white text-center py-20">Loading user data...</p>
    )

  return (
    <div className="flex flex-col mb-10 gap-8 p-6 pb-[45%] sm:pb-[40%] sm:p-10 md:p-16 md:pb-0 lg:p-20">
      <motion.IonTitle
        variants={titleVariants}
        initial="hidden"
        animate="visible"
        className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-poppinsbold"
      >
        SETTINGS
      </motion.IonTitle>

      <div className="border border-[#565656] rounded-lg p-6 sm:p-10 flex flex-col lg:flex-row gap-10 bg-[#1E1E2E]">
        <motion.div
          variants={inputContainerVariants}
          initial="hidden"
          animate="visible"
          className="w-full lg:w-[40%] flex flex-col gap-4"
        >
          <div>
            <IonLabel className="text-white font-poppins text-sm sm:text-base">
              Username:
            </IonLabel>
            <motion.div
              className="bg-[#252533] text-white p-2 rounded-md"
              variants={inputVariants}
            >
              <input value={username} readOnly />
            </motion.div>
            <br/>
            <IonLabel className="text-white font-poppins text-sm sm:text-base">
              Email:
            </IonLabel>
            <motion.div
              className="bg-[#252533] text-white p-2 rounded-md"
              variants={inputVariants}
            >
              <input value={user.email} readOnly />
            </motion.div>
          </div>
        </motion.div>

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

          <IonText>
            <p className="text-white font-poppins text-center text-sm sm:text-base">
              Select a new profile picture:
            </p>
          </IonText>

          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <ul className="flex flex-wrap gap-4 justify-center">
              {avatarOptions.map((avatar) => (
                <motion.div key={avatar.id} variants={contentVariants}>
                  <li
                    onClick={() => setSelectedAvatarId(avatar.id)}
                    className={`cursor-pointer w-[4rem] h-[4rem] sm:w-[5rem] sm:h-[5rem] rounded-full overflow-hidden border-4 ${
                      selectedAvatarId === avatar.id
                        ? 'border-[#B5B5FF]'
                        : 'border-transparent'
                    } hover:scale-105 transition`}
                  >
                    <img
                      src={avatar.file}
                      alt={avatar.name}
                      className="w-full h-full object-cover"
                    />
                  </li>
                </motion.div>
              ))}
            </ul>
          </motion.div>

          <IonButton
            color="primary"
            expand="block"
            onClick={handleConfirmAvatarChange}
            disabled={selectedAvatarId === profilePicId}
          >
            Confirm Change
          </IonButton>
        </div>
      </div>

     
      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
        <IonButton
          color="primary"
          expand="block"
          onClick={handleLogout}
        >
          Logout
        </IonButton>

        <IonButton
          color="danger"
          expand="block"
          onClick={handleDeleteAccount}
        >
          Delete Account
        </IonButton>
      </div>

    
      {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-[#1E1E2E] rounded-2xl p-6 text-center w-[90%] sm:w-[400px] border border-[#B5B5FF]">

            <img src={accountDeleteImage} alt="Warning" className="h-50 md:h-80 mx-auto mb-4" />

            <IonText>
              <h2 className="text-white text-lg font-bold mb-3">
                Delete Account
              </h2>
            </IonText>

            <IonText>
              <p className="text-gray-400 text-sm mb-6">
                Are you sure you want to permanently delete your account?
                <br />
                This action cannot be undone.
              </p>
            </IonText>

            <div className="flex justify-center gap-4">
              <IonButton
                color="medium"
                expand="block"
                onClick={() => setIsDeleting(false)}
              >
                Cancel
              </IonButton>

             
              <IonButton
                color="danger"
                expand="block"
                onClick={openPasswordModal}
              >
                Delete
              </IonButton>
            </div>

          </div>
        </div>
      )}

     
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
          <div className="bg-[#1E1E2E] p-6 w-[90%] sm:w-[400px] rounded-2xl text-center border border-[#B5B5FF]">

            <IonText>
              <h2 className="text-white text-lg font-bold mb-4">
              Re-enter Password</h2>
            </IonText>

            <input
              type="password"
              placeholder="Enter password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              className="w-full p-2 rounded-md mb-4 bg-[#252533] text-white border border-gray-600 outline-none"
            />

            <div className="flex justify-center gap-4">
              <IonButton
                color="medium"
                expand="block"
                onClick={() => setIsPasswordModalOpen(false)}
              >
                Cancel
              </IonButton>

              <IonButton
                color="danger"
                expand="block"
                onClick={confirmDeleteAccount}
              >
                Confirm Delete
              </IonButton>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}

export default Settings
