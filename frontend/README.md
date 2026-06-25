# Futuristic 3D Developer Portfolio (Full-Stack Next.js + MongoDB)

This is a premium, state-of-the-art developer portfolio featuring a Three.js 3D interactive canvas, glowing cursor effects, responsive design, and a fully functional admin panel to manage projects and contact submissions.

The entire backend has been migrated into **Next.js Serverless API Routes**, enabling a single deployment on **Vercel** with a single database connection.

---

## 🚀 Features

- **Futuristic 3D Landing Page**: Interactive Three.js particle systems and custom shaders.
- **Full-Stack Built-in**: API routes handle all projects, messages, and admin authentication.
- **Admin Dashboard**: Live management of projects (create, edit, delete) and contact form messages.
- **MongoDB Atlas Integration**: Serverless-optimized connection pool with automatic SRV record resolution.
- **Tailored Styling**: Pure CSS design tokens with support for glowing states, smooth GSAP animations, and glassmorphism.

---

## 🛠️ Local Development

### 1. Configure Environment Variables
Create a file named `.env.local` inside the `frontend` folder (this has already been configured for you locally):
```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
```

### 2. Start the Development Server
From the `frontend` directory, run:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

- **Frontend Site**: `http://localhost:3000`
- **Admin Login**: `http://localhost:3000/admin`
- **Admin Dashboard**: `http://localhost:3000/admin/dashboard`
- **API Health Check**: `http://localhost:3000/api/health`

---

## 🌐 How to Deploy to Vercel (Single Repo)

Follow these simple steps to deploy your portfolio so it runs live on the web:

### Step 1: Create a GitHub Repository
1. Go to [GitHub](https://github.com) and create a new public or private repository.
2. Initialize and push your project to GitHub.
   * **Tip**: We recommend pushing the contents of the `frontend` folder as the root of your repository to make Vercel deployment instant.
   * Alternatively, if you push the entire folder (containing both `frontend` and `backend` directories), you can specify `frontend` as the **Root Directory** in Vercel.

### Step 2: Import Project to Vercel
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New** → **Project**.
3. Import your GitHub repository.

### Step 3: Configure Project Settings
- **Framework Preset**: Next.js (detected automatically).
- **Root Directory**:
  - Leave empty (default `./`) if the contents of `frontend` are at the root of your GitHub repository.
  - Set to `frontend` if your GitHub repository contains the `frontend` and `backend` subdirectories.

### Step 4: Add Environment Variables
Under the **Environment Variables** section, add the following keys and values:

| Key | Value | Description |
|---|---|---|
| `MONGODB_URI` | `mongodb+srv://Shopify_projects:telD9H0SOuHxHb9m@cluster0.4ahw9qu.mongodb.net/Shopify_projects?retryWrites=true&w=majority&appName=Cluster0` | Connection string to your MongoDB Atlas cluster |
| `JWT_SECRET` | `portfolio_super_secret_jwt_2024` | Secret key used to sign JWT authorization tokens |
| `JWT_EXPIRE` | `7d` | Token expiration time (e.g., `7d` for 7 days) |

### Step 5: Deploy!
Click **Deploy**. Vercel will build your Next.js application, start the serverless API routes, and provide you with a live URL (e.g. `your-portfolio.vercel.app`) in under 2 minutes!

---

## 🔐 Default Admin Credentials

- **Email**: `admin@portfolio.com`
- **Password**: `admin123456`

To log in and manage your portfolio projects, visit `https://your-domain.vercel.app/admin`.
