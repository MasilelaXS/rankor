import { useEffect, useState } from 'react';
import { useAdminStore } from '../../stores/adminStore';
import { Button, Card, CardContent, Modal, Input, Badge } from '../../components/ui';
import { Textarea } from '../../components/ui';
import type { Rating, PointAdjustment } from '../../types/api';
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
  Mail,
  Phone,
  MessageSquare
} from 'lucide-react';

interface FilterState {
  search?: string;
}

interface OverrideModalData {
  rating: Rating | null;
  type: 'override' | 'adjust';
  isOpen: boolean;
}

interface PointHistoryModalData {
  technicianId: number;
  technicianName: string;
  isOpen: boolean;
}

export default function AllRatingsPage() {
  const {
    ratings,
    isRatingsLoading,
    fetchRatings,
    fetchTechnicians,
    overrideRatingPoints,
    adjustTechnicianPoints,
    getTechnicianPointHistory,
    error,
    clearError
  } = useAdminStore();

  // Filter state
  const [filters, setFilters] = useState<FilterState>({});

  // Modal states
  const [overrideModal, setOverrideModal] = useState<OverrideModalData>({
    rating: null,
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
    admin_override_reason: ''
  });
  const [adjustForm, setAdjustForm] = useState({
    points_change: 0,
    reason: ''
  });

  // Load data on mount
  useEffect(() => {
    fetchRatings();
    fetchTechnicians();
  }, [fetchRatings, fetchTechnicians]);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      if (error) clearError();
    };
  }, [error, clearError]);

  // Filter ratings based on search
  const filteredRatings = ratings.filter((rating) => {
    if (!filters.search) return true;
    
    const searchTerm = filters.search.toLowerCase();
    return (
      rating.client_name.toLowerCase().includes(searchTerm) ||
      rating.client_email.toLowerCase().includes(searchTerm) ||
      rating.technician_names.toLowerCase().includes(searchTerm) ||
      rating.comments.toLowerCase().includes(searchTerm)
    );
  });

  const getRatingStatus = (rating: Rating) => {
    const percentage = parseFloat(rating.percentage);
    if (rating.admin_override_reason) {
      return { status: 'overridden', color: 'amber', icon: Settings };
    }
    if (percentage >= 70) {
      return { status: 'passed', color: 'green', icon: CheckCircle2 };
    }
    return { status: 'failed', color: 'red', icon: XCircle };
  };

  const handleOverrideRating = async () => {
    if (!overrideModal.rating) return;

    try {
      await overrideRatingPoints(overrideModal.rating.id, {
        points_change: overrideForm.points_change,
        admin_override_reason: overrideForm.admin_override_reason
      });
      closeModal();
      await fetchRatings(); // Refresh the list
    } catch (error) {
      console.error('Failed to override rating:', error);
    }
  };

  const handleAdjustPoints = async () => {
    if (!overrideModal.rating) return;

    try {
      const technicianIds = overrideModal.rating.technician_ids.split(',').map((id: string) => parseInt(id.trim()));
      
      for (const techId of technicianIds) {
        await adjustTechnicianPoints(techId, {
          points_change: adjustForm.points_change,
          reason: adjustForm.reason
        });
      }
      
      closeModal();
      await fetchRatings(); // Refresh the list
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

  const openOverrideModal = (rating: Rating, type: 'override' | 'adjust') => {
    setOverrideModal({ rating, type, isOpen: true });
    if (type === 'override') {
      setOverrideForm({ points_change: 0, admin_override_reason: '' });
    } else {
      setAdjustForm({ points_change: 0, reason: '' });
    }
  };

  const closeModal = () => {
    setOverrideModal({ rating: null, type: 'override', isOpen: false });
    setPointHistoryModal({ technicianId: 0, technicianName: '', isOpen: false });
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      const diffInHours = Math.floor(diffInMinutes / 60);

      if (diffInMinutes < 60) {
        return `${diffInMinutes} minutes ago`;
      } else if (diffInHours < 24) {
        return `${diffInHours} hours ago`;
      } else {
        return `${Math.floor(diffInMinutes / 1440)} days ago`;
      }
    } catch {
      return dateString;
    }
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            All Ratings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage and review all customer ratings with enhanced point system controls
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
            <Star className="w-4 h-4 mr-1" />
            {filteredRatings.length} of {ratings.length} ratings
          </Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
              Search Ratings
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search by client, technician, or comments..."
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-11 h-12 text-base"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ratings List */}
      {isRatingsLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#cc0000] mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">Loading ratings...</p>
        </div>
      ) : filteredRatings.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center">
            <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No ratings found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {filters.search ? 'No ratings match your search' : 'No ratings have been submitted yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredRatings.map((rating) => {
            const status = getRatingStatus(rating);
            const percentage = parseFloat(rating.percentage);
            
            return (
              <Card key={rating.id} className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-8">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    {/* Rating Info */}
                    <div className="flex-1 space-y-6">
                      {/* Header with client info and status */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {rating.client_name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              <span>{rating.client_email}</span>
                            </div>
                            {rating.client_contact && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                <span>{rating.client_contact}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <Badge 
                          variant={status.status === 'passed' ? 'success' : status.status === 'failed' ? 'error' : 'warning'}
                          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium"
                        >
                          <status.icon className="h-4 w-4" />
                          {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
                        </Badge>
                      </div>
                      
                      {/* Key metrics in a cleaner grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Technicians</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                {rating.technician_names}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              percentage >= 70 
                                ? 'bg-green-100 dark:bg-green-900/30' 
                                : 'bg-red-100 dark:bg-red-900/30'
                            }`}>
                              <Star className={`h-5 w-5 ${
                                percentage >= 70 
                                  ? 'text-green-600 dark:text-green-400' 
                                  : 'text-red-600 dark:text-red-400'
                              }`} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Score</p>
                              <p className={`text-lg font-bold ${
                                percentage >= 70 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                              }`}>
                                {rating.total_score}/{rating.max_score} ({percentage.toFixed(1)}%)
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                              <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Submitted</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {formatDate(rating.submitted_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Comments section */}
                      {rating.comments && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-5 border border-blue-100 dark:border-blue-800">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                              <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                                Client Feedback
                              </h4>
                              <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                                {rating.comments}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Admin override section */}
                      {rating.admin_override_reason && (
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-5 border border-amber-200 dark:border-amber-800">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-2">
                                Admin Override Applied
                              </h4>
                              <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed mb-2">
                                {rating.admin_override_reason}
                              </p>
                              {rating.admin_override_by && (
                                <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300">
                                  <User className="h-3 w-3" />
                                  <span>By {rating.admin_override_by}</span>
                                  <span>•</span>
                                  <span>{rating.admin_override_at}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="lg:border-l lg:border-gray-200 dark:lg:border-gray-700 lg:pl-6">
                      <div className="flex flex-col gap-3 lg:min-w-[220px]">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openOverrideModal(rating, 'override')}
                          className="flex items-center justify-center gap-2 h-11 font-medium hover:bg-[#cc0000] hover:text-white hover:border-[#cc0000] transition-colors"
                        >
                          <Settings className="h-4 w-4" />
                          Override Points
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openOverrideModal(rating, 'adjust')}
                          className="flex items-center justify-center gap-2 h-11 font-medium hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors"
                        >
                          <TrendingUp className="h-4 w-4" />
                          Adjust Points
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const technicianIds = rating.technician_ids.split(',').map((id: string) => parseInt(id.trim()));
                            const firstTechId = technicianIds[0];
                            const techName = rating.technician_names.split(',')[0].trim();
                            handleViewPointHistory(firstTechId, techName);
                          }}
                          className="flex items-center justify-center gap-2 h-11 font-medium hover:bg-gray-600 hover:text-white hover:border-gray-600 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                          Point History
                        </Button>
                      </div>
                    </div>
                  </div>
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
        title={overrideModal.type === 'override' ? 'Override Rating Points' : 'Adjust Technician Points'}
      >
        <div className="space-y-4">
          {overrideModal.rating && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                {overrideModal.rating.client_name}
              </h4>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p>Technicians: {overrideModal.rating.technician_names}</p>
                <p>Current Score: {overrideModal.rating.total_score}/{overrideModal.rating.max_score} ({parseFloat(overrideModal.rating.percentage).toFixed(1)}%)</p>
                <p>Current Points: {overrideModal.rating.points_awarded_auto}{overrideModal.rating.points_awarded_final !== null ? ` → ${overrideModal.rating.points_awarded_final}` : ''}</p>
              </div>
            </div>
          )}

          {overrideModal.type === 'override' ? (
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
                    onClick={() => setOverrideForm(prev => ({
                      ...prev,
                      points_change: Math.max(-100, prev.points_change - 1)
                    }))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={overrideForm.points_change}
                    onChange={(e) => setOverrideForm(prev => ({
                      ...prev,
                      points_change: parseInt(e.target.value) || 0
                    }))}
                    className="text-center"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setOverrideForm(prev => ({
                      ...prev,
                      points_change: Math.min(100, prev.points_change + 1)
                    }))}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {overrideForm.points_change > 0 ? '+' : ''}{overrideForm.points_change} points relative to current rating
                </p>
              </div>

              <div>
                <label htmlFor="override-reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Override Reason
                </label>
                <Textarea
                  id="override-reason"
                  placeholder="Explain why you're overriding the points for this rating..."
                  value={overrideForm.admin_override_reason}
                  onChange={(e) => setOverrideForm(prev => ({
                    ...prev,
                    admin_override_reason: e.target.value
                  }))}
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleOverrideRating} className="flex-1">
                  Override Points
                </Button>
                <Button variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
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
                    onClick={() => setAdjustForm(prev => ({
                      ...prev,
                      points_change: Math.max(-100, prev.points_change - 1)
                    }))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={adjustForm.points_change}
                    onChange={(e) => setAdjustForm(prev => ({
                      ...prev,
                      points_change: parseInt(e.target.value) || 0
                    }))}
                    className="text-center"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAdjustForm(prev => ({
                      ...prev,
                      points_change: Math.min(100, prev.points_change + 1)
                    }))}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {adjustForm.points_change > 0 ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <TrendingUp className="h-3 w-3" />
                      Add {adjustForm.points_change} points to technician balance
                    </span>
                  ) : adjustForm.points_change < 0 ? (
                    <span className="flex items-center gap-1 text-red-600">
                      <TrendingDown className="h-3 w-3" />
                      Remove {Math.abs(adjustForm.points_change)} points from technician balance
                    </span>
                  ) : (
                    'No change to technician balance'
                  )}
                </p>
              </div>

              <div>
                <label htmlFor="adjust-reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Adjustment Reason
                </label>
                <Textarea
                  id="adjust-reason"
                  placeholder="Explain why you're adjusting the technician's points..."
                  value={adjustForm.reason}
                  onChange={(e) => setAdjustForm(prev => ({
                    ...prev,
                    reason: e.target.value
                  }))}
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleAdjustPoints} className="flex-1">
                  Adjust Points
                </Button>
                <Button variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
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