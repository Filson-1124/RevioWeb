import React from 'react'
import Library from '../pages/Library'
import { Outlet } from 'react-router-dom'

const LibraryLayout = () => {
  return (
    
    <div className="flex flex-col h-screen overflow-hidden ">
      
     
      <div className="flex-shrink-0">
        <Library />
      </div>

      
      <main className="flex-1 overflow-y-auto no-scrollbar pb-24 md:pb-0">
        <Outlet />
      </main>
    </div>
  )
}

export default LibraryLayout
