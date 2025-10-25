import React from 'react'
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
  Outlet,
  useLocation,
} from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import Library, { libraryLoader } from './pages/Library'
import Focus from './pages/Focus'
import Settings from './pages/Settings'
import RootLayout from './layout/RootLayout'
import LibraryLayout from './layout/LibraryLayout'
import Reviewers, { reviewersLoader } from './components/Reviewers'
import Review from './pages/Review'
import Login from './components/Login'
import Register from './components/Register'
import { AuthProvider } from './components/AuthContext'
import { AudioProvider } from './components/AudioContext'
import { PomodoroProvider } from './components/PomodoroContext'
import PomodoroControls from './components/PomodoroControl'

import CreateReviewer from './components/CreateReviewer'
import StudyToolsLayout from './layout/StudyToolsLayout'
import StudyToolsMenu from './pages/StudyToolsMenu'
import Gamified, { gamifiedLoader } from './pages/Gamified'
import ForgotPassword from './components/ForgotPassword'
import EditFlashCard, { editFlashCardLoader } from './components/EditFlashCard'

import MainLoader from './ReviewerLoaders/MainLoader'
import ACloader from './ReviewerLoaders/ACloader'
import TDloader from './ReviewerLoaders/TDloader'
import STDloader from './ReviewerLoaders/STDloader'
import AIloader from './ReviewerLoaders/AIloader'
import Download from './pages/Download'

const PomodoroWrapper = () => {
  const location = useLocation()
  const hidePomodoro = ['/', '/Register', '/ResetPassword'].includes(location.pathname)
  return (
    <>
      <Outlet />
      {!hidePomodoro && <PomodoroControls />}
    </>
  )
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<PomodoroWrapper />}>

      <Route path="/" element={<Login />} />
      <Route path="/Register" element={<Register />} />
      <Route path="/ResetPassword" element={<ForgotPassword />} />


      <Route path="/Main" element={<RootLayout />}>
        <Route path="Library" element={<LibraryLayout />}>
          <Route index element={<Library />} loader={libraryLoader} />
          <Route path=":id" element={<Reviewers />} loader={reviewersLoader} />

          <Route path=":id/:reviewerId" element={<Review />} loader={MainLoader} />
          <Route path=":id/:reviewerId/ac" element={<Review />} loader={ACloader} />
          <Route path=":id/:reviewerId/td" element={<Review />} loader={TDloader} />
          <Route path=":id/:reviewerId/std" element={<Review />} loader={STDloader} />
          <Route path=":id/:reviewerId/ai" element={<Review />} loader={AIloader} />

          <Route
            path="/Main/Library/:id/:reviewerId/gamified"
            element={<Gamified />}
            loader={gamifiedLoader}
          />
          <Route
            path="/Main/Library/:id/:reviewerId/edit"
            element={<EditFlashCard />}
            loader={editFlashCardLoader}
          />
        </Route>

        <Route path="Focus" element={<Focus />} />
        <Route path="Create" element={<StudyToolsLayout />}>
          <Route index element={<StudyToolsMenu />} />
          <Route path="Submit" element={<CreateReviewer />} />
        </Route>

        <Route path="Download" element={<Download />} />
        <Route path="Settings" element={<Settings />} />

        <Route path="review/main/:id/:reviewerId" element={<Review />} loader={MainLoader} />
        <Route path="review/acronym/:id/:reviewerId" element={<Review />} loader={ACloader} />
        <Route path="review/terms/:id/:reviewerId" element={<Review />} loader={TDloader} />
        <Route path="review/summarized/:id/:reviewerId" element={<Review />} loader={STDloader} />
        <Route path="review/ai/:id/:reviewerId" element={<Review />} loader={AIloader} />
      </Route>
    </Route>
  )
)

const App = () => {
  return (
    <AuthProvider>
      <AudioProvider>
        <PomodoroProvider>
          <RouterProvider router={router} />
          
        </PomodoroProvider>
      </AudioProvider>
      <ToastContainer position="bottom-center" />
    </AuthProvider>
    
    
  )
}

export default App
