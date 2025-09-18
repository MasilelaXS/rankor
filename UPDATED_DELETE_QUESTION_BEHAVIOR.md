# Updated Delete Question Behavior

## Overview

The delete question functionality has been enhanced to protect data integrity by preventing the deletion of questions that are referenced in existing ratings. This ensures that historical rating data remains consistent and complete.

## Behavior Logic

### Decision Tree

```
DELETE /api/admin/questions/{id}
│
├── Question exists?
│   ├── NO → Return 404 "Question not found"
│   └── YES → Continue
│
├── Question used in ratings?
│   ├── NO → Safe to delete
│   │   └── DELETE question → Success response
│   │
│   └── YES → Has dependencies
│       ├── Question is ACTIVE?
│       │   ├── YES → DEACTIVATE + reorder → Success with explanation
│       │   └── NO → Already inactive → Error with explanation
│       │
│       └── Count dependencies for user information
```

## Three Scenarios

### Scenario 1: Safe Deletion (No Dependencies)
**Condition**: Question has never been used in any ratings  
**Action**: Question is permanently deleted (soft delete)  
**Result**: Standard success response

### Scenario 2: Protected Deletion (Has Dependencies - Active Question)
**Condition**: Question is used in ratings AND currently active  
**Action**: Question is deactivated instead of deleted + automatic reordering  
**Result**: Success response with explanation of action taken

### Scenario 3: Protected Deletion (Has Dependencies - Inactive Question)
**Condition**: Question is used in ratings AND already inactive  
**Action**: No changes made to question  
**Result**: Error response explaining why deletion is not possible

---

## API Examples

### Example 1: Safe Deletion (No Rating Dependencies)

**Request:**
```bash
DELETE https://score.ctecg.co.za/api/admin/questions/15
X-Token: 874932179f68fe67c37d135f893b81c13de1d592f7dc10eed2b3b61cbb40e72f
```

**Response:**
```json
{
    "success": true,
    "status_code": 200,
    "message": "Question deleted successfully",
    "data": {
        "action_taken": "deleted"
    },
    "timestamp": "2025-09-17 20:00:00"
}
```

**What happened:**
- Question 15 was not used in any ratings
- Question was permanently deleted from the system
- No data integrity issues

---

### Example 2: Protected Deletion - Active Question with Dependencies

**Request:**
```bash
DELETE https://score.ctecg.co.za/api/admin/questions/3
X-Token: 874932179f68fe67c37d135f893b81c13de1d592f7dc10eed2b3b61cbb40e72f
```

**Response:**
```json
{
    "success": true,
    "status_code": 200,
    "message": "Question cannot be deleted as it is used in 15 rating(s). Question has been deactivated instead.",
    "data": {
        "action_taken": "deactivated",
        "ratings_count": 15
    },
    "timestamp": "2025-09-17 20:00:00"
}
```

**What happened:**
- Question 3 is used in 15 existing ratings
- Question was deactivated (`active = 0`) instead of deleted
- Automatic reordering occurred for remaining active questions
- Historical rating data remains intact
- Question can still be viewed in inactive questions list

---

### Example 3: Protected Deletion - Inactive Question with Dependencies

**Request:**
```bash
DELETE https://score.ctecg.co.za/api/admin/questions/8
X-Token: 874932179f68fe67c37d135f893b81c13de1d592f7dc10eed2b3b61cbb40e72f
```

**Response:**
```json
{
    "success": false,
    "status_code": 400,
    "message": "Question cannot be deleted as it is used in 23 rating(s). Question is already inactive.",
    "data": null,
    "timestamp": "2025-09-17 20:00:00"
}
```

**What happened:**
- Question 8 is used in 23 existing ratings
- Question is already inactive (`active = 0`)
- No action taken (cannot delete or further deactivate)
- Clear explanation provided to user
- Historical rating data remains protected

---

### Example 4: Question Not Found

**Request:**
```bash
DELETE https://score.ctecg.co.za/api/admin/questions/999
X-Token: 874932179f68fe67c37d135f893b81c13de1d592f7dc10eed2b3b61cbb40e72f
```

