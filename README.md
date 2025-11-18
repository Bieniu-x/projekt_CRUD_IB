Game Library – Mini CRUD App (Express + SQLite + JWT + HTML/JS)

Prosty projekt typu end-to-end, stworzony w celach edukacyjnych.
Aplikacja umożliwia rejestrację i logowanie użytkowników oraz wykonywanie operacji CRUD na bazie gier (dodawanie, edycja, usuwanie i wyświetlanie).
Wszystkie chronione endpointy dostępne są wyłącznie po zalogowaniu.

Projekt został wdrożony online i działa na publicznym hostingu Render.

Live demo (Render):
https://game-library-crud-ib.onrender.com

Konto testowe:
login: student
email: student@test.com
hasło: student123

Technologie użyte w projekcie:

Backend:
Node.js (wersja 18)
Express
better-sqlite3 (baza danych w jednym pliku)
bcrypt (hashowanie haseł)
jsonwebtoken (JWT) – autoryzacja
cookie-parser – obsługa ciasteczek httpOnly

Frontend:
Czysty HTML + CSS + JavaScript
Fetch API do komunikacji z backendem
Baza danych
SQLite (plikowa baza danych, automatyczne migracje)

Hosting:
Render (aplikacja działa online)
Node 18 + środowiskowa zmienna JWT_SECRET
