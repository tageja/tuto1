'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import supabase from '../../lib/supabase';
import { fetchAssignmentDetail, fetchAssignmentSubmissions } from '../../lib/homework';
import type { HomeworkDetailDrawerProps } from './types';

export function HomeworkDetailDrawer({
  isOpen,
  onClose,
  assignmentId,
  schoolId,
  isAdmin,
  onUpdate,
}: HomeworkDetailDrawerProps) {
  const [loading, setLoading] = useState(true);
  const [assignment, setAssignment] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
const [submissionEdits, setSubmissionEdits] = useState<
  Record<string, { status: string; score: string; is_locked: boolean }>
>({});
  const [savingSubmissionId, setSavingSubmissionId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && assignmentId) {
      fetchData();
    }
  }, [isOpen, assignmentId]);

  const fetchData = async () => {
    if (!assignmentId) return;

    setLoading(true);
    try {
      const [assignmentData, submissionsData] = await Promise.all([
        fetchAssignmentDetail(assignmentId, supabase),
        fetchAssignmentSubmissions(assignmentId, supabase),
      ]);

      setAssignment(assignmentData);
      setSubmissions(submissionsData);
      const editMap: Record<string, { status: string; score: string }> = {};
      submissionsData.forEach((submission) => {
        editMap[submission.id] = {
          status: submission.status,
          score: submission.score !== null ? String(submission.score) : '',
          is_locked: submission.is_locked || false,
        };
      });
      setSubmissionEdits(editMap);
    } catch (error) {
      console.error('Error fetching assignment details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmissionFieldChange = (
    submissionId: string,
    field: 'status' | 'score',
    value: string
  ) => {
    setSubmissionEdits((prev) => ({
      ...prev,
      [submissionId]: {
        status: prev[submissionId]?.status ?? '',
        score: prev[submissionId]?.score ?? '',
        is_locked: prev[submissionId]?.is_locked ?? false,
        [field]: value,
      },
    }));
  };

  const handleSaveSubmission = async (submissionId: string) => {
    if (!isAdmin) return;
    const edit = submissionEdits[submissionId];
    if (!edit) return;
    if (edit.is_locked) return;

    const parsedScore =
      edit.score === '' ? null : Number(Number(edit.score).toFixed(2));

    if (parsedScore !== null && (isNaN(parsedScore) || parsedScore < 0 || parsedScore > 10)) {
      alert('Score must be a number between 0 and 10.');
      return;
    }

    setSavingSubmissionId(submissionId);
    try {
      const { error } = await supabase
        .from('school_homework_submissions')
        .update({
          status: edit.status || 'pending',
          score: parsedScore,
          is_locked: true,
        })
        .eq('id', submissionId);

      if (error) throw error;

      alert('Submission updated');
      fetchData();
      onUpdate();
    } catch (error: any) {
      console.error('Error updating submission:', error);
      alert(`Failed to update submission: ${error.message}`);
    } finally {
      setSavingSubmissionId(null);
    }
  };

  if (!isOpen || !assignmentId) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-end z-50">
      <div className="w-full md:w-1/2 lg:w-1/3 h-full md:h-auto md:max-h-[90vh] bg-white md:rounded-l-xl shadow-xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Assignment Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : assignment ? (
            <>
              {/* Assignment Info */}
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-3">{assignment.title}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subject:</span>
                    <span className="font-medium">{assignment.subject}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Due Date:</span>
                    <span className="font-medium">
                      {new Date(assignment.due_date).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Assigned:</span>
                    <span className="font-medium">
                      {new Date(assignment.assigned_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
                {assignment.description && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-600">Instructions:</p>
                    <p className="text-sm text-gray-900 mt-1">{assignment.description}</p>
                  </div>
                )}
              </Card>

              {/* Submissions */}
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Submissions ({submissions.length})
                </h3>
                <div className="space-y-2">
                  {submissions.length === 0 ? (
                    <Card className="p-4 text-center text-gray-500">
                      No submissions yet
                    </Card>
                  ) : (
                    submissions.map((submission) => {
                      const student = submission.student;
                      const editState = submissionEdits[submission.id] || {
                        status: submission.status,
                        score: submission.score !== null ? String(submission.score) : '',
                        is_locked: submission.is_locked || false,
                      };
                      const isLocked = editState.is_locked || submission.is_locked;

                      return (
                        <Card
                          key={submission.id}
                          className={`p-4 ${
                            submission.status === 'late' ? 'border-red-300 bg-red-50' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-medium text-gray-900">
                                {student.first_name} {student.last_name}
                              </p>
                              {student.student_number && (
                                <p className="text-xs text-gray-500">
                                  #{student.student_number}
                                </p>
                              )}
                            </div>
                            <span
                              className={`px-2 py-1 text-xs rounded-full font-medium ${
                                submission.status === 'graded'
                                  ? 'bg-green-100 text-green-700'
                                  : submission.status === 'submitted'
                                  ? 'bg-blue-100 text-blue-700'
                                  : submission.status === 'late'
                                  ? 'bg-red-100 text-red-700'
                                  : submission.status === 'incomplete'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <div>
                              {submission.submitted_at ? (
                                <p className="text-gray-600">
                                  Submitted:{' '}
                                  {new Date(submission.submitted_at).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </p>
                              ) : (
                                <p className="text-gray-500">Not submitted</p>
                              )}
                            </div>
                            {submission.score !== null && (
                              <span className="font-semibold text-blue-600">
                                {submission.score}/10
                              </span>
                            )}
                          </div>
                          {isAdmin && (
                            <div className="mt-4 space-y-3 border-t pt-3">
                              <div className="flex flex-col">
                                <label className="text-xs font-medium text-gray-600 mb-1">
                                  Submission Status
                                </label>
                                <select
                                  value={editState.status}
                                  onChange={(e) =>
                                    handleSubmissionFieldChange(
                                      submission.id,
                                      'status',
                                      e.target.value
                                    )
                                  }
                                  disabled={isLocked}
                                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                >
                                  {['submitted', 'late', 'incomplete', 'pending', 'graded'].map(
                                    (statusOption) => (
                                      <option key={statusOption} value={statusOption}>
                                        {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
                                      </option>
                                    )
                                  )}
                                </select>
                              </div>
                              <div className="flex flex-col">
                                <label className="text-xs font-medium text-gray-600 mb-1">
                                  Score (/10)
                                </label>
                                <input
                                  type="number"
                                  min={0}
                                  max={10}
                                  step={0.5}
                                  value={editState.score}
                                  onChange={(e) =>
                                    handleSubmissionFieldChange(
                                      submission.id,
                                      'score',
                                      e.target.value
                                    )
                                  }
                                  disabled={isLocked}
                                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                  placeholder="e.g. 8.5"
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                {isLocked && (
                                  <span className="text-xs text-gray-500">
                                    Finalized · editing disabled
                                  </span>
                                )}
                                {!isLocked && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleSaveSubmission(submission.id)}
                                    disabled={savingSubmissionId === submission.id}
                                  >
                                    {savingSubmissionId === submission.id ? 'Saving...' : 'Save'}
                                  </Button>
                                )}
                              </div>
                            </div>
                          )}
                        </Card>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Late Submissions Summary */}
              {isAdmin && submissions.some((s) => s.status === 'late') && (
                <Card className="p-4 bg-red-50 border-red-300">
                  <p className="text-sm font-medium text-red-900">
                    ⚠️ Late Submissions ({submissions.filter((s) => s.status === 'late').length})
                  </p>
                  <p className="text-xs text-red-700 mt-1">
                    These students submitted after the due date
                  </p>
                </Card>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Assignment not found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

