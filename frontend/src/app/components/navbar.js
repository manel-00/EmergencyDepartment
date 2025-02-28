'use client'
import React,{useState,useEffect} from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from 'next/navigation'

import Offcanvas from 'react-bootstrap/Offcanvas';

import {FiSettings, FiSearch,GrDashboard, LiaSignOutAltSolid, FiShoppingCart, FiDribbble,RiBehanceLine, FaFacebookF,FiInstagram, FiTwitter,LuMail, LuGlobe} from '../assets/icons/vander'

export default function Navbar({navDark, manuClass,containerClass}){
    let [show, setShow] = useState(false);
    let [showTwo, setShowTwo] = useState(false);
    let [scroll, setScroll] = useState(false);
    let [isMenu, setisMenu] = useState(false);
    let [modal, setModal] = useState(false)

    let handleClose = () => setShow(false);
    let handleShow = () => setShow(true);


    let handleCloseTwo = () => setShowTwo(false);
    let handleShowTwo = () => setShowTwo(true);


    let [manu , setManu] = useState('');
    let current = usePathname();

    useEffect(() => {

        setManu(current)

        window.addEventListener("scroll", () => {
          setScroll(window.scrollY > 50);
        });
        window.scrollTo(0, 0);
        const closeModal = ()=>{
            setModal(false)
        }
        document.addEventListener("mousedown",closeModal)
        return()=>{
            document.removeEventListener("mousedown",closeModal)
        }
      }, []);

      let toggleMenu = () => {
        setisMenu(!isMenu);
        if (document.getElementById("navigation")) {
            const anchorArray = Array.from(document.getElementById("navigation").getElementsByTagName("a"));
            anchorArray.forEach(element => {
                element.addEventListener('click', (elem) => {
                    const target = elem.target.getAttribute("href")
                    if (target !== "") {
                        if (elem.target.nextElementSibling) {
                            var submenu = elem.target.nextElementSibling.nextElementSibling;
                            submenu.classList.toggle('open');
                        }
                    }
                })
            });
        }
    };
    return(
        <header id="topnav" className={`${scroll ? "nav-sticky" :""} navigation sticky`}>
            <div className={containerClass}>
                <div>
                    {navDark === true ? 
                    <Link className="logo" href="/">
                        <Image src='/images/logo-dark.png' width={115} height={22} className="logo-light-mode" alt=""/>
                        <Image src='/images/logo-light.png' width={115} height={22} className="logo-dark-mode" alt=""/>
                    </Link> :

                    <Link className="logo" href="/">
                        <span className="logo-light-mode">
                            <Image src='/images/logo-dark.png' className="l-dark" width={115} height={22} alt=""/>
                            <Image src='/images/logo-light.png' className="l-light" width={115} height={22} alt=""/>
                        </span>
                        <Image src='/images/logo-light.png' width={115} height={22} className="logo-dark-mode" alt=""/>
                    </Link>
                    }
                </div>
        
                <div className="menu-extras">
                    <div className="menu-item">
                        <Link href="#"  className={`navbar-toggle ${isMenu ? 'open' : ''}`} id="isToggle" onClick={() => toggleMenu()}>
                            <div className="lines">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </Link>
                    </div>
                </div>

                <ul className="dropdowns list-inline mb-0">
                    <li className="list-inline-item mb-0">
                        <Link href="#"  onClick={handleShowTwo}>
                            <div className="btn btn-icon btn-pills btn-primary"><FiSettings className="fea icon-sm"/></div>
                        </Link>
                    </li>
                    <Offcanvas show={showTwo} onHide={handleCloseTwo} placement="end">
                        <Offcanvas.Header closeButton className="offcanvas-header p-4 border-bottom">
                            <h5 id="offcanvasRightLabel" className="mb-0">
                                <Image src='/images/logo-dark.png' width={115} height={22} className="light-version" alt=""/>
                                <Image src='/images/logo-light.png' width={115} height={22} className="dark-version" alt=""/>
                            </h5>
                        </Offcanvas.Header>
                        <Offcanvas.Body>
                            <div className="row">
                                <div className="col-12">
                                    <div>
                                        <div>
                                            <Image src='/images/mobile-app.svg' width={0} height={0} sizes="100vw" style={{width:'100%', height:'auto'}} alt="" className="w-75 h-auto mx-auto d-block"/>
                                        </div>
                                        <h5 className="my-4">Get in touch!</h5>
                                        <form>
                                            <div className="row">
                                                <div className="col-md-12">
                                                    <div className="mb-3">
                                                        <label className="form-label">Your Name <span className="text-danger">*</span></label>
                                                        <input name="name" id="name" type="text" className="form-control border rounded" placeholder="First Name :"/>
                                                    </div>
                                                </div>

                                                <div className="col-md-12">
                                                    <div className="mb-3">
                                                        <label className="form-label">Your Email <span className="text-danger">*</span></label>
                                                        <input name="email" id="email" type="email" className="form-control border rounded" placeholder="Your email :"/>
                                                    </div> 
                                                </div>

                                                <div className="col-md-12">
                                                    <div className="mb-3">
                                                        <label className="form-label">Subject</label>
                                                        <input name="subject" id="subject" className="form-control border rounded" placeholder="Your subject :"/>
                                                    </div>
                                                </div>

                                                <div className="col-md-12">
                                                    <div className="mb-3">
                                                        <label className="form-label">Comments <span className="text-danger">*</span></label>
                                                        <textarea name="comments" id="comments" rows="4" className="form-control border rounded" placeholder="Your Message :"></textarea>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-sm-12">
                                                    <button type="submit" id="submit" name="send" className="btn btn-primary">Send Message</button>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </Offcanvas.Body>
                        <div className="offcanvas-footer p-4 border-top text-center">
                            <ul className="list-unstyled social-icon social mb-0">
                                <li className="list-inline-item mb-0"><Link href="https://1.envato.market/doctris-next" target="_blank" className="rounded"><FiShoppingCart className="align-middle mb-0"/></Link></li>
                                <li className="list-inline-item mb-0"><Link href="https://dribbble.com/shreethemes" target="_blank" className="rounded"><FiDribbble className="align-middle mb-0"/></Link></li>
                                <li className="list-inline-item mb-0"><Link href="https://www.behance.net/shreethemes" target="_blank" className="rounded"><RiBehanceLine className="align-middle mb-0"/></Link></li>
                                <li className="list-inline-item mb-0"><Link href="https://www.facebook.com/shreethemes" target="_blank" className="rounded"><FaFacebookF className="align-middle mb-0"/></Link></li>
                                <li className="list-inline-item mb-0"><Link href="https://www.instagram.com/shreethemes/" target="_blank" className="rounded"><FiInstagram className="align-middle mb-0"/></Link></li>
                                <li className="list-inline-item mb-0"><Link href="https://twitter.com/shreethemes" target="_blank" className="rounded"><FiTwitter className="align-middle mb-0"/></Link></li>
                                <li className="list-inline-item mb-0"><Link href="mailto:support@shreethemes.in" className="rounded"><LuMail className="align-middle mb-0"/></Link></li>
                                <li className="list-inline-item mb-0"><Link href="https://shreethemes.in" target="_blank" className="rounded"><LuGlobe className="align-middle mb-0"/></Link></li>
                            </ul>
                        </div>
                    </Offcanvas>

                    <li className="list-inline-item mb-0 ms-1">
                        <Link href="#" className="btn btn-icon btn-pills btn-primary" onClick={handleShow} >
                            <FiSearch/>
                        </Link>
                    </li>
                    <Offcanvas show={show} onHide={handleClose} placement="top" style={{height:'250px'}}>
                        <Offcanvas.Header closeButton>
                        </Offcanvas.Header>
                        <Offcanvas.Body className="pb-3">
                            <div className="container">
                                <div className="row">
                                    <div className="col">
                                        <div className="text-center">
                                            <h4>Search now.....</h4>
                                            <div className="subcribe-form mt-4">
                                                <form>
                                                    <div className="mb-0">
                                                        <input type="text" id="help" name="name" className="border rounded-pill" required="" placeholder="Search"/>
                                                        <button type="submit" className="btn btn-pills btn-primary">Search</button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Offcanvas.Body>
                    </Offcanvas>

                    <li className="list-inline-item mb-0 ms-1">
                    <div className="d-flex">
                    <Link className="btn btn-primary me-2" href="/login">Se connecter</Link>
                    <Link className="btn btn-outline-primary" href="/signup">S'inscrire</Link>
                    </div>
                    </li>

                </ul>

                <div id="navigation" style={{ display: isMenu ? 'block' : 'none' }}>
                    <ul className={manuClass}>
                        <li className={`${["", "/","/index-two", "/index-three"].includes(manu)? "active" : ""} has-submenu parent-menu-item`}>
                            <Link href="#">Home</Link><span className="menu-arrow"></span>
                            <ul className="submenu">
                                <li className={manu === "/" || "" ? "active" : ""}><Link href="/" className="sub-menu-item">Index One</Link></li>
                                <li className={manu === "/index-two" ? "active" : ""}><Link href="/index-two" className="sub-menu-item">Index Two</Link></li>
                                <li className={manu === "/index-three" ? "active" : ""}><Link href="/index-three" className="sub-menu-item">Index Three</Link></li>
                            </ul>
                        </li>

                        <li className={`${["/doctor-dashboard", "/doctor-appointment","/patient-list", "/doctor-schedule","/invoices","/patient-review","/doctor-messages","/doctor-profile","/doctor-profile-setting","/doctor-chat","/login","/signup","/forgot-password","/doctor-team-one","/doctor-team-two","/doctor-team-three"].includes(manu)? "active" : ""} has-submenu parent-parent-menu-item`}>
                            <Link href="#">Doctors</Link><span className="menu-arrow"></span>
                            <ul className="submenu">
                                <li className={`${["/doctor-dashboard", "/doctor-appointment","/patient-list", "/doctor-schedule","/invoices","/patient-review","/doctor-messages","/doctor-profile","/doctor-profile-setting","/doctor-chat","/login","/signup","/forgot-password"].includes(manu)? "active" : ""} has-submenu parent-menu-item`}>
                                    <Link href="#" className="menu-item"> Dashboard </Link><span className="submenu-arrow"></span>
                                    
                                </li>
                                
                            </ul>
                        </li>

                        <li className={`${["/patient-dashboard", "/patient-profile","/booking-appointment", "/patient-invoice"].includes(manu)? "active" : ""} has-submenu parent-menu-item`}>
                            <Link href="#">Patients</Link><span className="menu-arrow"></span>
                            
                        </li>

                        <li className={`${["/pharmacy", "/pharmacy-shop","/pharmacy-product-detail", "/pharmacy-shop-cart","/pharmacy-checkout","/pharmacy-account"].includes(manu)? "active" : ""} has-submenu parent-menu-item`}>
                            <Link href="#">Pharmacy</Link><span className="menu-arrow"></span>
                            
                        </li>

                        <li className={`${["/aboutus", "/departments","/faqs", "/blogs","/blog-detail","/terms","/privacy","/error"].includes(manu)? "active" : ""} has-submenu parent-parent-menu-item`}><Link href="#">Pages</Link><span className="menu-arrow"></span>
                          
                        </li>
                    </ul>
                </div>
            </div>
        </header>
    )
}