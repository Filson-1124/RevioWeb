import React from 'react'
import { IoFolderOpen } from "react-icons/io5"
import { FaMusic } from "react-icons/fa"
import { FaCirclePlus } from "react-icons/fa6"
import { IoMdSettings } from "react-icons/io"
import { NavLink } from 'react-router-dom'
import logo from '../assets/logo.png'
import { FaMobileAlt } from "react-icons/fa";

const NavBar = () => {
  return (
    <div
      className="
        fixed bottom-0 left-0 w-full h-[10%] bg-[#0B0B0F]
        flex justify-center items-center z-50
        md:static md:flex-col md:w-[6rem] md:h-screen md:justify-start md:py-10
        overflow-hidden
      "
    >
      <img src={logo} alt="Logo" className="hidden md:block size-20 mb-10" />
      <ul className="flex flex-row gap-4 px-4 p-5 sm:gap-5 items-center md:flex-col md:gap-10">
        <NavLink to='/Main/Library'>
          <li className="p-3 duration-300 ease-in-out hover:bg-gradient-to-r from-[#B5B5FF] to-[#6F56AA] rounded-2xl hover:scale-105">
            <IoFolderOpen color="white" size={30} />
          </li>
        </NavLink>
        <NavLink to='/Main/Focus'>
          <li className="p-3 duration-300 ease-in-out hover:bg-gradient-to-r from-[#B5B5FF] to-[#6F56AA] rounded-2xl hover:scale-110">
            <FaMusic color="white" size={30} />
          </li>
        </NavLink>
        <NavLink to='/Main/Create'>
          <li className="p-3 duration-300 ease-in-out hover:bg-gradient-to-r from-[#B5B5FF] to-[#6F56AA] rounded-2xl hover:scale-110">
            <FaCirclePlus color="white" size={50} className='md:size-9' />
          </li>
        </NavLink>
        <NavLink to='/Main/Settings'>
          <li className="p-3 duration-300 ease-in-out hover:bg-gradient-to-r from-[#B5B5FF] to-[#6F56AA] rounded-2xl hover:scale-110">
            <IoMdSettings color="white" size={30} />
          </li>
        </NavLink>
        <NavLink to='/Main/Download'>
          <li className="p-3 duration-300 ease-in-out hover:bg-gradient-to-r from-[#B5B5FF] to-[#6F56AA] rounded-2xl hover:scale-110 md:hidden">
            <FaMobileAlt color="white" size={30} />
          </li>
        </NavLink>
      </ul>
    </div>
  )
}

export default NavBar