**Response:**
```json
{
    "success": false,
    "status_code": 404,
    "message": "Question not found",
    "data": null,
    "timestamp": "2025-09-17 20:00:00"
}
```

---

## Response Fields Explanation

### Success Responses

#### `action_taken` Field
- **"deleted"**: Question was permanently removed (no dependencies)
- **"deactivated"**: Question was deactivated due to rating dependencies

#### `ratings_count` Field
- Shows how many ratings reference this question
- Only present when action_taken is "deactivated"
- Helps admins understand the scope of the dependency

### Error Responses

#### Status Codes
- **400**: Question has dependencies and cannot be deleted
- **404**: Question does not exist
- **500**: Server error during processing

---

## Data Integrity Protection

### What's Protected
- **Rating History**: All historical ratings remain complete
- **Statistical Reports**: Rating analytics remain accurate
- **Audit Trail**: Complete record of what questions were asked

### Database Relationships
The system checks the `rating_answers` table for references:
```sql
SELECT COUNT(*) as usage_count 
FROM rating_answers 
WHERE question_id = ?
```

### Automatic Actions
When a question with dependencies is "deleted":
1. Question is deactivated (`active = 0`)
2. Question is moved to end of order list
3. Remaining active questions are reordered sequentially
4. User receives clear explanation of what happened

---

## Administrative Workflow

### Before This Update
❌ Questions could be deleted even if used in ratings  
❌ This would break rating history and reports  
❌ No warning about data dependencies  
❌ Potential data integrity issues

### After This Update
✅ Questions with dependencies are protected from deletion  
✅ Automatic fallback to deactivation when needed  
✅ Clear communication about why action was taken  
✅ Complete data integrity maintained  
✅ Historical ratings remain intact

---

## Best Practices

### For Administrators

1. **Review Dependencies**: Check how many ratings use a question before attempting deletion
2. **Use Deactivation**: For questions you no longer want to use, consider manual deactivation instead of deletion
3. **Clean Up Safely**: Only delete questions that were created by mistake and never used
4. **Monitor Responses**: Pay attention to the `action_taken` field in responses

### For Developers

1. **Check Response Data**: Always check the `action_taken` field to understand what actually happened
2. **Handle Different Outcomes**: Prepare UI to handle both deletion and deactivation scenarios
3. **Display Explanations**: Show users the explanation message, especially for protected deletions
4. **Update UI State**: Refresh question lists after deletion attempts

---

## Testing Scenarios

### Test Case 1: New Question Deletion
```bash
# Create a new question
POST /api/admin/questions
{"text": "Test question for deletion"}

# Delete it immediately (should succeed)
DELETE /api/admin/questions/{new_id}
# Expected: Successfully deleted
```

### Test Case 2: Question with Ratings
```bash
# Try to delete a question that has been used in ratings
DELETE /api/admin/questions/1
# Expected: Deactivated instead, with count of ratings
```

### Test Case 3: Already Inactive Question
```bash
# First deactivate a question with ratings
PUT /api/admin/questions/2
{"active": 0}

# Then try to delete it
DELETE /api/admin/questions/2
# Expected: Error explaining it cannot be deleted
```

---

## Error Handling

### Server Errors
If any unexpected error occurs during the deletion process:
```json
{
    "success": false,
    "status_code": 500,
    "message": "Failed to process question deletion",
    "data": null,
    "timestamp": "2025-09-17 20:00:00"
}
```

### Authentication Errors
If admin authentication is missing:
```json
{
    "success": false,
    "status_code": 401,
    "message": "Authentication required",
    "data": null,
    "timestamp": "2025-09-17 20:00:00"
}
```

---

## Summary

The updated delete question behavior provides:

- **Data Protection**: Prevents accidental loss of rating history
- **Smart Fallbacks**: Automatically deactivates when deletion isn't safe
- **Clear Communication**: Tells users exactly what happened and why
- **Flexible Management**: Allows cleanup of truly unused questions
- **Audit Trail**: Maintains complete historical records

This ensures that your rating system maintains data integrity while still providing the flexibility to manage questions effectively.