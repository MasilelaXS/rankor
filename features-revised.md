# Ctecg Score - Revised Features (Simplified)

## 1. User Roles & Authentication

### Admin
- **System Constraint**: Only ONE admin user allowed in the system
- Secure login required (can create password if empty, password reset via email)
- Dashboard access
- Manage technicians (add, edit, deactivate)
- Manage rating questions (add, edit, delete, reorder)
- Choose technician(s), enter client details, and create review links
- View all ratings and feedback
- Override scoring decisions with notes
- Receive email notifications when a rating is submitted

### Technician
- Secure login required (can create password if empty, password reset via email)
- View own score and performance reports
- View feedback/comments from clients
- Receive email notifications when rated

### Client
- No login required
- Accesses a unique, expiring link to rate technician(s)
- Provides basic info: name, client code, email, contact number
- Can only submit one rating per link

---

## 2. Simplified Rating Flow

1. Admin selects technician(s) for a review
2. Admin enters client details (name, client code, email, contact)
3. Admin clicks "Create Review Link" to generate unique rating link
4. Admin copies and sends the link to the client manually
5. Client opens the link (valid for 48 hours only)
6. Client completes rating form (their details pre-filled from step 2)
7. System calculates score - 70%+ = +1 point, <70% = no point
8. If technician gets 3 bad reviews (<70%) in one month = -1 point
9. Admin can override the automatic scoring with notes
10. Admin receives email: "Review for [tech name(s)] has been submitted"
11. Technician(s) receive email notification about their new rating
12. Link becomes invalid after use

---

## 3. Rating Form & Scoring

- Admin manages questions in database (CRUD + reorder)
- Each question rated 1-5 points
- **Pass threshold: 70%** (e.g., 35/50 points = 70%)
- Scoring rules:
  - ≥70% = technician gains +1 point
  - <70% = no point gained
  - 3 bad reviews (<70%) in one month = technician loses -1 point
- Admin can override automatic scoring with explanatory notes
- Client details pre-filled from admin input (stored with rating)
- Multiple technicians can be linked to one rating

---

## 4. Unique Rating Links

- Each link tied to one or more technicians
- Valid for 48 hours from creation (South Africa timezone)
- Single use only
- Contains secure, random token
- **Constraint**: Only ONE active link per client email address
- Expired/used links show error page

---

## 5. Authentication & Security

- API uses custom X-Token header (tokens valid 12 hours)
- Password creation: if user password is empty, they can set it
- Password reset: email reset link functionality (30 minutes validity, South Africa timezone)
- **Constraint**: Each user can only have ONE active password reset token at a time
- **Constraint**: Each client email can only have ONE active rating link (48 hours validity)
- All passwords use password_hash() function
- No rate limiting (simple app)
- South Africa timezone (Africa/Johannesburg) for all timestamps

---

## 6. Email Notifications

- Admin receives email: "Review for [technician name(s)] has been submitted"
- Technician receives email when they get a new rating
- Password reset emails with secure tokens
- Simple email function (no external dependencies)

---

## 7. Client Information (No Separate Table)

Client data stored directly with each rating:
- Name
- Client Code  
- Email
- Contact Number(s)

---

## 8. API Structure

- Single index.php with routing
- Controllers for different functionality
- JSON responses only
- Endpoints:
  - Authentication (login, logout, password reset)
  - Admin functions (technicians, questions, callouts, links, overrides)
  - Technician functions (view own data)
  - Public rating submission
  - Reports and analytics

---

## 9. Database Changes

- Remove separate clients table (client info stored with ratings)
- Add API tokens table
- Add admin override fields to ratings
- Add password reset tokens
- Set pass percentage to 70%
- Track monthly bad review counts for point deduction logic

---

## 10. Key Simplifications & Rules

- No client accounts/management (admin enters client details)
- Client info stored per rating
- Simple email notifications
- Admin override capability
- Multiple technicians per rating link
- 70% pass threshold for gaining points
- 3 bad reviews in one month = lose 1 point
- 12-hour API token validity

---

This simplified version focuses on the core rating functionality while maintaining necessary features for admin control and technician feedback.
