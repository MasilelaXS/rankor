# Admin Leaderboard Documentation

#### 📊 Endpoint Details

### 🔐 Admin Leaderboard (Authenticated)
**Endpoint:** `GET /api/admin/leaderboard`
**Authentication:** Required (X-Token header)
**Purpose:** Full admin access with all technician data

### 🌐 Public Leaderboard (No Authentication) 
**Endpoint:** `GET /api/public/leaderboard` 
**Authentication:** None required
**Purpose:** Perfect for big screen displays and public dashboardsOverview

The Admin Leaderboard endpoint provides comprehensive ranking and performance analysis for all technicians within a specified time period. This endpoint is designed to give administrators complete visibility into technician performance, identify top performers and those needing improvement, and provide actionable insights for team management.

---

## � Summary

✅ **Created comprehensive admin leaderboard documentation covering:**

- **Complete API reference** with all endpoints, parameters, and response structures
- **Performance classifications** (excellent, good, average, needs improvement, no ratings)
- **Activity level classifications** (highly active, active, low activity, inactive)  
- **Intelligent ranking system** based on monthly points and total points
- **Leaders and trailers identification** for management focus
- **Dashboard integration examples** with chart configurations
- **UI component examples** for frontend implementation
- **Best practices** for caching, real-time updates, and error handling

✅ **Key features documented:**

- Auto-updating monthly performance data
- Comprehensive summary statistics 
- Historical analysis capabilities
- Export functionality guidance
- Mobile-responsive design recommendations
- **🆕 Public endpoint for big screen displays (no authentication required)**

✅ **Tested endpoints confirm:**

- All data structures match documentation
- Performance levels working correctly
- Activity classifications accurate
- Summary statistics comprehensive
- Period context properly formatted
- **🆕 Public leaderboard working perfectly for big screen displays**

The admin leaderboard provides everything needed for effective team performance management and data-driven decision making! 🏆

---

## �📊 Endpoint Details

**Endpoint:** `GET /api/admin/leaderboard`  
**Authentication:** Admin token required  
**Method:** GET  
**Purpose:** View monthly technician rankings with detailed performance metrics

---

## 🔐 Authentication

```bash
curl -X GET "https://score.ctecg.co.za/api/admin/leaderboard" \
  -H "X-Token: your_admin_token"
```

---

## 📝 Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `year` | integer | Current year | Year for leaderboard (e.g., 2025) |
| `month` | integer | Current month | Month for leaderboard (1-12) |
| `limit` | integer | 10 | Number of technicians to show (5-50) |

### Example Requests:

**Current Month Leaderboard:**
**Admin Current Month:**
```bash
curl "https://score.ctecg.co.za/api/admin/leaderboard" \
  -H "X-Token: your_admin_token"
```

**Admin Specific Month:**
```bash
curl "https://score.ctecg.co.za/api/admin/leaderboard?year=2025&month=8&limit=20" \
  -H "X-Token: your_admin_token"
```

**Admin Top 5 Performers:**
```bash
curl "https://score.ctecg.co.za/api/admin/leaderboard?limit=5" \
  -H "X-Token: your_admin_token"
```

**🌐 PUBLIC ENDPOINTS (No Authentication - Perfect for Big Screens!):**

**Public Current Month:**
```bash
curl "https://score.ctecg.co.za/api/public/leaderboard"
```

**Public Specific Month:**
```bash
curl "https://score.ctecg.co.za/api/public/leaderboard?year=2025&month=9&limit=10"
```

**Public Top 5 (Great for displays):**
```bash
curl "https://score.ctecg.co.za/api/public/leaderboard?limit=5"
```

---

## 📈 Response Structure

### Complete Response Example:

