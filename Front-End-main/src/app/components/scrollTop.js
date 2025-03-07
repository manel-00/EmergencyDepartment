'use client'
import React, {useState} from 'react'; 
import Link from 'next/link';

import {FiArrowUp} from '../assets/icons/vander'

export default function ScrollTop(){
    let [visible, setVisible] = useState(false) 
  
    let toggleVisible = () => { 
      let scrolled = document.documentElement.scrollTop; 
      if (scrolled > 300){ 
        setVisible(true) 
      }  
      else if (scrolled <= 300){ 
        setVisible(false) 
      } 
    }; 
    
    let scrollToTop = () =>{ 
      window.scrollTo({ 
        top: 0,  
        behavior: 'smooth'
      }); 
    }; 
    if (typeof window !== "undefined") {
      window.addEventListener('scroll', toggleVisible); 
    }
    
    return(
        <Link href="#" onClick={scrollToTop} id="back-to-top" className="back-to-top fs-5 rounded-pill text-center bg-primary justify-content-center align-items-center" style={visible=== true ? {display : 'block'}: {display : 'none'}}><FiArrowUp className="fea icon-sm"/></Link>
    )
}