// import { useMemo, useRef, useState, useEffect } from "react";
// import supabase from "../../supabase"; // Adjust path as needed

// type Mode = "text" | "image" | "video";

// export default function VideoGenerator() {
//   const [mode, setMode] = useState<Mode>("text");
//   const [prompt, setPrompt] = useState("");
//   const [file, setFile] = useState<File | null>(null);
//   const [busy, setBusy] = useState(false);
//   const [videoId, setVideoId] = useState<string | null>(null);
//   const [status, setStatus] = useState<any>(null);
//   const [videoUrl, setVideoUrl] = useState<string | null>(null);
//   const [alert, setAlert] = useState("");

//   const BUCKET = "video";
//   const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

//   const pollTimerRef = useRef<number | null>(null);

//   useEffect(() => {
//     return () => {
//       if (pollTimerRef.current) {
//         clearInterval(pollTimerRef.current);
//       }
//     };
//   }, []);

//   const ready = useMemo(() => {
//     if (!prompt.trim()) return false;
//     if (mode === "text") return true;
//     return !!file;
//   }, [prompt, mode, file]);

//   function acceptForMode(m: Mode) {
//     if (m === "image") return "image/*";
//     if (m === "video") return "video/*";
//     return "";
//   }

//   function stopPolling() {
//     if (pollTimerRef.current) {
//       window.clearInterval(pollTimerRef.current);
//       pollTimerRef.current = null;
//     }
//   }

//   function reset() {
//     stopPolling();
//     setVideoId(null);
//     setStatus(null);
//     setVideoUrl(null);
//     setAlert("");
//   }

//   async function uploadToSupabasePublicUrl(f: File): Promise<string> {
//     const { data: session } = await supabase.auth.getSession();
//     const userId = session?.session?.user?.id ?? "public";

//     const ext = f.name.split(".").pop() || "bin";
//     const name = `${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;
//     const path = `${userId}/${name}`;

//     const { error } = await supabase.storage
//       .from(BUCKET)
//       .upload(path, f, { upsert: false, contentType: f.type });

//     if (error) throw error;

//     const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
//     if (!data?.publicUrl) throw new Error("Failed to get public URL");

//     return data.publicUrl;
//   }

//   async function createVideo(publicUrl?: string): Promise<string> {
//     const res = await fetch(`${API}/api/video/create`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         prompt,
//         model: "sora-simulated",
//         seconds: "8",
//         size: "1280x720",
//         publicUrl,
//         filename: file?.name,
//       }),
//     });

//     const json = await res.json();
//     if (!res.ok) throw new Error(json?.error || "Failed to create job");

//     return json.video_id as string;
//   }

//   function extractVideoUrl(s: any): string | null {
//     const candidates = [
//       s?.output_url,
//       s?.output?.url,
//       s?.outputs?.[0]?.url,
//       s?.data?.[0]?.url,
//       s?.video?.url,
//       s?.url,
//     ];
    
//     const url = candidates.find((u: any) => 
//       typeof u === "string" && (u.startsWith("http") || u.startsWith("https"))
//     ) ?? null;
    
//     return url;
//   }

//   async function pollStatus(id: string) {
//     stopPolling();

//     pollTimerRef.current = window.setInterval(async () => {
//       try {
//         const res = await fetch(`${API}/api/video/status?id=${id}`);
//         const s = await res.json();
//         setStatus(s);

//         if (s.status === "completed" || s.status === "succeeded") {
//           stopPolling();
//           const url = extractVideoUrl(s);
//           if (!url) {
//             setAlert("Generation completed but no video URL found");
//           } else {
//             setVideoUrl(url);
//           }
//         }

//         if (s.status === "failed" || s.status === "cancelled") {
//           stopPolling();
//           setAlert(`Generation failed: ${s.error || "Unknown error"}`);
//         }
//       } catch (e: any) {
//         stopPolling();
//         setAlert(`Polling error: ${e.message}`);
//       }
//     }, 2000);
//   }

//   async function handleGenerate() {
//     if (!ready || busy) return;

//     reset();
//     setBusy(true);

//     try {
//       let publicUrl: string | undefined;

