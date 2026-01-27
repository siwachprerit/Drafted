<p align="center">
  <img src="client/src/assets/hero-bg.jpg" alt="Drafted Banner" width="100%" />
</p>

<h1 align="center">
  ✍️ Drafted
</h1>

<p align="center">
  <strong>Where words find their weight.</strong><br/>
  A premium, full-stack blogging platform for modern storytellers.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Socket.IO-Real--time-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.IO" />
  <img src="https://img.shields.io/badge/TailwindCSS-4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS" />
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-project-structure">Project Structure</a> •
  <a href="#-api-reference">API Reference</a> •
  <a href="#-screenshots">Screenshots</a> •
  <a href="#-contributing">Contributing</a>
</p>

---

## 🌟 Overview

**Drafted** is a beautifully designed, full-stack blogging platform built with the MERN stack. It provides an immersive writing and reading experience with a stunning glassmorphic UI, real-time notifications, social features, and modern web technologies.

Whether you're a casual writer or a professional storyteller, Drafted offers a distraction-free canvas to craft and share your narrative with the world.

---

## ✨ Features

### 📝 **Content Management**
- **Create & Edit Blogs** — Rich text editor with cover image support
- **Draft & Publish System** — Save drafts and publish when ready
- **Tags Support** — Organize content with customizable tags
- **Cover Images** — Beautiful hero images for each blog post

### 👤 **User Authentication & Profiles**
- **Secure Authentication** — JWT-based auth with bcrypt password hashing
- **User Profiles** — Customizable profiles with profile pictures
- **Account Management** — Update profile info, change password, delete account
- **Session Persistence** — Stay logged in across browser sessions

### 💬 **Social Features**
- **Follow/Unfollow System** — Follow your favorite writers
- **Like Blogs** — Show appreciation for great content
- **Comments** — Engage in discussions with inline commenting
- **Save to Library** — Bookmark blogs for later reading
- **User Suggestions** — Discover new writers to follow

### 🔔 **Real-Time Notifications**
- **Instant Notifications** — Socket.IO powered real-time updates
- **Notification Types** — Likes, comments, new followers
- **Read/Unread Status** — Track which notifications you've seen
- **Notification Bell** — Elegant dropdown with notification list

### 🎨 **Premium UI/UX**
- **Glassmorphic Design** — Modern frosted glass aesthetic
- **Dark/Light Theme** — System-aware theme with manual toggle
- **Framer Motion Animations** — Smooth, delightful transitions
- **Responsive Design** — Beautiful on desktop, tablet, and mobile
- **Custom Typography** — Premium fonts (Instrument Serif, Playfair Display, Inter)
- **Parallax Scrolling** — Immersive hero sections

### 📊 **Dashboard**
- **Author Dashboard** — Manage your published and draft blogs
- **Blog Statistics** — View likes and comments on your content
- **Saved Blogs** — Access your reading library
- **Quick Actions** — Edit, delete, or publish with one click

### 🔍 **Discovery & Feed**
- **Personalized Feed** — See posts from writers you follow
- **Latest Stories** — Discover trending content on the homepage
- **Author Profiles** — Explore individual writer portfolios
- **Share Functionality** — Copy blog links to clipboard

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 19** | UI library with hooks |
| **React Router 7** | Client-side routing |
| **TailwindCSS 4** | Utility-first CSS framework |
| **Framer Motion** | Animation library |
| **Socket.IO Client** | Real-time WebSocket communication |
| **Axios** | HTTP client for API requests |
| **Lucide React** | Beautiful icon library |
| **React Hot Toast** | Toast notifications |
| **Vite** | Next-gen frontend build tool |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | JavaScript runtime |
| **Express.js** | Web application framework |
| **MongoDB** | NoSQL database |
| **Mongoose** | MongoDB ODM |
| **Socket.IO** | Real-time bidirectional events |
| **JWT (jsonwebtoken)** | Authentication tokens |
| **bcrypt** | Password hashing |
| **Multer** | File upload middleware |
| **CORS** | Cross-origin resource sharing |
| **dotenv** | Environment variables |

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (local instance or MongoDB Atlas)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/drafted.git
   cd drafted
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Configure environment variables**

   Create a `.env` file in the `/server` directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/drafted
   JWT_SECRET=your_super_secret_jwt_key_here
   ```

5. **Seed the database (optional)**
   ```bash
   cd server
   node src/seed.js
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd server
   npm start
   ```
   The server will run on `http://localhost:5000`

