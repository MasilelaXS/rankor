# Technician Mobile API Documentation

## Overview

The Technician API provides a complete mobile app experience with focused endpoints designed for bottom tab navigation. Each endpoint serves a specific purpose in the technician mobile application workflow.

---

## 📱 Mobile App Structure

### Bottom Navigation Tabs

1. **🏠 Dashboard** - `/api/technician/dashboard`
2. **⭐ Ratings** - `/api/technician/ratings`
3. **💰 Points** - `/api/technician/points`
4. **🏆 Leaderboard** - `/api/technician/leaderboard`
5. **👤 Profile** - `/api/technician/profile`

---

## 🔐 Authentication

All endpoints require technician authentication via X-Token header:

```bash
-H "X-Token: your_technician_token"
```

Get token via login:
```bash
curl -X POST "https://score.ctecg.co.za/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "technician@company.com",
    "password": "password123",
    "user_type": "technician"
  }'
```

---

## 🏠 Dashboard Tab

**Endpoint:** `GET /api/technician/dashboard`  
**Purpose:** Quick overview and key metrics for the home screen

### Response Structure:
```json
{
  "success": true,
  "data": {
    "technician": {
      "id": 1,
      "name": "Steven Tech",
      "email": "steven@dannel.co.za",
      "employee_id": "TECH001"
    },
    "summary": {
      "total_points": 2,
      "total_ratings": 4,
      "average_percentage": 88.64,
      "current_rank": 1,
      "total_technicians": 4
    },
    "this_month": {
      "ratings_count": 4,
      "good_ratings": 4,
      "bad_ratings": 0,
      "performance_percentage": 100,
      "points_earned": 1
    },
    "activity": {
      "recent_ratings_7_days": 4
    }
  }
}
```

### Mobile UI Elements:
- **Header**: Welcome message with technician name
- **Summary Cards**: Total points, rank, average percentage
- **This Month**: Monthly performance overview
- **Quick Stats**: Recent activity indicator

---

## ⭐ Ratings Tab

**Endpoint:** `GET /api/technician/ratings`  
**Purpose:** Complete ratings history with pagination and filtering

### Query Parameters:
- `page` (default: 1): Page number
- `limit` (default: 20, max: 50): Items per page  
- `start_date`: Filter from date (YYYY-MM-DD)
- `end_date`: Filter to date (YYYY-MM-DD)

### Example Request:
```bash
curl "https://score.ctecg.co.za/api/technician/ratings?page=1&limit=10" \
  -H "X-Token: your_token"
```

### Response Structure:
```json
{
  "success": true,
  "data": {
    "ratings": [
      {
        "id": 4,
        "total_score": 49,
        "max_score": 55,
        "percentage": "89.09",
        "points_awarded_auto": 1,
        "points_awarded_final": null,
        "final_points": 1,
        "was_overridden": 0,
        "comments": "Good service",
        "submitted_at": "2025-09-18 10:49:42",
        "client_name": "Email Test Client",
        "client_email": "test-email@example.com"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 4,
      "pages": 1
    },
    "filters_applied": {
      "start_date": null,
      "end_date": null
    }
  }
}
```

### Mobile UI Elements:
- **List View**: Cards showing each rating with score, percentage, client
- **Filters**: Date range picker
- **Pagination**: Infinite scroll or pagination controls
- **Override Indicators**: Visual indicator when admin adjusted points

---

## 💰 Points Tab

**Endpoint:** `GET /api/technician/points`  
**Purpose:** Points tracking with adjustment history and timeline graphs

### Response Structure:
```json
{
  "success": true,
  "data": {
    "current_points": 2,
    "adjustments_history": [
      {
        "id": 10,
        "points_change": -2,
        "reason": "Late submission of JC",
        "created_at": "2025-09-18 21:01:41",
        "adjustment_type": "manual_adjustment",
        "previous_total": 4,
        "new_total": 2,
        "admin_name": "Steven Admin",
        "adjustment_category": "penalty"
      }
    ],
    "monthly_timeline": [
      {
        "year": 2025,
        "month": 9,
        "total_ratings": 4,
        "good_ratings": 4,
        "bad_ratings": 0,
        "net_points": 1,
        "points_at_month_end": 2
      }
    ],
    "current_month_adjustments": {
      "total_adjustments": 5,
      "bonus_points": "3",
      "penalty_points": "-5",
      "net_adjustment": "-2"
    },
    "statistics": {
      "total_adjustments": 5,
      "positive_adjustments": 2,
      "negative_adjustments": 3
    }
  }
}
```

### Mobile UI Elements:
- **Current Points**: Large display of total points
- **Chart**: Monthly timeline showing points progression
- **Adjustments List**: History of all point changes with reasons
- **Monthly Summary**: Current month adjustment statistics
- **Categories**: Visual distinction between bonuses/penalties

---

## 🏆 Leaderboard Tab

**Endpoint:** `GET /api/technician/leaderboard`  
**Purpose:** Rankings and competitive comparison with other technicians

### Response Structure:
```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "id": 4,
        "name": "Mr. XS Masilela",
        "total_points": 2,
        "month_ratings": 1,
        "month_good_ratings": 1,
        "month_points": 2,
        "month_percentage": "100.00",
        "is_current_user": 0
      },
      {
        "id": 1,
        "name": "Steven Tech",
        "total_points": 2,
        "month_ratings": 4,
        "month_good_ratings": 4,
        "month_points": 1,
        "month_percentage": "100.00",
        "is_current_user": 1
      }
    ],
    "current_user_position": {
      "rank": 3,
      "total_points": 2,
      "points_to_first": 1,
      "total_technicians": 4
    },
    "top_performer": {
      "id": 4,
      "name": "Mr. XS Masilela",
      "total_points": 2
    },
    "month_context": {
      "year": "2025",
      "month": "9",
      "month_name": "September 2025"
    }
  }
}
```

