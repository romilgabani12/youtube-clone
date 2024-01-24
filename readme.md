# YouTube Backend


## Introduction

This is a YouTube backend project that covers allmost the functionalities of YouTube and also combines the Tweet functionality from twitter into it. Find more about his project in the documentaion below.


## Features

### User Management:

- Registration, login, logout, Update Password
- Profile management (avatar, cover image, details)
- Watch history tracking

### Video Management:
- Video upload and publishing
- Video search, sorting, and pagination
- Video editing and deletion
- Visibility control (publish/unpublish)

### Tweet Management:

- Tweet creation and publishing
- Viewing user tweets
- Updating and deleting tweets

### Subscription Management:

- Subscribing to channels
- Viewing subscriber and subscribed channel lists

### Playlist Management:

- Creating, updating, and deleting playlists
- Adding and removing videos from playlists
- Viewing user playlists

### Like Management:

- Liking and unliking videos, comments, and tweets
- Viewing liked videos

### Comment Management:

- Adding, updating, and deleting comments on videos

### Dashboard:

- Viewing channel statistics (views, subscribers, videos, likes)
- All videos uploaded by the channel

### Health Check:

- Endpoint to verify the backend's health

## Technologies Used:

- Node.js
- Express.js
- MongoDB
- Cloudinary (must have an account)

## Installation and Setup

1. Clone the repository:

```bash
  git clone https://github.com/romilgabani12/youtube-clone.git
```

2. Install dependencies:

```bash
  cd backend
  npm install
```

3. Set up environment variables: Create a .env in root of project and fill in the required values :

- PORT 
- MONGODB_URI 
- CORS_ORIGIN 
- ACCESS_TOKEN_SECRET 
- ACCESS_TOKEN_EXPIRY 
- REFRESH_TOKEN_SECRET 
- REFRESH_TOKEN_EXPIRY
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET

4. Start the server:

```bash
  npm run dev
```