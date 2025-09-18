import React, { useEffect, useState } from 'react';
import { Search, Plus, Filter, User, Phone, Mail, Award, Calendar, Trash2, Edit, Eye } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAdminStore } from '../../stores/adminStore';
import type { TechnicianUser } from '../../types/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';

interface TechnicianFormData {
  name: string;
  email: string;
  phone: string;
  employee_id: string;
}

const TechniciansPage: React.FC = () => {
  const { 
    technicians, 
    isTechniciansLoading,
    fetchTechnicians,
    createTechnician,
    updateTechnicianAsync,
    removeTechnician
  } = useAdminStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTechnician, setSelectedTechnician] = useState<TechnicianUser | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Form for adding/editing technicians
  const technicianForm = useForm<TechnicianFormData>({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      employee_id: ''
    }
  });

  useEffect(() => {
    fetchTechnicians();
  }, [fetchTechnicians]);

  // Filter technicians based on search term
  const filteredTechnicians = technicians.filter((tech) =>
    tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tech.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tech.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteTechnician = async () => {
    if (!selectedTechnician) return;

    setDeleteLoading(true);
    try {
      await removeTechnician(selectedTechnician.id);
      setShowDeleteModal(false);
      setSelectedTechnician(null);
      // Refresh the list
      await fetchTechnicians();
    } catch (error) {
      console.error('Failed to delete technician:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleAddTechnician = async (data: TechnicianFormData) => {
    setSubmitLoading(true);
    try {
      await createTechnician({
        ...data,
        user_type: 'technician'
      });
      setShowAddModal(false);
      technicianForm.reset();
      // Refresh will happen automatically due to store update
    } catch (error) {
      console.error('Failed to create technician:', error);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEditTechnician = async (data: TechnicianFormData) => {
    if (!selectedTechnician) return;

    setSubmitLoading(true);
    try {
      await updateTechnicianAsync(selectedTechnician.id, data);
      setShowEditModal(false);
      setSelectedTechnician(null);
      technicianForm.reset();
      // Refresh will happen automatically due to store update
    } catch (error) {
      console.error('Failed to update technician:', error);
    } finally {
      setSubmitLoading(false);
    }
  };

  const openEditModal = (technician: TechnicianUser) => {
    setSelectedTechnician(technician);
    technicianForm.reset({
      name: technician.name,
      email: technician.email,
      phone: technician.phone,
      employee_id: technician.employee_id
    });
    setShowEditModal(true);
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDetailsModal(false);
    setShowDeleteModal(false);
    setSelectedTechnician(null);
    technicianForm.reset();
  };

  const getPerformanceLevel = (points: number): { level: string; color: 'success' | 'warning' | 'error' } => {
    if (points >= 80) return { level: 'Excellent', color: 'success' };
    if (points >= 60) return { level: 'Good', color: 'warning' };
    return { level: 'Needs Improvement', color: 'error' };
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isTechniciansLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-4 border-[#cc0000] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading technicians...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Technicians
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and monitor technician performance
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Technician
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Technicians
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {technicians.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  High Performers
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {technicians.filter(t => t.total_points >= 80).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Average Performers
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {technicians.filter(t => t.total_points >= 60 && t.total_points < 80).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Need Improvement
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {technicians.filter(t => t.total_points < 60).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Search technicians..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Technicians Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Technicians</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTechnicians.length === 0 ? (
            <div className="text-center py-8">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No technicians found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Technician</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Ratings</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTechnicians.map((tech) => (
                  <TableRow key={tech.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">{tech.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">ID: {tech.employee_id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm text-gray-900 dark:text-gray-100">{tech.email}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{tech.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <Badge variant={getPerformanceLevel(tech.total_points).color}>
                          {getPerformanceLevel(tech.total_points).level}
                        </Badge>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {tech.total_points} points
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {tech.total_ratings}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {formatDate(tech.created_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedTechnician(tech);
                            setShowDetailsModal(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(tech)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedTechnician(tech);
                            setShowDeleteModal(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Technician Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedTechnician(null);
        }}
        title="Technician Details"
      >
        {selectedTechnician && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {selectedTechnician.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Employee ID: {selectedTechnician.employee_id}
                </p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {selectedTechnician.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {selectedTechnician.phone}
                  </p>
                </div>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Award className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Points</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {selectedTechnician.total_points}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Ratings</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {selectedTechnician.total_ratings}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Joined</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {formatDate(selectedTechnician.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Last Updated</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {formatDate(selectedTechnician.updated_at)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                Close
              </Button>
              <Button onClick={() => {
                if (selectedTechnician) {
                  openEditModal(selectedTechnician);
                  setShowDetailsModal(false);
                }
              }}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Technician
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedTechnician(null);
        }}
        title="Delete Technician"
      >
        {selectedTechnician && (
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Are you sure you want to delete <strong>{selectedTechnician.name}</strong>? 
              This action cannot be undone and will remove all their data.
            </p>
            
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
              >
                Cancel
              </Button>
              <Button 
                variant="primary"
                onClick={handleDeleteTechnician}
                isLoading={deleteLoading}
                disabled={deleteLoading}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleteLoading ? 'Deleting...' : 'Delete Technician'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Technician Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={closeModals}
        title="Add New Technician"
      >
        <form onSubmit={technicianForm.handleSubmit(handleAddTechnician)} className="space-y-6">
          <Input
            label="Full Name"
            {...technicianForm.register('name', { 
              required: 'Name is required',
              minLength: { value: 2, message: 'Name must be at least 2 characters' }
            })}
            error={technicianForm.formState.errors.name?.message}
            placeholder="Enter full name"
            leftIcon={<User className="w-4 h-4" />}
          />

          <Input
            label="Email Address"
            type="email"
            {...technicianForm.register('email', { 
              required: 'Email is required',
              pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
            })}
            error={technicianForm.formState.errors.email?.message}
            placeholder="Enter email address"
            leftIcon={<Mail className="w-4 h-4" />}
          />

          <Input
            label="Phone Number"
            type="tel"
            {...technicianForm.register('phone', { 
              required: 'Phone number is required',
              pattern: { value: /^[0-9+\-\s()]+$/, message: 'Invalid phone number' }
            })}
            error={technicianForm.formState.errors.phone?.message}
            placeholder="Enter phone number"
            leftIcon={<Phone className="w-4 h-4" />}
          />

          <Input
            label="Employee ID"
            {...technicianForm.register('employee_id', { 
              required: 'Employee ID is required',
              minLength: { value: 3, message: 'Employee ID must be at least 3 characters' }
            })}
            error={technicianForm.formState.errors.employee_id?.message}
            placeholder="Enter employee ID"
          />

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button 
              type="button" 
              variant="outline" 
              onClick={closeModals}
              disabled={submitLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              isLoading={submitLoading}
              disabled={submitLoading}
            >
              {submitLoading ? 'Creating...' : 'Create Technician'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Technician Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={closeModals}
        title="Edit Technician"
      >
        <form onSubmit={technicianForm.handleSubmit(handleEditTechnician)} className="space-y-6">
          <Input
            label="Full Name"
            {...technicianForm.register('name', { 
              required: 'Name is required',
              minLength: { value: 2, message: 'Name must be at least 2 characters' }
            })}
            error={technicianForm.formState.errors.name?.message}
            placeholder="Enter full name"
            leftIcon={<User className="w-4 h-4" />}
          />

          <Input
            label="Email Address"
            type="email"
            {...technicianForm.register('email', { 
              required: 'Email is required',
              pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
            })}
            error={technicianForm.formState.errors.email?.message}
            placeholder="Enter email address"
            leftIcon={<Mail className="w-4 h-4" />}
          />

          <Input
            label="Phone Number"
            type="tel"
            {...technicianForm.register('phone', { 
              required: 'Phone number is required',
              pattern: { value: /^[0-9+\-\s()]+$/, message: 'Invalid phone number' }
            })}
            error={technicianForm.formState.errors.phone?.message}
            placeholder="Enter phone number"
            leftIcon={<Phone className="w-4 h-4" />}
          />

          <Input
            label="Employee ID"
            {...technicianForm.register('employee_id', { 
              required: 'Employee ID is required',
              minLength: { value: 3, message: 'Employee ID must be at least 3 characters' }
            })}
            error={technicianForm.formState.errors.employee_id?.message}
            placeholder="Enter employee ID"
          />

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button 
              type="button" 
              variant="outline" 
              onClick={closeModals}
              disabled={submitLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              isLoading={submitLoading}
              disabled={submitLoading}
            >
              {submitLoading ? 'Updating...' : 'Update Technician'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TechniciansPage;