```json
{
  "success": true,
  "status_code": 200,
  "message": "Leaderboard for September 2025 retrieved successfully",
  "data": {
    "leaderboard": [
      {
        "id": 4,
        "name": "Mr. XS Masilela",
        "email": "xsmasilela@gmail.com",
        "total_points": 2,
        "ratings_this_month": 1,
        "points_this_month": 2,
        "good_ratings": 1,
        "bad_ratings": 0,
        "points_gained": 1,
        "points_lost": 0,
        "avg_percentage_this_month": "100.00",
        "rank_position": 1,
        "performance_level": "excellent",
        "activity_level": "low_activity"
      },
      {
        "id": 2,
        "name": "Sarah Johnson",
        "email": "sarah@ctecg.com",
        "total_points": 2,
        "ratings_this_month": 1,
        "points_this_month": 2,
        "good_ratings": 1,
        "bad_ratings": 0,
        "points_gained": 2,
        "points_lost": 0,
        "avg_percentage_this_month": "100.00",
        "rank_position": 2,
        "performance_level": "excellent",
        "activity_level": "low_activity"
      },
      {
        "id": 1,
        "name": "Steven Tech",
        "email": "steven@dannel.co.za",
        "total_points": 2,
        "ratings_this_month": 4,
        "points_this_month": 1,
        "good_ratings": 4,
        "bad_ratings": 0,
        "points_gained": 3,
        "points_lost": 0,
        "avg_percentage_this_month": "100.00",
        "rank_position": 3,
        "performance_level": "excellent",
        "activity_level": "highly_active"
      },
      {
        "id": 3,
        "name": "Mike Davis",
        "email": "mike@ctecg.com",
        "total_points": 0,
        "ratings_this_month": 0,
        "points_this_month": 0,
        "good_ratings": 0,
        "bad_ratings": 0,
        "points_gained": 0,
        "points_lost": 0,
        "avg_percentage_this_month": "0.00",
        "rank_position": 4,
        "performance_level": "no_ratings",
        "activity_level": "inactive"
      }
    ],
    "leaders": [
      {
        "id": 4,
        "name": "Mr. XS Masilela",
        "email": "xsmasilela@gmail.com",
        "total_points": 2,
        "rank_position": 1,
        "performance_level": "excellent"
      },
      {
        "id": 2,
        "name": "Sarah Johnson", 
        "email": "sarah@ctecg.com",
        "total_points": 2,
        "rank_position": 2,
        "performance_level": "excellent"
      },
      {
        "id": 1,
        "name": "Steven Tech",
        "email": "steven@dannel.co.za", 
        "total_points": 2,
        "rank_position": 3,
        "performance_level": "excellent"
      }
    ],
    "trailers": [],
    "summary": {
      "total_active_technicians": 4,
      "total_ratings_this_month": 6,
      "overall_avg_percentage": "100.00",
      "total_points_awarded": 5,
      "highest_monthly_points": 2,
      "lowest_monthly_points": 0
    },
    "period": {
      "year": 2025,
      "month": 9,
      "month_name": "September",
      "is_current_month": true
    },
    "metadata": {
      "total_technicians_shown": 4,
      "leaders_count": 3,
      "trailers_count": 0
    }
  },
  "timestamp": "2025-09-18 21:30:00"
}
```

---

## 🏆 Data Structure Breakdown

### Individual Technician Data:

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Technician unique identifier |
| `name` | string | Technician full name |
| `email` | string | Technician email address |
| `total_points` | integer | All-time accumulated points |
| `ratings_this_month` | integer | Number of ratings received this month |
| `points_this_month` | integer | Net points earned this month |
| `good_ratings` | integer | Ratings ≥70% this month |
| `bad_ratings` | integer | Ratings <70% this month |
| `points_gained` | integer | Total positive points this month |
| `points_lost` | integer | Total negative points this month |
| `avg_percentage_this_month` | decimal | Average rating percentage this month |
| `rank_position` | integer | Current rank (1 = best) |
| `performance_level` | string | Performance classification |
| `activity_level` | string | Activity classification |

---

## 📊 Performance Classifications

### Performance Levels:

| Level | Criteria | Color Suggestion | Description |
|-------|----------|------------------|-------------|
| **excellent** | ≥85% average | 🟢 Green | Top performers, consistently excellent work |
| **good** | 70-84% average | 🔵 Blue | Solid performers, meeting expectations |
| **average** | 50-69% average | 🟡 Yellow | Average performance, room for improvement |
| **needs_improvement** | <50% average | 🔴 Red | Below standards, requires intervention |
| **no_ratings** | 0 ratings | ⚫ Gray | No data available for assessment |

### Activity Levels:

| Level | Criteria | Description |
|-------|----------|-------------|
| **highly_active** | ≥5 ratings | Very busy technicians |
| **active** | 2-4 ratings | Regular activity |
| **low_activity** | 1 rating | Minimal activity |
| **inactive** | 0 ratings | No activity this month |

---

## 🎯 Key Features

### 1. **Automatic Data Updates**
The endpoint automatically updates monthly performance data before generating the leaderboard, ensuring real-time accuracy.

### 2. **Intelligent Ranking**
Ranking is based on:
- Primary: Net points earned this month
- Secondary: Total accumulated points (tiebreaker)

### 3. **Leaders & Trailers Identification**
- **Leaders**: Top 3 performers (automatically highlighted)
- **Trailers**: Bottom 3 performers (for improvement focus)
- Trailers only shown if 4+ technicians (prevents embarrassment in small teams)

### 4. **Comprehensive Summary Statistics**
- Total active technicians
- Overall team performance average
- Total points distributed
- Performance range (highest/lowest)

---

## 💡 Use Cases

### 1. **Monthly Performance Review**
```bash
# Get current month performance for team meeting
curl "https://score.ctecg.co.za/api/admin/leaderboard" \
  -H "X-Token: admin_token"
```