2. **Start the frontend development server**
   ```bash
   cd client
   npm run dev
   ```
   The client will run on `http://localhost:5173`

3. **Open your browser** and navigate to `http://localhost:5173`

---

## 📁 Project Structure

```
Drafted/
├── client/                     # React frontend application
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── assets/             # Images and media
│   │   ├── components/         # Reusable UI components
│   │   │   ├── AuthBackground.jsx
│   │   │   ├── BlogCard.jsx
│   │   │   ├── FollowListModal.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── NotificationBell.jsx
│   │   │   ├── NotificationToast.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── ScrollToTop.jsx
│   │   ├── layouts/            # Layout wrappers
│   │   │   └── MainLayout.jsx
│   │   ├── pages/              # Page components
│   │   │   ├── Account.jsx
│   │   │   ├── BlogDetails.jsx
│   │   │   ├── CreateBlog.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── EditBlog.jsx
│   │   │   ├── Feed.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── Register.jsx
│   │   ├── services/           # API and socket services
│   │   │   ├── api.js
│   │   │   └── socket.js
│   │   ├── App.jsx             # Root component with routing
│   │   ├── main.jsx            # Entry point
│   │   └── index.css           # Global styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                     # Express backend application
│   ├── uploads/                # Uploaded images storage
│   ├── src/
│   │   ├── config/             # Configuration files
│   │   │   ├── db.js           # MongoDB connection
│   │   │   └── socketio.js     # Socket.IO setup
│   │   ├── controllers/        # Request handlers
│   │   │   ├── auth.controller.js
│   │   │   ├── blog.controller.js
│   │   │   ├── notification.controller.js
│   │   │   └── user.controller.js
│   │   ├── middlewares/        # Express middlewares
│   │   │   └── auth.middleware.js
│   │   ├── models/             # Mongoose schemas
│   │   │   ├── Blog.js
│   │   │   ├── Notification.js
│   │   │   └── User.js
│   │   ├── routes/             # API routes
│   │   │   ├── auth.routes.js
│   │   │   ├── blog.routes.js
│   │   │   ├── notification.routes.js
│   │   │   ├── upload.routes.js
│   │   │   └── user.routes.js
│   │   ├── utils/              # Utility functions
│   │   │   └── generateToken.js
│   │   ├── app.js              # Express app configuration
│   │   ├── server.js           # Server entry point
│   │   └── seed.js             # Database seeding script
│   ├── .env                    # Environment variables
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/register` | Register new user | ❌ |
| `POST` | `/api/auth/login` | Login user | ❌ |
| `GET` | `/api/auth/me` | Get current user | ✅ |
| `PUT` | `/api/auth/profile` | Update profile | ✅ |
| `DELETE` | `/api/auth/delete` | Delete account | ✅ |

### Blogs
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/blogs` | Get all published blogs | ❌ |
| `GET` | `/api/blogs/my` | Get current user's blogs | ✅ |
| `GET` | `/api/blogs/:id` | Get blog by ID | ❌ |
| `GET` | `/api/blogs/:id/edit` | Get blog for editing | ✅ |
| `POST` | `/api/blogs` | Create new blog | ✅ |
| `PUT` | `/api/blogs/:id` | Update blog | ✅ |
| `DELETE` | `/api/blogs/:id` | Delete blog | ✅ |
| `POST` | `/api/blogs/:id/like` | Like/unlike blog | ✅ |
| `POST` | `/api/blogs/:id/comment` | Add comment | ✅ |
| `POST` | `/api/blogs/:id/save` | Save/unsave blog | ✅ |
| `GET` | `/api/blogs/saved` | Get saved blogs | ✅ |

### Users
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/users/:userId/follow` | Follow/unfollow user | ✅ |
| `GET` | `/api/users/:userId` | Get user profile | ❌ |
| `GET` | `/api/users/:userId/followers` | Get user's followers | ❌ |
| `GET` | `/api/users/:userId/following` | Get user's following | ❌ |
| `GET` | `/api/users/suggestions` | Get suggested users | ✅ |

