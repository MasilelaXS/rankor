import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  MessageSquare, 
  Link2, 
  Star,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { useAdminStore } from '../../stores/adminStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { MetricCard } from '../../components/ui/MetricCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/Loading';

const AdminDashboardHome = () => {
  const { 
    dashboardData, 
    isDashboardLoading, 
    fetchDashboardData,
    error 
  } = useAdminStore();

  useEffect(() => {
    // Fetch real dashboard data from API
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (isDashboardLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-96">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600 dark:text-gray-400 mt-4">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Failed to load dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error}
          </p>
          <Button onClick={fetchDashboardData}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Overview of your Ctecg Score system
          </p>
        </div>
        <div className="flex space-x-3">
          <Link to="/admin/links">
            <Button variant="outline">
              <Link2 className="w-4 h-4 mr-2" />
              Create Rating Link
            </Button>
          </Link>
          <Link to="/admin/technicians">
            <Button>
              <Users className="w-4 h-4 mr-2" />
              Manage Technicians
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Technicians"
          value={dashboardData?.stats?.total_technicians || 0}
          icon={<Users className="w-6 h-6 text-[#cc0000]" />}
          trend={{ value: 0, isPositive: true }}
        />
        <MetricCard
          title="Ratings This Month"
          value={dashboardData?.stats?.ratings_this_month || 0}
          icon={<Star className="w-6 h-6 text-[#cc0000]" />}
          trend={{ value: 0, isPositive: true }}
        />
        <MetricCard
          title="Top Technicians"
          value={dashboardData?.top_technicians?.length || 0}
          icon={<Link2 className="w-6 h-6 text-[#cc0000]" />}
          trend={{ value: 0, isPositive: true }}
        />
        <MetricCard
          title="Avg Score"
          value={`${dashboardData?.stats?.avg_percentage_this_month?.toFixed(1) || '0.0'}%`}
          icon={<TrendingUp className="w-6 h-6 text-[#cc0000]" />}
          trend={{ 
            value: dashboardData?.stats?.avg_percentage_this_month && dashboardData.stats.avg_percentage_this_month >= 70 ? 1 : -1, 
            isPositive: dashboardData?.stats?.avg_percentage_this_month ? dashboardData.stats.avg_percentage_this_month >= 70 : true
          }}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Ratings */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="w-5 h-5 mr-2" />
                Recent Ratings
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData?.recent_ratings && dashboardData.recent_ratings.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.recent_ratings.slice(0, 5).map((rating) => (
                    <div key={rating.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {rating.technician_names || 'Unknown Technician'}
                          </div>
                          <Badge 
                            variant={parseFloat(rating.percentage) >= 80 ? 'success' : parseFloat(rating.percentage) >= 60 ? 'warning' : 'error'}
                            size="sm" 
                            className="ml-2"
                          >
                            {rating.percentage}%
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {rating.client_name} • {new Date(rating.submitted_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2">
                    <Link to="/admin/ratings">
                      <Button variant="outline" size="sm" className="w-full">
                        View Performance
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Star className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No ratings yet
                  </p>
                  <Link to="/admin/links">
                    <Button variant="outline" className="mt-4">
                      Create Your First Rating Link
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/admin/links" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Link2 className="w-4 h-4 mr-2" />
                  Create Rating Link
                </Button>
              </Link>
              <Link to="/admin/technicians" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Add Technician
                </Button>
              </Link>
              <Link to="/admin/questions" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Manage Questions
                </Button>
              </Link>
              <Link to="/admin/ratings" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Star className="w-4 h-4 mr-2" />
                  View Performance
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  API Status
                </span>
                <Badge variant="success" size="sm">
                  Online
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Questions
                </span>
                <Badge variant="outline" size="sm">
                  Available
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Recent Ratings
                </span>
                <Badge variant="warning" size="sm">
                  {dashboardData?.recent_ratings?.length || 0}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardHome;