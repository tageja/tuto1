'use client';

import { useState, useCallback } from 'react';
import { X, Upload, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui/Button';
import { createAlbum, type AlbumCategory, type AlbumStatus } from '../../lib/api/albums';
import { supabase } from '../../lib/supabase';

interface CreateAlbumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  schoolId: string;
  classes?: Array<{ id: string; name: string; grade_level?: string | null }>;
}

export function CreateAlbumModal({
  isOpen,
  onClose,
  onSuccess,
  schoolId,
  classes = [],
}: CreateAlbumModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<AlbumCategory>('school');
  const [eventDate, setEventDate] = useState('');
  const [description, setDescription] = useState('');
  const [classId, setClassId] = useState<string>('');
  const [grade, setGrade] = useState<string>('');
  const [status, setStatus] = useState<AlbumStatus>('active');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);

  // Get visibility summary based on class selection
  const getVisibilitySummary = useCallback(() => {
    if (classId) {
      const selectedClass = classes.find(c => c.id === classId);
      const className = selectedClass?.name || 'selected class';
      return {
        icon: <EyeOff className="w-4 h-4 text-amber-600" />,
        text: `Visible only to parents of ${className}`,
        color: 'bg-amber-50 border-amber-200 text-amber-800'
      };
    }
    return {
      icon: <Eye className="w-4 h-4 text-green-600" />,
      text: 'Visible to all parents',
      color: 'bg-green-50 border-green-200 text-green-800'
    };
  }, [classId, classes]);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter((f) => f.type.startsWith('image/'));
    setSelectedFiles((prev) => [...prev, ...imageFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter((f) => f.type.startsWith('image/'));
    setSelectedFiles((prev) => [...prev, ...imageFiles]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setTitle('');
    setCategory('school');
    setEventDate('');
    setDescription('');
    setClassId('');
    setGrade('');
    setStatus('active');
    setSelectedFiles([]);
    setUploadProgress(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (selectedFiles.length === 0) {
      setError('Please select at least one photo');
      return;
    }

    setLoading(true);
    setUploadProgress({ current: 0, total: selectedFiles.length });

    try {
      // Get current user
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        throw new Error('User not authenticated');
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', authUser.id)
        .single();

      if (userError || !userData) {
        throw new Error('Failed to get user information');
      }

      // Create album with photos - using the updated API that handles everything
      await createAlbum(
        {
          school_id: schoolId,
          title: title.trim(),
          category,
          event_date: eventDate || null,
          class_id: classId || null,
          grade: grade || null,
          description: description.trim() || null,
          status,
          created_by: userData.id,
        },
        selectedFiles,
        (current, total) => setUploadProgress({ current, total })
      );

      resetForm();
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error creating album:', err);
      setError(err.message || 'Failed to create album');
    } finally {
      setLoading(false);
      setUploadProgress(null);
    }
  };

  const visibility = getVisibilitySummary();

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={loading ? undefined : onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Create Album</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close"
              disabled={loading}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Sports Day 2025"
                  className="w-full h-11 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={loading}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as AlbumCategory)}
                  className="w-full h-11 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={loading}
                >
                  <option value="school">School</option>
                  <option value="class">Class</option>
                  <option value="competition">Competition</option>
                  <option value="workshop">Workshop</option>
                  <option value="outing">Outing</option>
                  <option value="practice">Practice</option>
                  <option value="celebration">Celebration</option>
                </select>
              </div>

              {/* Event Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Date (optional)
                </label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full h-11 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
              </div>

              {/* Class Selector - Always visible when classes exist */}
              {classes.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Restrict to Class (optional)
                  </label>
                  <select
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    className="w-full h-11 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={loading}
                  >
                    <option value="">All parents can view</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} {cls.grade_level && `(${cls.grade_level})`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Visibility Summary */}
              <div className={`p-3 border rounded-lg flex items-center gap-2 ${visibility.color}`}>
                {visibility.icon}
                <span className="text-sm font-medium">{visibility.text}</span>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe the album..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as AlbumStatus)}
                  className="w-full h-11 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                >
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photos *
                </label>
                <div 
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    loading ? 'border-gray-200 bg-gray-50' : 'border-gray-300 hover:border-blue-400'
                  }`}
                  onDrop={loading ? undefined : handleDrop}
                  onDragOver={handleDragOver}
                >
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="photo-upload"
                    disabled={loading}
                  />
                  <label
                    htmlFor="photo-upload"
                    className={`flex flex-col items-center ${loading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      Click to upload or drag and drop
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      Images will be compressed automatically (max 1600px)
                    </span>
                  </label>
                </div>

                {/* Selected files preview */}
                {selectedFiles.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {selectedFiles.length} photo{selectedFiles.length !== 1 ? 's' : ''} selected
                      </span>
                      {!loading && (
                        <button
                          type="button"
                          onClick={() => setSelectedFiles([])}
                          className="text-xs text-red-600 hover:underline"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="w-full h-20 object-cover rounded border border-gray-200"
                          />
                          {!loading && (
                            <button
                              type="button"
                              onClick={() => handleRemoveFile(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                            {file.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload Progress */}
                {uploadProgress && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      <span className="text-sm text-blue-800">
                        Uploading photo {uploadProgress.current} of {uploadProgress.total}...
                      </span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || selectedFiles.length === 0}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  'Create Album'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
