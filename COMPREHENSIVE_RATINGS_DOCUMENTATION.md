# Complete Ratings System Documentation

## Overview

The Ctecg Score API provides a comprehensive rating system that allows clients to rate technician services through secure, time-limited links. This document covers the entire rating workflow from link creation to data analysis.

---

## System Architecture

### Core Components

#### 1. **Rating Links**
- Unique, secure tokens for client access
- Time-limited (48-hour expiry)
- Single-use only
- Links multiple technicians to one rating session

#### 2. **Questions System**
- Dynamic question management
- 1-5 scoring scale
- Sequential ordering
- Active/inactive states for lifecycle management

#### 3. **Rating Submissions**
- Comprehensive answer tracking
- Automatic scoring calculation
- Points allocation based on pass/fail thresholds
- Optional client comments

#### 4. **Notification System**
- Email notifications to admins and technicians
- Real-time updates on rating submissions
- Customizable email templates

---

## Database Schema

### Core Tables

```sql
-- Rating Links: Main entry point for ratings
rating_links:
- id (Primary Key)
- token (Unique secure identifier)
- client_name, client_email, client_code, client_contact
- created_by_admin_id (FK to admins)
- used (0/1 flag)
- used_at (Timestamp when rating submitted)
- expires_at (48 hours from creation)
- created_at, updated_at

-- Link Technicians: Many-to-many relationship
rating_link_technicians:
- rating_link_id (FK to rating_links)
- technician_id (FK to technicians)

-- Ratings: Submitted rating data
ratings:
- id (Primary Key)
- rating_link_id (FK to rating_links)
- total_score, max_score, percentage
- points_awarded_auto (System calculated: 0 or 1)
- points_awarded_final (Admin override value)
- admin_override_by (FK to admins)
- admin_override_reason, admin_override_at
- comments (Client feedback)
- submitted_at

-- Rating Answers: Individual question responses
rating_answers:
- id (Primary Key)
- rating_id (FK to ratings)
- question_id (FK to questions)
- score (1-5 scale)

-- Questions: Rating criteria
questions:
- id (Primary Key)
- text (Question content)
- order_position (Display sequence)
- active (0/1 visibility flag)
- created_at, updated_at
```

---

## Rating Workflow

### Phase 1: Link Creation (Admin)

#### Create Rating Link
**Endpoint:** `POST /api/admin/rating-links`  
**Authentication:** Admin token required

**Request Example:**
```bash
curl -X POST https://score.ctecg.co.za/api/admin/rating-links \
  -H "X-Token: 874932179f68fe67c37d135f893b81c13de1d592f7dc10eed2b3b61cbb40e72f" \
  -H "Content-Type: application/json" \
  -d '{
    "client_name": "ABC Company Ltd",
    "client_email": "manager@abccompany.com",
    "client_code": "CLI001",
    "client_contact": "+27 11 123 4567",
    "technician_ids": [1, 3, 7]
  }'
```

**Successful Response:**
```json
{
  "success": true,
  "status_code": 201,
  "message": "Rating link created successfully",
  "data": {
    "link_id": 42,
    "token": "a1b2c3d4e5f6789012345abcdef67890",
    "rating_url": "https://score.ctecg.co.za/rate/a1b2c3d4e5f6789012345abcdef67890",
    "expires_at": "2025-09-19 20:30:00",
    "client_name": "ABC Company Ltd",
    "client_email": "manager@abccompany.com",
    "action": "created"
  },
  "timestamp": "2025-09-17 20:30:00"
}
```

#### Get Rating Links
**Endpoint:** `GET /api/admin/rating-links`  
**Authentication:** Admin token required

**Query Parameters:**
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Items per page, max 100 (default: 20)
- `status` (optional): Filter by status - 'all', 'active', 'used', 'expired' (default: 'all')
- `search` (optional): Search in client name, email, or code

**Request Example:**
```bash
curl -X GET "https://score.ctecg.co.za/api/admin/rating-links?status=active&page=1&limit=10" \
  -H "X-Token: 874932179f68fe67c37d135f893b81c13de1d592f7dc10eed2b3b61cbb40e72f"
```

**Response:**
```json
{
  "success": true,
  "status_code": 200,
  "message": "Rating links retrieved successfully",
  "data": {
    "rating_links": [
      {
        "id": 9,
        "token": "8d1dc17663e47248dce7a63ee420c83fce9115a2d59c0b380556ea1c02cdfc81",
        "client_name": "Email Test Client",
        "client_code": null,
        "client_email": "test-email@example.com",
        "client_contact": "555-0000",
        "expires_at": "2025-09-19 09:28:42",
        "used": 0,
        "used_at": null,
        "created_by_admin_id": 1,
        "created_at": "2025-09-17 09:28:42",
        "updated_at": "2025-09-17 09:28:42",
        "created_by_name": "Steven Admin",
        "status": "active",
        "submitted_at": null,
        "rating_percentage": null,
        "technician_names": "Steven Tech",
        "technician_count": 1
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 1,
      "total_count": 1,
      "per_page": 20,
      "has_next": false,
      "has_prev": false
    },
    "filters": {
      "status": "active",
      "search": ""
    }
  },
  "timestamp": "2025-09-18 06:51:50"
}
```

**Status Values:**
- `active`: Link is not used and not expired
- `used`: Link has been used to submit a rating
- `expired`: Link has expired without being used

#### Link Creation Logic

1. **Duplicate Prevention**: If a rating link already exists for the same client email with active technicians, the system:
   - Updates the existing link with new token
   - Extends expiry by 48 hours
   - Updates client information
   - Replaces technician associations

2. **Token Generation**: 32-character random hex string
3. **Expiry**: 48 hours from creation/update
4. **Technician Linking**: Creates entries in `rating_link_technicians` table

#### Business Rules
- **Required Fields**: `client_name`, `client_email`, `technician_ids[]`
- **Optional Fields**: `client_code`, `client_contact`
- **Technician Validation**: All technician IDs must exist and be active
- **Email Validation**: Standard email format required
- **Token Uniqueness**: System ensures no duplicate tokens

---

