//Import potrzebnych bibliotek
import express from "express";      // Express = serwer HTTP
import cors from "cors";            // CORS = pozwala frontowi komunikować się z API
import path from "path";            // path = praca ze ścieżkami plików
import { fileURLToPath } from "url"; // potrzebne do __dirname w ESM

//Utworzenie aplikacji Express
const app = express();

//Middleware – konfiguracja zachowania serwera
app.use(cors());            // zezwala na połączenia z innego adresu (frontend)
app.use(express.json());    // umożliwia odbieranie JSON w requestach (np. POST)

//Konfiguracja folderu public (frontend)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

//Testowy endpoint (API)
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    message: "Serwer działa poprawnie 💪",
    time: new Date().toISOString(),
  });
});

//Strona główna (fallback, jeśli ktoś wejdzie na /)
app.get("/", (req, res) => {
  res.send("Hello from backend! Wejdź na /api/health żeby sprawdzić API 🙂");
});

//Uruchomienie serwera
const PORT = process.env.PORT || 3000;  // jeśli nie ma zmiennej PORT → domyślnie 3000
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
