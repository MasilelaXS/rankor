# Ctecg Score API - Frontend Development Guide

**Version:** 1.0.0  
**Base URL:** `https://score.ctecg.co.za/api`  
**Timezone:** Africa/Johannesburg  
**Authentication:** Custom X-Token header  
**Content-Type:** application/json  
**Status:** ✅ All endpoints tested and verified accurate

---

## Table of Contents

1. [Authentication](#authentication)
2. [Common Response Format](#common-response-format)
3. [Error Handling](#error-handling)
4. [Authentication Endpoints](#authentication-endpoints)
5. [Admin Endpoints](#admin-endpoints)
6. [Technician Endpoints](#technician-endpoints)
7. [Public Endpoints](#public-endpoints)
8. [Data Models](#data-models)

---

## Authentication

All protected endpoints require the `X-Token` header:

```http
X-Token: your_token_here
```

**Token Validity:** 12 hours  
**Token Types:** Admin and Technician tokens are separate  

---

## Common Response Format

All API responses follow this structure:

```json
{
  "success": true|false,
  "status_code": 200,
  "message": "Human readable message",
  "data": {}, // Response data or null
  "timestamp": "2025-09-17 09:24:22"
}
```

---

## Error Handling

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `405` - Method Not Allowed
- `422` - Validation Error
- `500` - Internal Server Error

### Validation Error Format
```json
{
  "success": false,
  "status_code": 422,
  "message": "Validation failed",
  "data": {
    "errors": {
      "field_name": "Error message"
    }
  }
}
```

---

## Authentication Endpoints

### 1. Login
**POST** `/auth/login`

**Request:**
```json
{
  "email": "admin@ctecg.com",
  "password": "password123",
  "user_type": "admin" // or "technician"
}
```

**Response (Success):**
```json
{
  "success": true,
  "status_code": 200,
  "message": "Login successful",
  "data": {
    "token": "abc123...",
    "user": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@ctecg.com",
      "user_type": "admin"
    },
    "expires_in": "12 hours"
  }
}
```

**Response (Password Creation Required):**
```json
{
  "success": true,
  "status_code": 200,
  "message": "Password creation required",
  "data": {
    "requires_password_creation": true,
    "user_id": 1,
    "user_type": "admin",
    "name": "Admin User",
    "email": "admin@ctecg.com"
  }
}
```

### 2. Create Password (First-time Users)
**POST** `/auth/create-password`

**Request:**
```json
{
  "user_id": 1,
  "user_type": "admin",
  "password": "newpassword123",
  "confirm_password": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "status_code": 200,
  "message": "Password created successfully",
  "data": {
    "token": "abc123...",
    "user": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@ctecg.com",
      "user_type": "admin"
    },
    "expires_in": "12 hours"
  }
}
```

### 3. Forgot Password
**POST** `/auth/forgot-password`

**Request:**
```json
{
  "email": "admin@ctecg.com",
  "user_type": "admin"
}
```

**Response:**
```json
{
  "success": true,
  "status_code": 200,
  "message": "Password reset email sent successfully"
}
```

### 4. Reset Password
**POST** `/auth/reset-password`

**Request:**
```json
{
  "token": "reset_token_here",
  "password": "newpassword123",
  "confirm_password": "newpassword123"
}
```

### 5. Logout
**POST** `/auth/logout`

**Headers:** `X-Token: your_token`

**Response:**
```json
{
  "success": true,
  "status_code": 200,
  "message": "Logged out successfully"
}
```

### 6. Verify Token
**GET** `/auth/verify`

**Headers:** `X-Token: your_token`

**Response:**
```json
{
  "success": true,
  "status_code": 200,
  "message": "Authentication verified",
  "data": {
    "user": {
      "user_id": 1,
      "user_type": "admin",
      "name": "Steven Admin",
      "email": "steven@support.ctecg.co.za",
      "expires_at": "2025-09-17 21:02:19"
    },
    "authenticated": true
  }
}
```

### 7. Get Profile
**GET** `/auth/profile`

**Headers:** `X-Token: your_token`

**Response:**
```json
{
  "success": true,
  "status_code": 200,
  "message": "Profile retrieved successfully",
  "data": {
    "id": 1,
    "name": "Steven Admin",
    "email": "steven@support.ctecg.co.za",
    "status": "active",
    "created_at": "2025-09-17 00:01:01",
    "updated_at": "2025-09-17 09:02:19",
    "user_type": "admin"
  }
}
```

---

## Admin Endpoints

### 1. Dashboard
**GET** `/admin/dashboard`

**Headers:** `X-Token: admin_token`

**Response:**
```json
{
  "success": true,
  "status_code": 200,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "stats": {
      "total_technicians": 3,
      "ratings_this_month": 1,
      "avg_percentage_this_month": 89.09
    },
    "recent_ratings": [
      {
        "id": 1,
        "rating_link_id": 8,
        "total_score": 49,
        "max_score": 55,
        "percentage": "89.09",
        "points_awarded_auto": 1,
        "points_awarded_final": null,
        "admin_override_reason": null,
        "admin_override_by": null,
        "admin_override_at": null,
        "comments": "Great service overall!",
        "submitted_at": "2025-09-17 09:24:22",
        "client_name": "Updated Test Client v2",
        "client_email": "test@example.com",
        "technician_names": "Steven Tech, Sarah Johnson"
      }
    ],
    "top_technicians": [
      {
        "id": 2,
        "name": "Sarah Johnson",
        "total_points": 1,
        "ratings_this_month": 1,
        "avg_percentage": "89.090000",
        "points_this_month": "1"
      }
    ]
  }
}
```

### 2. Get All Technicians
**GET** `/admin/technicians`

**Headers:** `X-Token: admin_token`

**Response:**
```json
{
  "success": true,
  "status_code": 200,
  "message": "Technicians retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Steven Tech",
      "email": "steven@dannel.co.za",
      "phone": "555-0101",
      "employee_id": "TECH001",
      "total_points": 1,
      "total_ratings": 1,
      "created_at": "2025-09-17 00:01:01",
      "updated_at": "2025-09-17 09:24:22"
    }
  ]
}
```

### 3. Create Technician
**POST** `/admin/technicians`

**Headers:** `X-Token: admin_token`

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@ctecg.com",
  "phone": "555-0123",
  "employee_id": "TECH004"
}
```

**Response:**
```json
{
  "success": true,
  "status_code": 201,
  "message": "Technician created successfully",
  "data": {
    "id": 4,
    "name": "John Doe",
    "email": "john@ctecg.com",
    "phone": "555-0123",
    "employee_id": "TECH004",
    "total_points": 0,
    "total_ratings": 0,
    "created_at": "2025-09-17 10:00:00",
    "updated_at": "2025-09-17 10:00:00"
  }
}
```

### 4. Update Technician
**PUT** `/admin/technicians/{id}`

**Headers:** `X-Token: admin_token`

**Request:**
```json
{
  "name": "John Updated",
  "phone": "555-9999",
  "employee_id": "TECH004-UPDATED"
}
```

### 5. Deactivate Technician
**DELETE** `/admin/technicians/{id}`

**Headers:** `X-Token: admin_token`

### 6. Get All Questions
**GET** `/admin/questions`

**Headers:** `X-Token: admin_token`

**Response:**
```json
{
  "success": true,
  "status_code": 200,
  "message": "Questions retrieved successfully",
  "data": [
    {
      "id": 1,
      "text": "Did the technician explain the work done?",
      "order_position": 1,
      "active": 1,
      "created_at": "2025-09-17 00:01:01",
      "updated_at": "2025-09-17 00:01:01"
    }
  ]
}
```

### 7. Create Question
**POST** `/admin/questions`

**Headers:** `X-Token: admin_token`

**Request:**
```json
{
  "text": "Was the technician punctual?",
  "order_position": 12
}
```

**Response:**
```json
{
  "success": true,
  "status_code": 201,
  "message": "Question created successfully",
  "data": {
    "id": 12,
    "text": "Was the technician punctual?",
    "order_position": 12,
    "active": 1,
    "created_at": "2025-09-17 10:00:00",
    "updated_at": "2025-09-17 10:00:00"
  }
}
```

### 8. Update Question
**PUT** `/admin/questions/{id}`

**Headers:** `X-Token: admin_token`

**Request:**
```json
{
  "text": "Updated question text",
  "order_position": 5,
  "active": 1
}
```

### 9. Delete Question
**DELETE** `/admin/questions/{id}`

**Headers:** `X-Token: admin_token`

### 10. Create Rating Link
**POST** `/admin/rating-links`

**Headers:** `X-Token: admin_token`

**Request:**
```json
{
  "technician_ids": [1, 2],
  "client_name": "Test Client",
  "client_code": "TC001",
  "client_email": "client@example.com",
  "client_contact": "555-1234"
}
```

**Response:**
```json
{
  "success": true,
  "status_code": 201,
  "message": "Rating link created successfully", // or "updated successfully"
  "data": {
    "link_id": 8,
    "token": "a9a05b26459bfe9f96a7f607b076e0d5...",
    "rating_url": "https://score.ctecg.co.za/rate/a9a05b26459bfe9f96a7f607b076e0d5...",
    "expires_at": "2025-09-19 09:21:36",
    "client_name": "Test Client",
    "client_email": "client@example.com",
    "action": "created" // or "updated"
  }
}
```

### 11. Get All Ratings
**GET** `/admin/ratings`

**Headers:** `X-Token: admin_token`

**Query Parameters (Optional):**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `technician_id` - Filter by technician
- `start_date` - Filter from date (YYYY-MM-DD)
- `end_date` - Filter to date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "status_code": 200,
  "message": "Ratings retrieved successfully",
  "data": {
    "ratings": [
      {
        "id": 1,
        "rating_link_id": 8,
        "total_score": 49,
        "max_score": 55,
        "percentage": "89.09",
        "points_awarded_auto": 1,
        "points_awarded_final": null,
        "admin_override_reason": null,
        "admin_override_by": null,
        "admin_override_at": null,
        "comments": "Great service overall!",
        "submitted_at": "2025-09-17 09:24:22",
        "client_name": "Updated Test Client v2",
        "client_email": "test@example.com",
        "client_code": null,
        "client_contact": "555-8888",
        "technician_names": "Sarah Johnson, Steven Tech",
        "technician_ids": "1,2",
        "overridden_by": null
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "pages": 1
    }
  }
}
```

### 12. Override Rating Points
**POST** `/admin/ratings/{id}/override`

**Headers:** `X-Token: admin_token`

**Request:**
```json
{
  "points_awarded_final": 0,
  "admin_override_reason": "Client complaint - service was incomplete"
}
```

### 13. Get Settings
**GET** `/admin/settings`

**Headers:** `X-Token: admin_token`

**Response:**
```json
{
  "success": true,
  "status_code": 200,
  "message": "Settings retrieved successfully",
  "data": {
    "pass_percentage": "70",
    "company_name": "Ctecg Score",
    "timezone": "Africa/Johannesburg"
  }
}
```

### 14. Update Settings
**PUT** `/admin/settings`

**Headers:** `X-Token: admin_token`

**Request:**
```json
{
  "pass_percentage": "75",
  "company_name": "Ctecg Score Updated"
}
```

---

## Technician Endpoints

### 1. Dashboard
**GET** `/technician/dashboard`

**Headers:** `X-Token: technician_token`

**Response:**
```json
{
  "success": true,
  "status_code": 200,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "technician": {
      "id": 1,
      "name": "Steven Tech",
      "email": "steven@dannel.co.za",
      "employee_id": "TECH001",
      "total_points": 1,
      "total_ratings": 1
    },
    "performance": {
      "total_ratings": 1,
      "average_percentage": 89.09,
      "total_points_calculated": "1"
    },
    "current_month": {
      "stats": {
        "total_ratings": 0,
        "good_ratings": 0,
        "bad_ratings": 0,
        "points_gained": 0,
        "points_lost": 0,
        "net_points": 0
      },
      "performance_percentage": 0
    },
    "recent_ratings": [
      {
        "id": 1,
        "rating_link_id": 8,
        "total_score": 49,
        "max_score": 55,
        "percentage": "89.09",
        "points_awarded_auto": 1,
        "points_awarded_final": null,
        "admin_override_reason": null,
        "admin_override_by": null,
        "admin_override_at": null,
        "comments": "Great service overall!",
        "submitted_at": "2025-09-17 09:24:22",
        "client_name": "Updated Test Client v2",
        "client_email": "test@example.com",
        "final_points": 1
      }
    ],
    "monthly_trend": []
  }
}
```

### 2. Get Technician Ratings
**GET** `/technician/ratings`

**Headers:** `X-Token: technician_token`

**Query Parameters (Optional):**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

### 3. Get Rating Details
**GET** `/technician/ratings/{id}`

**Headers:** `X-Token: technician_token`

### 4. Get Performance Data
**GET** `/technician/performance`

**Headers:** `X-Token: technician_token`

**Response:**
```json
{
  "success": true,
  "status_code": 200,
  "message": "Performance data retrieved successfully",
  "data": {
    "overall": {
      "total_ratings": 1,
      "average_percentage": 89.09,
      "good_ratings": 1,
      "bad_ratings": 0,
      "success_rate": 100,
      "total_points_from_ratings": 1
    },
    "monthly_performance": [],
    "question_performance": []
  }
}
```

### 5. Get Ranking
**GET** `/technician/ranking`

**Headers:** `X-Token: technician_token`

---

## Public Endpoints

### 1. Get System Info
**GET** `/public/info`

**No Authentication Required**

**Response:**
```json
{
  "success": true,
  "status_code": 200,
  "message": "System info retrieved successfully",
  "data": {
    "company_name": "Ctecg Score",
    "company_color": "#cc0000",
    "timezone": "Africa/Johannesburg",
    "rating_scale": {
      "1": "Poor",
      "2": "Fair",
      "3": "Good",
      "4": "Very Good",
      "5": "Excellent"
    }
  }
}
```

### 2. Get Rating Form
**GET** `/public/rating/{token}`

**No Authentication Required**

**Response:**
```json
{
  "success": true,
  "status_code": 200,
  "message": "Rating form loaded successfully",
  "data": {
    "client_info": {
      "name": "Updated Test Client v2",
      "code": null,
      "email": "test@example.com",
      "contact": "555-8888"
    },
    "technicians": [
      {
        "id": 1,
        "name": "Steven Tech"
      },
      {
        "id": 2,
        "name": "Sarah Johnson"
      }
    ],
    "questions": [
      {
        "id": 1,
        "text": "Did the technician explain the work done?",
        "order_position": 1,
        "active": 1,
        "created_at": "2025-09-17 00:01:01",
        "updated_at": "2025-09-17 00:01:01"
      }
    ],
    "expires_at": "2025-09-19 09:21:36",
    "instructions": "Please rate each question from 1 (Poor) to 5 (Excellent)"
  }
}
```

### 3. Submit Rating
**POST** `/public/rating/{token}`

**No Authentication Required**

**Request:**
```json
{
  "answers": {
    "1": 5,
    "2": 4,
    "3": 5,
    "4": 4,
    "5": 5,
    "6": 3,
    "7": 5,
    "8": 4,
    "9": 5,
    "10": 4,
    "11": 5
  },
  "comments": "Great service overall!"
}
```

**Response:**
```json
{
  "success": true,
  "status_code": 200,
  "message": "Rating submitted successfully",
  "data": {
    "rating_id": "1",
    "total_score": 49,
    "max_score": 55,
    "percentage": 89.09,
    "points_awarded": 1,
    "technicians": [
      "Steven Tech",
      "Sarah Johnson"
    ],
    "thank_you_message": "Thank you for your feedback! Your rating has been submitted successfully."
  }
}
```

### 4. Check Rating Status
**GET** `/public/rating/{token}/status`

**No Authentication Required**

---

## Data Models

### User (Admin/Technician)
```typescript
interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  employee_id?: string; // Technicians only
  total_points?: number; // Technicians only
  total_ratings?: number; // Technicians only
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}
```

### Question
```typescript
interface Question {
  id: number;
  text: string;
  order_position: number;
  active: number; // 1 or 0
  created_at: string;
  updated_at: string;
}
```

### Rating
```typescript
interface Rating {
  id: number;
  rating_link_id: number;
  total_score: number;
  max_score: number;
  percentage: string;
  points_awarded_auto: number;
  points_awarded_final?: number;
  admin_override_reason?: string;
  admin_override_by?: string;
  admin_override_at?: string;
  comments?: string;
  submitted_at: string;
  client_name: string;
  client_email: string;
  client_code?: string;
  client_contact?: string;
  technician_names: string;
  technician_ids: string;
}
```

### Rating Link
```typescript
interface RatingLink {
  id: number;
  token: string;
  client_name: string;
  client_code?: string;
  client_email: string;
  client_contact?: string;
  expires_at: string;
  used: number; // 1 or 0
  used_at?: string;
  created_by_admin_id: number;
  created_at: string;
  updated_at: string;
}
```

---

## Important Notes

1. **Token Management**: Tokens expire after 12 hours. Handle 401 responses by redirecting to login.

2. **Rating Links**: Only one active rating link per client email. Creating a new one will update the existing one.

3. **Password Requirements**: Minimum 8 characters for password creation.

4. **Timezone**: All timestamps are in Africa/Johannesburg timezone.

5. **Points System**: 
   - ≥70% = +1 point
   - <70% = 0 points
   - 3 bad reviews in one month = -1 point

6. **Email Already Has Link**: If a client email already has an active rating link, creating a new one will update the existing link instead of failing.

7. **Multiple Technicians**: One rating link can be associated with multiple technicians, and all linked technicians receive the same points from that rating.

---

## API Root
**GET** `/`

Returns basic API information:
```json
{
  "success": true,
  "status_code": 200,
  "message": "API is running",
  "data": {
    "name": "Ctecg Score API",
    "version": "1.0.0",
    "timezone": "Africa/Johannesburg",
    "timestamp": "2025-09-17 09:24:22"
  }
}
```
