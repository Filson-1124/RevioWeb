import React from 'react'
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom'

import Library, { libraryLoader } from './pages/Library'
import Focus from './pages/Focus'
import Settings from './pages/Settings'
import RootLayout from './layout/RootLayout'
import LibraryLayout from './layout/LibraryLayout'
import Reviewers, { reviewersLoader } from './components/Reviewers'
import Review from './pages/Review' // Removed inline loader import
import Login from './components/Login'
import Register from './components/Register'
import { ToastContainer } from 'react-toastify'
import { AuthProvider } from './components/AuthContext'
import 'react-toastify/dist/ReactToastify.css';
import { AudioProvider } from './components/AudioContext'
import CreateReviewer from './components/CreateReviewer'
import StudyToolsLayout from './layout/StudyToolsLayout'
import StudyToolsMenu from './pages/StudyToolsMenu'
import Gamified, { gamifiedLoader } from './pages/Gamified'
import ForgotPassword from './components/ForgotPassword'
import EditFlashCard from './components/EditFlashCard'
import { editFlashCardLoader } from './components/EditFlashCard'

// New loader imports
import MainLoader from './ReviewerLoaders/MainLoader'
import ACloader from './ReviewerLoaders/ACloader'
import TDloader from './ReviewerLoaders/TDloader'
import STDloader from './ReviewerLoaders/STDloader'
import AIloader from './ReviewerLoaders/AIloader'


const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path="/" element={<Login />} />
      <Route path="/Register" element={<Register />} />
      <Route path="/ResetPassword" element={<ForgotPassword/>}/>
      
      <Route path="/Main" element={<RootLayout />}>
        <Route path="Library" element={<LibraryLayout />}>
          <Route index element={<Library />} loader={libraryLoader} />
          <Route path=":id" element={<Reviewers />} loader={reviewersLoader} />

          {/* Main reviewer route */}
          <Route path=":id/:reviewerId" element={<Review />} loader={MainLoader} />

          {/* Reviewer type routes */}
          <Route path=":id/:reviewerId/ac" element={<Review />} loader={ACloader} />
          <Route path=":id/:reviewerId/td" element={<Review />} loader={TDloader} />
          <Route path=":id/:reviewerId/std" element={<Review />} loader={STDloader} />
          <Route path=":id/:reviewerId/ai" element={<Review />} loader={AIloader} />

          {/* Gamified route */}
          <Route path="/Main/Library/:id/:reviewerId/gamified" element={<Gamified />} loader={gamifiedLoader} />
           <Route path="/Main/Library/:id/:reviewerId/edit" element={<EditFlashCard/>} loader={editFlashCardLoader} />
        </Route>

        <Route path="Focus" element={<Focus />} />

        <Route path="Create" element={<StudyToolsLayout />}>
          <Route index element={<StudyToolsMenu />} />
          <Route path="Submit" element={<CreateReviewer />} />
        </Route>

        <Route path="Settings" element={<Settings />} />
      </Route>
    </Route>
  )
)

const App = () => {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <ToastContainer position="top-center" autoClose={3000} />
    </AuthProvider>
  )
}

export default App
