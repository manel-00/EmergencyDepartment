'use client'
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {RiAirplayLine,RiCalendarCheckLine,RiTimerLine, RiPagesLine,RiMailUnreadLine,RiUser2Line,RiUserSettingsLine,RiEmpathizeLine,RiChat1Line,RiChatVoiceLine,RiLoginCircleLine, RiDeviceRecoverLine} from '../assets/icons/vander'
import Image from "next/image";

export default function Sidebar({colClass}){
    let location = usePathname()
    
    return(
        <>
        <div className={colClass}>
            <div className="rounded shadow sticky-bar">
                <div className="card border-0">
                    <Image src='/images/doctors/profile-bg.jpg' width={0} height={0} sizes="100vw" style={{width:'100%', height:'auto'}} className="img-fluid" alt=""/>
                </div>

                <div className="text-center avatar-profile margin-nagative mt-n5 position-relative pb-4 border-bottom">
                    <Image src='/images/doctors/01.jpg' width={80} height={80} className="rounded-circle shadow-md avatar avatar-md-md" alt=""/>
                    <h5 className="mt-3 mb-1">Dr. Calvin Carlo</h5>
                    <p className="text-muted mb-0">Orthopedic</p>
                </div>

                <ul className="list-unstyled sidebar-nav mb-0">
                    <li className={`${location === '/doctor-dashboard'? 'active' : ''} navbar-item mb-2`}><Link href="/doctor-dashboard" className="navbar-link"><RiAirplayLine className="align-middle navbar-icon"/> Dashboard</Link></li>
                    <li className={`${location === '/doctor-appointment'? 'active' : ''} navbar-item mb-2`}><Link href="/doctor-appointment" className="navbar-link"><RiCalendarCheckLine className="align-middle navbar-icon"/> Appointment</Link></li>
                    <li className={`${location === '/doctor-schedule'? 'active' : ''} navbar-item mb-2`}><Link href="/doctor-schedule" className="navbar-link"><RiTimerLine className="align-middle navbar-icon"/> Schedule Timing</Link></li>
                    <li className={`${location === '/invoices'? 'active' : ''} navbar-item mb-2`}><Link href="/invoices" className="navbar-link"><RiPagesLine className="align-middle navbar-icon"/> Invoices</Link></li>
                    <li className={`${location === '/doctor-messages'? 'active' : ''} navbar-item mb-2`}><Link href="/doctor-messages" className="navbar-link"><RiMailUnreadLine className="align-middle navbar-icon"/> Messages</Link></li>
                    <li className={`${location === '/doctor-profile'? 'active' : ''} navbar-item mb-2`}><Link href="/doctor-profile" className="navbar-link"><RiUser2Line className="align-middle navbar-icon"/> Profile</Link></li>
                    <li className={`${location === '/doctor-profile-setting'? 'active' : ''} navbar-item mb-2`}><Link href="/doctor-profile-setting" className="navbar-link"><RiUserSettingsLine className="align-middle navbar-icon"/> Profile Settings</Link></li>
                    <li className={`${location === '/patient-list'? 'active' : ''} navbar-item mb-2`}><Link href="/patient-list" className="navbar-link"><RiEmpathizeLine className="align-middle navbar-icon"/> Patients</Link></li>
                    <li className={`${location === '/patient-review'? 'active' : ''} navbar-item mb-2`}><Link href="/patient-review" className="navbar-link"><RiChat1Line className="align-middle navbar-icon"/> Patients Review</Link></li>
                    <li className={`${location === '/doctor-chat'? 'active' : ''} navbar-item mb-2`}><Link href="/doctor-chat" className="navbar-link"><RiChatVoiceLine className="align-middle navbar-icon"/> Chat</Link></li>
                    <li className={`${location === '/login'? 'active' : ''} navbar-item mb-2`}><Link href="/login" className="navbar-link"><RiLoginCircleLine className="align-middle navbar-icon"/> Login</Link></li>
                    <li className="navbar-item"><Link href="/forgot-password" className="navbar-link"><RiDeviceRecoverLine className="align-middle navbar-icon"/> Forgot Password</Link></li>
                </ul>
            </div>
        </div>
        </>
    )
}