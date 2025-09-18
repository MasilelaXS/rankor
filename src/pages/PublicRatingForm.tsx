import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Clock, CheckCircle, Users, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { apiService } from '../services/apiService';
import type { RatingFormData, SubmitRatingRequest, SubmitRatingResponse } from '../types/api';

const PublicRatingForm: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  // Form data state
  const [ratingData, setRatingData] = useState<RatingFormData | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [comments, setComments] = useState('');
  
  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<SubmitRatingResponse | null>(null);

  // Load rating form data
  useEffect(() => {
    const loadRatingForm = async () => {
      if (!token) {
        setError('Invalid rating link');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const data = await apiService.getRatingForm(token);
        setRatingData(data);
      } catch (error: unknown) {
        console.error('Failed to load rating form:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        if (typeof error === 'object' && error !== null && 'status_code' in error) {
          const statusCode = (error as { status_code: number }).status_code;
          if (statusCode === 404 || statusCode === 410) {
            setError('This rating link has expired or is no longer valid.');
          } else {
            setError('Failed to load rating form. Please try again.');
          }
        } else {
          setError(errorMessage);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadRatingForm();
  }, [token]);

  const handleRatingChange = (questionId: number, rating: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: rating
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token || !ratingData) return;

    // Validate that all questions are answered
    const unansweredQuestions = ratingData.questions.filter(q => !answers[q.id]);
    if (unansweredQuestions.length > 0) {
      setError('Please answer all questions before submitting.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const submitData: SubmitRatingRequest = {
        answers,
        comments: comments.trim() || undefined
      };

      const result = await apiService.submitRating(token, submitData);
      setSubmissionResult(result);
      setIsSubmitted(true);
    } catch (error: unknown) {
      console.error('Failed to submit rating:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit rating. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-500';
    if (rating >= 3) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getProgressPercentage = () => {
    if (!ratingData) return 0;
    const answeredCount = Object.keys(answers).length;
    return (answeredCount / ratingData.questions.length) * 100;
  };

  const isExpired = () => {
    if (!ratingData) return false;
    return new Date() > new Date(ratingData.expires_at);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#cc0000] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading rating form...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !ratingData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Unable to Load Rating Form
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error}
            </p>
            <Button onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (isSubmitted && submissionResult) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Thank You for Your Feedback!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {submissionResult.thank_you_message}
            </p>
            
            {/* Results Summary */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {submissionResult.percentage}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Overall Score
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {submissionResult.total_score}/{submissionResult.max_score}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Points Scored
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#cc0000]">
                    +{submissionResult.points_awarded}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Points Awarded
                  </div>
                </div>
              </div>
            </div>

            {/* Technicians */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                Technicians Rated:
              </h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {submissionResult.technicians.map((techName: string, index: number) => (
                  <Badge key={index} variant="primary">
                    {techName}
                  </Badge>
                ))}
              </div>
            </div>

            <Button onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main rating form
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Service Rating
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Please rate your experience with our technician(s)
              </p>
            </div>
            <div className="text-right">
              {isExpired() ? (
                <Badge variant="error">Expired</Badge>
              ) : (
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4 mr-1" />
                  Expires: {new Date(ratingData!.expires_at).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Progress</span>
              <span>{Object.keys(answers).length}/{ratingData?.questions.length || 0} questions</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-[#cc0000] h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Client Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Service Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Client Information</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Name:</span>
                    <span className="ml-2 text-gray-900 dark:text-gray-100">{ratingData?.client_info.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Email:</span>
                    <span className="ml-2 text-gray-900 dark:text-gray-100">{ratingData?.client_info.email}</span>
                  </div>
                  {ratingData?.client_info.code && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Code:</span>
                      <span className="ml-2 text-gray-900 dark:text-gray-100">{ratingData.client_info.code}</span>
                    </div>
                  )}
                  {ratingData?.client_info.contact && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Contact:</span>
                      <span className="ml-2 text-gray-900 dark:text-gray-100">{ratingData.client_info.contact}</span>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Technician(s) ({ratingData?.technicians.length})
                </h4>
                <div className="space-y-2">
                  {ratingData?.technicians.map((tech) => (
                    <Badge key={tech.id} variant="primary">
                      {tech.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rating Form */}
        {isExpired() ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
                Rating Link Expired
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                This rating link has expired and is no longer accepting responses.
              </p>
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Rate Your Experience</CardTitle>
                <p className="text-gray-600 dark:text-gray-400">
                  {ratingData?.instructions}
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Questions */}
                {ratingData?.questions.map((question, index) => (
                  <div key={question.id} className="border-b border-gray-100 dark:border-gray-800 pb-6 last:border-b-0 last:pb-0">
                    <div className="mb-4">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                        {index + 1}. {question.text}
                      </h4>
                      
                      {/* Star Rating */}
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            type="button"
                            onClick={() => handleRatingChange(question.id, rating)}
                            className={`p-2 rounded-lg transition-all duration-200 ${
                              answers[question.id] >= rating
                                ? 'text-yellow-400 scale-110'
                                : 'text-gray-300 dark:text-gray-600 hover:text-yellow-300 hover:scale-105'
                            }`}
                          >
                            <Star 
                              className="w-8 h-8" 
                              fill={answers[question.id] >= rating ? 'currentColor' : 'none'} 
                            />
                          </button>
                        ))}
                        {answers[question.id] && (
                          <div className="ml-4 flex items-center">
                            <span className={`text-sm font-medium ${getRatingColor(answers[question.id])}`}>
                              {answers[question.id] === 5 ? 'Excellent' :
                               answers[question.id] === 4 ? 'Good' :
                               answers[question.id] === 3 ? 'Average' :
                               answers[question.id] === 2 ? 'Below Average' : 'Poor'}
                            </span>
                            <span className="text-gray-400 dark:text-gray-500 ml-2">
                              ({answers[question.id]}/5)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Comments */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Additional Comments (Optional)
                  </label>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Please share any additional feedback about your experience..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#cc0000] focus:border-transparent resize-none"
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex">
                      <AlertTriangle className="h-5 w-5 text-red-400 mr-3 mt-0.5" />
                      <p className="text-red-700 dark:text-red-300">{error}</p>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSubmitting || Object.keys(answers).length !== ratingData?.questions.length}
                    className="px-8"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      'Submit Rating'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        )}
      </div>
    </div>
  );
};

export default PublicRatingForm;