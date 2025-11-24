import React from 'react'
import { IoFolderOpen } from "react-icons/io5"
import { FaMusic } from "react-icons/fa"
import { FaCirclePlus } from "react-icons/fa6"
import { IoMdSettings } from "react-icons/io"
import { NavLink } from 'react-router-dom'
import logo from '../assets/logo.png'
import { FaMobileAlt } from "react-icons/fa";
import { useNavigate } from 'react-router-dom'

const NavBar = () => {
 const navigate=useNavigate()
  return (
   <div
  className="
    fixed bottom-0 left-0 w-full h-[11%] bg-[#0B0B0F] p-1
    flex justify-center items-center z-50
    md:static md:flex-col md:w-[6rem] md:h-screen md:justify-start md:py-10
    overflow-hidden
  "
>
  <img
    src={logo}
    alt="Logo"
    className="hidden md:block size-20 mb-10 cursor-pointer hover:scale-110 transition-transform duration-300"
    onClick={() => navigate('/Main/Library')}
  />

  <ul className="flex flex-row gap-4 px-4 p-5 sm:gap-5 items-center md:flex-col md:gap-10 lg:gap-6">

   
    <NavLink to="/Main/Library" className="group">
      <li className="p-3 duration-300 ease-in-out hover:bg-gradient-to-r from-[#B5B5FF] to-[#6F56AA] rounded-2xl hover:scale-105">
        <IoFolderOpen
          color="white"
          size={30}
          className="transition-transform duration-300 group-hover:-translate-y-1"
        />
      </li>
    </NavLink>

    <NavLink to="/Main/Focus" className="group">
      <li className="p-3 duration-300 ease-in-out hover:bg-gradient-to-r from-[#B5B5FF] to-[#6F56AA] rounded-2xl hover:scale-110">
        <FaMusic
          color="white"
          size={30}
          className="transition-transform duration-500 group-hover:scale-125 group-hover:rotate-[10deg]"
        />
      </li>
    </NavLink>


    <NavLink to="/Main/Create" className="group">
      <li className="p-3 duration-300 ease-in-out hover:bg-gradient-to-r from-[#B5B5FF] to-[#6F56AA] rounded-2xl hover:scale-110">
        <FaCirclePlus
          color="white"
          size={50}
          className="md:size-9 transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-110"
        />
      </li>
    </NavLink>

 
    <NavLink to="/Main/Settings" className="group">
      <li className="p-3 duration-300 ease-in-out hover:bg-gradient-to-r from-[#B5B5FF] to-[#6F56AA] rounded-2xl hover:scale-110">
        <IoMdSettings
          color="white"
          size={30}
          className="transition-transform duration-500 group-hover:rotate-[360deg]"
        />
      </li>
    </NavLink>

    
    <NavLink to="/Main/Download" className="group">
      <li className="p-3 duration-300 ease-in-out hover:bg-gradient-to-r from-[#B5B5FF] to-[#6F56AA] rounded-2xl hover:scale-110">
        <FaMobileAlt
          color="white"
          size={30}
          className="transition-transform duration-500 group-hover:rotate-[8deg] group-hover:scale-110"
        />
      </li>
    </NavLink>

  </ul>
</div>

  )
}

export default NavBar