### Notifications
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/notifications` | Get user notifications | ✅ |
| `PUT` | `/api/notifications/:id/read` | Mark as read | ✅ |
| `PUT` | `/api/notifications/read-all` | Mark all as read | ✅ |

### Uploads
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/upload/image` | Upload image | ✅ |

---

## 🗄️ Database Schema

### User Model
```javascript
{
  name: String,           // Display name
  username: String,       // Unique username
  email: String,          // Unique email
  password: String,       // Hashed password
  role: String,           // User role (default: 'user')
  profilePicture: String, // Profile image URL
  followers: [ObjectId],  // Array of follower IDs
  following: [ObjectId],  // Array of following IDs
  savedBlogs: [ObjectId], // Array of saved blog IDs
  createdAt: Date
}
```

### Blog Model
```javascript
{
  title: String,          // Blog title
  content: String,        // Blog content
  author: ObjectId,       // Reference to User
  tags: [String],         // Array of tags
  coverImage: String,     // Cover image URL
  isPublished: Boolean,   // Published status
  likes: [ObjectId],      // Array of user IDs who liked
  comments: [{            // Array of comments
    user: ObjectId,
    content: String,
    createdAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Notification Model
```javascript
{
  recipient: ObjectId,    // User receiving notification
  sender: ObjectId,       // User who triggered it
  type: String,           // 'like', 'comment', 'follow', 'unfollow'
  blog: ObjectId,         // Related blog (if applicable)
  content: String,        // Notification message
  isRead: Boolean,        // Read status
  createdAt: Date
}
```

---

## 🔌 Real-Time Events

Drafted uses Socket.IO for real-time functionality:

### Client Events (Emit)
| Event | Payload | Description |
|-------|---------|-------------|
| `join` | `userId` | Join user's notification room |

### Server Events (Listen)
| Event | Payload | Description |
|-------|---------|-------------|
| `new_notification` | `Notification` | New notification received |
| `remove_notification` | `notificationId` | Notification removed (e.g., unfollow) |

---

## 🎨 Design System

### Color Palette
- **Primary**: Indigo (`#6366F1`)
- **Background Light**: `#E0E7FF` (Indigo-100)
- **Background Dark**: `#030712` (Gray-950)
- **Accent**: Violet, Purple gradients

### Typography
- **Headings**: Instrument Serif (Italic)
- **Display**: Newsreader
- **Body**: Inter
- **Serif Accents**: Playfair Display

### Animation Principles
- Smooth easing (ease-out for entries)
- Staggered list animations
- Subtle parallax effects
- Spring-based transitions for UI elements

---

## 🛡️ Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Protected Routes**: Client-side route guards
- **Input Validation**: Server-side request validation
- **CORS Configuration**: Controlled cross-origin access
- **Cascade Deletion**: User data cleanup on account deletion

---

## 📱 Responsive Breakpoints

| Breakpoint | Width | Target |
|------------|-------|--------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablets |
| `lg` | 1024px | Laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large screens |

---

## 🧪 Development Scripts

### Client
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

### Server
```bash
npm start        # Start server
node src/seed.js # Seed database with sample data
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Style Guidelines
- Use ESLint configuration provided
- Follow React hooks best practices
- Write meaningful commit messages
- Document new features in README

---

## 📄 License

This project is licensed under the **ISC License**.

---

## 🙏 Acknowledgments

- [Lucide Icons](https://lucide.dev/) for beautiful icons
- [Framer Motion](https://www.framer.com/motion/) for animations
- [TailwindCSS](https://tailwindcss.com/) for styling
- [Google Fonts](https://fonts.google.com/) for typography

---

<p align="center">
  <strong>Made with ❤️ by storytellers, for storytellers.</strong>
</p>

<p align="center">
  <a href="#-drafted">Back to Top ↑</a>
</p>