//       if (mode !== "text") {
//         if (!file) throw new Error("No file selected");
//         publicUrl = await uploadToSupabasePublicUrl(file);
//       }

//       const id = await createVideo(publicUrl);
//       setVideoId(id);
//       pollStatus(id);
//     } catch (e: any) {
//       setAlert(e.message);
//     } finally {
//       setBusy(false);
//     }
//   }

//   return (
//     <div style={{ maxWidth: 900, margin: "20px auto", color: "#fff", padding: "20px", fontFamily: "Arial, sans-serif" }}>
//       <h1 style={{ color: "#fff", marginBottom: "30px" }}>AI Video Generator</h1>
      
//       {/* Mode selector */}
//       <div style={{ marginBottom: "25px", display: "flex", gap: "20px" }}>
//         <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
//           <input
//             type="radio"
//             value="text"
//             checked={mode === "text"}
//             onChange={(e) => {
//               setMode(e.target.value as Mode);
//               setFile(null);
//             }}
//             style={{ marginRight: "8px" }}
//           />
//           Text to Video
//         </label>
//         <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
//           <input
//             type="radio"
//             value="image"
//             checked={mode === "image"}
//             onChange={(e) => {
//               setMode(e.target.value as Mode);
//               setFile(null);
//             }}
//             style={{ marginRight: "8px" }}
//           />
//           Image to Video
//         </label>
//         <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
//           <input
//             type="radio"
//             value="video"
//             checked={mode === "video"}
//             onChange={(e) => {
//               setMode(e.target.value as Mode);
//               setFile(null);
//             }}
//             style={{ marginRight: "8px" }}
//           />
//           Video to Video
//         </label>
//       </div>

//       {/* Prompt input */}
//       <div style={{ marginBottom: "25px" }}>
//         <textarea
//           placeholder="Describe the video you want to generate..."
//           value={prompt}
//           onChange={(e) => setPrompt(e.target.value)}
//           rows={4}
//           style={{ 
//             width: "100%", 
//             padding: "15px", 
//             fontSize: "16px",
//             borderRadius: "8px",
//             border: "2px solid #555",
//             backgroundColor: "#333",
//             color: "#fff",
//             resize: "vertical"
//           }}
//         />
//       </div>

//       {/* File upload */}
//       {mode !== "text" && (
//         <div style={{ marginBottom: "25px" }}>
//           <input
//             type="file"
//             accept={acceptForMode(mode)}
//             onChange={(e) => setFile(e.target.files?.[0] || null)}
//             style={{ 
//               padding: "10px",
//               backgroundColor: "#333",
//               color: "#fff",
//               borderRadius: "8px",
//               border: "2px solid #555",
//               width: "100%"
//             }}
//           />
//           {file && (
//             <div style={{ marginTop: "10px", padding: "10px", backgroundColor: "#2a2a2a", borderRadius: "8px" }}>
//               <span style={{ color: "#4CAF50" }}>✓</span> Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
//             </div>
//           )}
//         </div>
//       )}

//       {/* Generate button */}
//       <button 
//         disabled={!ready || busy} 
//         onClick={handleGenerate}
//         style={{
//           padding: "15px 40px",
//           fontSize: "18px",
//           fontWeight: "bold",
//           backgroundColor: ready && !busy ? "#007bff" : "#555",
//           color: "white",
//           border: "none",
//           borderRadius: "8px",
//           cursor: ready && !busy ? "pointer" : "not-allowed",
//           opacity: ready && !busy ? 1 : 0.7,
//           transition: "all 0.3s",
//           width: "100%"
//         }}
//       >
//         {busy ? "⏳ Generating Video..." : "🚀 Generate Video"}
//       </button>

//       {/* Alert message */}
//       {alert && (
//         <div style={{ 
//           color: "#fff", 
//           marginTop: "20px", 
//           padding: "15px", 
//           backgroundColor: "#ff4444",
//           borderRadius: "8px",
//           border: "1px solid #ff6666"
//         }}>
//           <strong>Error:</strong> {alert}
//         </div>
//       )}

//       {/* Status display */}
//       {status && (
//         <div style={{ marginTop: "30px", padding: "20px", backgroundColor: "#2a2a2a", borderRadius: "8px" }}>
//           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
//             <h3 style={{ margin: 0 }}>Generation Status:</h3>
//             <span style={{ 
//               color: status.status === "completed" ? "#4CAF50" : 
//                     status.status === "failed" ? "#f44336" : 
//                     status.status === "processing" ? "#FFC107" : "#fff",
//               fontWeight: "bold",
//               padding: "5px 15px",
//               borderRadius: "20px",
//               backgroundColor: status.status === "completed" ? "rgba(76, 175, 80, 0.2)" :
//                              status.status === "failed" ? "rgba(244, 67, 54, 0.2)" :
//                              status.status === "processing" ? "rgba(255, 193, 7, 0.2)" : "#333"
//             }}>
//               {status.status?.toUpperCase() || "UNKNOWN"}
//             </span>
//           </div>
          
//           {status.progress !== undefined && (
//             <div style={{ marginBottom: "15px" }}>
//               <div style={{ 
//                 height: "10px", 
//                 backgroundColor: "#444", 
//                 borderRadius: "5px",
//                 overflow: "hidden"
//               }}>
//                 <div 
//                   style={{ 
//                     height: "100%", 
//                     backgroundColor: "#007bff",
//                     width: `${status.progress}%`,
//                     transition: "width 0.3s"
//                   }}
//                 />
//               </div>
//               <div style={{ display: "flex", justifyContent: "space-between", marginTop: "5px" }}>
//                 <span>Progress: {status.progress}%</span>
//                 {status.estimated_completion_time && (
//                   <span>ETA: {new Date(status.estimated_completion_time).toLocaleTimeString()}</span>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Generated video */}
//       {videoUrl && (
//         <div style={{ marginTop: "40px", backgroundColor: "#2a2a2a", padding: "25px", borderRadius: "12px" }}>
//           <h3 style={{ color: "#4CAF50", marginBottom: "20px" }}>🎬 Generated Video:</h3>
//           <div style={{ position: "relative", borderRadius: "10px", overflow: "hidden" }}>
//             <video 
//               src={videoUrl} 
//               controls 
//               style={{ 
//                 width: "100%", 
//                 borderRadius: "10px",
//                 backgroundColor: "#000"
//               }} 
//               autoPlay 
//               loop 
//               muted
//             />
//           </div>
//           <div style={{ marginTop: "20px", display: "flex", gap: "15px" }}>
//             <a 
//               href={videoUrl} 
//               download="generated-video.mp4"
//               style={{
//                 backgroundColor: "#4CAF50",
//                 color: "white",
//                 textDecoration: "none",
//                 padding: "12px 25px",
//                 borderRadius: "8px",
//                 fontWeight: "bold",
//                 display: "inline-flex",
//                 alignItems: "center",
//                 gap: "8px"
//               }}
//             >
//               📥 Download Video
//             </a>
//             <button
//               onClick={() => navigator.clipboard.writeText(videoUrl)}
//               style={{
//                 backgroundColor: "#555",
//                 color: "white",
//                 border: "none",
//                 padding: "12px 25px",
//                 borderRadius: "8px",
//                 fontWeight: "bold",
//                 cursor: "pointer",
//                 display: "inline-flex",
//                 alignItems: "center",
//                 gap: "8px"
//               }}
//             >
//               📋 Copy URL
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
import { useMemo, useRef, useState, useEffect } from "react";
import supabase from "../../supabase"; // Adjust path as needed

type Mode = "text" | "image" | "video";

