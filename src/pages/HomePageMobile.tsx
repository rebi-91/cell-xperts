// // src/pages/auth/HomePage.tsx
// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Header from './Header';
// import './HomePage.css';

// const MAIN_TEXT_COLOR = 'rgb(52, 78, 102)';
// const ACCENT_COLOR    = '#00D364';
// const ACC_COLOR       = 'rgb(42, 157, 239)';
// const chevronDown     =
//   'https://zbcowibbhjynfpkqgupz.supabase.co/storage/v1/object/public/booking//down-chevron.png';

// // ===== 1) Centralised route definitions =====
// const NAV_LINKS: Record<string,string> = {
//   'All Services':        '/services',
//   'Travel Clinic':       '/book/3',
//   'Private Treatments':  '/services?tab=PRIVATE',
//   'NHS Treatments':      '/services?tab=NHS',
//   'Pharmacy First':      '/services?tab=PHARMACY',
// };

// const HERO_CARD_LINKS: Record<string,string> = {
//   'Weight loss service': '/book/13',
//   'Travel Clinic':       '/book/3',
//   'Ear wax removal':     '/book/19',
// };

// const POPULAR_SERVICES = [
//   {
//     title: 'Weight loss management',
//     link:  '/book/13',
//     sub:   'Achieve your weight goals.',
//     img:   'https://www.chathampharmacy.co.uk/_next/image?url=%2Fimages%2Fservices%2Fweight-loss-4.webp&w=640&q=75',
//   },
//   {
//     title: 'Erectile dysfunction',
//     link:  '/book/21',
//     sub:   'Effective solutions tailored to your needs.',
//     img:   'https://www.chathampharmacy.co.uk/_next/image?url=%2Fimages%2Fservices%2Fed-3.webp&w=640&q=75',
//   },
//   {
//     title: 'Oral Contraception',
//     link:  '/book/14',
//     sub:   'Fast, confidential help when you need it.',
//     img:   'https://www.chathampharmacy.co.uk/_next/image?url=%2Fimages%2Fservices%2Fmorning-after-pill.webp&w=640&q=75',
//   },
//   {
//     title: 'Flu vaccination',
//     link:  '/book/15',
//     sub:   'Stay protected this season with a quick flu jab.',
//     img:   'https://www.chathampharmacy.co.uk/_next/image?url=%2Fimages%2Fservices%2Fflu-vaccine.webp&w=640&q=75',
//   },
//   {
//     title: 'Hair Loss',
//     link:  '/book/7',
//     sub:   'Support for healthier, fuller hair.',
//     img:   'https://www.chathampharmacy.co.uk/_next/image?url=%2Fimages%2Fservices%2Fhair-loss-2.webp&w=640&q=75',
//   },
//   {
//     title: 'Vitamin B12 Injection',
//     link:  '/book/6',
//     sub:   'Restore energy and improve vitality.',
//     img:   'https://www.chathampharmacy.co.uk/_next/image?url=%2Fimages%2Fservices%2Fvitamin-b12-injection.webp&w=640&q=75',
//   },
// ];

// const VACCINATIONS = [
//   {
//     title: 'Chickenpox',
//     link:  '/book/31',
//     img:   'https://www.chathampharmacy.co.uk/_next/image?url=%2Fimages%2Fvaccines%2Fchickenpox.webp&w=1080&q=75',
//   },
//   {
//     title: 'Hepatitis A',
//     link:  '/book/23',
//     img:   'https://www.chathampharmacy.co.uk/_next/image?url=%2Fimages%2Fvaccines%2Fhepatitis.webp&w=1080&q=75',
//   },
//   {
//     title: 'Typhoid',
//     link:  '/book/24',
//     img:   'https://ysm-res.cloudinary.com/image/upload/ar_16:9,c_fill,dpr_3.0,f_auto,g_faces:auto,q_auto:eco,w_500/v1/yms/prod/d01914a4-5add-47e4-ba61-8681278f830a',
//   },
//   {
//     title: 'Yellow Fever',
//     link:  '/book/25',
//     img:   'https://www.leamingtontravelclinic.co.uk/wp-content/uploads/2023/08/Yellow_fever2.jpg',
//   },
// ];

