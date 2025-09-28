import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, Badge } from '../../components/ui';
import { apiService } from '../../services/apiService';
import type { RatingLinkResultsData } from '../../types/api';
import {
  Star,
  User,
  MessageSquare,
  Trophy,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Mail,
  Phone,
  Building,
  Target,
  TrendingUp,
  Award,
  ArrowLeft
} from 'lucide-react';

export default function RatingDetailsPage() {
  const { ratingLinkId } = useParams<{ ratingLinkId: string }>();
  const navigate = useNavigate();
  const [results, setResults] = useState<RatingLinkResultsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = useCallback(async () => {
    if (!ratingLinkId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiService.getTechnicianRatingLinkResults(parseInt(ratingLinkId));
      setResults(data);
    } catch (err) {
      setError((err as Error).message || 'Failed to fetch rating results');
    } finally {
      setLoading(false);
    }
  }, [ratingLinkId]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    if (percentage >= 75) return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    if (percentage >= 60) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
  };

  const getPassingStatus = () => {
    if (!results?.analysis) return null;
    
    const { is_passing } = results.analysis;
    return {
      icon: is_passing ? CheckCircle2 : XCircle,
      color: is_passing ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
      label: is_passing ? 'Passed' : 'Failed',
      bgColor: is_passing ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
    };
  };

  if (loading) {
    return (
      <div className="mobile-viewport bg-gray-50 dark:bg-black flex flex-col overflow-hidden">
        {/* Fixed Header */}
        <div className="flex-shrink-0 safe-area-top">
          <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Rating Details
              </h1>
            </div>
          </div>
        </div>

        {/* Loading State */}
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading rating details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-gray-50 dark:bg-black flex flex-col">
        {/* Fixed Header */}
        <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 safe-area-top">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Rating Details
            </h1>
          </div>
        </div>

        {/* Error State */}
        <div className="flex-1 overflow-y-auto mobile-scroll">
          <div className="p-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <p className="text-red-800 dark:text-red-200">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!results) return null;

  return (
    <div className="mobile-viewport bg-gray-50 dark:bg-black flex flex-col overflow-hidden">
      {/* Fixed Header */}
      <div className="flex-shrink-0 safe-area-top">
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Rating Details
            </h1>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto mobile-scroll">
        <div className="p-4 space-y-4 pb-20 safe-area-bottom">
        {/* Client Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {results.rating_link.client_name}
                </h3>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{results.rating_link.client_email}</span>
                  </div>
                  {results.rating_link.client_code && (
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      <span>Code: {results.rating_link.client_code}</span>
                    </div>
                  )}
                  {results.rating_link.client_contact && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{results.rating_link.client_contact}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                {results.rating_link.used ? (
                  <Badge variant="success" className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Completed
                  </Badge>
                ) : (
                  <Badge variant="warning" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Pending
                  </Badge>
                )}
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Created: {formatDate(results.rating_link.created_at)}
                </div>
              </div>
            </div>

            {/* Technicians */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Assigned Technicians</h4>
              <div className="flex flex-wrap gap-2">
                {results.rating_link.technicians.map((tech) => (
                  <div key={tech.id} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-1">
                    <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm text-gray-900 dark:text-white">{tech.name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">({tech.employee_id})</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rating Results */}
        {results.rating_results ? (
          <>
            {/* Score Summary */}
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      {results.rating_results.total_score}/{results.rating_results.max_score}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Score</div>
                  </div>

                  <div className="text-center">
                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full mb-2 ${getPerformanceColor(results.rating_results.percentage)}`}>
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      {results.rating_results.percentage.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Percentage</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Trophy className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      {results.rating_results.points_awarded_final !== null 
                        ? results.rating_results.points_awarded_final 
                        : results.rating_results.points_awarded_auto}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Points Awarded</div>
                  </div>

                  <div className="text-center">
                    {(() => {
                      const status = getPassingStatus();
                      if (!status) return null;
                      return (
                        <>
                          <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full mb-2 ${status.bgColor}`}>
                            <status.icon className={`h-5 w-5 ${status.color}`} />
                          </div>
                          <div className={`text-lg font-bold ${status.color}`}>
                            {status.label}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Pass Rate: {results.system_settings.pass_percentage}%
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                  Submitted on {formatDate(results.rating_results.submitted_at)}
                </div>
              </CardContent>
            </Card>

            {/* Question Breakdown */}
            <Card>
              <CardContent className="p-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Question Breakdown</h4>
                <div className="space-y-4">
                  {results.rating_results.question_answers.map((qa, index) => (
                    <div key={qa.question_id} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                      <div className="space-y-3">
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-white">
                            {index + 1}. {qa.question_text}
                          </h5>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-5 w-5 ${
                                star <= qa.score
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300 dark:text-gray-600'
                              }`}
                            />
                          ))}
                          <span className="ml-2 text-base font-medium text-gray-900 dark:text-white">
                            {qa.score}/5 Stars
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Client Comments */}
            {results.rating_results.comments && (
              <Card>
                <CardContent className="p-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Client Feedback
                  </h4>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <p className="text-gray-800 dark:text-gray-200 italic">
                      "{results.rating_results.comments}"
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Admin Override Info */}
            {results.rating_results.admin_override_reason && (
              <Card>
                <CardContent className="p-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Award className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    Admin Override
                  </h4>
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                    <div className="space-y-2">
                      <p className="text-amber-900 dark:text-amber-100">
                        <span className="font-medium">Reason:</span> {results.rating_results.admin_override_reason}
                      </p>
                      <div className="text-sm text-amber-700 dark:text-amber-300">
                        Points changed from {results.rating_results.points_awarded_auto} to {results.rating_results.points_awarded_final}
                        {results.rating_results.admin_override_at && (
                          <> • {formatDate(results.rating_results.admin_override_at)}</>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="p-4">
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Results Available
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  This rating link has not been used yet.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        </div>
      </div>
    </div>
  );
}