### Phase 2: Rating Access (Public)

#### Get Rating Form
**Endpoint:** `GET /api/public/rating/{token}`  
**Authentication:** None required

**Request Example:**
```bash
curl https://score.ctecg.co.za/api/public/rating/a1b2c3d4e5f6789012345abcdef67890
```

**Successful Response:**
```json
{
  "success": true,
  "status_code": 200,
  "message": "Rating form loaded successfully",
  "data": {
    "client_info": {
      "name": "ABC Company Ltd",
      "code": "CLI001",
      "email": "manager@abccompany.com",
      "contact": "+27 11 123 4567"
    },
    "technicians": [
      {"id": 1, "name": "John Smith"},
      {"id": 3, "name": "Sarah Johnson"},
      {"id": 7, "name": "Mike Wilson"}
    ],
    "questions": [
      {
        "id": 1,
        "text": "How would you rate the technician's punctuality?",
        "order_position": 1
      },
      {
        "id": 2,
        "text": "How satisfied are you with the quality of work?",
        "order_position": 2
      },
      {
        "id": 3,
        "text": "How professional was the technician's communication?",
        "order_position": 3
      },
      {
        "id": 4,
        "text": "How clean and organized was the work area?",
        "order_position": 4
      },
      {
        "id": 5,
        "text": "Would you recommend our services to others?",
        "order_position": 5
      }
    ],
    "expires_at": "2025-09-19 20:30:00",
    "instructions": "Please rate each question from 1 (Poor) to 5 (Excellent)"
  },
  "timestamp": "2025-09-17 21:15:00"
}
```

#### Link Validation
The system validates:
- **Token exists** in database
- **Not expired** (within 48 hours)
- **Not already used** (single-use only)
- **Questions available** (at least one active question)

#### Error Responses

**Invalid/Expired Token:**
```json
{
  "success": false,
  "status_code": 400,
  "message": "Invalid, expired, or already used rating link",
  "data": null,
  "timestamp": "2025-09-17 21:15:00"
}
```

---

### Phase 3: Rating Submission (Public)

#### Submit Rating
**Endpoint:** `POST /api/public/rating/{token}`  
**Authentication:** None required

**Request Example:**
```bash
curl -X POST https://score.ctecg.co.za/api/public/rating/a1b2c3d4e5f6789012345abcdef67890 \
  -H "Content-Type: application/json" \
  -d '{
    "answers": {
      "1": 5,
      "2": 4,
      "3": 5,
      "4": 3,
      "5": 4
    },
    "comments": "The technicians were professional and completed the work efficiently. The workspace could have been tidier."
  }'
```

**Successful Response:**
```json
{
  "success": true,
  "status_code": 201,
  "message": "Rating submitted successfully",
  "data": {
    "rating_id": 156,
    "total_score": 21,
    "max_score": 25,
    "percentage": 84.0,
    "points_awarded": 1,
    "pass_threshold": 70
  },
  "timestamp": "2025-09-17 21:30:00"
}
```

#### Submission Validation

1. **Answer Completeness**: All active questions must be answered
2. **Score Range**: Each answer must be 1-5
3. **Question Validity**: Question IDs must exist and be active
4. **Link Status**: Token must still be valid and unused

#### Scoring Logic

```javascript
// Automatic scoring calculation
totalScore = sum(all_answers)
maxScore = questionCount * 5
percentage = (totalScore / maxScore) * 100

// Points allocation (from settings table)
passPercentage = 70  // Default, configurable
pointsAwarded = percentage >= passPercentage ? 1 : 0
```

#### Database Operations

1. **Create Rating Record**: Store overall rating data
2. **Create Answer Records**: Individual question responses
3. **Mark Link Used**: Prevent reuse (`used = 1, used_at = NOW()`)
4. **Send Notifications**: Email admin and technicians

---

### Phase 4: Link Status Check (Public)

#### Check Rating Status
**Endpoint:** `GET /api/public/rating/{token}/status`  
**Authentication:** None required

**Valid Link Response:**
```json
{
  "success": true,
  "status_code": 200,
  "message": "Rating link is valid",
  "data": {
    "valid": true,
    "expires_at": "2025-09-19 20:30:00",
    "client_name": "ABC Company Ltd",
    "technician_count": 3
  },
  "timestamp": "2025-09-17 21:00:00"
}
```

**Already Used Response:**
```json
{
  "success": true,
  "status_code": 200,
  "message": "Rating link has already been used",
  "data": {
    "valid": false,
    "reason": "already_used",
    "used_at": "2025-09-17 21:30:00"
  },
  "timestamp": "2025-09-17 22:00:00"
}
```

**Expired Response:**
```json
{
  "success": true,
  "status_code": 200,
  "message": "Rating link has expired",
  "data": {
    "valid": false,
    "reason": "expired",
    "expired_at": "2025-09-17 20:30:00"
  },
  "timestamp": "2025-09-18 09:00:00"
}
```

---

## Rating Management (Admin)

### View All Ratings (Grouped Per Technician)
**Endpoint:** `GET /api/admin/ratings`  
**Authentication:** Admin token required

**Purpose:** View and manage ratings organized by technician for easy performance analysis and point management. Each technician is listed with their complete rating history, statistics, and current point totals.

**Key Features:**
- **Grouped by Technician:** Each technician shows all their ratings together
- **Performance Summary:** Average percentage, good/poor rating counts, point totals
- **Point Management Context:** See current points and identify adjustment opportunities
- **Override Tracking:** View which ratings have been manually adjusted
- **Individual Rating Details:** Complete information for each rating per technician

**Query Parameters:**
- `page` (default: 1): Page number for pagination
- `limit` (default: 20): Items per page (max: 100)
- `technician_id` (optional): Show only specific technician with all their ratings
- `start_date`: Filter ratings from date (YYYY-MM-DD format)
- `end_date`: Filter ratings to date (YYYY-MM-DD format)

**Request Examples:**

**View All Technicians with Ratings:**
```bash
curl "https://score.ctecg.co.za/api/admin/ratings?limit=10" \
  -H "X-Token: your_admin_token"
```