// const PHARMACY_FIRST = [
//   {
//     title: 'Sinusitis',
//     link:  '/book/22',
//     img:   'https://www.chathampharmacy.co.uk/_next/image?url=%2Fimages%2Fpharmacy-first%2Fsinusitis.webp&w=1200&q=75',
//   },
//   {
//     title: 'Sore throat',
//     link:  '/book/2',
//     img:   'https://www.chathampharmacy.co.uk/_next/image?url=%2Fimages%2Fpharmacy-first%2Fsore-throat.webp&w=1200&q=75',
//   },
//   {
//     title: 'Earache',
//     link:  '/book/20',
//     img:   'https://www.chathampharmacy.co.uk/_next/image?url=%2Fimages%2Fpharmacy-first%2Fearache.webp&w=1200&q=75',
//   },
//   {
//     title: 'Infected insect bite',
//     link:  '/book/9',
//     img:   'https://www.chathampharmacy.co.uk/_next/image?url=%2Fimages%2Fpharmacy-first%2Finsect-bite.webp&w=1200&q=75',
//   },
//   {
//     title: 'Impetigo',
//     link:  '/book/8',
//     img:   'https://www.chathampharmacy.co.uk/_next/image?url=%2Fimages%2Fpharmacy-first%2Fimpetigo.webp&w=1200&q=75',
//   },
//   {
//     title: 'Shingles',
//     link:  '/book/12',
//     img:   'https://www.chathampharmacy.co.uk/_next/image?url=%2Fimages%2Fpharmacy-first%2Fshingles.webp&w=1200&q=75',
//   },
//   {
//     title: 'Uncomplicated UTI (women)',
//     link:  '/book/5',
//     img:   'https://www.chathampharmacy.co.uk/_next/image?url=%2Fimages%2Fpharmacy-first%2Futi.webp&w=1200&q=75',
//   },
// ];

// const HomePage: React.FC = () => {
//   const [selection, setSelection] = useState<string>('');
//   const navigate = useNavigate();

//   const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const pick = e.target.value;
//     setSelection(pick);
//     if (NAV_LINKS[pick]) {
//       navigate(NAV_LINKS[pick]);
//     }
//   };

//   return (
//     <>
//       <Header />

//       <main className="pt-header">

//         {/* Hero Section */}
//         <section className="container py-5 hero-section">
//           <div className="row align-items-center">
//             {/* Left Column */}
//             <div className="col-md-6">
//               <h1 style={{ color: MAIN_TEXT_COLOR, fontWeight: 700, fontSize: '2.5rem' }}>
//                 Trusted <span style={{ color: ACCENT_COLOR }}>Pharmacy</span><br/>
//                 Care in <span style={{ color: ACC_COLOR }}>Coleshill</span>
//               </h1>
//               <p style={{ color: MAIN_TEXT_COLOR, margin: '1rem 0' }}>
//                 Explore our wide range of treatments or consult with our medical professionals.
//               </p>

//               <div className="mb-3">
//                 <select
//                   value={selection}
//                   onChange={handleSelect}
//                   className="form-select w-100"
//                 >
//                   <option value="">Select a service</option>
//                   {Object.keys(NAV_LINKS).map(opt => (
//                     <option key={opt} value={opt}>{opt}</option>
//                   ))}
//                 </select>
//               </div>

//               <div className="mb-3">
//                 <button
//                   className="btn btn-start w-100"
//                   onClick={() => navigate('/services')}
//                 >
//                   Get Started Now
//                 </button>
//               </div>

