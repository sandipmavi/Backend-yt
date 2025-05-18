# 🎬 YouTube API - Backend

This is the **backend** of a YouTube-like application built with **Node.js**, **Express.js**, and **MongoDB**. It supports features such as user authentication, video upload and streaming, likes/dislikes, views, comments, and more.
## 🚀 Features

- 🔐 User Authentication (JWT based)
- 📦 Video Upload and Streaming (Cloudinary Integration)
- 👍 Like / 👎 Dislike / 👁 View tracking
- 💬 Comment system
- 🔎 Filter by category & tags
- 🔐 Protected Routes with Middleware
- 📊 Engagement Metrics

---

## 📁 Project Structure
youtube-backend/
- ├── models/
- ├── routes/
- ├── middlewares/
- ├── config/
- ├── .env
- ├── index.js
- └── README.md

## ⚙️ Tech Stack

- **Node.js**
- **Express.js**
- **MongoDB (Mongoose)**
- **Cloudinary** (for media storage)
- **JWT** (for authentication)
- **dotenv**


📦 Installation & Setup

# Clone the repo
- git clone https://github.com/your-username/youtube-backend.git
- cd youtube-backend

## Install dependencies
- npm install



## Start the server
- npm run dev


# 📡  API Endpoints Overview
## 🔐 Auth Routes
- Method	Route	Description
- POST	/auth/signup	Register a new user
- POST	/auth/login	Login and get token

## 🎬 Video Routes

- POST	/api/v1/video	Upload a video
- GET	/api/v1/video/:id	Get a single video by ID
- POST	/api/v1/video/like/:id	Like a video
- POST	/api/v1/video/view/:id	Increment view count
- POST /ap1/v1/video/dislike/:id Dislike  a video
- PUT /api/v1/video/update/:id  Update a video like thumbnail , description, title


## 💬 Comment Routes

- POST	/comments/	Add a comment to a video
- GET	/comments/:videoId	Get comments for a video
- PUT /comments/:commentId  update the comment
- DELETE /comments/:commentId  Delete a comment

## 🛡️ Middleware
- checkAuth: Validates JWT tokens and protects routes

- upload: Handles video uploads using cloudinary

## 🧪 Testing the API
- You can use Postman or Thunder Client for testing:

- 📨Register/Login a user to get the token

- 📨Send requests to video or comment routes with Authorization: Bearer <token>

## 📬 Contribution
- Contributions are welcome! Please fork the repository and open a pull request.

## 📄 License
- This project is licensed under the MIT License.

## 🔗 Connect
- 🆔GitHub: sandipmavi
- 📧Email: smavi.dev@gmail.com