**View Specific Technician's Complete History:**
```bash
curl "https://score.ctecg.co.za/api/admin/ratings?technician_id=1" \
  -H "X-Token: your_admin_token"
```

**View September 2025 Performance:**
```bash
curl "https://score.ctecg.co.za/api/admin/ratings?start_date=2025-09-01&end_date=2025-09-30" \
  -H "X-Token: your_admin_token"
```

**Response Structure:**
```json
{
  "success": true,
  "status_code": 200,
  "message": "Technician ratings retrieved successfully",
  "data": {
    "technicians": [
      {
        "technician_id": 1,
        "technician_name": "Steven Tech",
        "technician_email": "steven@dannel.co.za",
        "current_total_points": 4,
        "total_ratings": 4,
        "average_percentage": 88.64,
        "good_ratings": 4,
        "poor_ratings": 0,
        "total_points_from_ratings": 3,
        "overridden_ratings": 2,
        "ratings": [
          {
            "id": 4,
            "total_score": 49,
            "max_score": 55,
            "percentage": "89.09",
            "points_awarded_auto": 1,
            "points_awarded_final": null,
            "admin_override_reason": null,
            "admin_override_by": null,
            "admin_override_at": null,
            "comments": "Good service",
            "submitted_at": "2025-09-18 10:49:42",
            "client_name": "Email Test Client",
            "client_code": null,
            "client_email": "test-email@example.com",
            "overridden_by": null
          },
          {
            "id": 1,
            "total_score": 49,
            "max_score": 55,
            "percentage": "89.09",
            "points_awarded_auto": 1,
            "points_awarded_final": 2,
            "admin_override_reason": "Additional effort noted by supervisor",
            "admin_override_by": 1,
            "admin_override_at": "2025-09-18 06:40:10",
            "comments": "Great service overall!",
            "submitted_at": "2025-09-17 09:24:22",
            "client_name": "Updated Test Client v2",
            "client_code": null,
            "client_email": "test@example.com",
            "overridden_by": "Steven Admin"
          }
        ]
      },
      {
        "technician_id": 4,
        "technician_name": "Mr. XS Masilela",
        "technician_email": "xsmasilela@gmail.com",
        "current_total_points": -1,
        "total_ratings": 1,
        "average_percentage": 85.45,
        "good_ratings": 1,
        "poor_ratings": 0,
        "total_points_from_ratings": -1,
        "overridden_ratings": 1,
        "ratings": [
          {
            "id": 2,
            "total_score": 47,
            "max_score": 55,
            "percentage": "85.45",
            "points_awarded_auto": 1,
            "points_awarded_final": -1,
            "admin_override_reason": "Documentation testing - adjusting points to verify override functionality",
            "admin_override_by": 1,
            "admin_override_at": "2025-09-17 21:12:15",
            "comments": "The technicians were very professional and knowledgeable.",
            "submitted_at": "2025-09-17 21:08:40",
            "client_name": "Test Documentation Client",
            "client_code": "DOC001",
            "client_email": "testclient@documentation.com",
            "overridden_by": "Steven Admin"
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 2,
      "pages": 1
    },
    "filters_applied": {
      "technician_id": null,
      "start_date": null,
      "end_date": null
    }
  },
  "timestamp": "2025-09-18 19:43:10"
}
```

**Data Structure Explained:**

**Technician Summary Fields:**
- `current_total_points`: Overall accumulated points across all time
- `total_ratings`: Number of ratings received (in filtered period)
- `average_percentage`: Average rating percentage for the period
- `good_ratings`: Count of ratings ≥70% (passing threshold)
- `poor_ratings`: Count of ratings <70% (below threshold)
- `total_points_from_ratings`: Sum of all points from ratings in this period
- `overridden_ratings`: Count of ratings with admin point adjustments

**Individual Rating Fields:**
- `points_awarded_auto`: System-calculated points (0 or 1 based on percentage)
- `points_awarded_final`: Final points after admin override (null = no override)
- `admin_override_*`: Details about manual point adjustments for this rating
- `overridden_by`: Name of admin who made the override

**Admin Workflow Benefits:**

**1. Quick Performance Assessment:**
```bash
# See all technicians ranked by performance
curl "https://score.ctecg.co.za/api/admin/ratings" -H "X-Token: your_token"
```

**2. Individual Technician Review:**
```bash
# Deep dive into specific technician's history
curl "https://score.ctecg.co.za/api/admin/ratings?technician_id=1" -H "X-Token: your_token"
```

**3. Monthly Performance Analysis:**
```bash
# Review month's performance for point adjustments
curl "https://score.ctecg.co.za/api/admin/ratings?start_date=2025-09-01&end_date=2025-09-30" -H "X-Token: your_token"
```

**Point Management Integration:**

Based on the grouped data, admins can easily:

1. **Identify High Performers for Rewards:**
   - Look for technicians with high `average_percentage` (≥90%)
   - Check `good_ratings` vs `total_ratings` ratio
   - Use `/api/admin/technicians/{id}/adjust-points` to add bonus points

2. **Identify Poor Performance for Penalties:**
   - Find technicians with low `average_percentage` (<70%)
   - Check `poor_ratings` count and recent rating trends
   - Use `/api/admin/technicians/{id}/adjust-points` to subtract points

3. **Review Override History:**
   - See `overridden_ratings` count per technician
   - Review individual `admin_override_reason` explanations
   - Ensure consistent point adjustment policies

4. **Spot Rating Anomalies:**
   - Compare `points_awarded_auto` vs `points_awarded_final`
   - Look for ratings that need point corrections
   - Use `/api/admin/ratings/{id}/override` for rating-specific adjustments

