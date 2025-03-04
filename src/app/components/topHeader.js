'use client'
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { FaBars, FiSettings, FiMail, GrDashboard, RiLogoutCircleRLine } from '../assets/icons/vander';

import SimpleBar from "simplebar-react";
import Offcanvas from 'react-bootstrap/Offcanvas';

export default function TopHeader({ toggle, setToggle }) {
    const [countryModal, setCountryModal] = useState(false);
    const [mailModal, setMailModal] = useState(false);
    const [userModal, setUserModal] = useState(false);
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    useEffect(() => {
        const handleCloseModals = () => {
            setCountryModal(false);
            setMailModal(false);
            setUserModal(false);
        };
        document.addEventListener('mousedown', handleCloseModals);

        return () => {
            document.removeEventListener('mousedown', handleCloseModals);
        };
    }, []);

    return (
        <div className="top-header">
            <div className="header-bar d-flex justify-content-between border-bottom">
                <div className="d-flex align-items-center">
                    <Link href="#" className="logo-icon">
                        <Image src='/images/logo-icon.png' width={32} height={30} className="small" alt="" />
                        <span className="big">
                            <Image src='/images/logo-dark.png' width={115} height={22} className="logo-light-mode" alt="" />
                            <Image src='/images/logo-light.png' width={115} height={22} className="logo-dark-mode" alt="" />
                        </span>
                    </Link>
                    <Link onClick={() => setToggle(!toggle)} className="btn btn-icon btn-pills btn-soft-primary ms-2" href="#">
                        <FaBars />
                    </Link>
                    <div className="search-bar p-0 d-none d-lg-block ms-2">
                        <div id="search" className="menu-search mb-0">
                            <form role="search" method="get" id="searchform" className="searchform">
                                <div>
                                    <input type="text" className="form-control border rounded-pill" name="s" id="s" placeholder="Search Keywords..." />
                                    <input type="submit" id="searchsubmit" defaultValue="Search" />
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <ul className="list-unstyled mb-0">
                    <li className="list-inline-item mb-0">
                        <div className="dropdown dropdown-primary">
                            <button type="button" className="btn btn-pills btn-soft-primary dropdown-toggle p-0" onClick={() => setCountryModal(!countryModal)}>
                                <Image src='/images/language/american.png' width={36} height={36} className="avatar avatar-ex-small rounded-circle p-2" alt="" />
                            </button>
                            <SimpleBar className={`${countryModal ? 'show' : ''} dropdown-menu dd-menu drop-ups dropdown-menu-end shadow border-0 mt-3 p-2`} style={{ height: '175px', position: 'absolute', right: '0' }}>
                                {/* Add your country data here */}
                            </SimpleBar>
                        </div>
                    </li>

                    <li className="list-inline-item mb-0 ms-1">
                        <Link href="#" onClick={handleShow} data-bs-toggle="offcanvas" data-bs-target="#offcanvasRight" aria-controls="offcanvasRight">
                            <div className="btn btn-icon btn-pills btn-soft-primary"><FiSettings className="fea icon-sm" /></div>
                        </Link>
                    </li>
                    <Offcanvas show={show} onHide={handleClose} placement="end" style={{ width: '430px' }}>
                        <Offcanvas.Header closeButton className="offcanvas-header p-4 border-bottom">
                            <h5 id="offcanvasRightLabel" className="mb-0">
                                <Image src='/images/logo-dark.png' width={115} height={22} className="light-version" alt="" />
                                <Image src='/images/logo-light.png' width={115} height={22} className="dark-version" alt="" />
                            </h5>
                        </Offcanvas.Header>
                        <Offcanvas.Body>
                            {/* Add your Offcanvas content here */}
                        </Offcanvas.Body>
                    </Offcanvas>

                    <li className="list-inline-item mb-0 ms-1">
                        <div className="dropdown dropdown-primary">
                            <button type="button" className="btn btn-icon btn-pills btn-soft-primary dropdown-toggle p-0" onClick={() => setMailModal(!mailModal)}>
                                <FiMail className="fea icon-sm" />
                            </button>
                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">4 <span className="visually-hidden">unread mail</span></span>
                            <SimpleBar className={`${mailModal ? 'show' : ''} dropdown-menu dd-menu dropdown-menu-end shadow rounded border-0 mt-3 px-2 py-2`} style={{ height: '320px', width: '300px', position: 'absolute', right: '0' }}>
                                {/* Add your mail data here */}
                            </SimpleBar>
                        </div>
                    </li>

                    <li className="list-inline-item mb-0 ms-1">
                        <div className="dropdown dropdown-primary">
                            <button type="button" className="btn btn-pills btn-soft-primary dropdown-toggle p-0" onClick={() => setUserModal(!userModal)}>
                                <Image src='/images/doctors/01.jpg' width={36} height={36} className="avatar avatar-ex-small rounded-circle" alt="" />
                            </button>
                            <div className={`${userModal ? 'show' : ''} dropdown-menu dd-menu dropdown-menu-end shadow border-0 mt-3 py-3`} style={{ minWidth: '200px', position: 'absolute', right: '0' }}>
                                <Link className="dropdown-item d-flex align-items-center text-dark" href="/profile">
                                    <Image src='/images/doctors/01.jpg' width={45} height={45} className="avatar avatar-md-sm rounded-circle border shadow" alt="" />
                                    <div className="flex-1 ms-2">
                                        <span className="d-block mb-1">Calvin Carlo</span>
                                        <small className="text-muted">Orthopedic</small>
                                    </div>
                                </Link>
                                <Link className="dropdown-item text-dark d-flex align-items-center" href="/"><span className="mb-0 d-inline-flex me-1"><GrDashboard className="align-middle h6 mb-0" /></span> Dashboard</Link>
                                <Link className="dropdown-item text-dark d-flex align-items-center" href="/dr-profile"><span className="mb-0 d-inline-block me-1"><FiSettings className="align-middle h6 mb-0" /></span> Profile Settings</Link>
                                <div className="dropdown-divider border-top"></div>
                                <Link className="dropdown-item text-dark d-flex align-items-center" href="/lock-screen"><span className="mb-0 d-inline-block me-1"><RiLogoutCircleRLine className="align-middle h6 mb-0" /></span> Logout</Link>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    );
}