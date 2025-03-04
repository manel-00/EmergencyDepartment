import React from "react";
import Link from "next/link";

export default function Footer(){
    return(
        <footer className="bg-footer-color shadow py-3">
            <div className="container-fluid">
                <div className="row align-items-center">
                    <div className="col">
                        <div className="text-sm-start text-center">
                            <p className="mb-0 text-muted">{new Date().getFullYear()} © Doctris. Design with <i className="mdi mdi-heart text-danger"></i> by <Link href="https://shreethemes.in/" target="_blank" className="text-reset">Shreethemes</Link>.</p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}