**Best Practices:**
- **Use technician_id filter** for detailed individual performance reviews
- **Use date filters** for monthly/weekly performance analysis  
- **Review average_percentage** to identify consistent performance patterns
- **Check overridden_ratings** to track admin intervention frequency
- **Analyze comments** for context before making point adjustments
  },
  "timestamp": "2025-09-18 09:00:00"
}
```

---

## Technician Point Management (Admin)

Admins have full control over technician points through multiple mechanisms: rating overrides, manual point adjustments, and viewing complete point history. This system allows admins to reward excellent behavior or penalize poor performance outside of normal ratings.

### Manual Point Adjustments (Rewards & Penalties)

**Endpoint:** `POST /api/admin/technicians/{id}/adjust-points`  
**Authentication:** Admin token required

**Purpose:** Allow admins to manually add or subtract points for technician behavior, customer feedback, or other scenarios not covered by standard ratings.

**Common Use Cases:**
- **Add Points (+):** Excellent customer service, going above and beyond, training completion, positive feedback
- **Subtract Points (-):** Late arrivals, safety violations, customer complaints, dress code violations

**Request Example (Adding Points):**
```bash
curl -X POST https://score.ctecg.co.za/api/admin/technicians/1/adjust-points \
  -H "X-Token: your_admin_token" \
  -H "Content-Type: application/json" \
  -d '{
    "points_change": 2,
    "reason": "Received excellent customer feedback - went above and beyond to solve network issue"
  }'
```

**Request Example (Subtracting Points):**
```bash
curl -X POST https://score.ctecg.co.za/api/admin/technicians/1/adjust-points \
  -H "X-Token: your_admin_token" \
  -H "Content-Type: application/json" \
  -d '{
    "points_change": -1,
    "reason": "Arrived 30 minutes late to client appointment without prior notice"
  }'
```

**Request Parameters:**
- `points_change` (required): Integer between -5 and +5 (cannot be 0)
- `reason` (required): Detailed explanation for the point adjustment

**Success Response:**
```json
{
  "success": true,
  "status_code": 200,
  "message": "Points adjusted successfully",
  "data": {
    "technician_id": "1",
    "technician_name": "Steven Tech",
    "points_change": 2,
    "previous_total": 5,
    "new_total": 7,
    "reason": "Received excellent customer feedback - went above and beyond to solve network issue",
    "admin_name": "Steven Admin"
  },
  "timestamp": "2025-09-18 10:15:00"
}
```

**Validation Rules:**
- `points_change` must be between -5 and +5 (configurable via settings)
- `points_change` cannot be 0 (no-op adjustments not allowed)
- Cannot result in negative total points
- Requires detailed reason (minimum 10 characters)
- Automatically sends email notification to technician

### Rating Points Override

**Endpoint:** `POST /api/admin/ratings/{id}/override`  
**Authentication:** Admin token required

**Purpose:** Adjust points for specific ratings when circumstances warrant it (different from general behavior adjustments).

**Request Example:**
```bash
curl -X POST https://score.ctecg.co.za/api/admin/ratings/156/override \
  -H "X-Token: your_admin_token" \
  -H "Content-Type: application/json" \
  -d '{
    "points_change": 1,
    "reason": "Client rating was unfair - technician dealt with exceptional circumstances"
  }'
```

**Response:**
```json
{
  "success": true,
  "status_code": 200,
  "message": "Rating points adjusted successfully",
  "data": {
    "original_points": 1,
    "points_change": 1,
    "new_points": 2,
    "technicians_affected": 1
  },
  "timestamp": "2025-09-18 10:15:00"
}
```

### View Technician Point History

**Endpoint:** `GET /api/admin/technicians/{id}/point-history`  
**Authentication:** Admin token required

**Purpose:** View complete audit trail of all point changes for a technician.

**Request Example:**
```bash
curl -H "X-Token: your_admin_token" \
  https://score.ctecg.co.za/api/admin/technicians/1/point-history
```

**Response:**
```json
{
  "success": true,
  "status_code": 200,
  "message": "Point history retrieved successfully",
  "data": {
    "technician_id": "1",
    "technician_name": "Steven Tech",
    "current_total_points": 8,
    "history": [
      {
        "id": 6,
        "adjustment_type": "manual_adjustment",
        "points_change": 2,
        "previous_total": 5,
        "new_total": 7,
        "reason": "Received excellent customer feedback - went above and beyond",
        "admin_name": "Steven Admin",
        "related_rating_id": null,
        "client_name": null,
        "created_at": "2025-09-18 06:38:49"
      },
      {
        "id": 7,
        "adjustment_type": "rating_override",
        "points_change": 1,
        "previous_total": 7,
        "new_total": 8,
        "reason": "Client rating was unfair - exceptional circumstances",
        "admin_name": "Steven Admin",
        "related_rating_id": 156,
        "client_name": "ABC Company Ltd",
        "created_at": "2025-09-18 06:40:10"
      },
      {
        "id": 8,
        "adjustment_type": "manual_adjustment",
        "points_change": -1,
        "previous_total": 8,
        "new_total": 7,
        "reason": "Arrived late to client appointment without notice",
        "admin_name": "Steven Admin",
        "related_rating_id": null,
        "client_name": null,
        "created_at": "2025-09-18 07:15:30"
      }
    ],
    "summary": {
      "total_adjustments": 3,
      "points_gained": 3,
      "points_lost": 1,
      "net_change": 2
    }
  },
  "timestamp": "2025-09-18 10:15:00"
}
```

**Adjustment Types Explained:**
- `manual_adjustment`: Admin manually added/subtracted points for behavior
- `rating_override`: Admin adjusted points for a specific rating
- `rating_submission`: Points automatically awarded from a rating submission

### Quick Point Management Guide

**When to Add Points (+):**
- Exceptional customer service feedback
- Going above and beyond job requirements
- Completing additional training
- Helping colleagues or covering shifts
- Maintaining perfect punctuality record
- Solving complex technical problems

**When to Subtract Points (-):**
- Consistent lateness or no-shows
- Safety protocol violations
- Customer complaints about behavior
- Inappropriate dress or presentation
- Equipment damage or misuse
- Failure to follow company procedures

**Best Practices:**
1. **Always provide detailed reasons** - helps technicians understand and improve
2. **Be consistent** - similar behaviors should receive similar point adjustments
3. **Document immediately** - adjust points when incidents occur, not weeks later
4. **Communicate clearly** - follow up verbal discussions with point adjustments
5. **Track patterns** - use point history to identify training needs or recognition opportunities

---

## Enhanced Points Management System

The system includes a comprehensive points management framework with relative adjustments, comprehensive tracking, and detailed audit trails.

#### Database Enhancement

The enhanced system includes a new `point_adjustments` table that tracks all point changes:

```sql
-- Point adjustments tracking table
CREATE TABLE `point_adjustments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `technician_id` int(11) NOT NULL,
  `admin_id` int(11) NOT NULL,
  `adjustment_type` enum('rating_override','manual_adjustment','rating_submission') NOT NULL,
  `points_change` int(11) NOT NULL COMMENT 'Positive or negative point change',
  `previous_total` int(11) NOT NULL,
  `new_total` int(11) NOT NULL,
  `reason` text NOT NULL,
  `related_rating_id` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
);

-- Enhanced ratings table with relative tracking
ALTER TABLE `ratings` 
ADD COLUMN `points_override_change` int(11) DEFAULT NULL 
COMMENT 'Relative change from auto points';
```