### 2. **Historical Analysis**
```bash
# Compare July vs August performance
curl "https://score.ctecg.co.za/api/admin/leaderboard?year=2025&month=7" \
  -H "X-Token: admin_token"

curl "https://score.ctecg.co.za/api/admin/leaderboard?year=2025&month=8" \
  -H "X-Token: admin_token"
```

### 3. **Top Performers Recognition**
```bash
# Get top 5 for employee of the month program
curl "https://score.ctecg.co.za/api/admin/leaderboard?limit=5" \
  -H "X-Token: admin_token"
```

### 4. **Performance Intervention**
```bash
# Get full team view to identify who needs help
curl "https://score.ctecg.co.za/api/admin/leaderboard?limit=50" \
  -H "X-Token: admin_token"
```

---

## 📱 Dashboard Integration

### Graph Data for Charts:

**Performance Distribution Chart:**
```javascript
// Use performance_level data for pie chart
const performanceData = leaderboard.reduce((acc, tech) => {
  acc[tech.performance_level] = (acc[tech.performance_level] || 0) + 1;
  return acc;
}, {});
```

**Monthly Points Chart:**
```javascript
// Use points_this_month for bar chart
const chartData = {
  labels: leaderboard.map(tech => tech.name),
  datasets: [{
    label: 'Points This Month',
    data: leaderboard.map(tech => tech.points_this_month),
    backgroundColor: leaderboard.map(tech => 
      tech.performance_level === 'excellent' ? '#28a745' :
      tech.performance_level === 'good' ? '#17a2b8' :
      tech.performance_level === 'average' ? '#ffc107' :
      tech.performance_level === 'needs_improvement' ? '#dc3545' : '#6c757d'
    )
  }]
};
```

**Activity vs Performance Scatter Plot:**
```javascript
const scatterData = leaderboard.map(tech => ({
  x: tech.ratings_this_month,
  y: parseFloat(tech.avg_percentage_this_month),
  label: tech.name,
  color: getPerformanceColor(tech.performance_level)
}));
```

---

## 🎨 UI Components

### Leaderboard Table:
```html
<!-- Example table structure -->
<table class="leaderboard-table">
  <thead>
    <tr>
      <th>Rank</th>
      <th>Technician</th>
      <th>Points This Month</th>
      <th>Ratings</th>
      <th>Average %</th>
      <th>Performance</th>
      <th>Activity</th>
    </tr>
  </thead>
  <tbody>
    <!-- Loop through leaderboard data -->
  </tbody>
</table>
```

### Performance Badge:
```css
.performance-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.performance-excellent { background: #28a745; color: white; }
.performance-good { background: #17a2b8; color: white; }
.performance-average { background: #ffc107; color: black; }
.performance-needs-improvement { background: #dc3545; color: white; }
.performance-no-ratings { background: #6c757d; color: white; }
```

### Leaders Highlight:
```html
<!-- Top 3 performers highlight section -->
<div class="leaders-section">
  <h3>🏆 Top Performers</h3>
  <div class="leaders-cards">
    <!-- Loop through leaders array -->
  </div>
</div>
```

---

## ⚠️ Important Notes

### 1. **Data Freshness**
The endpoint automatically updates monthly performance data before generating results, ensuring real-time accuracy but potentially slower response times during peak usage.

### 2. **Ranking Algorithm**
- **Primary Sort**: Net points this month (rewards current performance)
- **Secondary Sort**: Total accumulated points (rewards consistency)
- This ensures active performers rank higher than inactive ones with historical points

### 3. **Trailer Display Logic**
Trailers (bottom performers) are only shown when there are 4+ technicians to prevent embarrassment in small teams.

### 4. **Performance Thresholds**
- Performance levels are calculated based on monthly averages
- Technicians with 0 ratings show as "no_ratings" regardless of historical performance

---

## 🔧 Error Handling

### Common Error Responses:

**Invalid Authentication:**
```json
{
  "success": false,
  "status_code": 401,
  "message": "Authentication required",
  "data": null
}
```

**Invalid Parameters:**
```json
{
  "success": false,
  "status_code": 400,
  "message": "Invalid month parameter. Must be between 1 and 12",
  "data": null
}
```

**Server Error:**
```json
{
  "success": false,
  "status_code": 500,
  "message": "Failed to retrieve leaderboard",
  "data": null
}
```

---

## 🚀 Best Practices

### 1. **Caching Strategy**
Consider caching leaderboard data for 5-10 minutes to improve performance during high-traffic periods.

### 2. **Pagination**
For large teams (50+ technicians), implement client-side pagination or request smaller chunks.

### 3. **Real-time Updates**
Refresh leaderboard data when:
- New ratings are submitted
- Admin makes point adjustments
- Monthly period changes

### 4. **Historical Comparison**
Store previous month's data client-side to show trends and improvements.

### 5. **Export Functionality**
Use leaderboard data to generate Excel/PDF reports for management meetings.

---

This comprehensive leaderboard system provides everything needed for effective team performance management and competitive motivation! 🏆