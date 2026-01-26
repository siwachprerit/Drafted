# Drafted - AI-Powered Blogging Platform

Drafted is a premium, modern blogging platform designed for storytellers. It features a sleek glassmorphic UI, real-time notifications, rich text editing, and AI-powered interaction.

## 🚀 Technologies

*   **Frontend**: React (Vite), Tailwind CSS, Framer Motion
*   **Backend**: Node.js, Express.js, Socket.IO
*   **Database**: MongoDB
*   **Authentication**: JWT (JSON Web Tokens)

---

## 🛠️ Getting Started Locally

### Prerequisites

*   Node.js (v18+)
*   MongoDB (Local or Atlas)

### 1. Clone the Repository

```bash
git clone https://github.com/siwachprerit/Drafted.git
cd Drafted
```

### 2. Setup Backend

Navigate to the server directory and install dependencies:

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory with the following variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
# Optional: Allowed origins for CORS if restricted
# CLIENT_URL=http://localhost:5173
```

Start the server:

```bash
npm start
```
The server will run on `http://localhost:5000`.

### 3. Setup Frontend

Open a new terminal, navigate to the client directory, and install dependencies:

```bash
cd client
npm install
```

Start the development server:

```bash
npm run dev
```
The client will run on `http://localhost:5173`.

---

## 🌍 Deployment Guide

### Backend Deployment (Railway)

1.  Push your code to GitHub.
2.  Login to [Railway](https://railway.app/).
3.  Click **"New Project"** -> **"Deploy from GitHub repo"**.
4.  Select the `Drafted` repository.
5.  **Important**: Railway might try to deploy the root. You need to configure it to deploy the `server` folder.
    *   Go to **Settings** -> **Root Directory**.
    *   Set it to `/server`.
6.  Go to the **Variables** tab and add:
    *   `MONGO_URI`: Your MongoDB Cloud URL.
    *   `JWT_SECRET`: A secure random string.
    *   `PORT`: `5000` (Optional, Railway sets its own PORT usually, code handles it).
7.  Railway will build and deploy. Once finished, it will give you a public domain (e.g., `drafted-server.up.railway.app`).

### Frontend Deployment (Vercel)

1.  Login to [Vercel](https://vercel.com/).
2.  Click **"Add New..."** -> **"Project"**.
3.  Import the `Drafted` repository.
4.  **Framework Preset**: Select **Vite**.
5.  **Root Directory**: Click "Edit" and select `client`.
6.  **Environment Variables**:
    *   Key: `VITE_API_URL`
    *   Value: The **Domain URL** from your Railway backend (e.g., `https://drafted-server.up.railway.app/api`).
    *   **Note**: Ensure you add `/api` at the end if your backend routes are prefixed with `/api`.
7.  Click **Deploy**.

### Final Configuration

*   Once deployment is complete, your app should be live!
*   If you see CORS errors:
    *   Go to your `server` code (`src/app.js`).
    *   Update `app.use(cors())` to `app.use(cors({ origin: 'https://your-vercel-app.vercel.app' }))` for better security, or keep it open.
*   **Socket.IO**: The frontend automatically connects to the backend URL (minus `/api`). Ensure your backend allows socket connections from the frontend origin.

---

## 📂 Project Structure

```
Drafted/
├── client/         # React Frontend
│   ├── src/
│   ├── public/
│   └── vite.config.js
└── server/         # Express Backend
    ├── src/
    │   ├── models/
    │   ├── routes/
    │   └── controllers/
    └── package.json
```
