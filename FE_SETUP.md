# Frontend Setup Instructions (Vite + React)

## 1. Prerequisites
- **Node.js** (v16+) and **npm** installed.

## 2. Configuration (`.env.local`)
The Frontend uses `vite.config.ts` to proxy requests to the Backend during development.

1.  **Locate/Create Environment File**:
    - File: `OnlineExamFe/client/.env.local` (Create if it doesn't exist).

2.  **To Connect to LOCAL Backend (Default)**:
    - Set `VITE_API_TARGET` to your local backend URL.
    - Leave `VITE_API_BASE_URL` **empty**.
    ```env
    VITE_API_TARGET=https://localhost:7239
    VITE_API_BASE_URL=
    ```

3.  **To Connect to ONLINE Backend (Swagger/Render)**:
    - Set `VITE_API_BASE_URL` to the online URL.
    ```env
    VITE_API_BASE_URL=https://it4409-20251.onrender.com
    # VITE_API_TARGET is ignored when VITE_API_BASE_URL is set
    ```

## 3. Run Frontend (Local)
1.  **Navigate to Client Directory**:
    ```bash
    cd OnlineExamFe/client
    ```

2.  **Install Dependencies** (if first time):
    ```bash
    npm install
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```

4.  **Access the Application**:
    - Open your browser at: `http://localhost:5173`
    - The app will automatically proxy API calls (e.g., `/api/Auth/login`) to the configured Target (e.g., `https://localhost:7239`).

## 4. Troubleshooting
- **CORS Error**:
    - Ensure your Backend `appsettings.json` allows `http://localhost:5173` in `FrontendUrl`.
    - Ensure your `.env.local` has the correct `VITE_API_TARGET` if using proxy.
- **WebSocket Error**:
    - If `ws://` connections fail, ensure the Backend is running and `UseWebSockets()` is enabled in `Program.cs`.
    - Use `console.log` in `ExamListPage.tsx` to debug the `wsUrl` received from the Backend.
