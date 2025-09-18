# Ctecg Score API - Usage Examples

## Questions Management API Examples

### Authentication
All admin endpoints require the `X-Token` header:
```bash
X-Token: 874932179f68fe67c37d135f893b81c13de1d592f7dc10eed2b3b61cbb40e72f
```

---

## Question Endpoints

### 1. Get All Active Questions
```bash
GET https://score.ctecg.co.za/api/admin/questions
X-Token: your_token_here
```

**Response:**
```json
{
    "success": true,
    "status_code": 200,
    "message": "Questions retrieved successfully",
    "data": [
        {
            "id": 1,
            "text": "How satisfied are you with the service?",
            "order_position": 1,
            "active": 1,
            "created_at": "2025-09-17 10:00:00",
            "updated_at": "2025-09-17 10:00:00"
        },
        {
            "id": 2,
            "text": "Was the technician professional?",
            "order_position": 2,
            "active": 1,
            "created_at": "2025-09-17 10:00:00",
            "updated_at": "2025-09-17 10:00:00"
        }
    ],
    "timestamp": "2025-09-17 19:40:59"
}
```

### 2. Get All Inactive Questions
```bash
GET https://score.ctecg.co.za/api/admin/questions/inactive
X-Token: your_token_here
```

**Response:**
```json
{
    "success": true,
    "status_code": 200,
    "message": "Inactive questions retrieved successfully",
    "data": [
        {
            "id": 12,
            "text": "Old question that was deactivated",
            "order_position": 10,
            "active": 0,
            "created_at": "2025-09-15 10:00:00",
            "updated_at": "2025-09-17 19:11:17"
        }
    ],
    "timestamp": "2025-09-17 19:41:23"
}
```

---

## Question Update Examples

### 3. Deactivate a Question (Original Issue - Now Fixed!)
```bash
PUT https://score.ctecg.co.za/api/admin/questions/12
X-Token: your_token_here
Content-Type: application/json

{
    "active": 0
}
```

**Response:**
```json
{
    "success": true,
    "status_code": 200,
    "message": "Question updated successfully",
    "data": null,
    "timestamp": "2025-09-17 19:11:17"
}
```

**What happens:** 
- Question 12 is deactivated (`active = 0`)
- Automatically moved to end of order list
- All remaining active questions are reordered sequentially (1,2,3,4,5...)

### 4. Reactivate a Question
```bash
PUT https://score.ctecg.co.za/api/admin/questions/12
X-Token: your_token_here
Content-Type: application/json

{
    "active": 1,
    "order_position": 3
}
```

**Response:**
```json
{
    "success": true,
    "status_code": 200,
    "message": "Question updated successfully",
    "data": null,
    "timestamp": "2025-09-17 19:45:00"
}
```

### 5. Update Only Question Text
```bash
PUT https://score.ctecg.co.za/api/admin/questions/5
X-Token: your_token_here
Content-Type: application/json

{
    "text": "How would you rate the overall service quality?"
}
```

### 6. Update Only Order Position
```bash
PUT https://score.ctecg.co.za/api/admin/questions/5
X-Token: your_token_here
Content-Type: application/json

{
    "order_position": 2
}
```

### 7. Update Multiple Fields
```bash
PUT https://score.ctecg.co.za/api/admin/questions/5
X-Token: your_token_here
Content-Type: application/json

{
    "text": "How satisfied are you with our technician's expertise?",
    "order_position": 1,
    "active": 1
}
```

---

## Create New Question

### 8. Create New Question
```bash
POST https://score.ctecg.co.za/api/admin/questions
X-Token: your_token_here
Content-Type: application/json

{
    "text": "Would you recommend our services to others?",
    "order_position": 6
}
```

**Response:**
```json
{
    "success": true,
    "status_code": 201,
    "message": "Question created successfully",
    "data": {
        "id": 13,
        "text": "Would you recommend our services to others?",
        "order_position": 6,
        "active": 1,
        "created_at": "2025-09-17 19:50:00",
        "updated_at": "2025-09-17 19:50:00"
    },
    "timestamp": "2025-09-17 19:50:00"
}
```

### 9. Create Question with Auto Order
```bash
POST https://score.ctecg.co.za/api/admin/questions
X-Token: your_token_here
Content-Type: application/json

{
    "text": "Rate the timeliness of service delivery"
}
```
*Note: If order_position is not provided, it will automatically be set to the next available position*

---

## Delete Question

### 10. Delete (Soft Delete) Question
```bash
DELETE https://score.ctecg.co.za/api/admin/questions/8
X-Token: your_token_here
```

**Response:**
```json
{
    "success": true,
    "status_code": 200,
    "message": "Question deleted successfully",
    "data": null,
    "timestamp": "2025-09-17 19:55:00"
}
```

*Note: This performs a soft delete by setting `active = 0`*

---

## Error Examples

### 11. Missing Required Field
```bash
PUT https://score.ctecg.co.za/api/admin/questions/12
X-Token: your_token_here
Content-Type: application/json

{}
```

**Response:**
```json
{
    "success": false,
    "status_code": 400,
    "message": "At least one field must be provided for update",
    "data": null,
    "timestamp": "2025-09-17 19:11:17"
}
```

### 12. Unauthorized Access
```bash
PUT https://score.ctecg.co.za/api/admin/questions/12
Content-Type: application/json

{
    "active": 0
}
```

**Response:**
```json
{
    "success": false,
    "status_code": 401,
    "message": "Authentication required",
    "data": null,
    "timestamp": "2025-09-17 19:11:17"
}
```

### 13. Question Not Found
```bash
PUT https://score.ctecg.co.za/api/admin/questions/999
X-Token: your_token_here
Content-Type: application/json

{
    "active": 0
}
```

**Response:**
```json
{
    "success": false,
    "status_code": 404,
    "message": "Question not found",
    "data": null,
    "timestamp": "2025-09-17 19:11:17"
}
```

---

## Key Features

### ✅ Flexible Updates
- All fields (`text`, `order_position`, `active`) are optional
- You can update any combination of fields
- No need to send unchanged fields

### ✅ Automatic Reordering
- When deactivating questions, remaining active questions are automatically reordered
- Example: Questions 1,2,3,4,5 → Deactivate 3 → Result: 1,2,3,4 (sequential)

### ✅ Separate Management
- Active questions: `/api/admin/questions`
- Inactive questions: `/api/admin/questions/inactive`
- Easy to reactivate inactive questions

### ✅ Order Management
- Questions maintain proper sequential order
- No gaps in order positions for active questions
- Inactive questions moved to end of order list

---

## Testing with curl

### Example curl commands:

```bash
# Get active questions
curl -X GET "https://score.ctecg.co.za/api/admin/questions" \
  -H "X-Token: your_token_here"

# Get inactive questions
curl -X GET "https://score.ctecg.co.za/api/admin/questions/inactive" \
  -H "X-Token: your_token_here"

# Deactivate question
curl -X PUT "https://score.ctecg.co.za/api/admin/questions/12" \
  -H "X-Token: your_token_here" \
  -H "Content-Type: application/json" \
  -d '{"active": 0}'

# Update question text
curl -X PUT "https://score.ctecg.co.za/api/admin/questions/5" \
  -H "X-Token: your_token_here" \
  -H "Content-Type: application/json" \
  -d '{"text": "Updated question text"}'
```

---

## Notes

- All timestamps are in South Africa timezone (Africa/Johannesburg)
- Questions are returned ordered by `order_position ASC`
- Soft delete is used (questions are never permanently deleted)
- Order positions are automatically managed to maintain sequential numbering