// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Header from './Header';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
// import './HomePageDesktop.css';

// const chevronDown = 'https://gpcdcgwgkciyogknekwp.supabase.co/storage/v1/object/public/pharmacy//chevron%20down.png';
// const ACCENT = '#00D364';
// const PRIMARY = '#0A1F44';
// const TEXT = '#1C2B39';

// const NAV_LINKS: Record<string,string> = {
//   'All Services': '/services?tab=ALL',
//   'Travel Clinic': '/services?tab=TRAVEL',
//   'Private Treatments': '/services?tab=PRIVATE',
//   'NHS Treatments': '/services?tab=NHS',
//   'Pharmacy First': '/services?tab=PHARMACY',
// };

// const HERO_CARD_LINKS: Record<string,string> = {
//   'Weight loss clinic': '/weight-loss-clinic',
//   'Travel Clinic': '/travel-clinic',
//   'Ear Wax Removal': '/microsuction-earwax-removal',
// };

// const browseOptions = Object.keys(NAV_LINKS);

// const popularServices = [
//   {
//     title: 'Weight loss clinic',
//     link: '/weight-loss-clinic',
//     sub: 'Achieve your weight goals.',
//     img:
//       'https://gpcdcgwgkciyogknekwp.supabase.co/storage/v1/object/public/pharmacy/weightclinic.jpg',
//   },
//   {
//     title: 'Ear Wax Removal',
//     link: '/microsuction-earwax-removal',
//     sub: 'Safe microsuction for clear, comfortable ears.',
//     img:
//     'https://clearclinics.co.uk/wp-content/uploads/2023/10/earwax-removal-1024x561.jpg',
//   },
//   {
//     title: 'Travel Vaccinations',
//     link: '/travel-clinic',
//     sub: 'Comprehensive vaccine service for your trip.',
//     img:
//     'https://clinic-digital.lon1.cdn.digitaloceanspaces.com/100/530057/yyrgMObVYh.webp',
//   },
//   {
//     title: 'Vitamin B12 Injection',
//     link: '/book/6',
//     sub: 'Restore energy and improve vitality.',
//     img:
//     'https://www.chathampharmacy.co.uk/_next/image?url=%2Fimages%2Fservices%2Fvitamin-b12-injection.webp&w=640&q=75',
//   },
//   {
//     title: 'Oral Contraception',
//     link: '/oral-contraceptives',
//     sub: 'Fast, confidential help when you need it.',
//     img:
//     'https://gpcdcgwgkciyogknekwp.supabase.co/storage/v1/object/public/pharmacy/pic.png',
//   },
//   {
//     title: 'Erectile dysfunction',
//     link: '/book/20',
//     sub: 'Effective solutions tailored to your needs.',
//     img:
//       'https://gpcdcgwgkciyogknekwp.supabase.co/storage/v1/object/public/pharmacy/ed.jpeg',
//   },
// ];
// const covidvaccine = [
//   {
//     title: 'COVID vaccine',
//     link: '/book/16',
//     sub: 'Free COVID-19 booster for eligible patients (over 75).',
//     img:
//       'https://lead-services-agency.fra1.cdn.digitaloceanspaces.com/4/542160/8ruIf7vdRW.webp',
//   },
//   {
//     title: 'Flu jab',
//     link: '/book/14',
//     sub: 'Free NHS flu jab to keep you protected.',
//     img:
//     'https://lead-services-agency.fra1.cdn.digitaloceanspaces.com/4/101404/2-EtcvQ5-J.webp',
//   },
 
// ];


