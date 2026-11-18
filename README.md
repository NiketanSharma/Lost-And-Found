# Findr — Production-Ready Lost & Found Web Platform

Findr is a full-stack, responsive, and secure web application designed to help universities, colleges, corporate offices, public venues, and residential communities report, search, claim, and recover misplaced personal belongings.

---

## 🌟 Key Features

### 1. User Authentication & Profile Management
- Secure JWT-based authentication (Access & Refresh tokens with automatic rotation).
- User registration with email validation and strict password hashing using Django ORM.
- Profile dashboard with editable contact details, affiliation bio, and avatar upload.
- Secure change password workflow with current password validation.
- Role-based permissions preventing unauthorized modifications.

### 2. Item Management (Lost & Found)
- **Lost Belongings**: Users can report items they have lost with incident date, building/location, category, detailed description, and photos.
- **Found Belongings**: Users can list items discovered with safe guidance for concealing unique identifying traits.
- 10 structured categories: *Electronics, Mobile Phones, Wallets, Documents, Bags, Books, Clothing, Jewellery, Keys, Other*.
- Lifecycle statuses: `Active` (Open), `Claimed` (Under verification), and `Resolved` (Safely reunited).
- Full CRUD operations with strict ownership permission checks.

### 3. Smart Search & Multi-Criteria Filtering
- Real-time search across item titles, descriptions, and locations.
- Backend-driven filter query parameters for category, item type (Lost/Found), status, date ranges, and locations.
- Sort by newest, oldest, incident dates, and alphabetical order.
- Built-in server-side pagination with responsive page navigation.

### 4. Claim & Recovery Verification System
- Prospective owners can submit formal claim requests with proofs of ownership (serial numbers, screen locks, unique marks).
- Item owners receive real-time notifications and can review claimant details.
- Item owners can **Accept** or **Decline** claims directly from their dashboard.
- Safe handover workflow: Items are only marked resolved when the owner confirms recovery.

### 5. In-App Notification Center
- Instant notifications generated on claim submission, claim approval/rejection, and item status changes.
- Unread badge counter in the top navigation bar.
- One-click "Mark All as Read" and instant redirection to relevant items.

### 6. User Dashboard & Analytics
- Overview statistic counters: Total Reported, Lost, Found, Reunited, and Pending Incoming Claims.
- Segmented tabs: *My Lost Items*, *My Found Items*, *My Resolved Items*, *Incoming Claims*, and *Submitted Claims*.
- Quick actions to edit, delete, and mark items as resolved.

### 7. Administrative Moderation
- Full-featured Django Admin interface for university/office staff.
- Moderation tools to review claims, remove inappropriate content, and monitor community statistics.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4, React Router DOM v7, Axios, React Icons, React Hot Toast |
| **Backend** | Python 3.11+, Django 5+, Django REST Framework, Simple JWT, Django CORS Headers, Django Filter, Pillow |
| **Database** | SQLite (Local Development) / PostgreSQL via `dj-database-url` & `psycopg2-binary` (Production) |
| **Media / Storage** | Cloudinary (`cloudinary`, `django-cloudinary-storage`) with automatic local fallback |
| **Production Server** | Gunicorn, WhiteNoise (Static asset compression & caching) |
| **Hosting Platform** | Render (Web Service for Backend, Static Site for Frontend, Render PostgreSQL) |

---

## 📁 Project Folder Structure

