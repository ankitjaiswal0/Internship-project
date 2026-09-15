# SecureVault – Secure User Management System

A simple, functional web application built to demonstrate fundamental cybersecurity concepts, including secure authentication, Role-Based Access Control (RBAC), and defenses against common web vulnerabilities like SQL Injection, XSS, and CSRF.

## Architecture & Tech Stack
- **Frontend**: React.js (Vite) + Tailwind CSS
- **Backend**: Python Flask REST API
- **Database**: SQLite with SQLAlchemy ORM

## Implemented Security Features

### 1. Authentication Flow
- **Password Hashing**: Passwords are never stored in plaintext. `Flask-Bcrypt` securely hashes passwords with salting before saving to the database.
- **JWT & HttpOnly Cookies**: After successful login, a JWT access token and a CSRF token are generated. The JWT is stored in an `HttpOnly` cookie, rendering it inaccessible to JavaScript and preventing theft via Cross-Site Scripting (XSS).
- **Strong Password Policy**: Registration enforces minimum complexity requirements.

### 2. Authorization (RBAC)
- The backend enforces Role-Based Access Control.
- Normal users (`USER` role) can only access their profile and activity.
- Attempting to access admin routes (`/api/admin/*`) without the `ADMIN` role returns a `403 Forbidden` error, properly logged in the audit trail.

### 3. Protection Against OWASP Top 10
- **SQL Injection Prevention**: We use SQLAlchemy ORM, which automatically parameterizes all queries, preventing SQLi. No strings are manually concatenated into SQL statements.
- **Cross-Site Scripting (XSS) Prevention**:
  - React automatically escapes any dynamic variables rendered in the DOM, preventing script injection.
  - No `dangerouslySetInnerHTML` is used.
  - HttpOnly cookies prevent XSS attackers from stealing session tokens.
- **Cross-Site Request Forgery (CSRF) Protection**: Enabled natively through `Flask-JWT-Extended` configuration (`JWT_COOKIE_CSRF_PROTECT = True`). Modifying requests require a double-submit `X-CSRF-TOKEN` header.

### 4. Rate Limiting
- `Flask-Limiter` is used to mitigate brute-force and DDoS attacks against sensitive endpoints (e.g., Login is limited to 10 requests/minute, Registration to 5 requests/minute). Exceeding this returns `HTTP 429 Too Many Requests`.

### 5. Security Headers
- Enforced on all backend responses:
  - `Content-Security-Policy: default-src 'self'`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `X-Frame-Options: DENY`

### 6. Audit Logging
- An `audit_logs` table records significant events: successful/failed logins, registrations, unauthorized admin access attempts, and admin actions.
- Logs include user ID, action description, timestamp, IP address, and status.

## Installation & Running

### Backend Setup
1. Open a terminal and navigate to the `backend` folder.
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/Scripts/activate  # On Windows: .\venv\Scripts\Activate.ps1
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the Flask application:
   ```bash
   python app.py
   ```
   *The database `securevault.db` will be created automatically. The first user registered will be granted the `ADMIN` role.*

### Frontend Setup
1. Open a new terminal and navigate to the `frontend` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Access the application in your browser at `http://localhost:5173`.

## Testing
A simple automated security test script is provided for the backend.
1. Ensure the Flask server is running.
2. From the `backend` directory, run:
   ```bash
   pytest test_security.py
   ```
This will verify SQLi defenses, weak password rejection, rate limiting, and RBAC enforcement.