// const pharmacyFirst = [
//   {
//     title: 'Sinusitis',
//     link: '/book/21',
//     img:
//       'https://www.chathampharmacy.co.uk/_next/image?url=%2Fimages%2Fpharmacy-first%2Fsinusitis.webp&w=1200&q=75',
//     subtitle: 'Ages 12+',
//   },
//   {
//     title: 'Sore throat',
//     link: '/book/2',
//     img:
//       'https://www.chathampharmacy.co.uk/_next/image?url=%2Fimages%2Fpharmacy-first%2Fsore-throat.webp&w=1200&q=75',
//     subtitle: 'Ages 5+',
//   },
//   {
//     title: 'Earache',
//     link: '/book/19',
//     img:
//       'https://www.chathampharmacy.co.uk/_next/image?url=%2Fimages%2Fpharmacy-first%2Fearache.webp&w=1200&q=75',
//     subtitle: 'Ages 1–17',
//   },
//   {
//     title: 'Infected insect bite',
//     link: '/book/8',
//     img:
//       'https://www.chathampharmacy.co.uk/_next/image?url=%2Fimages%2Fpharmacy-first%2Finsect-bite.webp&w=1200&q=75',
//     subtitle: 'Ages 1+',
//   },
//   {
//     title: 'Impetigo',
//     link: '/book/7',
//     img:
//       'https://www.chathampharmacy.co.uk/_next/image?url=%2Fimages%2Fpharmacy-first%2Fimpetigo.webp&w=1200&q=75',
//     subtitle: 'Ages 1+',
//   },
//   {
//     title: 'Shingles',
//     link: '/book/44',
//     img:
//       'https://www.chathampharmacy.co.uk/_next/image?url=%2Fimages%2Fpharmacy-first%2Fshingles.webp&w=1200&q=75',
//     subtitle: 'Ages 18+',
//   },
//   {
//     title: 'Uncomplicated UTI (women)',
//     link: '/book/5',
//     img:
//       'https://www.chathampharmacy.co.uk/_next/image?url=%2Fimages%2Fpharmacy-first%2Futi.webp&w=1200&q=75',
//     subtitle: 'Women aged 16–64',
//   },
// ];

// export default function HomePageDesktop() {
//   const [sel, setSel] = useState('All Services');
//   const [pfIndex, setPfIndex] = useState(0);
//   const navigate = useNavigate();

//   const onBrowse = (e:React.ChangeEvent<HTMLSelectElement>) => {
//     setSel(e.target.value);
//     if (NAV_LINKS[e.target.value]) navigate(NAV_LINKS[e.target.value]);
//   };

//   return (
//     <>
//       <Header />
//       <main className="desktop-page">
//         <section className="hero-section">
//           <div className="hero-text">
//             <h1>
//               Trusted <span style={{color:ACCENT}}>Pharmacy</span><br/>
//               Care in Coleshill
//             </h1>
//             <p>Explore our wide range of treatments or consult with our medical professionals.</p>
//             <div className="hero-controls">
//               <select value={sel} onChange={onBrowse} className="browse-select">
//                 {browseOptions.map(o=>(
//                   <option key={o} value={o}>{o}</option>
//                 ))}
//               </select>
//               <button
//                 className="btn-get-started"
//                 onClick={()=>navigate(NAV_LINKS[sel]||NAV_LINKS['All Services'])}
//               >
//                 Get Started Now
//               </button>
//             </div>
//             <div className="hero-rating">
//               <img src="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_74x24dp.png"
//                    alt="Google logo"/>
//               <span>★★★★★ 4.3/5.0</span>
//             </div>
//           </div>
//            {/* …above */}
           
//            <div className="hero-cards">
//   {/* Big featured card on the left */}
//   <div
//     className="card featured-card"
//     onClick={() => navigate(HERO_CARD_LINKS['Weight loss clinic'])}
//   >
//     <div className="card-image">
//       <img
//         src="https://gpcdcgwgkciyogknekwp.supabase.co/storage/v1/object/public/pharmacy/weightclinic.jpg"
//         alt="Weight loss clinic"
//       />
//       <div className="card-overlay"></div>
//     </div>
//     <div className="card-footer">
//       <h4>Weight loss clinic</h4>
//       <FontAwesomeIcon icon={faChevronRight} />
//     </div>
//   </div>

//   {/* Two smaller cards stacked vertically on the right */}
//   <div className="side-cards">
//     {['Travel Clinic', 'Ear Wax Removal'].map((key) => {
//       const imgUrl = key === 'Ear Wax Removal'
//         ? 'https://clearclinics.co.uk/wp-content/uploads/2023/10/earwax-removal-1024x561.jpg'
//         : 'https://www.chathampharmacy.co.uk/_next/image?url=%2Fimages%2Fservices%2Ftravel-clinic.webp&w=1200&q=75';
//       return (
//         <div
//           key={key}
//           className="card side-card"
//           onClick={() => navigate(HERO_CARD_LINKS[key])}
//         >
//           <div className="card-image">
//             <img src={imgUrl} alt={key} />
//             <div className="card-overlay"></div>
//           </div>
//           <div className="card-footer">
//             <h5>{key}</h5>
//             <FontAwesomeIcon icon={faChevronRight} />
//           </div>
//         </div>
//       );
//     })}
//   </div>
// </div>
//         </section>