### Mobile UI Elements:
- **Your Position**: Highlighted card showing current rank
- **Points to #1**: Clear indication of points needed to reach top
- **Leaderboard List**: Top 10 technicians with avatars and stats
- **Monthly Context**: Current month being displayed
- **Progress Indicator**: Visual progress toward next rank

### Key Features:
- **Current User Highlighting**: Your position is clearly marked
- **Points to First**: Shows exactly how many points needed to be #1
- **Monthly Performance**: Shows both total points and this month's activity

---

## 👤 Profile Tab

**Endpoint:** `GET /api/technician/profile`  
**Purpose:** Personal performance status and achievement badges

### Response Structure:
```json
{
  "success": true,
  "data": {
    "technician": {
      "id": 1,
      "name": "Steven Tech",
      "email": "steven@dannel.co.za",
      "employee_id": "TECH001",
      "status": "active",
      "created_at": "2025-09-17 00:01:01"
    },
    "performance_status": {
      "status": "excellent",
      "message": "Excellent technician - consistently high performance",
      "color": "#28a745",
      "trend": "stable"
    },
    "statistics": {
      "total_points": 2,
      "total_ratings": 4,
      "average_percentage": 88.64,
      "good_ratings_count": 0,
      "poor_ratings_count": 0
    },
    "recent_performance": [
      {
        "year": 2025,
        "month": 9,
        "total_ratings": 4,
        "good_ratings": 4,
        "bad_ratings": 0,
        "month_percentage": "100.00"
      }
    ],
    "badges": {
      "has_excellent_rating": false,
      "consistent_performer": false,
      "active_technician": false,
      "top_performer": true
    }
  }
}
```

### Performance Status Classifications:
- **🌟 Excellent** (85%+): Green badge, consistently high performance
- **👍 Good** (75-84%): Blue badge, above average performance  
- **⚖️ Average** (65-74%): Yellow badge, meets basic expectations
- **⚠️ Needs Improvement** (<65%): Red badge, below expectations
- **🆕 Neutral** (<3 ratings): Gray badge, building performance history

### Available Badges:
- **🎯 Top Performer**: 85%+ average with 3+ ratings
- **⭐ Excellent Rating**: 90%+ average
- **🔄 Consistent Performer**: 75%+ over 2+ months
- **💪 Active Technician**: 5+ total ratings

### Mobile UI Elements:
- **Status Badge**: Large colored badge with performance classification
- **Statistics Cards**: Key performance numbers
- **Badges Section**: Achievement badges with descriptions
- **Trend Indicator**: Shows if performance is improving/declining
- **Recent Performance**: Chart of last 3 months

---

## 📊 Graph Data for Mobile Charts

### Dashboard Chart Data:
Use `this_month` data for simple monthly overview charts.

### Points Timeline Chart:
Use `monthly_timeline` array from `/api/technician/points`:
```javascript
// Example Chart.js configuration
const chartData = {
  labels: monthlyTimeline.map(m => `${m.year}-${m.month}`),
  datasets: [{
    label: 'Points',
    data: monthlyTimeline.map(m => m.points_at_month_end),
    borderColor: '#007bff',
    backgroundColor: 'rgba(0,123,255,0.1)'
  }]
};
```

### Performance Chart:
Use `recent_performance` from `/api/technician/profile`:
```javascript
const performanceChart = {
  labels: recentPerformance.map(m => `${m.year}-${m.month}`),
  datasets: [{
    label: 'Performance %',
    data: recentPerformance.map(m => m.month_percentage),
    borderColor: '#28a745',
    backgroundColor: 'rgba(40,167,69,0.1)'
  }]
};
```

---

## 🚀 Implementation Tips

### Mobile App Best Practices:

1. **Caching Strategy**: Cache dashboard data for offline viewing
2. **Pull-to-Refresh**: Implement on all list views
3. **Pagination**: Use infinite scroll for ratings history
4. **Real-time Updates**: Consider WebSocket for live leaderboard updates
5. **Offline Support**: Cache critical data for offline viewing

### Error Handling:
```javascript
// Example error handling
try {
  const response = await fetch('/api/technician/dashboard', {
    headers: { 'X-Token': token }
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      // Redirect to login
      handleLogout();
    } else {
      // Show error message
      showError('Failed to load dashboard');
    }
  }
  
  const data = await response.json();
  updateDashboard(data);
} catch (error) {
  showError('Network error - check connection');
}
```

### Performance Optimization:
- Use pagination for large datasets
- Implement proper loading states
- Cache static data (technician info)
- Optimize image loading for profile pictures

---

## 🎨 UI/UX Recommendations

### Bottom Tab Design:
```css
/* Example tab styling */
.bottom-tabs {
  position: fixed;
  bottom: 0;
  width: 100%;
  background: white;
  border-top: 1px solid #e9ecef;
  padding: 8px 0;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 8px;
}

.tab-active {
  color: #007bff;
  border-top: 2px solid #007bff;
}
```

### Status Colors:
- **Excellent**: `#28a745` (Green)
- **Good**: `#17a2b8` (Blue)  
- **Average**: `#ffc107` (Yellow)
- **Needs Improvement**: `#dc3545` (Red)
- **Neutral**: `#6c757d` (Gray)

### Chart Colors:
- **Points**: `#007bff` (Primary Blue)
- **Performance**: `#28a745` (Success Green)
- **Bonuses**: `#28a745` (Green)
- **Penalties**: `#dc3545` (Red)

---

This mobile-optimized API structure provides everything needed for a complete technician mobile application with intuitive navigation and comprehensive data visualization! 🎉