import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./services/axiosConfig"; // Importar configuraci�n de Axios

createRoot(document.getElementById("root")!).render(<App />);  