//               <div className="d-flex align-items-center">
//                 <img
//                   src="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_74x24dp.png"
//                   alt="Google"
//                   className="google-logo"
//                 />
//                 <span style={{ color: MAIN_TEXT_COLOR, marginLeft: 8 }}>
//                   ★★★★★ 4.9/5.0
//                 </span>
//               </div>
//             </div>

//             {/* Right Column (desktop only) */}
//             <div className="col-md-6 d-none d-md-flex hero-cards gap-3">
//               <div
//                 className="card stacked-card"
//                 style={{ width: 260, cursor: 'pointer' }}
//                 onClick={() => navigate(HERO_CARD_LINKS['Weight loss service'])}
//               >
//                 <div className="overflow-hidden" style={{ height: 220 }}>
//                   <img
//                     src="https://www.chathampharmacy.co.uk/_next/image?url=%2Fimages%2Fweight-loss%2F1.webp&w=3840&q=90"
//                     alt="Weight loss service"
//                     className="card-img"
//                   />
//                 </div>
//                 <div className="card-body d-flex justify-content-between align-items-center px-3">
//                   <small>Weight loss service</small>
//                   <img src={chevronDown} className="chevron-90" alt="" />
//                 </div>
//                 <div className="card-footer text-center">
//                   <button
//                     className="btn weight-select-btn"
//                     onClick={() => navigate(HERO_CARD_LINKS['Weight loss service'])}
//                   >
//                     Select
//                   </button>
//                 </div>
//               </div>

//               <div className="d-flex flex-column gap-3">
//                 {['Travel Clinic','Ear wax removal'].map(key => (
//                   <div
//                     key={key}
//                     className="card side-card"
//                     style={{ cursor: 'pointer' }}
//                     onClick={() => navigate(HERO_CARD_LINKS[key])}
//                   >
//                     <div className="overflow-hidden" style={{ height: 140 }}>
//                       <img
//                         src={`https://www.chathampharmacy.co.uk/_next/image?url=%2Fimages%2Fservices%2F${key.toLowerCase().replace(/ /g,'-')}.webp&w=1200&q=75`}
//                         alt={key}
//                         className="card-img"
//                       />
//                     </div>
//                     <div className="card-body d-flex justify-content-between align-items-center px-3">
//                       <small>{key}</small>
//                       <img src={chevronDown} className="chevron-90" alt="" />
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Popular Services */}
//         <section className="container py-5 bg-light rounded popular-services">
//           <div className="d-flex justify-content-between align-items-center mb-4">
//             <h2 style={{ color: MAIN_TEXT_COLOR }}>Popular services</h2>
//           </div>
//           <div className="row g-4">
//             {POPULAR_SERVICES.map((svc, i) => (
//               <div key={i} className="col-sm-6 col-md-4">
//                 <div
//                   className="card h-100 shadow-sm border-0"
//                   style={{ cursor: 'pointer' }}
//                   onClick={() => navigate(svc.link)}
//                 >
//                   <div style={{ height: 140, overflow: 'hidden' }}>
//                     <img
//                       src={svc.img}
//                       alt={svc.title}
//                       className="w-100 h-100"
//                       style={{ objectFit: 'cover', transition: 'transform 0.3s' }}
//                       onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
//                       onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
//                     />
//                   </div>
//                   <div className="card-body">
//                     <h5 className="card-title mb-1" style={{ fontSize: '1rem' }}>
//                       {svc.title}
//                     </h5>
//                     <p className="text-muted small mb-0">{svc.sub}</p>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </section>

