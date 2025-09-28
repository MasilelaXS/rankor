import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Link2, Copy, Eye, Search, Clock, Users, Calendar, User, X, AlertTriangle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { CenteredLoading } from '../../components/ui/CenteredLoading';
import { useAdminStore } from '../../stores/adminStore';
import type { CreateRatingLinkRequest, RatingLink } from '../../types/api';

const RatingLinksPage: React.FC = () => {
  const {
    ratingLinks,
    ratingLinksPagination,
    isRatingLinksLoading,
    technicians,
    isTechniciansLoading,
    error,
    fetchRatingLinks,
    fetchTechnicians,
    createRatingLink,
  } = useAdminStore();

  // State for filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<RatingLink | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Create form state
  const [formData, setFormData] = useState<CreateRatingLinkRequest>({
    technician_ids: [],
    client_name: '',
    client_code: '',
    client_email: '',
    client_contact: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load rating links when filters change
  const loadRatingLinks = useCallback(() => {
    fetchRatingLinks({
      page: currentPage,
      limit: 20,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      search: searchTerm || undefined,
    });
  }, [fetchRatingLinks, currentPage, statusFilter, searchTerm]);

  // Load data on mount
  useEffect(() => {
    if (!technicians.length && !isTechniciansLoading) {
      fetchTechnicians();
    }
    loadRatingLinks();
  }, [technicians.length, isTechniciansLoading, fetchTechnicians, loadRatingLinks]);

  useEffect(() => {
    loadRatingLinks();
  }, [loadRatingLinks]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleCreateLink = async () => {
    try {
      setIsSubmitting(true);
      setFormErrors({});

      // Validate form
      const errors: Record<string, string> = {};
      if (!formData.client_name.trim()) {
        errors.client_name = 'Client name is required';
      }
      if (!formData.client_email.trim()) {
        errors.client_email = 'Client email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.client_email)) {
        errors.client_email = 'Please enter a valid email address';
      }
      if (!formData.technician_ids.length) {
        errors.technician_ids = 'At least one technician is required';
      }

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      const response = await createRatingLink(formData);
      
      // Show success with copy URL option
      setCopiedUrl(response.rating_url);
      setIsCreateModalOpen(false);
      resetForm();
      loadRatingLinks();
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'errors' in error) {
        setFormErrors((error as { errors: Record<string, string> }).errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      technician_ids: [],
      client_name: '',
      client_code: '',
      client_email: '',
      client_contact: '',
    });
    setFormErrors({});
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 3000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const getStatusBadge = (link: RatingLink) => {
    switch (link.status) {
      case 'active':
        return <Badge variant="success" size="sm">Active</Badge>;
      case 'used':
        return <Badge variant="default" size="sm">Used</Badge>;
      case 'expired':
        return <Badge variant="error" size="sm">Expired</Badge>;
      default:
        return <Badge variant="default" size="sm">{link.status}</Badge>;
    }
  };

  const getFullRatingUrl = (token: string) => {
    return `https://score.ctecg.co.za/rate/${token}`;
  };

  const filteredLinks = ratingLinks.filter(link => {
    const matchesSearch = 
      link.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.client_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.technician_names.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || link.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Rating Links
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create and manage rating links for clients
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Rating Link
        </Button>
      </div>

      {/* Success Notification */}
      {copiedUrl && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Copy className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                Rating Link Created!
              </h3>
              <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                <p>The rating link has been successfully created.</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Input
                    value={copiedUrl}
                    readOnly
                    className="flex-1 text-sm"
                  />
                  <Button
                    size="sm"
                    onClick={() => copyToClipboard(copiedUrl)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCopiedUrl(null)}
                >
                  <X className="w-4 h-4 mr-1" />
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Error
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by client name, email, or technician..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <Select
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="used">Used</option>
                <option value="expired">Expired</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rating Links Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Link2 className="w-5 h-5 mr-2" />
              Rating Links
            </span>
            {ratingLinksPagination && (
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                {ratingLinksPagination.total_count} total links
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isRatingLinksLoading ? (
            <CenteredLoading message="Loading rating links..." className="py-8" />
          ) : filteredLinks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Client</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Technicians</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Created</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Expires</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLinks.map((link) => (
                    <tr key={link.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {link.client_name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {link.client_email}
                          </div>
                          {link.client_code && (
                            <div className="text-xs text-gray-400 dark:text-gray-500">
                              Code: {link.client_code}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-900 dark:text-gray-100">
                            {link.technician_names}
                          </span>
                          <Badge variant="default" size="sm" className="ml-2">
                            {link.technician_count}
                          </Badge>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col space-y-1">
                          {getStatusBadge(link)}
                          {link.rating_percentage && (
                            <Badge variant="default" size="sm">
                              {link.rating_percentage}%
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {new Date(link.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          by {link.created_by_name}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {new Date(link.expires_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(link.expires_at).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(getFullRatingUrl(link.token))}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedLink(link);
                              setIsViewModalOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Link2 className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || statusFilter !== 'all' ? 'No rating links found matching your criteria' : 'No rating links created yet'}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="mt-4"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Rating Link
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {ratingLinksPagination && ratingLinksPagination.total_pages > 1 && (
        <div className="flex justify-center">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              disabled={!ratingLinksPagination.has_prev}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </Button>
            <span className="flex items-center px-4 text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage} of {ratingLinksPagination.total_pages}
            </span>
            <Button
              variant="outline"
              disabled={!ratingLinksPagination.has_next}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Create Rating Link Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetForm();
        }}
        title="Create Rating Link"
        size="xl"
      >
        <div className="space-y-6">
          {/* Technician Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Technicians *
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-3">
              {technicians.map((technician) => (
                <label key={technician.id} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={formData.technician_ids.includes(technician.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData(prev => ({
                          ...prev,
                          technician_ids: [...prev.technician_ids, technician.id]
                        }));
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          technician_ids: prev.technician_ids.filter(id => id !== technician.id)
                        }));
                      }
                    }}
                    className="rounded border-gray-300 text-[#cc0000] focus:ring-[#cc0000]"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {technician.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {technician.email}
                    </div>
                  </div>
                </label>
              ))}
            </div>
            {formErrors.technician_ids && (
              <p className="text-red-500 text-sm mt-1">{formErrors.technician_ids}</p>
            )}
          </div>

          {/* Client Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Client Name *
              </label>
              <Input
                value={formData.client_name}
                onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                placeholder="Enter client name"
                error={formErrors.client_name}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Client Code
              </label>
              <Input
                value={formData.client_code || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, client_code: e.target.value }))}
                placeholder="Enter client code (optional)"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Client Email *
              </label>
              <Input
                type="email"
                value={formData.client_email}
                onChange={(e) => setFormData(prev => ({ ...prev, client_email: e.target.value }))}
                placeholder="Enter client email"
                error={formErrors.client_email}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Client Contact
              </label>
              <Input
                value={formData.client_contact || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, client_contact: e.target.value }))}
                placeholder="Enter contact number (optional)"
              />
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Clock className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  Rating Link Information
                </h3>
                <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Links are valid for 48 hours from creation</li>
                    <li>Each link can only be used once</li>
                    <li>Only one active link allowed per client email</li>
                    <li>Creating a new link for the same email will update the existing one</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateLink}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Rating Link'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Link Details Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedLink(null);
        }}
        title="Rating Link Details"
        size="xl"
      >
        {selectedLink && (
          <div className="space-y-6">
            {/* Status and Basic Info */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {selectedLink.client_name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedLink.client_email}
                </p>
              </div>
              <div className="text-right">
                {getStatusBadge(selectedLink)}
                {selectedLink.rating_percentage && (
                  <div className="mt-2">
                    <Badge variant="default">
                      Score: {selectedLink.rating_percentage}%
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Client Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Client Information
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Name:</span>
                    <span className="text-gray-900 dark:text-gray-100">{selectedLink.client_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Email:</span>
                    <span className="text-gray-900 dark:text-gray-100">{selectedLink.client_email}</span>
                  </div>
                  {selectedLink.client_code && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Code:</span>
                      <span className="text-gray-900 dark:text-gray-100">{selectedLink.client_code}</span>
                    </div>
                  )}
                  {selectedLink.client_contact && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Contact:</span>
                      <span className="text-gray-900 dark:text-gray-100">{selectedLink.client_contact}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Technicians ({selectedLink.technician_count})
                </h4>
                <div className="text-sm text-gray-900 dark:text-gray-100">
                  {selectedLink.technician_names}
                </div>
              </div>
            </div>

            {/* Timeline Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Timeline
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Created:</span>
                    <span className="text-gray-900 dark:text-gray-100">
                      {new Date(selectedLink.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Expires:</span>
                    <span className="text-gray-900 dark:text-gray-100">
                      {new Date(selectedLink.expires_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Created by:</span>
                    <span className="text-gray-900 dark:text-gray-100">{selectedLink.created_by_name}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {selectedLink.used_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Used at:</span>
                      <span className="text-gray-900 dark:text-gray-100">
                        {new Date(selectedLink.used_at).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {selectedLink.submitted_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Submitted:</span>
                      <span className="text-gray-900 dark:text-gray-100">
                        {new Date(selectedLink.submitted_at).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Rating Link URL */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Rating Link URL
              </label>
              <div className="flex items-center space-x-2">
                <Input
                  value={getFullRatingUrl(selectedLink.token)}
                  readOnly
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(getFullRatingUrl(selectedLink.token))}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Close button */}
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setIsViewModalOpen(false);
                  setSelectedLink(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RatingLinksPage;