```text
Lost_and_Found/
├── render.yaml                 # Render Infrastructure as Code Blueprint
├── README.md                   # Complete documentation & deployment guide
├── .gitignore                  # Git ignore rules for Python & Node
├── backend/
│   ├── .env                    # Local environment variables (created)
│   ├── .env.example            # Backend environment template
│   ├── build.sh                # Render backend build script (pip, collectstatic, migrate, seed)
│   ├── manage.py               # Django CLI utility
│   ├── requirements.txt        # Production Python dependencies
│   ├── lost_and_found/         # Django Core Configuration
│   │   ├── __init__.py
│   │   ├── settings.py         # App settings (CORS, JWT, Cloudinary, WhiteNoise, DB)
│   │   ├── urls.py             # Top-level API routing
│   │   ├── wsgi.py             # WSGI entrypoint for Gunicorn
│   │   └── asgi.py             # ASGI entrypoint
│   ├── accounts/               # Custom User, Profile, Auth APIs
│   │   ├── models.py           # Custom User model
│   │   ├── serializers.py      # Registration, Profile, Password, JWT serializers
│   │   ├── views.py            # Auth endpoints
│   │   ├── urls.py             # /api/auth/ routes
│   │   ├── tests.py            # Unit tests for authentication
│   │   └── admin.py            # User admin registration
│   ├── items/                  # Item Management, Claims, Dashboard Stats
│   │   ├── models.py           # Item & Claim models
│   │   ├── serializers.py      # Item, Claim, and Stats serializers
│   │   ├── views.py            # Item CRUD, Claim actions, Dashboard stats
│   │   ├── filters.py          # DjangoFilter backend filters
│   │   ├── permissions.py      # IsOwnerOrReadOnly permissions
│   │   ├── urls.py             # /api/items/ routes
│   │   ├── claims_urls.py      # /api/claims/ routes
│   │   ├── dashboard_urls.py   # /api/dashboard/ routes
│   │   ├── tests.py            # Unit tests for items, claims, permissions
│   │   └── management/
│   │       └── commands/
│   │           └── seed_data.py # Automated seeder with sample items & demo users
│   └── notifications/          # In-App Notification System
│       ├── models.py           # Notification model
│       ├── serializers.py      # Notification serializers
│       ├── views.py            # List, mark read, unread count
│       ├── urls.py             # /api/notifications/ routes
│       └── admin.py            # Notification admin
└── frontend/
    ├── .env.example            # Frontend environment template
    ├── index.html              # HTML entry with Plus Jakarta Sans typography
    ├── package.json            # Node dependencies and scripts
    ├── vite.config.js          # Vite config with Tailwind & local /api proxy
    ├── public/
    │   ├── logo.svg            # Brand SVG logo
    │   └── _redirects          # SPA client-side routing rewrite for Render
    └── src/
        ├── App.jsx             # Routes & layout structure
        ├── index.css           # Tailwind v4 import & custom styles
        ├── main.jsx            # React root mount
        ├── api/
        │   └── axios.js        # Axios instance with JWT interceptors & token refresh
        ├── context/
        │   └── AuthContext.jsx # Auth state, login, register, profile, unread counter
        ├── components/
        │   ├── Navbar.jsx      # Navigation bar with badges & user dropdown
        │   ├── Footer.jsx      # Responsive SaaS footer
        │   ├── ItemCard.jsx    # Responsive card with image, badges & metadata
        │   ├── StatusBadge.jsx # Color-coded status & type badges
        │   ├── ClaimModal.jsx  # Modal for submitting ownership claims
        │   ├── ConfirmationModal.jsx # Confirmation dialog for destructive actions
        │   ├── Pagination.jsx  # Page numbers & pagination controls
        │   └── ProtectedRoute.jsx # Route guard for authenticated pages
        └── pages/
            ├── HomePage.jsx        # Landing page with search, stats, recent items
            ├── BrowseItemsPage.jsx # Full browse page with search & filter sidebar
            ├── ItemDetailPage.jsx  # Item details, reporter info, claims panel
            ├── ReportItemPage.jsx  # Report Lost / Found form with image preview
            ├── EditItemPage.jsx    # Edit existing report
            ├── DashboardPage.jsx   # User dashboard with stats & tabbed lists
            ├── ProfilePage.jsx     # Profile settings & change password
            ├── NotificationsPage.jsx # Full notifications inbox
            ├── AboutPage.jsx       # Mission, target groups, FAQ accordion
            ├── LoginPage.jsx       # Login form with quick demo user buttons
            ├── RegisterPage.jsx    # Registration form
            └── NotFoundPage.jsx    # 404 error page
```

---

## 🚀 Local Development Setup

### Prerequisites
- Python 3.11+
- Node.js v18+ and npm

---

### Step 1: Backend Setup (Django)

1. Open a terminal and navigate to `backend/`:
   ```bash
   cd backend
   ```

2. (Optional) Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On Linux / macOS:
   source venv/bin/activate
   ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Run database migrations:
   ```bash
   python manage.py migrate
   ```

5. Seed sample demo users and realistic items:
   ```bash
   python manage.py seed_data
   ```
   *This automatically creates demo accounts:*
   - **Admin Account**: `admin` / `AdminPass123!`
   - **Student Account (Alex)**: `alex_turner` / `Password123!`
   - **Finder Account (Sarah)**: `sarah_connor` / `Password123!`