#### 1. Enhanced Rating Points Override (Relative Adjustments)

**Endpoint:** `POST /api/admin/ratings/{id}/override`  
**Authentication:** Admin token required

**Key Changes:**
- Now uses `points_change` (relative) instead of `points_awarded` (absolute)
- Tracks all changes in `point_adjustments` table
- Enhanced email notifications with before/after totals

**Request Example:**
```bash
curl -X POST https://score.ctecg.co.za/api/admin/ratings/156/override \
  -H "X-Token: 874932179f68fe67c37d135f893b81c13de1d592f7dc10eed2b3b61cbb40e72f" \
  -H "Content-Type: application/json" \
  -d '{
    "points_change": 1,
    "reason": "Additional effort noted by supervisor"
  }'
```

**Response:**
```json
{
  "success": true,
  "status_code": 200,
  "message": "Rating points adjusted successfully",
  "data": {
    "original_points": 1,
    "points_change": 1,
    "new_points": 2,
    "technicians_affected": 2
  },
  "timestamp": "2025-09-18 10:15:00"
}
```

**Validation Rules:**
- `points_change` must be non-zero (-5 to +5 range)
- Cannot be 0 (no-op adjustments not allowed)
- Requires reason for all adjustments

#### 2. General Point Adjustments (Rewards & Penalties)

**Endpoint:** `POST /api/admin/technicians/{id}/adjust-points`  
**Authentication:** Admin token required

Allows admins to reward or penalize technicians for general behavior outside of ratings.

**Request Example:**
```bash
curl -X POST https://score.ctecg.co.za/api/admin/technicians/1/adjust-points \
  -H "X-Token: 874932179f68fe67c37d135f893b81c13de1d592f7dc10eed2b3b61cbb40e72f" \
  -H "Content-Type: application/json" \
  -d '{
    "points_change": 2,
    "reason": "Excellent customer service feedback received"
  }'
```

**Response:**
```json
{
  "success": true,
  "status_code": 200,
  "message": "Points adjusted successfully",
  "data": {
    "technician_id": "1",
    "technician_name": "Steven Tech",
    "points_change": 2,
    "previous_total": 5,
    "new_total": 7,
    "reason": "Excellent customer service feedback received",
    "admin_name": "Steven Admin"
  },
  "timestamp": "2025-09-18 10:15:00"
}
```

**Use Cases:**
- **Rewards (+points):** Excellent customer feedback, going above and beyond, training completion
- **Penalties (-points):** Late arrivals, safety violations, customer complaints
- **Adjustments:** Corrections for previous errors, policy updates

**Validation Rules:**
- `points_change` must be non-zero
- Maximum adjustment limit from settings (`max_manual_point_adjustment`, default: 5)
- Cannot result in negative total points
- Requires detailed reason

#### 3. Point History Tracking

**Endpoint:** `GET /api/admin/technicians/{id}/point-history`  
**Authentication:** Admin token required

Provides complete audit trail of all point changes for a technician.

**Request Example:**
```bash
curl -H "X-Token: 874932179f68fe67c37d135f893b81c13de1d592f7dc10eed2b3b61cbb40e72f" \
  https://score.ctecg.co.za/api/admin/technicians/1/point-history
```

**Response:**
```json
{
  "success": true,
  "status_code": 200,
  "message": "Success",
  "data": {
    "technician_id": "1",
    "history": [
      {
        "id": 6,
        "technician_id": 1,
        "technician_name": "Steven Tech",
        "admin_id": 1,
        "admin_name": "Steven Admin",
        "adjustment_type": "manual_adjustment",
        "points_change": 2,
        "previous_total": 5,
        "new_total": 7,
        "reason": "Excellent customer service feedback",
        "related_rating_id": null,
        "client_name": null,
        "created_at": "2025-09-18 06:38:49"
      },
      {
        "id": 7,
        "technician_id": 1,
        "technician_name": "Steven Tech",
        "admin_id": 1,
        "admin_name": "Steven Admin",
        "adjustment_type": "rating_override",
        "points_change": 1,
        "previous_total": 7,
        "new_total": 8,
        "reason": "Additional effort noted by supervisor",
        "related_rating_id": 156,
        "client_name": "ABC Company Ltd",
        "created_at": "2025-09-18 06:40:10"
      }
    ],
    "total_records": 2
  },
  "timestamp": "2025-09-18 10:15:00"
}
```

#### 4. Enhanced Email Notifications

The system now includes enhanced email notifications for all point changes:

**Point Adjustment Notifications:**
- Sent for both manual adjustments and rating overrides
- Includes before/after point totals
- Clear distinction between rewards and penalties
- Includes reason and admin attribution

**Email Content:**
- **Subject**: "You have received points!" (rewards) or "Point adjustment notification"
- **Content**: Shows point change, total before/after, reason, admin name
- **Customization**: Different styling for rewards vs penalties

#### 5. System Settings

New settings control enhanced points system behavior:

```sql
INSERT INTO `settings` VALUES
('max_manual_point_adjustment', '5', 'Maximum points in single adjustment'),
('point_adjustment_email_enabled', '1', 'Enable email notifications for adjustments'),
('point_history_retention_days', '365', 'Days to retain point history');
```

