# Mess Food Rating System

A full-stack web application for rating and reviewing college mess food quality. Built with React, Node.js, Express, MySQL, and Tailwind CSS.

## Features

### For Students
- ✅ Browse all available messes
- ⭐ Rate messes (1-5 stars)
- 💬 Add feedback and reviews
- 📊 Compare multiple messes
- 📝 View and manage personal reviews
- 🔍 Search and filter messes

### For Admins
- 📈 Real-time analytics dashboard
- 📊 Visual charts and trends
- 🏢 Manage messes (CRUD operations)
- 📥 Export reports in CSV format
- 👥 Monitor user activity
- 📋 View recent reviews

## Tech Stack

### Frontend
- React 18
- Tailwind CSS
- React Router DOM
- Chart.js & react-chartjs-2
- Axios
- React Icons

### Backend
- Node.js
- Express.js
- MySQL
- JWT Authentication
- bcryptjs
- express-validator

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8 or higher)
- npm or yarn

### 1. Database Setup

```bash
# Login to MySQL
mysql -u root -p

# Run the SQL script
source backend/models/db.sql