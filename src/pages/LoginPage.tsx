// import React, { useEffect, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import supabase from "../supabase";
// import { useSession } from "../context/SessionContext";
// import styles from "./HomePage.module.css";

// const HomePage: React.FC = () => {
//   const navigate = useNavigate();
//   const { session } = useSession();

//   const [role, setRole] = useState<string | null>(null);
//   const [status, setStatus] = useState<string>("");
//   const [error, setError] = useState<string>("");

//   useEffect(() => {
//     const fetchUserRole = async () => {
//       if (!session?.user?.id) return;

//       const { data, error } = await supabase
//         .from("profiles")
//         .select("role")
//         .eq("id", session.user.id)
//         .single();

//       if (error) {
//         navigate("/setup-profile");
//       } else {
//         const r = data.role;

//         if (r === "customer" || r === "driver" || r === "admin") {
//           setRole(r);
//         } else {
//           navigate("/setup-profile");
//         }
//       }
//     };

//     fetchUserRole();
//   }, [session, navigate]);

//   const handleSignOut = async () => {
//     setStatus("Signing out...");
//     setError("");

//     try {
//       await supabase.auth.signOut();
//       navigate("/sign-in", { replace: true });
//     } catch (err: any) {
//       setError(err.message || "Error signing out");
//       setStatus("");
//     }
//   };

//   return (
//     <div className={styles.pageWrapper}>
//       {/* Header */}
//       <div className={styles.header}>
//         <button
//           onClick={() => navigate("/")}
//           className={styles.backButton}
//           aria-label="Go to Homepage"
//         >
//           <img
//             src="https://gpcdcgwgkciyogknekwp.supabase.co/storage/v1/object/public/pharmacy//backhome.png"
//             alt="Back to Home"
//           />
//         </button>

//         {/* FlowFleet Logo Text */}
//         <div
//           style={{
//             padding: "0 15px", 
//             width: "100%",
//             maxWidth: "420px",
//             height: "90px",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             fontSize: "42px",
//             fontWeight: 800,
//             letterSpacing: "2px",
//             color: "white",
//             background: "linear-gradient(90deg, #00c6ff, #0072ff)",
//             borderRadius: "18px",
//             boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
//             textTransform: "uppercase",
//           }}
//         >
//           Taz 
//         </div>
//       </div>

//       {/* Main */}
//       <main className={styles.container}>
//         <p className={styles.subText}>
//           {session ? `Email: ${session.user.email}` : "Please sign in..."}
//         </p>

//         {session ? (
//           <button
//             onClick={handleSignOut}
//             className={styles.authButton}
//             disabled={!!status}
//           >
//             {status ? <div className={styles.loader} /> : "Sign Out"}
//           </button>
//         ) : (
//           <div className={styles.roleLinksContainer}>
//             <Link to="/sign-in" className={styles.authButton}>
//               Sign In
//             </Link>

//             <Link to="/sign-up" className={styles.authButton}>
//               Sign Up
//             </Link>
//           </div>
//         )}

//         {session && role && (
//           <div className={styles.roleLinksContainer}>
//             {role === "driver" ? (
//               <>
//                 <Link to="/my-orders" className={styles.roleLink}>
//                   Orders
//                 </Link>

//                 <Link to="/my-bookings" className={styles.roleLink}>
//                   My Bookings
//                 </Link>

//                 <Link to="/edit-profile" className={styles.roleLink}>
//                   Edit Profile
//                 </Link>
//               </>
//             ) : role === "admin" ? (
//               <>
//                 <Link to="/staffattendance" className={styles.roleLink}>
//                   Attendance
//                 </Link>

//                 <Link to="/bookings" className={styles.roleLink}>
//                   Bookings
//                 </Link>

//                 <Link to="/orders" className={styles.roleLink}>
//                   Orders
//                 </Link>

//                 <Link to="/store" className={styles.roleLink}>
//                   Store
//                 </Link>
//               </>
//             ) : (
//               <Link to="/attendance" className={styles.roleLink}>
//                 Staff Attendance
//               </Link>
//             )}
//           </div>
//         )}

//         <div className={styles.divider} />

//         {error && <p className={styles.error}>{error}</p>}
//       </main>
//     </div>
//   );
// };

// export default HomePage;