#### 6. Migration Script

To upgrade existing systems, run the provided migration script:

**File:** `database_migration_points_enhancement.sql`

**Key Features:**
- Creates `point_adjustments` table with proper foreign keys
- Adds `points_override_change` column to `ratings` table
- Creates historical records for existing overrides
- Adds database triggers for automatic point updates
- Creates `v_point_history` view for easy reporting
- Includes proper indexes for performance

**Migration Steps:**
1. Backup your database
2. Run: `mysql -u username -p database_name < database_migration_points_enhancement.sql`
3. Verify migration success with provided verification queries

---

## Technician Leaderboard System

### Get Monthly Leaderboard
**Endpoint:** `GET /api/admin/leaderboard`  
**Authentication:** Admin token required

**Description:**
Retrieves monthly technician rankings with comprehensive performance metrics. The endpoint automatically updates the `monthly_performance` table with current data each time it's called, ensuring accurate real-time rankings for display in graphs and dashboards.

**Query Parameters:**
- `year` (optional): Year for leaderboard (default: current year)
- `month` (optional): Month for leaderboard (default: current month)
- `limit` (optional): Maximum technicians to return (default: 10, max: 50)

**Example Request:**
```bash
curl -X GET "https://score.ctecg.co.za/api/admin/leaderboard?year=2025&month=9&limit=5" \
  -H "X-Token: your_admin_token"
```

**Response Structure:**
```json
{
  "success": true,
  "status_code": 200,
  "message": "Leaderboard for September 2025 retrieved successfully",
  "data": {
    "leaderboard": [
      {
        "id": 1,
        "name": "Steven Tech",
        "email": "steven@dannel.co.za",
        "total_points": 4,
        "ratings_this_month": 4,
        "points_this_month": 3,
        "good_ratings": 4,
        "bad_ratings": 0,
        "points_gained": 3,
        "points_lost": 0,
        "avg_percentage_this_month": "100.00",
        "rank_position": 1,
        "performance_level": "excellent",
        "activity_level": "active"
      }
    ],
    "leaders": [
      // Top 3 technicians (same structure as leaderboard items)
    ],
    "trailers": [
      // Bottom 3 technicians (same structure as leaderboard items)
    ],
    "summary": {
      "total_active_technicians": 4,
      "total_ratings_this_month": "6",
      "overall_avg_percentage": "100.00",
      "total_points_awarded": "4",
      "highest_monthly_points": 3,
      "lowest_monthly_points": -1
    },
    "period": {
      "year": "2025",
      "month": "9",
      "month_name": "September",
      "is_current_month": true
    },
    "metadata": {
      "total_technicians_shown": 4,
      "leaders_count": 3,
      "trailers_count": 3
    }
  },
  "timestamp": "2025-09-18 11:05:21"
}
```

**Data Fields Explained:**

**Individual Technician Data:**
- `total_points`: Overall accumulated points across all time
- `ratings_this_month`: Number of ratings received this month
- `points_this_month`: Net points gained/lost this month
- `good_ratings`: Ratings ≥70% this month
- `bad_ratings`: Ratings <70% this month
- `points_gained`: Positive points earned this month
- `points_lost`: Points lost due to poor performance this month
- `avg_percentage_this_month`: Average rating percentage for the month
- `rank_position`: Current ranking position (1 = best)
- `performance_level`: `excellent` (≥85%), `good` (≥70%), `average` (≥50%), `needs_improvement` (<50%), `no_ratings`
- `activity_level`: `highly_active` (≥5 ratings), `active` (≥2 ratings), `low_activity` (1 rating), `inactive` (0 ratings)

**Leaderboard Structure:**
- `leaderboard`: All technicians in ranking order (up to limit)
- `leaders`: Top 3 performing technicians this month
- `trailers`: Bottom 3 performing technicians (only shown if >3 total technicians)
- `summary`: Overall statistics for all active technicians
- `period`: Month/year information and current month indicator
- `metadata`: Count information about the response

**Technical Implementation:**
1. **Auto-Update**: Each call automatically refreshes the `monthly_performance` table
2. **Real-Time Data**: Calculations are based on current ratings and point adjustments
3. **Performance Optimized**: Uses dedicated monthly_performance table for fast queries
4. **Graph-Ready**: Data structure optimized for frontend graph/chart display

**Use Cases:**
- Monthly performance dashboards
- Technician recognition programs
- Performance trend analysis
- Competitive ranking displays
- Management reporting and KPIs

---

## Technician View (Technician Portal)

### View Personal Ratings
**Endpoint:** `GET /api/technician/ratings`  
**Authentication:** Technician token required

**Query Parameters:**
- `page`, `limit`: Pagination
- `start_date`, `end_date`: Date filtering

**Response:**
```json
{
  "success": true,
  "status_code": 200,
  "message": "Ratings retrieved successfully",
  "data": {
    "ratings": [
      {
        "id": 156,
        "total_score": 21,
        "max_score": 25,
        "percentage": 84.0,
        "final_points": 1,
        "admin_override_reason": null,
        "overridden_by": null,
        "comments": "The technicians were professional...",
        "submitted_at": "2025-09-17 21:30:00",
        "client_name": "ABC Company Ltd",
        "client_email": "manager@abccompany.com",
        "client_code": "CLI001"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 12,
      "pages": 1
    }
  },
  "timestamp": "2025-09-18 09:00:00"
}
```

### View Rating Details
**Endpoint:** `GET /api/technician/ratings/{id}`  
**Authentication:** Technician token required

