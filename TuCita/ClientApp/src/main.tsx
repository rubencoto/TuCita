import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./services/api/axiosConfig"; // Importar configuración de Axios

createRoot(document.getElementById("root")!).render(<App />);