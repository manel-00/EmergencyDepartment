'use client'
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

import { usePathname } from 'next/navigation'

import {GrDashboard, PiBrowsers, RiStethoscopeLine, LuUser2, PiWheelchairFill, AiOutlineAppstore, PiShoppingCart, MdFlip, FaRegFile, BsEnvelopeOpen, BiLogOutCircle, TbFileInfo, BsPostcard, FaRegComment} from '../assets/icons/vander'

import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';

export default function Sidebar({manuClass}){
    let [manu , setManu] = useState('');
    let [subManu , setSubManu] = useState('');
    let current = usePathname();

    useEffect(()=>{
        setManu(current)
        setSubManu(current)
        window.scrollTo(0, 0);
    },[])
    
    return(
            <nav id="sidebar" className={manuClass}>
                <SimpleBar className="sidebar-content" data-simplebar style={{height:'calc(100% - 60px)'}}>
                    <div className="sidebar-brand">
                        <Link href="/index">
                            <Image src='/images/logo-dark.png' width={115} height={22} className="logo-light-mode" alt=""/>
                            <Image src='/images/logo-light.png' width={115} height={22} className="logo-dark-mode" alt=""/>
                            <span className="sidebar-colored">
                                <Image src='/images/logo-light.png' width={115} height={22} alt=""/>
                            </span>
                        </Link>
                    </div>
        
                    <ul className="sidebar-menu">
                        <li className={`${manu === "/" || "" ? "active" : ""} ms-0`}><Link href="/"><GrDashboard className="me-2 d-inline-block mb-0 icon"/>Dashboard</Link></li>

                        <li className={`sidebar-dropdown ms-0 ${["/index-dark","/index-rtl","/index-rtl-dark","/index-sidebar-dark","/index-sidebar-colored","/layouts-item"].includes(manu)? "active" : ""}`}>
                            <Link href="#" onClick={(e)=>{setSubManu(subManu === "/layouts-item" ? "" : "/layouts-item")}}><PiBrowsers className="me-2 d-inline-block mb-0 icon"/>Layouts</Link>
                            <div className={`sidebar-submenu ${["/index-dark","/index-rtl","/index-rtl-dark","/index-sidebar-dark","/index-sidebar-colored","/layouts-item"].includes(subManu)? "d-block" : ""}`}>
                                <ul>
                                    <li className={`${manu === "/index-sidebar-dark" ? "active" : ""} ms-0`}><Link href="/index-sidebar-dark">Dark Sidebar</Link></li>
                                    <li className={`${manu === "/index-sidebar-colored" ? "active" : ""} ms-0`}><Link href="/index-sidebar-colored">Colored Sidebar</Link></li>
                                </ul>
                            </div>
                        </li>
                        <li className={`${manu === "/appointment" ? "active" : ""} ms-0`}><Link href="/appointment"><RiStethoscopeLine className="me-2 d-inline-block mb-0 icon"/>Appointment</Link></li>

                        <li className={`sidebar-dropdown ms-0 ${["/doctors","/add-doctor","/dr-profile","/doctors-item"].includes(manu)? "active" : ""}`}>
                            <Link href="#" onClick={(e)=>{setSubManu(subManu === "/doctors-item" ? "" : "/doctors-item")}}><LuUser2 className="me-2 d-inline-block mb-0 icon"/>Doctors</Link>
                            <div className={`sidebar-submenu ${["/doctors","/add-doctor","/dr-profile","/doctors-item"].includes(subManu)? "d-block" : ""}`}>
                                <ul>
                                    <li className={`${manu === "/doctors" ? "active" : ""} ms-0`}><Link href="/doctors">Doctors</Link></li>
                                    <li className={`${manu === "/add-doctor" ? "active" : ""} ms-0`}><Link href="/add-doctor">Add Doctor</Link></li>
                                    <li className={`${manu === "/dr-profile" ? "active" : ""} ms-0`}><Link href="/dr-profile">Profile</Link></li>
                                </ul>
                            </div>
                        </li>


                        <li className={`sidebar-dropdown ms-0 ${["/view-specialities","/add-speciality","/doctors-item"].includes(manu)? "active" : ""}`}>
                            <Link href="#" onClick={(e)=>{setSubManu(subManu === "/view-specialities-item" ? "" : "/view-specialities-item")}}><LuUser2 className="me-2 d-inline-block mb-0 icon"/>Specialities</Link>
                            <div className={`sidebar-submenu ${["/doctors","/add-doctor","/dr-profile","/view-specialities-item"].includes(subManu)? "d-block" : ""}`}>
                                <ul>
                                    <li className={`${manu === "/doctors" ? "active" : ""} ms-0`}><Link href="/view-specialities">Specialities</Link></li>
                                    <li className={`${manu === "/add-doctor" ? "active" : ""} ms-0`}><Link href="/add-speciality">Add Specialities</Link></li>
                                </ul>
                            </div>
                        </li>



                        <li className={`sidebar-dropdown ms-0 ${["/patients","/add-patient","/patient-profile","/patient-item"].includes(manu)? "active" : ""}`}>
                            <Link href="#" onClick={(e)=>{setSubManu(subManu === '/patient-item' ? '' : '/patient-item')}}><PiWheelchairFill className="me-2 d-inline-block mb-0 icon"/>Patients</Link>
                            <div className={`sidebar-submenu ${["/patients","/add-patient","/patient-profile","/patient-item"].includes(subManu)? "d-block" : ""}`}>
                                <ul>
                                    <li className={`${manu === "/patients" ? "active" : ""} ms-0`}><Link href="/patients">All Patients</Link></li>
                                    <li className={`${manu === "/add-patient" ? "active" : ""} ms-0`}><Link href="/add-patient">Add Patients</Link></li>
                                    <li className={`${manu === "/patient-profile" ? "active" : ""} ms-0`}><Link href="/patient-profile">Profile</Link></li>
                                </ul>
                            </div>
                        </li>

                        <li className={`sidebar-dropdown ms-0 ${["/chat","/email","/calendar","/app-item"].includes(manu)? "active" : ""}`}>
                            <Link href="#" onClick={(e)=>{setSubManu(subManu === '/app-item' ? '' : '/app-item')}}><AiOutlineAppstore className="me-2 d-inline-block mb-0 icon"/>Apps</Link>
                            <div className={`sidebar-submenu ${["/chat","/email","/calendar","/app-item"].includes(subManu)? "d-block" : ""}`}>
                                <ul>
                                    <li className={`${manu === "/chat" ? "active" : ""} ms-0`}><Link href="/chat">Chat</Link></li>
                                    <li className={`${manu === "/email" ? "active" : ""} ms-0`}><Link href="/email">Email</Link></li>
                                    <li className={`${manu === "/calendar" ? "active" : ""} ms-0`}><Link href="/calendar">Calendar</Link></li>
                                </ul>
                            </div>
                        </li>

                        <li className={`sidebar-dropdown ms-0 ${["/shop","/product-detail","/shopcart","/checkout",'/pharmacy-item'].includes(manu)? "active" : ""}`}>
                            <Link href="#" onClick={(e)=>{setSubManu(subManu === '/pharmacy-item' ? '' : '/pharmacy-item')}}><PiShoppingCart className="me-2 d-inline-block mb-0 icon"/>Pharmacy</Link>
                            <div className={`sidebar-submenu ${["/shop","/product-detail","/shopcart","/checkout",'/pharmacy-item'].includes(subManu)? "d-block" : ""}`}>
                                <ul>
                                    <li className={`${manu === "/shop" ? "active" : ""} ms-0`}><Link href="/shop">Shop</Link></li>
                                    <li className={`${manu === "/product-detail" ? "active" : ""} ms-0`}><Link href="/product-detail">Shop Detail</Link></li>
                                    <li className={`${manu === "/shopcart" ? "active" : ""} ms-0`}><Link href="/shopcart">Shopcart</Link></li>
                                    <li className={`${manu === "/checkout" ? "active" : ""} ms-0`}><Link href="/checkout">Checkout</Link></li>
                                </ul>
                            </div>
                        </li>

                        <li className={`sidebar-dropdown ms-0 ${["/blog-detail","/blogs",'/blog-item'].includes(manu)? "active" : ""}`}>
                            <Link href="#" onClick={(e)=>{setSubManu(subManu === '/blog-item' ? '' : '/blog-item')}}><MdFlip className="me-2 d-inline-block mb-0 icon"/>Blogs</Link>
                            <div className={`sidebar-submenu ${["/blog-detail","/blogs",'/blog-item'].includes(subManu)? "d-block" : ""}`}>
                                <ul>
                                    <li className={`${manu === "/blogs" ? "active" : ""} ms-0`}><Link href="/blogs">Blogs</Link></li>
                                    <li className={`${manu === "/blog-detail" ? "active" : ""} ms-0`}><Link href="/blog-detail">Blog Detail</Link></li>
                                </ul>
                            </div>
                        </li>

                        <li className={`sidebar-dropdown ms-0 ${["/faqs","/review","/invoice-list", "/invoice", "/terms",  "/privacy", "/blank-page", '/page-item'].includes(manu)? "active" : ""}`}>
                            <Link href="#" onClick={(e)=>{setSubManu(subManu === '/page-item' ? '' : '/page-item')}}><FaRegFile className="me-2 d-inline-block mb-0 icon"/>Pages</Link>
                            <div className={`sidebar-submenu ${["/faqs","/review","/invoice-list", "/invoice", "/terms",  "/privacy", "/blank-page", '/page-item'].includes(subManu)? "d-block" : ""}`}>
                                <ul>
                                    <li className={`${manu === "/faqs" ? "active" : ""} ms-0`}><Link href="/faqs">FAQs</Link></li>
                                    <li className={`${manu === "/review" ? "active" : ""} ms-0`}><Link href="/review">Reviews</Link></li>
                                    <li className={`${manu === "/invoice-list" ? "active" : ""} ms-0`}><Link href="/invoice-list">Invoice List</Link></li>
                                    <li className={`${manu === "/invoice" ? "active" : ""} ms-0`}><Link href="/invoice">Invoice</Link></li>
                                    <li className={`${manu === "/terms" ? "active" : ""} ms-0`}><Link href="/terms">Terms & Policy</Link></li>
                                    <li className={`${manu === "/privacy" ? "active" : ""} ms-0`}><Link href="/privacy">Privacy Policy</Link></li>
                                    <li className={`${manu === "/blank-page" ? "active" : ""} ms-0`}><Link href="/blank-page">Blank Page</Link></li>
                                </ul>
                            </div>
                        </li>
            
                        <li className={`sidebar-dropdown ms-0 ${["/email-confirmation","/email-password-reset",'/email-alert',"/email-invoice", "/mail-item"].includes(manu)? "active" : ""}`}>
                            <Link href="#" onClick={(e)=>{setSubManu(subManu === '/mail-item' ? '' : '/mail-item')}}><BsEnvelopeOpen className="me-2 d-inline-block mb-0 icon"/>Email Template </Link>
                            <div className={`sidebar-submenu ${["/email-confirmation","/email-password-reset",'/email-alert',"/email-invoice", "/mail-item"].includes(subManu)? "d-block" : ""}`}>
                                <ul>
                                    <li className={`${manu === "/email-confirmation" ? "active" : ""} ms-0`}><Link href="/email-confirmation">Confirmation</Link></li>
                                    <li className={`${manu === "/email-password-reset" ? "active" : ""} ms-0`}><Link href="/email-password-reset">Reset Password</Link></li>
                                    <li className={`${manu === "/email-alert" ? "active" : ""} ms-0`}><Link href="/email-alert">Alert</Link></li>
                                    <li className={`${manu === "/email-invoice" ? "active" : ""} ms-0`}><Link href="/email-invoice">Invoice</Link></li>
                                </ul>
                            </div>
                        </li>

                        <li className={`sidebar-dropdown ms-0 ${["/login","/signup",'/forgot-password',"/lock-screen", "/auth-item"].includes(manu)? "active" : ""}`}>
                            <Link href="#" onClick={(e)=>{setSubManu(subManu === '/auth-item' ? '' : '/auth-item')}}><BiLogOutCircle className="me-2 d-inline-block mb-0 icon"/>Authentication</Link>
                            <div className={`sidebar-submenu ${["/login","/signup",'/forgot-password',"/lock-screen", "/auth-item"].includes(subManu)? "d-block" : ""}`}>
                                <ul>
                                    <li className={`${manu === "/login" ? "active" : ""} ms-0`}><Link href="/login">Login</Link></li>
                                    <li className={`${manu === "/signup" ? "active" : ""} ms-0`}><Link href="/signup">Signup</Link></li>
                                    <li className={`${manu === "/forgot-password" ? "active" : ""} ms-0`}><Link href="/forgot-password">Forgot Password</Link></li>
                                    <li className={`${manu === "/lock-screen" ? "active" : ""} ms-0`}><Link href="/lock-screen">Lock Screen</Link></li>
                                </ul>
                            </div>
                        </li>

                        <li className={`sidebar-dropdown ms-0 ${["/ui-button","/ui-badges",'/ui-alert',"/ui-dropdown", "/ui-typography", "/ui-background", "/ui-text", "/ui-tooltip-popover","/ui-shadow", "/ui-border", "/ui-form", "/ui-pagination", "/ui-avatar", "/ui-modals", "/ui-icons", '/ui-item'].includes(manu)? "active" : ""}`}>
                            <Link href="#" onClick={(e)=>{setSubManu(subManu === '/ui-item' ? '' : '/ui-item')}}><TbFileInfo className="me-2 d-inline-block mb-0 icon"/>UI Components </Link>
                            <div className={`sidebar-submenu ${["/ui-button","/ui-badges",'/ui-alert',"/ui-dropdown", "/ui-typography", "/ui-background", "/ui-text", "/ui-tooltip-popover","/ui-shadow", "/ui-border", "/ui-form", "/ui-pagination", "/ui-avatar", "/ui-modals", "/ui-icons", '/ui-item'].includes(subManu)? "d-block" : ""}`}>
                                <ul>
                                    <li className={`${manu === "/ui-button" ? "active" : ""} ms-0`}><Link href="/ui-button">Buttons</Link></li>
                                    <li className={`${manu === "/ui-badges" ? "active" : ""} ms-0`}><Link href="/ui-badges">Badges</Link></li>
                                    <li className={`${manu === "/ui-alert" ? "active" : ""} ms-0`}><Link href="/ui-alert">Alert</Link></li>
                                    <li className={`${manu === "/ui-dropdown" ? "active" : ""} ms-0`}><Link href="/ui-dropdown">Dropdowns</Link></li>
                                    <li className={`${manu === "/ui-typography" ? "active" : ""} ms-0`}><Link href="/ui-typography">Typography</Link></li>
                                    <li className={`${manu === "/ui-background" ? "active" : ""} ms-0`}><Link href="/ui-background">Background</Link></li>
                                    <li className={`${manu === "/ui-text" ? "active" : ""} ms-0`}><Link href="/ui-text">Text Color</Link></li>
                                    <li className={`${manu === "/ui-tooltip-popover" ? "active" : ""} ms-0`}><Link href="/ui-tooltip-popover">Tooltips & Popovers</Link></li>
                                    <li className={`${manu === "/ui-shadow" ? "active" : ""} ms-0`}><Link href="/ui-shadow">Shadows</Link></li>
                                    <li className={`${manu === "/ui-border" ? "active" : ""} ms-0`}><Link href="/ui-border">Border</Link></li>
                                    <li className={`${manu === "/ui-form" ? "active" : ""} ms-0`}><Link href="/ui-form">Form Elements</Link></li>
                                    <li className={`${manu === "/ui-pagination" ? "active" : ""} ms-0`}><Link href="/ui-pagination">Pagination</Link></li>
                                    <li className={`${manu === "/ui-avatar" ? "active" : ""} ms-0`}><Link href="/ui-avatar">Avatars</Link></li>
                                    <li className={`${manu === "/ui-modals" ? "active" : ""} ms-0`}><Link href="/ui-modals">Modals</Link></li>
                                    <li className={`${manu === "/ui-icons" ? "active" : ""} ms-0`}><Link href="/ui-icons">Icons</Link></li>
                                </ul>
                            </div>
                        </li>

                        <li className={`sidebar-dropdown ms-0 ${["/comingsoon","/maintenance",'/error',"/thankyou", "/miscellaneous-item"].includes(manu)? "active" : ""}`}>
                            <Link href="#" onClick={(e)=>{setSubManu(subManu === '/miscellaneous-item' ? '' : '/miscellaneous-item')}}><BsPostcard className="me-2 d-inline-block mb-0 icon"/>Miscellaneous </Link>
                            <div className={`sidebar-submenu ${["/comingsoon","/maintenance",'/error',"/thankyou", "/miscellaneous-item"].includes(subManu)? "d-block" : ""}`}>
                                <ul>
                                    <li className="ms-0"><Link href="/comingsoon">Comingsoon</Link></li>
                                    <li className="ms-0"><Link href="/maintenance">Maintenance</Link></li>
                                    <li className="ms-0"><Link href="/error">404 !</Link></li>
                                    <li className="ms-0"><Link href="/thankyou">Thank you...!</Link></li>
                                </ul>
                            </div>
                        </li>
                    </ul>
                    
                </SimpleBar>
                <ul className="sidebar-footer list-unstyled mb-0">
                    <li className="list-inline-item mb-0 ms-1">
                        <Link href="#" className="btn btn-icon btn-pills btn-soft-primary">
                            <FaRegComment />
                        </Link>
                    </li>
                </ul>
            </nav>
    )
}