**Response:**
```json
{
  "success": true,
  "status_code": 200,
  "message": "Rating details retrieved successfully",
  "data": {
    "id": 156,
    "total_score": 21,
    "max_score": 25,
    "percentage": 84.0,
    "final_points": 1,
    "admin_override_reason": null,
    "overridden_by": null,
    "admin_override_at": null,
    "comments": "The technicians were professional...",
    "submitted_at": "2025-09-17 21:30:00",
    "client_name": "ABC Company Ltd",
    "client_email": "manager@abccompany.com",
    "client_code": "CLI001",
    "client_contact": "+27 11 123 4567",
    "answers": [
      {
        "score": 5,
        "question_text": "How would you rate the technician's punctuality?",
        "order_position": 1
      },
      {
        "score": 4,
        "question_text": "How satisfied are you with the quality of work?",
        "order_position": 2
      },
      {
        "score": 5,
        "question_text": "How professional was the technician's communication?",
        "order_position": 3
      },
      {
        "score": 3,
        "question_text": "How clean and organized was the work area?",
        "order_position": 4
      },
      {
        "score": 4,
        "question_text": "Would you recommend our services to others?",
        "order_position": 5
      }
    ],
    "technicians": [
      {"id": 1, "name": "John Smith"},
      {"id": 3, "name": "Sarah Johnson"},
      {"id": 7, "name": "Mike Wilson"}
    ]
  },
  "timestamp": "2025-09-18 09:30:00"
}
```

---

## Email Notification System

### Notification Types

#### 1. Admin Notification (Rating Submitted)
**Trigger**: When a rating is successfully submitted  
**Recipients**: All active admin users  
**Template**: `rating_submitted_admin`

**Email Content:**
- Subject: "New Rating Submitted for {Technician Names}"
- Technician names and client information
- Score summary and percentage
- Points awarded
- Client comments (if provided)
- Link to admin dashboard

#### 2. Technician Notification (Rating Received)
**Trigger**: When a rating is successfully submitted  
**Recipients**: All technicians linked to the rating  
**Template**: `rating_received_technician`

**Email Content:**
- Subject: "New Rating Received"
- Personal greeting with technician name
- Client information and score details
- Points awarded
- Comments from client
- Link to technician dashboard

#### 3. Points Override Notification
**Trigger**: When admin overrides rating points  
**Recipients**: Affected technicians  
**Template**: `points_override`

**Email Content:**
- Subject: "Your rating points have been updated"
- Original vs new points
- Reason for override
- Admin who made the change
- Link to view rating details

### Email Configuration
Emails are sent using SMTP configuration defined in `config/email.php`:
- **HTML and Text versions**: All emails include both formats
- **Company branding**: Customizable colors and branding
- **Error handling**: Email failures don't block rating submission

---

## Business Logic and Rules

### Pass/Fail Determination
- **Pass Threshold**: Configurable via settings (default: 70%)
- **Auto Points**: 1 point for pass, 0 for fail
- **Override Capability**: Admins can manually adjust points
- **Technician Impact**: Points accumulate in technician profiles

### Link Lifecycle
1. **Created**: Valid for 48 hours
2. **Active**: Available for rating submission
3. **Used**: Single rating submitted, link deactivated
4. **Expired**: Past 48-hour window, no longer accessible

### Question Management
- **Dynamic Questions**: Admins can modify questions anytime
- **Active/Inactive**: Questions can be temporarily disabled
- **Historical Integrity**: Submitted ratings preserve original questions
- **Automatic Reordering**: System maintains sequential question order

### Data Integrity
- **Referential Integrity**: Foreign key constraints prevent orphaned data
- **Transaction Safety**: Rating submission uses database transactions
- **Audit Trail**: All changes tracked with timestamps and user IDs
- **Soft Deletes**: Questions used in ratings cannot be permanently deleted

---

## Performance Considerations

### Database Optimization
- **Indexed Columns**: 
  - `rating_links.token` (unique index)
  - `rating_links.expires_at` 
  - `ratings.submitted_at`
  - `rating_link_technicians.technician_id`
- **Query Efficiency**: Pagination prevents large data loads
- **Connection Pooling**: Efficient database connection management

### Caching Strategy
- **Question Caching**: Active questions cached for rating forms
- **Settings Caching**: Pass percentage and other settings
- **Token Validation**: Efficient link status checking

### Scalability
- **Stateless Design**: API supports horizontal scaling
- **Database Transactions**: Ensure data consistency under load
- **Email Queue**: Background processing for notifications

---

## Security Features

### Token Security
- **Cryptographic Randomness**: 32-character hex tokens
- **Single Use**: Links invalidated after rating submission
- **Time-Limited**: 48-hour expiry window
- **No Guessable Patterns**: Secure random generation

### Data Protection
- **Input Sanitization**: All user inputs cleaned and validated
- **SQL Injection Prevention**: Prepared statements throughout
- **XSS Protection**: Output encoding and sanitization
- **Authentication Required**: Admin/technician endpoints protected

### Access Control
- **Role-Based Access**: Admin vs technician permissions
- **Data Ownership**: Technicians only see own ratings
- **API Rate Limiting**: Protection against abuse
- **CORS Configuration**: Controlled cross-origin access

---

## Error Handling

### HTTP Status Codes
- **200**: Successful operations
- **201**: Successful creation (links, ratings)
- **400**: Client errors (validation, invalid data)
- **401**: Authentication required
- **403**: Access denied
- **404**: Resource not found
- **500**: Server errors

### Error Response Format
```json
{
  "success": false,
  "status_code": 400,
  "message": "Human-readable error description",
  "data": null,
  "timestamp": "2025-09-17 20:30:00"
}
```

### Common Error Scenarios

#### Rating Link Errors
- **Invalid Token**: Token doesn't exist
- **Expired Link**: Past 48-hour window
- **Already Used**: Rating already submitted
- **No Questions**: No active questions available

#### Submission Errors
- **Missing Answers**: Not all questions answered
- **Invalid Scores**: Scores outside 1-5 range
- **Invalid Questions**: Question IDs don't exist

#### Authentication Errors
- **Missing Token**: No X-Token header provided
- **Invalid Token**: Token doesn't match any user
- **Expired Token**: User session expired
- **Wrong Role**: Insufficient permissions

---

## Testing and Quality Assurance

### Test Scenarios

#### Happy Path Testing
1. Create rating link with valid data
2. Access rating form with valid token
3. Submit complete rating with valid scores
4. Verify notifications sent
5. Check data persistence

