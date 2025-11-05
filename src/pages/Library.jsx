import React from 'react';
import { Link, useLoaderData } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaFolder, FaFolderOpen } from "react-icons/fa";
import { auth, db } from '../components/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from "firebase/auth";

const Library = () => {
  const foldersData = useLoaderData();

  if (!Array.isArray(foldersData)) return null;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15, // Delay between each card
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 30 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 12,
      },
    },
  };

  return (
    <div className='pb-[30%]'>
      {/* Header Section */}
      <div className='flex flex-col gap-7 p-10'>
        <h1 className='text-white text-xl font-bold md:text-4xl lg:text-5xl font-poppinsbold'>
          LIBRARY
        </h1>
        <hr className='text-white' />
      </div>

      {/* Folder Grid with Animation */}
      <motion.div
        className='px-6 sm:px-10 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 text-start'
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {foldersData.map(folder => {
          const isLongTitle = folder.title.length > 25;
          const textSize = isLongTitle
            ? 'text-xs sm:text-sm md:text-md'
            : 'text-sm sm:text-base md:text-lg';

          return (
            <motion.div
              key={folder.id}
              variants={itemVariants}
            >
              <Link
                to={folder.id}
                className='transition-all active:scale-95 group flex justify-start items-center gap-4 bg-[#20202C] p-4 sm:p-5 rounded-2xl duration-100 ease-in hover:scale-105'
              >
                <div className="relative flex-shrink-0 w-20 h-20">
                  <FaFolder
                    color='white'
                    size={80}
                    className='absolute top-0 left-0 opacity-100 group-hover:opacity-0 transition-all duration-200'
                  />
                  <FaFolderOpen
                    color='white'
                    size={80}
                    className='absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-all duration-200'
                  />
                </div>

                <h4
                  className={`text-white font-medium leading-snug break-words line-clamp-2 ${textSize}`}
                  title={folder.title}
                >
                  {folder.title}
                </h4>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default Library;


// Loader for Firebase Data
export const libraryLoader = async () => {
  // Wrap Firebase's auth check in a promise
  const getUser = () => {
    return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        if (user && user.emailVerified) {
          resolve(user);
        } else {
          reject("Unauthorized");
        }
      });
    });
  };

  try {
    const user = await getUser();
    const uid = user.uid;

    const foldersRef = collection(db, 'users', uid, 'folders');
    const snapshot = await getDocs(foldersRef);

    const folders = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || doc.id,
      };
    });

    return folders;
  } catch (error) {
    console.error("Error loading folders:", error);
    throw new Response("Unauthorized", { status: 401 });
  }
};
