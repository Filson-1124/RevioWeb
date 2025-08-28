
import React from 'react'
import { IoFolderOpen } from "react-icons/io5";
import { FaMusic } from "react-icons/fa";
import { FaCirclePlus } from "react-icons/fa6";
import { IoMdSettings } from "react-icons/io";
import { NavLink } from 'react-router-dom';
import logo from '../assets/logo.png'
import { IoPersonCircleOutline } from "react-icons/io5";

const sideNavBar = () => {
  return (
    <div className='flex flex-col gap-10 w-[6rem] h-screen bg-[#0B0B0F] pt-2S  py-10' >
       <img src={logo} alt="" className='size-20 ml-2' />
      <ul className='flex gap-10 flex-col px-4 self-center'>
       <NavLink to='/Main/Library'><li className='p-3 duration-300 ease-in-out hover:bg-linear-to-r from-[#B5B5FF] to-[#6F56AA] rounded-2xl hover:scale-105 '><IoFolderOpen color='white' size={40} /></li></NavLink> 
       <NavLink to='/Main/Focus'><li className='p-3 duration-300 ease-in-out hover:bg-linear-to-r from-[#B5B5FF] to-[#6F56AA] rounded-2xl hover:scale-110 '><FaMusic color='white' size={40} /></li></NavLink> 
       <NavLink to='/Main/Create'><li className='p-3 duration-300 ease-in-out hover:bg-linear-to-r from-[#B5B5FF] to-[#6F56AA] rounded-2xl hover:scale-110 '><FaCirclePlus color='white' size={40} /></li></NavLink> 
       <NavLink to='/Main/Settings'><li className='p-3 duration-300 ease-in-out hover:bg-linear-to-r from-[#B5B5FF] to-[#6F56AA] rounded-2xl hover:scale-110 '><IoMdSettings color='white' size={40} /></li></NavLink> 
      </ul>
    </div>
  )
}

export default sideNavBar



