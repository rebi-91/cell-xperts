

// import React from "react";
// import { Link, Navigate, useNavigate } from "react-router-dom";
// import { useSession } from "../../context/SessionContext"; // Ensure this context is correctly set up
// import supabase from "../../supabase";
// import { useForm } from "react-hook-form";
// import useAuth from "./hooks/useAuth";
// import styles from "./hooks/SignInPage.module.css";

// // TypeScript interfaces
// interface FormValues {
//   email: string;
//   password: string;
//   notInSchool: boolean; // New field for the checkbox (if needed)
// }

// const SignInPage: React.FC = () => {
//   const navigate = useNavigate();
//   const { session: contextSession } = useSession(); // Assuming useSession provides the current session
//   const { authState, signIn } = useAuth();

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<FormValues>(); // Initializing useForm

//   // Local state for status and error messages
//   const [status, setStatus] = React.useState<string>("");
//   const [error, setError] = React.useState<string>("");

//   const onSubmit = handleSubmit(async (data) => {
//     setStatus("Logging in...");
//     setError("");
//     try {
//       const { email, password } = data;

//       // Step 1: Authenticate the user
//       const { user, session } = await signIn(email, password);

//       // Ensure the session is set
//       if (!session) {
//         throw new Error("Authentication session not established.");
//       }

//       // Step 2: Fetch the user's profile to check the role
//       const { data: profileData, error: profileError } = await supabase
//         .from("profiles")
//         .select("role")
//         .eq("id", user.id)
//         .single();

//       if (profileError) {
//         throw new Error(profileError.message);
//       }

//       setStatus("Signed in successfully.");

//       if (profileData.role === "New") {
//         navigate("/setup-profile");
//       } else if (profileData.role === "Staff") {
//         navigate("/login");
//       } else {
//         navigate("/");  // fallback
//       }
      
//     } catch (err: any) {
//       setError(err.message || "An unexpected error occurred.");
//       setStatus("");
//     }
//   });

//   // Early return if already signed in
//   if (contextSession) return <Navigate to="/login" />;

//   return (
//     <div
//     style={{
//       backgroundColor: "#000",
//       minHeight: "100vh",
//       paddingTop: "env(safe-area-inset-top)",
//       paddingLeft: "env(safe-area-inset-left)",
//       paddingRight: "env(safe-area-inset-right)",
//       paddingBottom: "env(safe-area-inset-bottom)",
//       display: "flex",
//       justifyContent: "center",
//       alignItems: "center",
//     }}
//   >
//         <main
//           className={styles.container}
//         >
//       {/* Retained Home Link */}
//       <Link className={styles.homeLink} to="/login">
//         ◄ Home
//       </Link>
//       <form className={styles.form} onSubmit={onSubmit}>
//         <h1 className={styles.headerText}>Sign In</h1>

//         {/* Email Input */}
//         <label htmlFor="email" className={styles.label}>
//           Email:
//         </label>
//         <input
//           id="email"
//           type="email"
//           placeholder="Email"
//           {...register("email", { required: "Email is required." })}
//           className={styles.input}
//         />
//         {errors.email && <p className={styles.error}>{errors.email.message}</p>}

//         {/* Password Input */}
//         <label htmlFor="password" className={styles.label}>
//           Password:
//         </label>
//         <input
//           id="password"
//           type="password"
//           placeholder="Password"
//           {...register("password", { required: "Password is required." })}
//           className={styles.input}
//         />
//         {errors.password && <p className={styles.error}>{errors.password.message}</p>}

//         {/* Submit Button */}
//         <button type="submit" className={styles.button} disabled={authState.loading}>
//           {authState.loading ? <div className={styles.loader}></div> : "Login"}
//         </button>

//         {/* Sign-Up Link */}
//         <Link className={styles.authLink} to="/sign-up">
//           Don't have an account? Sign Up
//         </Link>

//         {/* Status Message */}
//         {status && <p className={styles.status}>{status}</p>}

//         {/* Error Message */}
//         {error && <p className={styles.error}>{error}</p>}
//       </form>
//     </main>
//     </div>
//   );
// };

// export default SignInPage;



import React from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useSession } from "../../context/SessionContext"; // Ensure this context is correctly set up
import supabase from "../../supabase";
import { useForm } from "react-hook-form";
import useAuth from "./hooks/useAuth";
import styles from "./hooks/SignInPage.module.css";

// TypeScript interfaces
interface FormValues {
  email: string;
  password: string;
}

const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const { session: contextSession } = useSession(); // Assuming useSession provides the current session
  const { authState, signIn } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  // Local state for status and error messages
  const [status, setStatus] = React.useState<string>("");
  const [error, setError] = React.useState<string>("");

  const onSubmit = handleSubmit(async (data) => {
    setStatus("Logging in...");
    setError("");
    try {
      const { email, password } = data;

      // Authenticate the user
      const { user, session } = await signIn(email, password);

      if (!session) {
        throw new Error("Authentication session not established.");
      }

      // Fetch the user's profile to check the role
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError) {
        throw new Error(profileError.message);
      }

      setStatus("Signed in successfully.");

      // Redirect based on role
      if (
        profileData.role === "admin" ||
        profileData.role === "driver" ||
        profileData.role === "customer"
      ) {
        navigate("/");
      } else {
        navigate("/sign-up");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setStatus("");
    }
  });

  // If already signed in, redirect immediately
  if (contextSession) {
    return <Navigate to="/login" />;
  }

  return (
    <div
      style={{
        backgroundColor: "#000",
        minHeight: "100vh",
        paddingTop: "env(safe-area-inset-top)",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
        paddingBottom: "env(safe-area-inset-bottom)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <main className={styles.container}>
        {/* Retained Home Link */}
        <Link className={styles.homeLink} to="/login">
          ◄ Home
        </Link>
        <form className={styles.form} onSubmit={onSubmit}>
          <h1 className={styles.headerText}>Sign In</h1>

          {/* Email Input */}
          <label htmlFor="email" className={styles.label}>
            Email:
          </label>
          <input
            id="email"
            type="email"
            placeholder="Email"
            {...register("email", { required: "Email is required." })}
            className={styles.input}
          />
          {errors.email && <p className={styles.error}>{errors.email.message}</p>}

          {/* Password Input */}
          <label htmlFor="password" className={styles.label}>
            Password:
          </label>
          <input
            id="password"
            type="password"
            placeholder="Password"
            {...register("password", { required: "Password is required." })}
            className={styles.input}
          />
          {errors.password && <p className={styles.error}>{errors.password.message}</p>}

          {/* Submit Button */}
          <button type="submit" className={styles.button} disabled={authState.loading}>
            {authState.loading ? <div className={styles.loader}></div> : "Login"}
          </button>

          {/* Sign-Up Link */}
          <Link className={styles.authLink} to="/sign-up">
            Don't have an account? Sign Up
          </Link>

          {/* Status and Error Messages */}
          {status && <p className={styles.status}>{status}</p>}
          {error && <p className={styles.error}>{error}</p>}
        </form>
      </main>
    </div>
  );
};

export default SignInPage;
