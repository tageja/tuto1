'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import supabase from '../../lib/supabase';
import type { CreateHomeworkModalProps } from './types';

export function CreateHomeworkModal({
  isOpen,
  onClose,
  onSuccess,
  schoolId,
  classes,
}: CreateHomeworkModalProps) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [targetScope, setTargetScope] = useState<'school' | 'classes'>('school');
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !subject || !dueDate) {
      alert('Please fill in all required fields');
      return;
    }

    if (targetScope === 'classes' && selectedClassIds.length === 0) {
      alert('Please select at least one class');
      return;
    }

    setLoading(true);

    try {
      // Create assignment
      const { data: assignment, error: assignmentError } = await supabase
        .from('school_homework_assignments')
        .insert({
          school_id: schoolId,
          class_id: targetScope === 'classes' && selectedClassIds.length === 1 ? selectedClassIds[0] : null,
          subject,
          title,
          description: description || null,
          due_date: dueDate,
          is_active: true,
        })
        .select()
        .single();

      if (assignmentError) throw assignmentError;

      // Create targets
      const targets = [];
      if (targetScope === 'school') {
        // Target all classes
        for (const cls of classes) {
          targets.push({
            assignment_id: assignment.id,
            class_id: cls.id,
            student_id: null,
            school_id: schoolId,
          });
        }
      } else {
        // Target selected classes
        for (const classId of selectedClassIds) {
          targets.push({
            assignment_id: assignment.id,
            class_id: classId,
            student_id: null,
            school_id: schoolId,
          });
        }
      }

      if (targets.length > 0) {
        const { error: targetsError } = await supabase
          .from('school_homework_targets')
          .insert(targets);

        if (targetsError) throw targetsError;
      }

      // Create pending submissions for all students in target classes
      const targetClassIds = targetScope === 'school' 
        ? classes.map(c => c.id)
        : selectedClassIds;

      const { data: students } = await supabase
        .from('school_students')
        .select('id')
        .in('class_id', targetClassIds)
        .ilike('status', 'active');

      if (students && students.length > 0) {
        const submissions = students.map(student => ({
          assignment_id: assignment.id,
          student_id: student.id,
          submitted_at: null,
          status: 'pending',
          score: null,
        }));

        await supabase
          .from('school_homework_submissions')
          .insert(submissions);
      }

      alert('Assignment created successfully!');
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Error creating assignment:', error);
      alert(`Failed to create assignment: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setSubject('');
    setDescription('');
    setDueDate('');
    setTargetScope('school');
    setSelectedClassIds([]);
    onClose();
  };

  const handleClassToggle = (classId: string) => {
    setSelectedClassIds(prev =>
      prev.includes(classId)
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    );
  };

  if (!isOpen) return null;

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Create Assignment</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Algebra Problem Set"
              />
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Mathematics"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Instructions for students..."
              />
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                min={today}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Target Scope */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Scope
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="school"
                    checked={targetScope === 'school'}
                    onChange={(e) => setTargetScope(e.target.value as 'school')}
                    className="mr-2"
                  />
                  <span>School-wide</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="classes"
                    checked={targetScope === 'classes'}
                    onChange={(e) => setTargetScope(e.target.value as 'classes')}
                    className="mr-2"
                  />
                  <span>Specific Classes</span>
                </label>
              </div>
            </div>

            {/* Class Selection */}
            {targetScope === 'classes' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Classes <span className="text-red-500">*</span>
                </label>
                <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
                  {classes.map((cls) => (
                    <label key={cls.id} className="flex items-center py-1 cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={selectedClassIds.includes(cls.id)}
                        onChange={() => handleClassToggle(cls.id)}
                        className="mr-2"
                      />
                      <span>{cls.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Assignment'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}

