# 📚 Biblioteca Digital

Trabajo Práctico Integrador — Desarrollo de Aplicaciones Web  
Aplicación full-stack para la gestión digital de una biblioteca: autores y libros con relación 1 a N, CRUD completo, filtros, y chatbot con inteligencia artificial.

---

## 📋 Descripción del Proyecto

La **Biblioteca Digital** permite:
- Gestionar **Autores** (crear, listar, eliminar)
- Gestionar **Libros** asociados a un autor (crear, leer, editar, eliminar)
- Filtrar libros por autor o por texto libre (título / género)
- Ver el detalle completo de cada libro
- Consultar al **Chatbot IA** (Gemini) preguntas sobre el catálogo usando datos reales de la base de datos

**Entidades y relación:**
```
Autor (1) ───────────< Libro (N)
 - id              - id
 - nombre          - titulo
 - nacionalidad    - genero
                   - anio_publicacion
                   - disponible
                   - autor_id (FK)
```

---

## 🛠️ Tecnologías Utilizadas

| Capa | Tecnología |
|---|---|
| Backend | Python 3 · Flask 3 · Flask-CORS |
| Base de datos | SQLite (integrada, sin instalación) |
| IA / Chatbot | Google Gemini 2.5 Flash (`google-genai`) |
| Frontend | Angular 19 (Standalone Components) |
| Estilos | CSS puro (sin frameworks externos) |
| Control de versiones | Git + GitHub |

---

## 📁 Estructura del Repositorio

```
biblioteca-api/
├── .gitignore                  ← Archivos ignorados por Git
├── README.md                   ← Este archivo
│
├── backend/
│   ├── app.py                  ← API REST Flask (todos los endpoints + chatbot)
│   ├── database.py             ← Creación de tablas e inserción de datos semilla
│   ├── requirements.txt        ← Dependencias Python
│   ├── .env.example            ← Plantilla de variables de entorno
│   └── pruebas.http            ← Archivo de pruebas para REST Client (VS Code)
│
└── frontend/
    └── src/app/
        ├── app.config.ts       ← Configuración principal (HttpClient, Router)
        ├── app.ts              ← Componente raíz
        ├── app.html            ← Navbar + router-outlet + chatbot flotante
        ├── app.routes.ts       ← Definición de rutas
        ├── models/             ← Interfaces TypeScript (Autor, Libro, MensajeChat)
        ├── services/           ← Servicios HTTP (AutorService, LibroService, ChatService)
        └── components/
            ├── libro-list/     ← Catálogo con filtros y eliminación
            ├── libro-detalle/  ← Vista de detalle de un libro
            ├── libro-form/     ← Formulario reactivo (alta y edición)
            ├── autor-list/     ← Gestión de autores
            └── chatbot/        ← Chatbot flotante con Gemini
```

---

## ⚙️ Requisitos Previos

- **Python 3.10+** — [python.org](https://python.org)
- **Node.js 18+** (incluye npm) — [nodejs.org](https://nodejs.org)
- **Angular CLI** — se usa vía `npx`, no requiere instalación global
- **Clave de API de Google Gemini** — [aistudio.google.com](https://aistudio.google.com)

---

## 🚀 Instalación y Ejecución

### Backend (Flask)

```bash
# 1. Ir a la carpeta del backend
cd backend

# 2. Crear el entorno virtual de Python
python -m venv venv

# 3. Activar el entorno virtual
# En Windows:
venv\Scripts\activate
# En Mac/Linux:
source venv/bin/activate

# 4. Instalar dependencias
pip install -r requirements.txt

# 5. Configurar la clave de Gemini
cp .env.example .env
# Editá el archivo .env y pegá tu API Key:
# GEMINI_API_KEY=tu_clave_aqui

# 6. Iniciar el servidor
python app.py
# El servidor queda corriendo en: http://127.0.0.1:5000
```

### Frontend (Angular)

> ⚠️ Abrí una **segunda terminal** sin cerrar la del backend.

```bash
# 1. Ir a la carpeta del frontend
cd frontend

# 2. Instalar dependencias de Node.js
npm install

# 3. Iniciar el servidor de desarrollo
npm start
# La app queda disponible en: http://localhost:4200
```

> **Nota Windows (PowerShell):** Si `npm start` falla por política de ejecución, usá `npm.cmd start`.

---

## 🔌 Endpoints de la API

| Método | URL | Descripción | Código OK |
|---|---|---|---|
| GET | `/autores` | Listar todos los autores | 200 |
| GET | `/autores/:id` | Obtener un autor por ID | 200 |
| POST | `/autores` | Crear un nuevo autor | 201 |
| PUT | `/autores/:id` | Actualizar un autor | 200 |
| DELETE | `/autores/:id` | Eliminar un autor (falla si tiene libros) | 200 |
| GET | `/libros` | Listar libros (filtros: `autor_id`, `busqueda`) | 200 |
| GET | `/libros/:id` | Obtener un libro por ID (incluye nombre del autor) | 200 |
| POST | `/libros` | Crear un nuevo libro | 201 |
| PUT | `/libros/:id` | Actualizar un libro | 200 |
| DELETE | `/libros/:id` | Eliminar un libro | 200 |
| POST | `/chat` | Enviar mensaje al chatbot Gemini | 200 |

---

## ✨ Funcionalidades

- ✅ CRUD completo de **Autores** y **Libros**
- ✅ Relación 1 a N con `FOREIGN KEY` en SQLite
- ✅ Filtrado de libros por **autor** (JOIN SQL) y por **texto libre**
- ✅ Formulario reactivo con **validaciones** y mensajes de error en pantalla
- ✅ Chatbot flotante con **Google Gemini** que consulta la base de datos real
- ✅ Interfaz responsive con navbar y tarjetas
- ✅ Tests unitarios con **Karma + Jasmine**
- ✅ Commits progresivos por etapa en **Git/GitHub**

---

## 🧪 Tests Unitarios

```bash
cd frontend
npx ng test --watch=false --browsers=ChromeHeadless
```

Los tests se encuentran en:
- `src/app/services/libro.service.spec.ts` — Prueba del `LibroService`
- `src/app/services/autor.service.spec.ts` — Prueba del `AutorService`
- `src/app/components/libro-list/libro-list.component.spec.ts` — Prueba del `LibroListComponent`

---

## 👩‍💻 Autora

**Agustina** — Trabajo Práctico Integrador  
Repositorio: [github.com/agustina-prog/biblioteca-api](https://github.com/agustina-prog/biblioteca-api)
