import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import { signOut, deleteUser } from 'firebase/auth';
import { auth, db } from '../components/firebase';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { avatarOptions } from '../assets/3D Avatars/avatars';
 // adjust path if needed



const Settings = () => {
  const { setIsLoggedIn, isLoggedIn } = useAuth();
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [profilePicId, setProfilePicId] = useState('');
  const [selectedAvatarId, setSelectedAvatarId] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const navigate = useNavigate();

  // Fetch user data
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        const docRef = doc(db, 'users', firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUsername(data.username);
          setProfilePicId(data.avatarId);
          setSelectedAvatarId(data.avatarId); // also set selection
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);



   const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to permanently delete your account?"
    );

    if (!confirmDelete) return;

    const user = auth.currentUser;
    if (user) {
      try {
        // delete from Firestore
        await deleteDoc(doc(db, "users", user.uid));

        // delete from Firebase Auth
        await deleteUser(user);

        alert("Your account has been permanently deleted.");
        navigate("/login");
      } catch (error) {
        console.error("Delete Account Error:", error);

        if (error.code === "auth/requires-recent-login") {
          alert("Please log in again to delete your account.");
          navigate("/login");
        } else {
          alert("Could not delete account.");
        }
      }
    }
  };

  // Match profilePicId to file using switch
  useEffect(() => {
    if (!profilePicId) return;

    let selectedAvatar = null;

    switch (profilePicId) {
      case "avatar1":    selectedAvatar = avatarOptions.find(avatar => avatar.id === profilePicId);
        if (selectedAvatar) {
          setProfilePic(selectedAvatar.file);
        } else {
          setProfilePic(null);
        }
      case "avatar2":
            selectedAvatar = avatarOptions.find(avatar => avatar.id === profilePicId);
        if (selectedAvatar) {
          setProfilePic(selectedAvatar.file);
        } else {
          setProfilePic(null);
        }
      case "avatar3":
            selectedAvatar = avatarOptions.find(avatar => avatar.id === profilePicId);
        if (selectedAvatar) {
          setProfilePic(selectedAvatar.file);
        } else {
          setProfilePic(null);
        }
      case "avatar4":
            selectedAvatar = avatarOptions.find(avatar => avatar.id === profilePicId);
        if (selectedAvatar) {
          setProfilePic(selectedAvatar.file);
        } else {
          setProfilePic(null);
        }
      case "avatar5":
            selectedAvatar = avatarOptions.find(avatar => avatar.id === profilePicId);
        if (selectedAvatar) {
          setProfilePic(selectedAvatar.file);
        } else {
          setProfilePic(null);
        }
      case "avatar6":
            selectedAvatar = avatarOptions.find(avatar => avatar.id === profilePicId);
        if (selectedAvatar) {
          setProfilePic(selectedAvatar.file);
        } else {
          setProfilePic(null);
        }
      case "avatar7":
            selectedAvatar = avatarOptions.find(avatar => avatar.id === profilePicId);
        if (selectedAvatar) {
          setProfilePic(selectedAvatar.file);
        } else {
          setProfilePic(null);
        }
      case "avatar8":
        selectedAvatar = avatarOptions.find(avatar => avatar.id === profilePicId);
        if (selectedAvatar) {
          setProfilePic(selectedAvatar.file);
        } else {
          setProfilePic(null);
        }
        break;
      default:
        setProfilePic(null);
    }
  }, [profilePicId]);

  // Confirm and save selected avatar
  const handleConfirmAvatarChange = async () => {
    if (!user || !selectedAvatarId) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        avatarId: selectedAvatarId,
      });
      setProfilePicId(selectedAvatarId); // update the current profile
      toast.success('Profile picture updated!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update profile picture.');
    }
  };

  // Logout
  const handleLogout = async () => {
    if (isLoggedIn) {
      await signOut(auth);
      localStorage.removeItem('isLoggedInWeb');
      setIsLoggedIn(false);
      toast.success('User Logged Out Successfully, see you soon!');
      navigate('/');
    }
  };

  if (!user) return <p className="text-white p-20">Loading user data...</p>;

  return (
    <div className='flex flex-col gap-7 p-20'>
      <h1 className='text-white text-xl font-bold md:text-4xl lg:text-5xl font-poppinsbold'>SETTINGS</h1>

      <div className='border-1 border-white p-10 flex flex-col lg:flex-row gap-10'>
        {/* User Info */}
        <div className='w-full lg:w-[40%] flex flex-col gap-2'>
          <label className='text-white font-poppins'>Username:</label>
          <input value={username} readOnly className='bg-[#252533] text-white p-1' />

          <label className='text-white font-poppins'>Email:</label>
          <input value={user.email} readOnly className='bg-[#252533] text-white p-1' />

          <label className='text-white font-poppins'>Password:</label>
          <input type="password" value="********" readOnly className='bg-[#252533] text-white p-1' />

          <button className='bg-[#B5B5FF] text-[#200448] font-poppins rounded p-2 mt-4'>Change Password</button>
        </div>

        {/* Avatar Section */}
        <div className='w-full lg:w-[60%] flex flex-col gap-10 items-center'>
          <div className='w-[7rem] h-[7rem] rounded-full overflow-hidden bg-white'>
            {profilePic && (
              <img src={profilePic} alt="Profile" className='w-full h-full object-cover' />
            )}
          </div>

          <p className='text-white font-poppins'>Select a new profile picture:</p>

          <ul className='flex flex-wrap gap-5 justify-center'>
            {avatarOptions.map((avatar) => (
              <li
                key={avatar.id}
                onClick={() => setSelectedAvatarId(avatar.id)}
                className={`cursor-pointer w-[5rem] h-[5rem] rounded-full overflow-hidden border-4 ${
                  selectedAvatarId === avatar.id ? 'border-[#B5B5FF]' : 'border-transparent'
                } transition-all duration-200 hover:scale-105`}
              >
                <img
                  src={avatar.file}
                  alt={avatar.name}
                  className='w-full h-full object-cover'
                />
              </li>
            ))}
          </ul>

          <button
            onClick={handleConfirmAvatarChange}
            className='bg-[#B5B5FF] text-[#200448] font-poppins rounded p-2 mt-4 disabled:opacity-50'
            disabled={selectedAvatarId === profilePicId}
          >
            Confirm Change
          </button>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className='bg-[#B5B5FF] text-[#200448] font-poppins font-semibold p-2 w-50 rounded self-center active:scale-95 hover:text-[#B5B5FF] hover:bg-[#200448]'
      >
        Logout
      </button>
      <button
      onClick={handleDeleteAccount}
        className='bg-[#CD3232] text-[#FFFFFF] font-poppins font-semibold p-2 w-50 rounded self-center active:scale-95 hover:text-[#B5B5FF] hover:bg-[#200448]'
      >
        Delete
      </button>
    </div>
  );
};

export default Settings;