//         {/* Popular Vaccinations */}
//         <section className="container py-5">
//           <h2 style={{ color: MAIN_TEXT_COLOR, fontWeight: 700, fontSize: '1.75rem', marginBottom: '1rem' }}>
//             Popular <span style={{ color: MAIN_TEXT_COLOR }}>Vaccinations</span>
//           </h2>
//           <div className="row g-4">
//             {VACCINATIONS.map((vac, i) => (
//               <div key={i} className="col-sm-6 col-md-3">
//                 <div
//                   className="position-relative rounded overflow-hidden shadow-sm"
//                   style={{ height: 280, cursor: 'pointer' }}
//                   onClick={() => navigate(vac.link)}
//                 >
//                   <img
//                     src={vac.img}
//                     className="w-100 h-100"
//                     style={{ objectFit: 'cover', transition: 'transform 0.3s' }}
//                     onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
//                     onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
//                     alt={vac.title}
//                   />
//                   <div
//                     style={{
//                       position: 'absolute',
//                       bottom: 0,
//                       left: 0,
//                       right: 0,
//                       padding: '1rem',
//                       background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
//                       color: '#fff',
//                     }}
//                   >
//                     <h5 style={{ margin: 0 }}>{vac.title}</h5>
//                     <small>Book vaccine →</small>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </section>

//         {/* Pharmacy First Carousel */}
//         <section className="container-fluid px-4 pharmacy-first-carousel" style={{ background: '#0F1637', color: '#fff', padding: '4rem 0' }}>
//           <div className="d-flex justify-content-between align-items-center mb-3">
//             <h2 style={{ fontWeight: 700, fontSize: '2rem' }}>
//               Pharmacy First <span style={{ fontWeight: 400 }}>treatments</span>
//             </h2>
//           </div>
//           <p style={{ opacity: 0.8, marginBottom: '2rem' }}>
//             Free NHS advice and treatments for common conditions.
//           </p>
//           <div className="d-flex overflow-auto pharmacy-first-track" style={{ gap: '16px' }}>
//             {PHARMACY_FIRST.map((svc, idx) => (
//               <div
//                 key={idx}
//                 className="card text-center flex-shrink-0"
//                 style={{ width: 260, border: 'none', borderRadius: '0.75rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
//               >
//                 <div style={{ height: 180, overflow: 'hidden' }}>
//                   <img
//                     src={svc.img}
//                     alt={svc.title}
//                     className="w-100 h-100"
//                     style={{ objectFit: 'cover', transition: 'transform 0.3s' }}
//                     onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
//                     onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
//                   />
//                 </div>
//                 <div className="card-body">
//                   <h5 style={{ fontWeight: 600 }}>{svc.title}</h5>
//                   <p className="small mb-2">Ages: see pharmacy first</p>
//                   <button
//                     className="btn btn-primary btn-sm"
//                     style={{ width: '80%', margin: '0 auto', padding: '0.4rem 0' }}
//                     onClick={() => navigate(svc.link)}
//                   >
//                     Get started
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </section>

//         {/* Find Us */}
//         <section className="container py-5 find-us">
//           <h2 style={{ color: MAIN_TEXT_COLOR, fontWeight: 700 }}>Find us</h2>
//           <div className="row align-items-center mt-4">
//             <div className="col-md-6">
//               <p>Contact us for Travel vaccination, ear wax removal and a wide range of NHS or private services we offer.</p>
//               <p><strong>Phone:</strong> 01675 466014</p>
//               <p><strong>Email:</strong> coleshillpharmacy@nhs.com</p>
//               <p><strong>Address:</strong> 114–116 High St, Coleshill, Birmingham B46 3BJ</p>
//               <p>
//                 <strong>Hours:</strong><br/>
//                 Monday–Friday 8:30 am–6 pm<br/>
//                 Saturday 9 am–5:30 pm<br/>
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
// };

