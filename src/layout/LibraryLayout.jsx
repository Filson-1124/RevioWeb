import React from 'react'
import Library from '../pages/Library'
import { Outlet } from 'react-router-dom'

const LibraryLayout = () => {
  return (
    <div>
      
      <Library/>
      <Outlet/>
    </div>
  )
}

export default LibraryLayout
