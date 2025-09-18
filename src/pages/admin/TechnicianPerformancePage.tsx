import { useEffect, useState } from 'react';
import { useAdminStore } from '../../stores/adminStore';
import { Button, Card, CardContent, Modal, Input, Badge } from '../../components/ui';
import { Textarea } from '../../components/ui';
import type { TechnicianRating, PointAdjustment } from '../../types/api';
import { 
  Star,
  Clock,
  Users,
  Search,
  Settings,
  Plus,
  Minus,
  TrendingUp,
  TrendingDown,
  Eye,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  User,
  MessageSquare,
  Trophy,
  Target,
  Filter
} from 'lucide-react';

interface FilterState {
  search?: string;
  start_date?: string;
  end_date?: string;
  technician_id?: number;
}

interface OverrideModalData {
  rating: TechnicianRating['ratings'][0] | null;
  technicianId: number;
  technicianName: string;
  type: 'override' | 'adjust';
  isOpen: boolean;
}

interface PointHistoryModalData {
  technicianId: number;
  technicianName: string;
  isOpen: boolean;
}

export default function TechnicianPerformancePage() {
  const {
    technicianRatings,
    isTechnicianRatingsLoading,
    fetchTechnicianRatings,
    fetchTechnicians,
    technicians,
    overrideRatingPoints,
    adjustTechnicianPoints,
    getTechnicianPointHistory,
    error,
    clearError
  } = useAdminStore();

  // Filter state
  const [filters, setFilters] = useState<FilterState>({});
  const [showFilters, setShowFilters] = useState(false);

  // Modal states
  const [overrideModal, setOverrideModal] = useState<OverrideModalData>({
    rating: null,
    technicianId: 0,
    technicianName: '',
    type: 'override',
    isOpen: false
  });
  const [pointHistoryModal, setPointHistoryModal] = useState<PointHistoryModalData>({
    technicianId: 0,
    technicianName: '',
    isOpen: false
  });
  const [pointHistory, setPointHistory] = useState<PointAdjustment[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Form states
  const [overrideForm, setOverrideForm] = useState({
    points_change: 0,
    reason: ''
  });
  const [adjustForm, setAdjustForm] = useState({
    points_change: 0,
    reason: ''
  });

  // Load data on mount - use existing ratings for now
  useEffect(() => {
    fetchTechnicianRatings();
    fetchTechnicians();
  }, [fetchTechnicianRatings, fetchTechnicians]);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      if (error) clearError();
    };
  }, [error, clearError]);

  // Filter technician ratings based on search
  const filteredTechnicianRatings = technicianRatings?.filter((techRating) => {
    if (!filters.search) return true;
    
    const searchTerm = filters.search.toLowerCase();
    return (
      techRating.technician_name.toLowerCase().includes(searchTerm) ||
      techRating.technician_email.toLowerCase().includes(searchTerm) ||
      techRating.ratings.some(rating => 
        rating.client_name.toLowerCase().includes(searchTerm) ||
        rating.client_email.toLowerCase().includes(searchTerm) ||
        rating.comments.toLowerCase().includes(searchTerm)
      )
    );
  }) || [];

  const handleApplyFilters = () => {
    fetchTechnicianRatings(filters);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    const newFilters = {};
    setFilters(newFilters);
    fetchTechnicianRatings(newFilters);
    setShowFilters(false);
  };

  const getRatingStatus = (rating: TechnicianRating['ratings'][0]) => {
    const percentage = parseFloat(rating.percentage);
    if (rating.admin_override_reason) {
      return { status: 'overridden', color: 'amber', icon: Settings };
    }
    if (percentage >= 70) {
      return { status: 'passed', color: 'green', icon: CheckCircle2 };
    }
    return { status: 'failed', color: 'red', icon: XCircle };
  };

  const getPerformanceLevel = (avgPercentage: number) => {
    if (avgPercentage >= 90) return { level: 'excellent', color: 'green', icon: Trophy };
    if (avgPercentage >= 75) return { level: 'good', color: 'blue', icon: Target };
    if (avgPercentage >= 60) return { level: 'average', color: 'yellow', icon: Target };
    return { level: 'needs improvement', color: 'red', icon: AlertTriangle };
  };

  const handleOverrideRating = async () => {
    if (!overrideModal.rating) return;

    try {
      await overrideRatingPoints(overrideModal.rating.id, {
        points_change: overrideForm.points_change,
        admin_override_reason: overrideForm.reason
      });
      closeModal();
      await fetchTechnicianRatings(filters); // Refresh the list
    } catch (error) {
      console.error('Failed to override rating:', error);
    }
  };

  const handleAdjustPoints = async () => {
    try {
      await adjustTechnicianPoints(overrideModal.technicianId, {
        points_change: adjustForm.points_change,
        reason: adjustForm.reason
      });
      closeModal();
      await fetchTechnicianRatings(filters); // Refresh the list
    } catch (error) {
      console.error('Failed to adjust points:', error);
    }
  };

  const handleViewPointHistory = async (technicianId: number, technicianName: string) => {
    setPointHistoryModal({ technicianId, technicianName, isOpen: true });
    setIsLoadingHistory(true);
    
    try {
      const response = await getTechnicianPointHistory(technicianId);
      setPointHistory(response.history || []);
    } catch (error) {
      console.error('Failed to fetch point history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const openOverrideModal = (rating: TechnicianRating['ratings'][0], technicianId: number, technicianName: string, type: 'override' | 'adjust') => {
    setOverrideModal({ rating, technicianId, technicianName, type, isOpen: true });
    if (type === 'override') {
      setOverrideForm({ points_change: 0, reason: '' });
    } else {
      setAdjustForm({ points_change: 0, reason: '' });
    }
  };

  const closeModal = () => {
    setOverrideModal({ rating: null, technicianId: 0, technicianName: '', type: 'override', isOpen: false });
    setPointHistoryModal({ technicianId: 0, technicianName: '', isOpen: false });
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const totalRatings = filteredTechnicianRatings.reduce((sum: number, tech) => sum + tech.total_ratings, 0);
  const totalPoints = filteredTechnicianRatings.reduce((sum: number, tech) => sum + tech.current_total_points, 0);
  const avgPerformance = filteredTechnicianRatings.length > 0 
    ? filteredTechnicianRatings.reduce((sum: number, tech) => sum + tech.average_percentage, 0) / filteredTechnicianRatings.length 
    : 0;

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Technician Performance
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Comprehensive view of technician ratings, performance metrics, and point management
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
            <Users className="w-4 h-4 mr-1" />
            {filteredTechnicianRatings.length} technicians
          </Badge>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Star className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Ratings</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalRatings}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <Trophy className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Points</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalPoints}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Performance</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{avgPerformance.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                Search Technicians
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search by name, email, client, or comments..."
                  value={filters.search || ''}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-11 h-12 text-base"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="h-12 px-6"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button
                onClick={handleApplyFilters}
                className="h-12 px-6"
              >
                Apply
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={filters.start_date || ''}
                    onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={filters.end_date || ''}
                    onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Specific Technician
                  </label>
                  <select
                    value={filters.technician_id || ''}
                    onChange={(e) => setFilters({ ...filters, technician_id: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="">All Technicians</option>
                    {technicians.map(tech => (
                      <option key={tech.id} value={tech.id}>{tech.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <Button variant="outline" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Technician Performance List */}
      {isTechnicianRatingsLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#cc0000] mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">Loading performance data...</p>
        </div>
      ) : filteredTechnicianRatings.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No technician data found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {filters.search || filters.start_date || filters.end_date || filters.technician_id 
                ? 'No technicians match your current filters' 
                : 'No technician performance data available'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {filteredTechnicianRatings.map((techRating) => {
            const performance = getPerformanceLevel(techRating.average_percentage);
            
            return (
              <Card key={techRating.technician_id} className="border-0 shadow-sm">
                <CardContent className="p-8">
                  {/* Technician Header */}
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
                        <User className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                          {techRating.technician_name}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">{techRating.technician_email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Badge 
                        variant={performance.level === 'excellent' ? 'success' : performance.level === 'needs improvement' ? 'error' : 'default'}
                        className="flex items-center gap-2 px-3 py-1.5"
                      >
                        <performance.icon className="h-4 w-4" />
                        {performance.level.charAt(0).toUpperCase() + performance.level.slice(1)}
                      </Badge>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openOverrideModal({} as TechnicianRating['ratings'][0], techRating.technician_id, techRating.technician_name, 'adjust')}
                          className="hover:bg-blue-600 hover:text-white hover:border-blue-600"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewPointHistory(techRating.technician_id, techRating.technician_name)}
                          className="hover:bg-gray-600 hover:text-white hover:border-gray-600"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Total Points</span>
                      </div>
                      <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                        {techRating.current_total_points}
                      </p>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-medium text-green-900 dark:text-green-100">Avg Score</span>
                      </div>
                      <p className="text-xl font-bold text-green-900 dark:text-green-100">
                        {techRating.average_percentage.toFixed(1)}%
                      </p>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-sm font-medium text-purple-900 dark:text-purple-100">Good Ratings</span>
                      </div>
                      <p className="text-xl font-bold text-purple-900 dark:text-purple-100">
                        {techRating.good_ratings}/{techRating.total_ratings}
                      </p>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Settings className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        <span className="text-sm font-medium text-amber-900 dark:text-amber-100">Overrides</span>
                      </div>
                      <p className="text-xl font-bold text-amber-900 dark:text-amber-100">
                        {techRating.overridden_ratings}
                      </p>
                    </div>
                  </div>

                  {/* Individual Ratings */}
                  {techRating.ratings && techRating.ratings.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Recent Ratings ({techRating.ratings.length})
                      </h3>
                      <div className="space-y-4">
                        {techRating.ratings.map((rating) => {
                          const ratingStatus = getRatingStatus(rating);
                          const percentage = parseFloat(rating.percentage);
                          
                          return (
                            <div key={rating.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
                              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                <div className="flex-1 space-y-4">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <h4 className="font-semibold text-gray-900 dark:text-white">
                                        {rating.client_name}
                                      </h4>
                                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        <span>{rating.client_email}</span>
                                        <span>•</span>
                                        <span>{formatDate(rating.submitted_at)}</span>
                                      </div>
                                    </div>
                                    <Badge 
                                      variant={ratingStatus.status === 'passed' ? 'success' : ratingStatus.status === 'failed' ? 'error' : 'warning'}
                                      className="flex items-center gap-1"
                                    >
                                      <ratingStatus.icon className="h-3 w-3" />
                                      {percentage.toFixed(1)}%
                                    </Badge>
                                  </div>
                                  
                                  <div className="flex items-center gap-6 text-sm">
                                    <div className="flex items-center gap-2">
                                      <Star className="h-4 w-4 text-gray-400" />
                                      <span className="text-gray-600 dark:text-gray-400">
                                        {rating.total_score}/{rating.max_score}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Trophy className="h-4 w-4 text-gray-400" />
                                      <span className="text-gray-600 dark:text-gray-400">
                                        {rating.points_awarded_final !== null ? rating.points_awarded_final : rating.points_awarded_auto} points
                                      </span>
                                    </div>
                                    {rating.admin_override_reason && (
                                      <Badge variant="warning" className="text-xs">
                                        Override Applied
                                      </Badge>
                                    )}
                                  </div>

                                  {rating.comments && (
                                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                                      <div className="flex items-start gap-2">
                                        <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                          {rating.comments}
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                  {rating.admin_override_reason && (
                                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                                      <div className="flex items-start gap-2">
                                        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                                        <div>
                                          <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">
                                            Admin Override
                                          </p>
                                          <p className="text-sm text-amber-800 dark:text-amber-200">
                                            {rating.admin_override_reason}
                                          </p>
                                          {rating.overridden_by && (
                                            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                                              By {rating.overridden_by} • {rating.admin_override_at}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <div className="flex gap-2 lg:flex-col">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openOverrideModal(rating, techRating.technician_id, techRating.technician_name, 'override')}
                                    className="hover:bg-[#cc0000] hover:text-white hover:border-[#cc0000]"
                                  >
                                    <Settings className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Override/Adjust Modal */}
      <Modal
        isOpen={overrideModal.isOpen}
        onClose={closeModal}
        title={overrideModal.type === 'override' ? 'Override Rating Points' : `Adjust Points - ${overrideModal.technicianName}`}
      >
        <div className="space-y-4">
          {overrideModal.rating && overrideModal.type === 'override' && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                {overrideModal.rating.client_name}
              </h4>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p>Current Score: {overrideModal.rating.total_score}/{overrideModal.rating.max_score} ({parseFloat(overrideModal.rating.percentage).toFixed(1)}%)</p>
                <p>Current Points: {overrideModal.rating.points_awarded_auto}{overrideModal.rating.points_awarded_final !== null ? ` → ${overrideModal.rating.points_awarded_final}` : ''}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Point Adjustment
              </label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (overrideModal.type === 'override') {
                      setOverrideForm(prev => ({ ...prev, points_change: Math.max(-5, prev.points_change - 1) }));
                    } else {
                      setAdjustForm(prev => ({ ...prev, points_change: Math.max(-5, prev.points_change - 1) }));
                    }
                  }}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={overrideModal.type === 'override' ? overrideForm.points_change : adjustForm.points_change}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    if (overrideModal.type === 'override') {
                      setOverrideForm(prev => ({ ...prev, points_change: value }));
                    } else {
                      setAdjustForm(prev => ({ ...prev, points_change: value }));
                    }
                  }}
                  className="text-center"
                  min={-5}
                  max={5}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (overrideModal.type === 'override') {
                      setOverrideForm(prev => ({ ...prev, points_change: Math.min(5, prev.points_change + 1) }));
                    } else {
                      setAdjustForm(prev => ({ ...prev, points_change: Math.min(5, prev.points_change + 1) }));
                    }
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {overrideModal.type === 'override' 
                  ? `${overrideForm.points_change > 0 ? '+' : ''}${overrideForm.points_change} points relative to auto-calculated rating`
                  : adjustForm.points_change > 0 
                    ? `Add ${adjustForm.points_change} points to technician balance`
                    : adjustForm.points_change < 0
                      ? `Remove ${Math.abs(adjustForm.points_change)} points from technician balance`
                      : 'No change to technician balance'
                }
              </p>
            </div>

            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {overrideModal.type === 'override' ? 'Override Reason' : 'Adjustment Reason'}
              </label>
              <Textarea
                id="reason"
                placeholder={overrideModal.type === 'override' 
                  ? "Explain why you're overriding the points for this rating..."
                  : "Explain why you're adjusting the technician's points..."
                }
                value={overrideModal.type === 'override' ? overrideForm.reason : adjustForm.reason}
                onChange={(e) => {
                  if (overrideModal.type === 'override') {
                    setOverrideForm(prev => ({ ...prev, reason: e.target.value }));
                  } else {
                    setAdjustForm(prev => ({ ...prev, reason: e.target.value }));
                  }
                }}
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                onClick={overrideModal.type === 'override' ? handleOverrideRating : handleAdjustPoints} 
                className="flex-1"
                disabled={(overrideModal.type === 'override' ? !overrideForm.reason.trim() : !adjustForm.reason.trim()) || 
                         (overrideModal.type === 'override' ? overrideForm.points_change === 0 : adjustForm.points_change === 0)}
              >
                {overrideModal.type === 'override' ? 'Override Points' : 'Adjust Points'}
              </Button>
              <Button variant="outline" onClick={closeModal}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Point History Modal */}
      <Modal
        isOpen={pointHistoryModal.isOpen}
        onClose={closeModal}
        title={`Point History - ${pointHistoryModal.technicianName}`}
      >
        <div className="space-y-4">
          {isLoadingHistory ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#cc0000] mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Loading history...</p>
            </div>
          ) : pointHistory.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 dark:text-gray-400">No point history found</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {pointHistory.map((entry, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className={`p-2 rounded-lg ${
                    entry.points_change > 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                  }`}>
                    {entry.points_change > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`font-medium ${
                        entry.points_change > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {entry.points_change > 0 ? '+' : ''}{entry.points_change} points
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(entry.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {entry.reason}
                    </p>
                    {entry.admin_name && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        By {entry.admin_name}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}