export default function VideoGenerator() {
  const [mode, setMode] = useState<Mode>("text");
  const [prompt, setPrompt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [status, setStatus] = useState<any>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [alert, setAlert] = useState("");

  const BUCKET = "video";
  const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

  const pollTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    };
  }, []);

  const ready = useMemo(() => {
    if (!prompt.trim()) return false;
    if (mode === "text") return true;
    return !!file;
  }, [prompt, mode, file]);

  function acceptForMode(m: Mode) {
    if (m === "image") return "image/*";
    if (m === "video") return "video/*";
    return "";
  }

  function stopPolling() {
    if (pollTimerRef.current) {
      window.clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }

  function reset() {
    stopPolling();
    setVideoId(null);
    setStatus(null);
    setVideoUrl(null);
    setAlert("");
  }

  async function uploadToSupabasePublicUrl(f: File): Promise<string> {
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id ?? "public";

    const ext = f.name.split(".").pop() || "bin";
    const name = `${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;
    const path = `${userId}/${name}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, f, { upsert: false, contentType: f.type });

    if (error) throw error;

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    if (!data?.publicUrl) throw new Error("Failed to get public URL");

    return data.publicUrl;
  }

  async function createVideo(publicUrl?: string): Promise<string> {
    const res = await fetch(`${API}/api/video/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        model: "gen-2", // Updated for Runway ML
        seconds: "8",
        size: "1280x720",
        publicUrl,
        filename: file?.name,
        mode: mode // Send mode to backend
      }),
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json?.error || "Failed to create job");

    return json.video_id as string;
  }

  function extractVideoUrl(s: any): string | null {
    const candidates = [
      s?.output_url,
      s?.output?.url,
      s?.outputs?.[0]?.url,
      s?.data?.[0]?.url,
      s?.video?.url,
      s?.url,
    ];
    
    const url = candidates.find((u: any) => 
      typeof u === "string" && (u.startsWith("http") || u.startsWith("https"))
    ) ?? null;
    
    return url;
  }

  async function pollStatus(id: string) {
    stopPolling();

    pollTimerRef.current = window.setInterval(async () => {
      try {
        const res = await fetch(`${API}/api/video/status?id=${id}`);
        const s = await res.json();
        setStatus(s);

        if (s.status === "completed" || s.status === "succeeded") {
          stopPolling();
          const url = extractVideoUrl(s);
          if (!url) {
            setAlert("Generation completed but no video URL found");
          } else {
            setVideoUrl(url);
          }
        }

        if (s.status === "failed" || s.status === "cancelled") {
          stopPolling();
          setAlert(`Generation failed: ${s.error || "Unknown error"}`);
        }
      } catch (e: any) {
        stopPolling();
        setAlert(`Polling error: ${e.message}`);
      }
    }, 2000);
  }

  async function handleGenerate() {
    if (!ready || busy) return;

    reset();
    setBusy(true);

    try {
      let publicUrl: string | undefined;

      if (mode !== "text") {
        if (!file) throw new Error("No file selected");
        publicUrl = await uploadToSupabasePublicUrl(file);
      }

      const id = await createVideo(publicUrl);
      setVideoId(id);
      pollStatus(id);
    } catch (e: any) {
      setAlert(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "20px auto", color: "#fff", padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ color: "#fff", marginBottom: "30px" }}>AI Video Generator (Runway ML)</h1>
      
      {/* Mode selector */}
      <div style={{ marginBottom: "25px", display: "flex", gap: "20px" }}>
        <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
          <input
            type="radio"
            value="text"
            checked={mode === "text"}
            onChange={(e) => {
              setMode(e.target.value as Mode);
              setFile(null);
            }}
            style={{ marginRight: "8px" }}
          />
          Text to Video
        </label>
        <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
          <input
            type="radio"
            value="image"
            checked={mode === "image"}
            onChange={(e) => {
              setMode(e.target.value as Mode);
              setFile(null);
            }}
            style={{ marginRight: "8px" }}
          />
          Image to Video
        </label>
        <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
          <input
            type="radio"
            value="video"
            checked={mode === "video"}
            onChange={(e) => {
              setMode(e.target.value as Mode);
              setFile(null);
            }}
            style={{ marginRight: "8px" }}
          />
          Video to Video
        </label>
      </div>

      {/* Prompt input */}
      <div style={{ marginBottom: "25px" }}>
        <textarea
          placeholder="Describe the video you want to generate..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          style={{ 
            width: "100%", 
            padding: "15px", 
            fontSize: "16px",
            borderRadius: "8px",
            border: "2px solid #555",
            backgroundColor: "#333",
            color: "#fff",
            resize: "vertical"
          }}
        />
      </div>

      {/* File upload */}
      {mode !== "text" && (
        <div style={{ marginBottom: "25px" }}>
          <input
            type="file"
            accept={acceptForMode(mode)}
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            style={{ 
              padding: "10px",
              backgroundColor: "#333",
              color: "#fff",
              borderRadius: "8px",
              border: "2px solid #555",
              width: "100%"
            }}
          />
          {file && (
            <div style={{ marginTop: "10px", padding: "10px", backgroundColor: "#2a2a2a", borderRadius: "8px" }}>
              <span style={{ color: "#4CAF50" }}>✓</span> Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </div>
          )}
        </div>
      )}

      {/* Generate button */}
      <button 
        disabled={!ready || busy} 
        onClick={handleGenerate}
        style={{
          padding: "15px 40px",
          fontSize: "18px",
          fontWeight: "bold",
          backgroundColor: ready && !busy ? "#007bff" : "#555",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: ready && !busy ? "pointer" : "not-allowed",
          opacity: ready && !busy ? 1 : 0.7,
          transition: "all 0.3s",
          width: "100%"
        }}
      >
        {busy ? "⏳ Generating Video..." : "🚀 Generate Video"}
      </button>

      {/* Alert message */}
      {alert && (
        <div style={{ 
          color: "#fff", 
          marginTop: "20px", 
          padding: "15px", 
          backgroundColor: "#ff4444",
          borderRadius: "8px",
          border: "1px solid #ff6666"
        }}>
          <strong>Error:</strong> {alert}
        </div>
      )}

      {/* Status display */}
      {status && (
        <div style={{ marginTop: "30px", padding: "20px", backgroundColor: "#2a2a2a", borderRadius: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
            <h3 style={{ margin: 0 }}>Generation Status:</h3>
            <span style={{ 
              color: status.status === "completed" ? "#4CAF50" : 
                    status.status === "failed" ? "#f44336" : 
                    status.status === "processing" ? "#FFC107" : "#fff",
              fontWeight: "bold",
              padding: "5px 15px",
              borderRadius: "20px",
              backgroundColor: status.status === "completed" ? "rgba(76, 175, 80, 0.2)" :
                             status.status === "failed" ? "rgba(244, 67, 54, 0.2)" :
                             status.status === "processing" ? "rgba(255, 193, 7, 0.2)" : "#333"
            }}>
              {status.status?.toUpperCase() || "UNKNOWN"}
            </span>
          </div>
          
          {status.progress !== undefined && (
            <div style={{ marginBottom: "15px" }}>
              <div style={{ 
                height: "10px", 
                backgroundColor: "#444", 
                borderRadius: "5px",
                overflow: "hidden"
              }}>
                <div 
                  style={{ 
                    height: "100%", 
                    backgroundColor: "#007bff",
                    width: `${status.progress}%`,
                    transition: "width 0.3s"
                  }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "5px" }}>
                <span>Progress: {status.progress}%</span>
                {status.estimated_completion_time && (
                  <span>ETA: {new Date(status.estimated_completion_time).toLocaleTimeString()}</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Generated video */}
      {videoUrl && (
        <div style={{ marginTop: "40px", backgroundColor: "#2a2a2a", padding: "25px", borderRadius: "12px" }}>
          <h3 style={{ color: "#4CAF50", marginBottom: "20px" }}>🎬 Generated Video:</h3>
          <div style={{ position: "relative", borderRadius: "10px", overflow: "hidden" }}>
            <video 
              src={videoUrl} 
              controls 
              style={{ 
                width: "100%", 
                borderRadius: "10px",
                backgroundColor: "#000"
              }} 
              autoPlay 
              loop 
              muted
            />
          </div>
          <div style={{ marginTop: "20px", display: "flex", gap: "15px" }}>
            <a 
              href={videoUrl} 
              download="generated-video.mp4"
              style={{
                backgroundColor: "#4CAF50",
                color: "white",
                textDecoration: "none",
                padding: "12px 25px",
                borderRadius: "8px",
                fontWeight: "bold",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              📥 Download Video
            </a>
            <button
              onClick={() => navigator.clipboard.writeText(videoUrl)}
              style={{
                backgroundColor: "#555",
                color: "white",
                border: "none",
                padding: "12px 25px",
                borderRadius: "8px",
                fontWeight: "bold",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              📋 Copy URL
            </button>
          </div>
        </div>
      )}
    </div>
  );
}