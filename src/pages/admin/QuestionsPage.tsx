import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { useAdminStore } from '../../stores/adminStore';
import type { Question } from '../../types/api';
import { 
  Plus, 
  Edit, 
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  MessageSquare
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { MetricCard } from '../../components/ui/MetricCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';

export default function QuestionsPage() {
  const {
    questions,
    inactiveQuestions,
    questionLoadingStates,
    isCreatingQuestion,
    isReorderingQuestions,
    fetchAllQuestions,
    createQuestion,
    updateQuestionAsync,
    deleteQuestion,
    toggleQuestionActive,
    reorderQuestionsAsync,
    error
  } = useAdminStore();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [editQuestionText, setEditQuestionText] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleteAlert, setDeleteAlert] = useState<{
    isOpen: boolean;
    questionId: number | null;
    questionText: string;
  }>({
    isOpen: false,
    questionId: null,
    questionText: ''
  });

  // Load questions only if array is empty (initial load)
  useEffect(() => {
    if (questions.length === 0 && inactiveQuestions.length === 0) {
      fetchAllQuestions();
    }
  }, [fetchAllQuestions, questions.length, inactiveQuestions.length]);

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;

    try {
      await createQuestion({
        text: newQuestionText.trim(),
        order_position: questions.length + 1
      });
      setNewQuestionText('');
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create question:', error);
    }
  };

  const handleUpdateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion || !editQuestionText.trim()) return;

    try {
      await updateQuestionAsync(editingQuestion.id, {
        text: editQuestionText.trim()
      });
      setEditingQuestion(null);
      setEditQuestionText('');
    } catch (error) {
      console.error('Failed to update question:', error);
    }
  };

  const handleDeleteQuestion = async (id: number) => {
    const question = questions.find(q => q.id === id) || inactiveQuestions.find(q => q.id === id);
    if (!question) return;

    setDeleteAlert({
      isOpen: true,
      questionId: id,
      questionText: question.text
    });
  };

  const confirmDeleteQuestion = async () => {
    if (!deleteAlert.questionId) return;

    try {
      const result = await deleteQuestion(deleteAlert.questionId);
      
      // Clear the delete alert
      setDeleteAlert({
        isOpen: false,
        questionId: null,
        questionText: ''
      });
      
      // Show success message based on the action taken
      if (result.message) {
        setSuccessMessage(result.message);
        // Auto-hide success message after 5 seconds
        setTimeout(() => setSuccessMessage(null), 5000);
      }
      
    } catch (error) {
      console.error('Failed to delete question:', error);
      // Close the alert anyway, the error will be shown by the error state
      setDeleteAlert({
        isOpen: false,
        questionId: null,
        questionText: ''
      });
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      await toggleQuestionActive(id);
    } catch (error) {
      console.error('Failed to toggle question status:', error);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source } = result;

    if (!destination || destination.index === source.index) {
      return;
    }

    const reorderedQuestions = Array.from(questions);
    const [removed] = reorderedQuestions.splice(source.index, 1);
    reorderedQuestions.splice(destination.index, 0, removed);

    // Update order_position for all questions
    const updatedQuestions = reorderedQuestions.map((question, index) => ({
      ...question,
      order_position: index + 1
    }));

    try {
      await reorderQuestionsAsync(updatedQuestions);
    } catch (error) {
      console.error('Failed to reorder questions:', error);
    }
  };

  const startEdit = (question: Question) => {
    setEditingQuestion(question);
    setEditQuestionText(question.text);
  };

  const cancelEdit = () => {
    setEditingQuestion(null);
    setEditQuestionText('');
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Questions Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage survey questions and their order
          </p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Active Questions"
          value={questions.length}
          icon={<Eye className="w-6 h-6 text-[#cc0000]" />}
          trend={{ value: 0, isPositive: true }}
        />
        <MetricCard
          title="Inactive Questions"
          value={inactiveQuestions.length}
          icon={<EyeOff className="w-6 h-6 text-gray-400" />}
          trend={{ value: 0, isPositive: true }}
        />
        <MetricCard
          title="Total Questions"
          value={questions.length + inactiveQuestions.length}
          icon={<MessageSquare className="w-6 h-6 text-blue-500" />}
          trend={{ value: 0, isPositive: true }}
        />
      </div>

      {/* Success Message */}
      {successMessage && (
        <Card variant="outlined" className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
          <CardContent className="p-4">
            <div className="text-sm text-green-800 dark:text-green-200">{successMessage}</div>
          </CardContent>
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <Card variant="outlined" className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <CardContent className="p-4">
            <div className="text-sm text-red-800 dark:text-red-200">{error}</div>
          </CardContent>
        </Card>
      )}

      {/* Create Question Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Question</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateQuestion} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Question Text
                </label>
                <textarea
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-[#cc0000] focus:border-[#cc0000] dark:bg-gray-700 dark:text-white"
                  placeholder="Enter your question..."
                  required
                />
              </div>
              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={isCreatingQuestion}
                  isLoading={isCreatingQuestion}
                >
                  Create Question
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewQuestionText('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Active Questions Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Active Questions</CardTitle>
        </CardHeader>
        <CardContent>
          {questions.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No active questions yet. Create your first question to get started.
            </p>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="questions">
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`space-y-4 ${snapshot.isDraggingOver ? 'bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2' : ''}`}
                  >
                    {questions.map((question, index) => (
                      <Draggable
                        key={question.id}
                        draggableId={question.id.toString()}
                        index={index}
                        isDragDisabled={isReorderingQuestions || editingQuestion?.id === question.id}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 transition-shadow ${
                              snapshot.isDragging ? 'shadow-lg' : 'shadow-sm'
                            }`}
                          >
                            {editingQuestion?.id === question.id ? (
                              <form onSubmit={handleUpdateQuestion} className="space-y-4">
                                <textarea
                                  value={editQuestionText}
                                  onChange={(e) => setEditQuestionText(e.target.value)}
                                  rows={3}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-[#cc0000] focus:border-[#cc0000] dark:bg-gray-700 dark:text-white"
                                  required
                                />
                                <div className="flex gap-2">
                                  <Button
                                    type="submit"
                                    size="sm"
                                    disabled={questionLoadingStates[question.id]?.updating}
                                    isLoading={questionLoadingStates[question.id]?.updating}
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={cancelEdit}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </form>
                            ) : (
                              <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3 flex-1">
                                  <div
                                    {...provided.dragHandleProps}
                                    className="flex-shrink-0 mt-1 cursor-grab active:cursor-grabbing"
                                  >
                                    <GripVertical className="h-5 w-5 text-gray-400" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        #{question.order_position}
                                      </span>
                                      <Badge variant="success">Active</Badge>
                                    </div>
                                    <p className="text-gray-900 dark:text-white">{question.text}</p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2 ml-4">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleToggleActive(question.id)}
                                    disabled={questionLoadingStates[question.id]?.toggling}
                                    isLoading={questionLoadingStates[question.id]?.toggling}
                                  >
                                    <EyeOff className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => startEdit(question)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteQuestion(question.id)}
                                    disabled={questionLoadingStates[question.id]?.deleting}
                                    isLoading={questionLoadingStates[question.id]?.deleting}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </CardContent>
      </Card>

      {/* Inactive Questions Section */}
      {inactiveQuestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Inactive Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inactiveQuestions.map((question) => (
                <div
                  key={question.id}
                  className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          #{question.order_position}
                        </span>
                        <Badge variant="default">Inactive</Badge>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{question.text}</p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(question.id)}
                        disabled={questionLoadingStates[question.id]?.toggling}
                        isLoading={questionLoadingStates[question.id]?.toggling}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteQuestion(question.id)}
                        disabled={questionLoadingStates[question.id]?.deleting}
                        isLoading={questionLoadingStates[question.id]?.deleting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Alert */}
      <Alert
        isOpen={deleteAlert.isOpen}
        type="confirm"
        title="Delete Question"
        message={`Are you sure you want to delete "${deleteAlert.questionText}"? 

Note: If this question has been used in ratings, it will be deactivated instead of deleted to preserve rating history.`}
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={deleteAlert.questionId ? questionLoadingStates[deleteAlert.questionId]?.deleting : false}
        onConfirm={confirmDeleteQuestion}
        onClose={() => setDeleteAlert({
          isOpen: false,
          questionId: null,
          questionText: ''
        })}
      />
    </div>
  );
}