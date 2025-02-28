import Image from 'next/image';
import Link from 'next/link';
import Navbar from './components/navbar';
import Footer from './components/footer';
import ScrollTop from './components/scrollTop';
import { RiArrowRightLine } from "react-icons/ri";
import { FiFacebook, FiLinkedin, FiGithub, FiTwitter, FiCalendar, FiClock } from "react-icons/fi";

export default function Home() {
  return (
    <>
      {/* Navbar */}
      <Navbar manuClass="navigation-menu nav-left nav-light" containerClass="container" />

      {/* Hero Section */}
      <section className="bg-half-260 d-table w-100" style={{ backgroundImage: `url('/images/bg/01.jpg')` }}>
        <div className="bg-overlay bg-overlay-dark"></div>
        <div className="container">
          <div className="row mt-5 mt-lg-0">
            <div className="col-12">
              <div className="heading-title">
                {/* Logo */}
                <Image src="/images/logo-icon.png" width={54} height={50} alt="Logo médical" />

                {/* Titre principal */}
                <h4 className="display-4 fw-bold text-white title-dark mt-3 mb-4">
                  Meet The <br/> Best Doctor
                </h4>

                {/* Description */}
                <p className="para-desc text-white-50 mb-0">
                  Great doctor if you need your family member to get effective immediate assistance, 
                  emergency treatment or a simple consultation.
                </p>

                {/* Boutons */}
                <div className="mt-4 pt-2">
                  <Link href="/booking-appointment" className="btn btn-primary">
                    Make Appointment
                  </Link>
                  <p className="text-white-50 mb-0 mt-2">
                    T&C apply. Please read{" "}
                    <Link href="#" className="text-white-50">
                      Terms and Conditions <RiArrowRightLine className="align-middle" />
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pied de page et scroll to top */}
      <Footer />
      <ScrollTop />
    </>
  );
}