// export default HomePage;
// src/pages/auth/HomePage.tsx
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

  const buttonStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: "320px",
    padding: "14px 16px",
    borderRadius: "14px",
    textDecoration: "none",
    textAlign: "center",
    fontWeight: 700,
    fontSize: "16px",
    border: "none",
    background: "linear-gradient(90deg, #00c6ff, #0072ff)",
    color: "#fff",
    boxSizing: "border-box",
    display: "block",
  };

  const linkCardStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: "320px",
    padding: "14px 16px",
    borderRadius: "14px",
    textDecoration: "none",
    textAlign: "center",
    fontWeight: 700,
    fontSize: "16px",
    background: "#111",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.08)",
    boxSizing: "border-box",
    display: "block",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        paddingTop: "env(safe-area-inset-top)",
        paddingRight: "env(safe-area-inset-right)",
        paddingBottom: "env(safe-area-inset-bottom)",
        paddingLeft: "env(safe-area-inset-left)",
      }}
    >
      <div
        style={{
          maxWidth: "420px",
          margin: "0 auto",
          minHeight: "100vh",
          padding: "16px 14px 24px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <button
            onClick={() => navigate("/")}
            aria-label="Go to Homepage"
            style={{
              width: "44px",
              height: "44px",
              minWidth: "44px",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "#111",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0",
              cursor: "pointer",
            }}
          >
            <img
              src="https://gpcdcgwgkciyogknekwp.supabase.co/storage/v1/object/public/pharmacy//backhome.png"
              alt="Back to Home"
              style={{
                width: "22px",
                height: "22px",
                objectFit: "contain",
              }}
            />
          </button>

          <div
            style={{
              padding: "0 15px",
              flex: 1,
              height: "64px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "30px",
              fontWeight: 800,
              letterSpacing: "1.5px",
              color: "white",
              background: "linear-gradient(90deg, #00c6ff, #0072ff)",
              borderRadius: "16px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
              textTransform: "uppercase",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            Taz
          </div>
        </div>

        {/* Main Card */}
        <main
          style={{
            background: "#0b0b0b",
            borderRadius: "20px",
            padding: "20px 16px",
            border: "1px solid rgba(255,255,255,0.06)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "14px",
              color: "rgba(255,255,255,0.78)",
              wordBreak: "break-word",
              textAlign: "center",
            }}
          >
            {session ? `Email: ${session.user.email}` : "Please sign in..."}
          </p>

          {session ? (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <button
                onClick={handleSignOut}
                disabled={!!status}
                style={{
                  ...buttonStyle,
                  cursor: "pointer",
                  opacity: status ? 0.8 : 1,
                }}
              >
                {status ? "Signing Out..." : "Sign Out"}
              </button>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                alignItems: "center",
              }}
            >
              <Link to="/sign-in" style={buttonStyle}>
                Sign In
              </Link>

              <Link to="/sign-up" style={buttonStyle}>
                Sign Up
              </Link>
            </div>
          )}

          {session && role && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                alignItems: "center",
              }}
            >
              {role === "driver" ? (
                <>
                  <Link to="/my-orders" style={linkCardStyle}>
                    Orders
                  </Link>

                  <Link to="/my-bookings" style={linkCardStyle}>
                    My Bookings
                  </Link>

                  <Link to="/edit-profile" style={linkCardStyle}>
                    Edit Profile
                  </Link>
                </>
              ) : role === "admin" ? (
                <>
                  <Link to="/dashboard" style={linkCardStyle}>
                    Dashboard
                  </Link>

                  <Link to="/staffattendance" style={linkCardStyle}>
                    Attendance
                  </Link>

                  <Link to="/bookings" style={linkCardStyle}>
                    Bookings
                  </Link>

                  <Link to="/orders" style={linkCardStyle}>
                    Orders
                  </Link>

                  <Link to="/" style={linkCardStyle}>
                    Store
                  </Link>
                </>
              ) : (
                <Link to="/attendance" style={linkCardStyle}>
                  Staff Attendance
                </Link>
              )}
            </div>
          )}

          <div
            style={{
              height: "1px",
              background: "rgba(255,255,255,0.08)",
              marginTop: "4px",
            }}
          />

          {error && (
            <p
              style={{
                margin: 0,
                color: "#ff6b6b",
                fontSize: "14px",
                textAlign: "center",
              }}
            >
              {error}
            </p>
          )}
        </main>
      </div>
    </div>
  );
};

export default HomePage;