//         <section className="popular-services">
//           <header>
//             <h2>Popular services</h2>
//             <button className="btn-start-sm" onClick={()=>navigate('/services')}>
//               See all services →
//             </button>
//           </header>
//           <div className="grid-3">
//             {popularServices.map(svc=>(
//               <div
//                 key={svc.title}
//                 className="card svc-card"
//                 onClick={()=>navigate(svc.link)}
//               >
//                 <div className="svc-img">
//                   <img src={svc.img} alt={svc.title}/>
//                 </div>
//                 <div className="svc-body">
//                   <h5>{svc.title}</h5>
//                   <p>{svc.sub}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </section>

//         <section className="pharmacy-first">
//           <header>
//             <h2>Pharmacy First treatments</h2>
//             <div className="pf-controls">
//               <button
//                 onClick={()=>setPfIndex(i=>Math.max(0,i-1))}
//                 disabled={pfIndex===0}
//               >←</button>
//               <button
//                 onClick={()=>setPfIndex(i=>Math.min(pharmacyFirst.length-3,i+1))}
//                 disabled={pfIndex>=pharmacyFirst.length-3}
//               >→</button>
//             </div>
//           </header>
//           <div className="pf-track" style={{transform:`translateX(-${pfIndex*276}px)`}}>
//             {pharmacyFirst.map(svc=>(
//               <div key={svc.title} className="card pf-card" onClick={()=>navigate(svc.link)}>
//                 <div className="pf-img"><img src={svc.img} alt={svc.title}/></div>
//                 <div className="pf-body">
//                   <h5>{svc.title}</h5>
//                   <small>{svc.subtitle}</small>
//                   <button className="btn-start-sm2">Get started</button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </section>

            
//             <section className="popular-services">
//           <header>
//             <h2>Free NHS vaccination</h2>
//             {/* <button className="btn-start-sm" onClick={()=>navigate('/services')}>
//               See all services →
//             </button> */}
//           </header>
//           <div className="grid-3">
//             {covidvaccine.map(svc=>(
//               <div
//                 key={svc.title}
//                 className="card svc-card"
//                 onClick={()=>navigate(svc.link)}
//               >
//                 <div className="svc-img">
//                   <img src={svc.img} alt={svc.title}/>
//                 </div>
//                 <div className="svc-body">
//                   <h5>{svc.title}</h5>
//                   <p>{svc.sub}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </section>

