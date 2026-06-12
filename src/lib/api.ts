
export const getServerUrl = () => {
  const stored = localStorage.getItem("JARVIS_SERVER_URL");
  if (stored) return stored;
  
  const envUrl = import.meta.env.VITE_SERVER_URL;
  if (envUrl && envUrl !== "http://localhost:3000") return envUrl;

  // Use absolute localhost for Electron static file loading
  if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
     return "http://localhost:3000";
  }

  // Use relative path for web and standard setups
  return "";
};