#### Error Path Testing
1. Submit rating with expired token
2. Submit rating with missing answers
3. Submit rating with invalid scores
4. Access non-existent rating link
5. Test authentication failures

#### Edge Case Testing
1. Submit rating exactly at expiry time
2. Concurrent access to same rating link
3. Very long comments and client names
4. Rating links with maximum technicians
5. Database connection failures during submission

### Performance Testing
- **Load Testing**: Multiple concurrent rating submissions
- **Stress Testing**: System behavior under extreme load
- **Email Performance**: Notification delivery under load
- **Database Performance**: Query optimization validation

---

## Monitoring and Analytics

### Key Metrics
- **Rating Completion Rate**: Links created vs ratings submitted
- **Average Response Time**: Rating submission performance
- **Email Delivery Rate**: Notification success percentage
- **Error Rate**: Failed operations tracking

### Logging
- **Access Logs**: All API requests logged
- **Error Logs**: Detailed error information
- **Performance Logs**: Slow query identification
- **Security Logs**: Authentication failures and suspicious activity

### Dashboard Analytics
- **Admin Dashboard**: 
  - Total ratings this month
  - Average rating percentage
  - Top performing technicians
  - Recent rating activity
  
- **Technician Dashboard**:
  - Personal rating history
  - Performance trends
  - Points accumulation
  - Ranking among peers

---

## Best Practices

### For Administrators
1. **Timely Link Creation**: Create links close to service completion
2. **Technician Selection**: Only include technicians who worked on the job
3. **Client Information**: Provide complete and accurate client details
4. **Override Justification**: Always provide clear reasons for point overrides
5. **Regular Monitoring**: Review ratings and follow up on issues

### For Clients
1. **Timely Submission**: Submit ratings before 48-hour expiry
2. **Honest Feedback**: Provide constructive and fair ratings
3. **Detailed Comments**: Include specific feedback for improvement
4. **Contact Information**: Ensure rating links reach the right person

### For Developers
1. **Input Validation**: Always validate and sanitize user inputs
2. **Error Handling**: Provide clear, actionable error messages
3. **Transaction Management**: Use database transactions for data integrity
4. **Performance Optimization**: Monitor and optimize slow queries
5. **Security Updates**: Keep dependencies and security measures current

---

## API Integration Examples

### Complete Rating Workflow (JavaScript)

```javascript
// Admin creates rating link
async function createRatingLink(adminToken, clientData, technicianIds) {
  const response = await fetch('/api/admin/rating-links', {
    method: 'POST',
    headers: {
      'X-Token': adminToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      client_name: clientData.name,
      client_email: clientData.email,
      client_code: clientData.code,
      client_contact: clientData.contact,
      technician_ids: technicianIds
    })
  });
  
  return response.json();
}

// Client accesses rating form
async function getRatingForm(token) {
  const response = await fetch(`/api/public/rating/${token}`);
  return response.json();
}

// Client submits rating
async function submitRating(token, answers, comments) {
  const response = await fetch(`/api/public/rating/${token}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      answers: answers,
      comments: comments
    })
  });
  
  return response.json();
}

// Admin views ratings
async function getRatings(adminToken, filters) {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/admin/ratings?${params}`, {
    headers: {
      'X-Token': adminToken
    }
  });
  
  return response.json();
}
```

### PHP Integration Example

```php
// Create rating link
function createRatingLink($adminToken, $clientData, $technicianIds) {
    $ch = curl_init();
    
    curl_setopt($ch, CURLOPT_URL, 'https://score.ctecg.co.za/api/admin/rating-links');
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'X-Token: ' . $adminToken,
        'Content-Type: application/json'
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'client_name' => $clientData['name'],
        'client_email' => $clientData['email'],
        'client_code' => $clientData['code'],
        'client_contact' => $clientData['contact'],
        'technician_ids' => $technicianIds
    ]));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    return json_decode($response, true);
}
```

---

## Troubleshooting Guide

### Common Issues

#### "Invalid, expired, or already used rating link"
**Causes:**
- Link has expired (>48 hours old)
- Rating already submitted
- Token doesn't exist
- System clock drift

**Solutions:**
1. Check link creation time vs current time
2. Verify rating hasn't been submitted
3. Generate new rating link if needed
4. Synchronize server time

#### "All questions must be answered"
**Causes:**
- Missing question answers in submission
- Question IDs changed since form load
- JavaScript form validation bypassed

**Solutions:**
1. Ensure all active questions are answered
2. Refresh form to get current questions
3. Validate answer completeness client-side

#### Email notifications not received
**Causes:**
- SMTP configuration issues
- Email addresses incorrect
- Spam filtering
- Email queue backlog

**Solutions:**
1. Verify SMTP settings in config/email.php
2. Check email address validity
3. Monitor email service logs
4. Test with known good email addresses

#### Slow rating submission
**Causes:**
- Database performance issues
- High email queue volume
- Network connectivity problems
- Inefficient database queries

**Solutions:**
1. Optimize database queries and indexes
2. Monitor database performance metrics
3. Implement email background processing
4. Scale database resources if needed

### System Health Checks

#### Daily Monitoring
1. **Rating Completion Rates**: Track submitted vs created links
2. **Error Rates**: Monitor API error responses
3. **Email Delivery**: Verify notification sending
4. **Database Performance**: Check slow query logs

#### Weekly Review
1. **Data Integrity**: Verify rating calculations
2. **Security Audit**: Review access logs
3. **Performance Trends**: Analyze response times
4. **User Feedback**: Review client and technician comments

---

## Conclusion

The Ctecg Score rating system provides a comprehensive, secure, and scalable solution for collecting and managing client feedback on technician services. The system emphasizes data integrity, user experience, and administrative control while maintaining high security and performance standards.

Key benefits include:
- **Secure, time-limited rating links** for controlled access
- **Comprehensive scoring and points system** for performance tracking
- **Automatic notifications** keeping all stakeholders informed
- **Flexible question management** allowing system evolution
- **Robust admin controls** for data oversight and correction
- **Detailed reporting and analytics** for business insights

For additional support or feature requests, contact the development team or refer to the API documentation for specific implementation details.