//         <section className="find-us">
//           <h2 style={{fontWeight: 700 }}>Find us</h2>
//           <div className="row align-items-center mt-4">
//             <div className="col-md-6">
//               <p>
//                 Contact us for travel vaccination, ear wax removal and a wide
//                 range of NHS or private services we offer.
//               </p>
//               <p>
//                 <strong>Phone:</strong> 01675 466014
//               </p>
//               <p>
//                 <strong>Email:</strong> coleshillpharmacy@gmail.com
//               </p>
//               <p>
//                 <strong>Address:</strong> 114–116 High St, Coleshill, Birmingham
//                 B46 3BJ
//               </p>
//               <p>
//                 <strong>Hours:</strong>
//                 <br />
//                 Monday–Friday 8:30 am–6 pm
//                 <br />
//                 Saturday 9 am–5:30 pm
//                 <br />
//                 Sunday Closed
//               </p>
//             </div>
//             <div className="col-md-6">
//               <iframe
//                 title="Coleshill Pharmacy Location"
//                 src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2483.123456789!2d-1.7890123!3d52.5654321!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48776789abcdef12:0x3456789abcdef!2s114-116%20High%20St,%20Coleshill%20B46%203BJ,%20UK!5e0!3m2!1sen!2suk!4v1623456789012"
//                 width="100%"
//                 height="300"
//                 style={{ border: 0, borderRadius: '0.5rem', marginBottom: '30px' }}
//                 allowFullScreen
//                 loading="lazy"
//               />
//             </div>
//           </div>
//         </section>
//       </main>
//     </>
//   );
// }
/**
 * HomePageDesktop.tsx — FleetFlow Driver Management Dashboard
 *
 * Supabase Tables & Columns Used:
 *
 * Table: drivers
 *   - id            uuid          PRIMARY KEY DEFAULT gen_random_uuid()
 *   - name          text          NOT NULL
 *   - driver_number text          NOT NULL UNIQUE   (e.g. "DRV-001")
 *   - cdl_class     text          NOT NULL          (e.g. "CDL Class A")
 *   - experience_years int        NOT NULL
 *   - status        text          NOT NULL          ('Available' | 'On Trip' | 'Off Duty')
 *   - hos_risk      text          NOT NULL          ('low' | 'medium' | 'high')
 *   - rating        numeric(3,1)  NOT NULL
 *   - avatar_url    text
 *   - created_at    timestamptz   DEFAULT now()
 *
 * Table: trips
 *   - id            uuid          PRIMARY KEY DEFAULT gen_random_uuid()
 *   - driver_id     uuid          REFERENCES drivers(id)
 *   - origin        text          NOT NULL
 *   - destination   text          NOT NULL
 *   - status        text          NOT NULL  ('completed' | 'in_progress')
 *   - completed_at  timestamptz
 *   - eta           timestamptz
 *   - created_at    timestamptz   DEFAULT now()
 *
 * Table: driver_locations
 *   - id            uuid          PRIMARY KEY DEFAULT gen_random_uuid()
 *   - driver_id     uuid          REFERENCES drivers(id)
 *   - city          text          NOT NULL
 *   - state         text          NOT NULL
 *   - location_note text                        (e.g. "Chicago Hub Terminal")
 *   - recorded_at   timestamptz   DEFAULT now()
 */
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import supabase from "../supabase";
import { useSession } from "../context/SessionContext";
import styles from "./HomePage.module.css";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { session } = useSession();

  const [role, setRole] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!session?.user?.id) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (error) {
        navigate("/setup-profile");
      } else {
        const r = data.role;

        if (r === "customer" || r === "driver" || r === "admin") {
          setRole(r);
        } else {
          navigate("/setup-profile");
        }
      }
    };

    fetchUserRole();
  }, [session, navigate]);

  const handleSignOut = async () => {
    setStatus("Signing out...");
    setError("");

    try {
      await supabase.auth.signOut();
      navigate("/sign-in", { replace: true });
    } catch (err: any) {
      setError(err.message || "Error signing out");
      setStatus("");
    }
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Header */}
      <div className={styles.header}>
        <button
          onClick={() => navigate("/")}
          className={styles.backButton}
          aria-label="Go to Homepage"
        >
          <img
            src="https://gpcdcgwgkciyogknekwp.supabase.co/storage/v1/object/public/pharmacy//backhome.png"
            alt="Back to Home"
          />
        </button>

        {/* FlowFleet Logo Text */}
        <div
          style={{
            padding: "0 15px", 
            width: "100%",
            maxWidth: "420px",
            height: "90px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "42px",
            fontWeight: 800,
            letterSpacing: "2px",
            color: "white",
            background: "linear-gradient(90deg, #00c6ff, #0072ff)",
            borderRadius: "18px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
            textTransform: "uppercase",
          }}
        >
          Taz 
        </div>
      </div>

      {/* Main */}
      <main className={styles.container}>
        <p className={styles.subText}>
          {session ? `Email: ${session.user.email}` : "Please sign in..."}
        </p>

        {session ? (
          <button
            onClick={handleSignOut}
            className={styles.authButton}
            disabled={!!status}
          >
            {status ? <div className={styles.loader} /> : "Sign Out"}
          </button>
        ) : (
          <div className={styles.roleLinksContainer}>
            <Link to="/sign-in" className={styles.authButton}>
              Sign In
            </Link>

            <Link to="/sign-up" className={styles.authButton}>
              Sign Up
            </Link>
          </div>
        )}

        {session && role && (
          <div className={styles.roleLinksContainer}>
            {role === "driver" ? (
              <>
                <Link to="/my-orders" className={styles.roleLink}>
                  Orders
                </Link>

                <Link to="/my-bookings" className={styles.roleLink}>
                  My Bookings
                </Link>

                <Link to="/edit-profile" className={styles.roleLink}>
                  Edit Profile
                </Link>
              </>
            ) : role === "admin" ? (
              <>
                <Link to="/dashboard" className={styles.roleLink}>
                  Dashboard
                </Link>
                <Link to="/staffattendance" className={styles.roleLink}>
                  Attendance
                </Link>

                <Link to="/bookings" className={styles.roleLink}>
                  Bookings
                </Link>

                <Link to="/orders" className={styles.roleLink}>
                  Orders
                </Link>

                <Link to="/store" className={styles.roleLink}>
                  Store
                </Link>
              </>
            ) : (
              <Link to="/attendance" className={styles.roleLink}>
                Staff Attendance
              </Link>
            )}
          </div>
        )}

        <div className={styles.divider} />

        {error && <p className={styles.error}>{error}</p>}
      </main>
    </div>
  );
};

export default HomePage;