6. Run backend test suite:
   ```bash
   python manage.py test
   ```

7. Start the Django development server:
   ```bash
   python manage.py runserver
   ```
   *Backend will run at:* `http://127.0.0.1:8000/`

---

### Step 2: Frontend Setup (React + Vite)

1. Open a second terminal window and navigate to `frontend/`:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *Frontend will run at:* `http://localhost:5173/`

*Note: In local development, Vite automatically proxies all `/api` and `/media` requests to `http://127.0.0.1:8000`, so no manual port configuration is needed!*

---

## 🔑 Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Description | Default (Local) |
|---|---|---|
| `SECRET_KEY` | Django cryptographic signing key | Dev fallback |
| `DEBUG` | Enable debug mode (`True` / `False`) | `True` |
| `ALLOWED_HOSTS` | Comma-separated allowed hostnames | `*` |
| `DATABASE_URL` | PostgreSQL connection string | Uses SQLite if omitted |
| `CORS_ALLOWED_ORIGINS` | Permitted frontend origins | `http://localhost:5173,http://127.0.0.1:5173` |
| `CSRF_TRUSTED_ORIGINS` | Trusted origins for CSRF | `http://localhost:5173,http://127.0.0.1:5173` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud identifier | Optional locally |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Optional locally |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Optional locally |

### Frontend (`frontend/.env`)

| Variable | Description | Default (Local) |
|---|---|---|
| `VITE_API_URL` | Production backend URL (e.g. on Render) | Empty (uses local proxy) |

---

## 🌐 Production Deployment on Render

You can deploy the application using the included `render.yaml` blueprint or manually as two connected services.

### Option A: 1-Click Blueprint Deploy (Recommended)
1. Push this repository to GitHub.
2. In the [Render Dashboard](https://dashboard.render.com/), click **New** > **Blueprint**.
3. Select this repository. Render will automatically detect `render.yaml` and configure:
   - Render PostgreSQL Database
   - Backend Django Web Service
   - Frontend Vite Static Site with SPA rewrites

---

### Option B: Manual Service Creation on Render

#### 1. Create PostgreSQL Database:
- Name: `lost-and-found-db`
- Plan: Free
- Copy the **Internal Database URL**.

#### 2. Deploy Backend Web Service:
- Name: `lost-and-found-backend`
- Environment: `Python`
- Root Directory: `backend`
- Build Command: `bash build.sh`
- Start Command: `gunicorn lost_and_found.wsgi:application --bind 0.0.0.0:$PORT`
- Add Environment Variables:
  - `PYTHON_VERSION`: `3.11.4`
  - `DEBUG`: `False`
  - `SECRET_KEY`: *(Generate a secure random string)*
  - `DATABASE_URL`: *(Paste Internal Database URL from step 1)*
  - `ALLOWED_HOSTS`: `.onrender.com`
  - `CORS_ALLOWED_ORIGINS`: `https://<YOUR-FRONTEND-NAME>.onrender.com`
  - `CSRF_TRUSTED_ORIGINS`: `https://<YOUR-FRONTEND-NAME>.onrender.com`
  - `CLOUDINARY_CLOUD_NAME`: *(Your Cloudinary cloud name)*
  - `CLOUDINARY_API_KEY`: *(Your Cloudinary API key)*
  - `CLOUDINARY_API_SECRET`: *(Your Cloudinary API secret)*

#### 3. Deploy Frontend Static Site:
- Name: `lost-and-found-frontend`
- Environment: `Static Site`
- Root Directory: `frontend`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- Add Environment Variable:
  - `VITE_API_URL`: `https://<YOUR-BACKEND-NAME>.onrender.com`
- Under **Redirects/Rewrites**, add:
  - Type: `Rewrite`
  - Source: `/*`
  - Destination: `/index.html`

---

## 🧪 Testing Verification

Run backend test cases:
```bash
cd backend
python manage.py test
```
**Test Coverage Includes:**
- User registration with password validation and duplicate email rejection
- Login with JWT token issuance
- Profile retrieval, updating, and unauthorized access guards
- Public item browsing and filtering
- Authenticated item creation
- Object-level permissions (preventing non-owners from editing/deleting items)
- Claim submission, preventing self-claims, and duplicate prevention
- Owner approval/rejection of claims and automated notification generation

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
