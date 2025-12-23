import React from 'react'
import { IoFolderOpen } from "react-icons/io5"
import { FaMusic } from "react-icons/fa"
import { FaCirclePlus } from "react-icons/fa6"
import { IoMdSettings } from "react-icons/io"
import { FaMobileAlt } from "react-icons/fa"
import { NavLink, useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'
import { IonFooter, IonToolbar, IonImg } from '@ionic/react'

const NavBar = () => {
  const navigate = useNavigate()
  return (
    <IonFooter
      className={`
        fixed bottom-0 left-0 w-full h-16
        md:static md:w-28 md:h-screen md:py-10
        bg-[#0B0B0F] p-1
        flex justify-center items-center
        md:flex-col md:justify-start md:items-center
        overflow-hidden z-50
      `}
    >
      <IonToolbar className="p-0 bg-transparent w-full">
        <div className="w-full flex flex-col md:flex-col items-center justify-center md:justify-start">

          {/* Logo (desktop only) */}
          <IonImg
            src={logo}
            alt="Logo"
            className="hidden md:block w-12 mb-10 cursor-pointer hover:scale-110 transition-transform duration-300"
            onClick={() => navigate('/Main/Library')}
          />

          {/* Nav buttons */}
          <ul className="flex flex-row justify-center items-center gap-4 md:flex-col md:gap-10 lg:gap-6 w-full">
            <NavLink to="/Main/Library" className="group">
              <li className="p-3 duration-300 ease-in-out hover:bg-gradient-to-r from-[#B5B5FF] to-[#6F56AA] rounded-2xl hover:scale-105">
                <IoFolderOpen color="white" size={30} className="transition-transform duration-300 group-hover:-translate-y-1"/>
              </li>
            </NavLink>

            <NavLink to="/Main/Focus" className="group">
              <li className="p-3 duration-300 ease-in-out hover:bg-gradient-to-r from-[#B5B5FF] to-[#6F56AA] rounded-2xl hover:scale-110">
                <FaMusic color="white" size={30} className="transition-transform duration-500 group-hover:scale-125 group-hover:rotate-[10deg]" />
              </li>
            </NavLink>

            <NavLink to="/Main/Create" className="group">
              <li className="p-3 duration-300 ease-in-out hover:bg-gradient-to-r from-[#B5B5FF] to-[#6F56AA] rounded-2xl hover:scale-110">
                <FaCirclePlus color="white" size={50} className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-110"/>
              </li>
            </NavLink>

            <NavLink to="/Main/Settings" className="group">
              <li className="p-3 duration-300 ease-in-out hover:bg-gradient-to-r from-[#B5B5FF] to-[#6F56AA] rounded-2xl hover:scale-110">
                <IoMdSettings color="white" size={30} className="transition-transform duration-500 group-hover:rotate-[360deg]" />
              </li>
            </NavLink>

            <NavLink to="/Main/Download" className="group">
              <li className="p-3 duration-300 ease-in-out hover:bg-gradient-to-r from-[#B5B5FF] to-[#6F56AA] rounded-2xl hover:scale-110">
                <FaMobileAlt color="white" size={30} className="transition-transform duration-500 group-hover:rotate-[8deg] group-hover:scale-110" />
              </li>
            </NavLink>
          </ul>
        </div>
      </IonToolbar>
    </IonFooter>
  )
}

export default NavBar
