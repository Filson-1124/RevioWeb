import React from 'react';
import { Link, useLoaderData } from 'react-router-dom';
import { FaFolder } from "react-icons/fa";
import { auth, db } from '../components/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from "firebase/auth";

const Library = () => {
  const foldersData = useLoaderData();

  if (!Array.isArray(foldersData)) return null;

  return (
    <div>
      <div className='flex flex-col gap-7 p-20'>
        <h1 className='text-white text-xl font-bold md:text-4xl lg:text-5xl font-poppinsbold'>LIBRARY</h1>
        <hr className='text-white' />
      </div>
      <div className='px-20 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-10'>
        {foldersData.map(folder => (
          <Link
            key={folder.id}
            className='flex justify-center gap-10 bg-[#20202C] p-5 rounded-2xl duration-150 ease-in hover:scale-110'
            to={folder.id}
          >
            <FaFolder color='white' size={80} />
            <h4 className='text-white self-center'>{folder.title}</h4>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Library;

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
