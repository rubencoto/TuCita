import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import App from "./App.tsx";
import "./index.css";
import "./services/api/axiosConfig"; // Importar configuración de Axios

// Configuración global de React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos - datos se consideran frescos
      gcTime: 10 * 60 * 1000, // 10 minutos en caché (antes cacheTime)
      refetchOnWindowFocus: false, // No re-fetch automático al cambiar de pestaña
      retry: 1, // 1 reintento en caso de error
      refetchOnReconnect: true, // Re-fetch al reconectar internet
    },
    mutations: {
      retry: 1,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);