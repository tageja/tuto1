'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { X, Loader2, Paperclip } from 'lucide-react';
import { uploadMessageFiles } from '../../lib/supabase/storage';
import type { MessageAttachment, MessagePriority, ThreadSummary } from '../../lib/types/messages';

type TeacherOption = {
  id: string;
  name: string;
  email?: string;
  user_id?: string;
  subjects?: string[] | null;
};

type ParentOption = {
  id: string;
  name: string;
  email: string;
  user_id?: string | null;
};

type ClassOption = {
  id: string;
  name: string;
  grade?: string | null;
};

type ComposeModalProps = {
  open: boolean;
  onClose: () => void;
  variant: 'admin' | 'parent';
  schoolId: string;
  userAuthId: string;
  teacherOptions: TeacherOption[];
  parentOptions: ParentOption[];
  classOptions: ClassOption[];
  gradeOptions: string[];
  onThreadCreated?: (summary: ThreadSummary) => void;
  labels: {
    title: string;
    subject: string;
    priority: string;
    recipientsTeachers: string;
    recipientsParents: string;
    recipientsClasses: string;
    recipientsGrades: string;
    message: string;
    cancel: string;
    send: string;
    attachments: string;
    emptyTeachers: string;
    emptyParents: string;
    emptyClasses: string;
    emptyGrades: string;
    errorNoRecipients: string;
  };
  priorities: MessagePriority[];
  defaultPriority?: MessagePriority;
  onError?: (message: string) => void;
  onSuccess?: (message: string) => void;
};

export function ComposeModal({
  open,
  onClose,
  variant,
  schoolId,
  userAuthId,
  teacherOptions,
  parentOptions,
  classOptions,
  gradeOptions,
  onThreadCreated,
  labels,
  priorities,
  defaultPriority = 'Normal',
  onError,
  onSuccess,
}: ComposeModalProps) {
  const [threadId, setThreadId] = useState<string | null>(null);
  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState<MessagePriority>(defaultPriority);
  const [teacherSelections, setTeacherSelections] = useState<string[]>([]);
  const [parentSelections, setParentSelections] = useState<string[]>([]);
  const [classSelections, setClassSelections] = useState<string[]>([]);
  const [gradeSelections, setGradeSelections] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setThreadId(crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`);
      setSubject('');
      setPriority(defaultPriority);
      setTeacherSelections([]);
      setParentSelections([]);
      setClassSelections([]);
      setGradeSelections([]);
      setMessage('');
      setFiles([]);
    }
  }, [open, defaultPriority]);

  const { teacherUserIds, teacherContacts } = useMemo(() => {
    const selectedTeachers = teacherOptions.filter((teacher) => teacherSelections.includes(teacher.id));
    const userIds = selectedTeachers.map((teacher) => teacher.user_id).filter(Boolean) as string[];
    const contacts = selectedTeachers
      .filter((teacher) => !teacher.user_id && teacher.email)
      .map((teacher) => ({
        teacherId: teacher.id,
        email: teacher.email!.toLowerCase(),
        name: teacher.name,
      }));
    return { teacherUserIds: userIds, teacherContacts: contacts };
  }, [teacherOptions, teacherSelections]);

  const { parentUserIds, parentContacts } = useMemo(() => {
    const selectedParents = parentOptions.filter((parent) => parentSelections.includes(parent.id));
    const userIds = selectedParents.map((parent) => parent.user_id).filter(Boolean) as string[];
    const contacts = selectedParents
      .filter((parent) => !parent.user_id)
      .map((parent) => ({
        email: parent.email.toLowerCase(),
        name: parent.name,
      }));
    return { parentUserIds: userIds, parentContacts: contacts };
  }, [parentOptions, parentSelections]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files || []);
    if (selected.length) {
      setFiles((prev) => [...prev, ...selected]);
    }
    event.target.value = '';
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const hasRecipients =
    teacherSelections.length > 0 || 
    parentSelections.length > 0 || 
    classSelections.length > 0 || 
    gradeSelections.length > 0;

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      onError?.('Subject and message are required');
      return;
    }

    if (!hasRecipients) {
      onError?.(labels.errorNoRecipients);
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate fresh IDs for each submit attempt
      const freshThreadId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`;
      const freshMessageId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-msg`;

      let attachments: MessageAttachment[] = [];
      if (files.length) {
        attachments = await uploadMessageFiles({
          schoolId,
          threadId: freshThreadId,
          files,
        });
      }

      const payload = {
        schoolId,
        userAuthId,
        subject: subject.trim(),
        priority,
        messageBody: message.trim(),
        attachments,
        clientMessageId: freshMessageId,
        clientThreadId: freshThreadId,
        to: {
          userIds: [...teacherUserIds, ...parentUserIds],
          teacherContacts,
          parentContacts,
          classIds: classSelections,
          gradeLevels: gradeSelections,
        },
      };

      console.log('📤 Compose modal sending payload:', JSON.stringify(payload, null, 2));

      const response = await fetch('/api/school/messages/threads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.error('❌ Server responded with status:', response.status);
        let errorMessage = 'Failed to create thread';
        try {
          const responseText = await response.text();
          console.error('❌ Response body:', responseText);
          const errorJson = JSON.parse(responseText);
          console.error('❌ Parsed error:', errorJson);
          if (errorJson?.error) {
            errorMessage = errorJson.error;
          }
          if (errorJson?.details) {
            errorMessage += ` (${errorJson.details})`;
          }
        } catch (parseError) {
          console.error('❌ Could not parse error response:', parseError);
        }
        throw new Error(errorMessage);
      }

      const json = await response.json();
      console.log('✅ Thread created successfully:', json);
      
      if (json.success && json.data?.summary) {
        onThreadCreated?.(json.data.summary);
        onSuccess?.(labels.send + ' successful');
        onClose();
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error('ComposeModal submit error', error);
      onError?.(error?.message || 'Failed to send message');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <p className="text-lg font-semibold text-gray-900">{labels.title}</p>
            <p className="text-sm text-gray-500">{variant === 'admin' ? 'Admin' : 'Parent'}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-700 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">{labels.subject}</label>
              <input
                type="text"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">{labels.priority}</label>
              <select
                value={priority}
                onChange={(event) => setPriority(event.target.value as MessagePriority)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              >
                {priorities.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Recipients - Different options for Admin vs Parent */}
          {variant === 'admin' ? (
            /* Admin: Shows Classes, Grades, and Parents */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">
                  {labels.recipientsClasses}
                </label>
                {classOptions.length === 0 ? (
                  <p className="text-xs text-gray-400">{labels.emptyClasses}</p>
                ) : (
                  <select
                    multiple
                    value={classSelections}
                    onChange={(event) =>
                      setClassSelections(Array.from(event.target.selectedOptions).map((option) => option.value))
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm h-28 focus:ring-2 focus:ring-blue-500"
                  >
                    {classOptions.map((classItem) => (
                      <option key={classItem.id} value={classItem.id}>
                        {classItem.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">
                  {labels.recipientsGrades}
                </label>
                {gradeOptions.length === 0 ? (
                  <p className="text-xs text-gray-400">{labels.emptyGrades}</p>
                ) : (
                  <select
                    multiple
                    value={gradeSelections}
                    onChange={(event) =>
                      setGradeSelections(Array.from(event.target.selectedOptions).map((option) => option.value))
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm h-28 focus:ring-2 focus:ring-blue-500"
                  >
                    {gradeOptions.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">
                  {labels.recipientsParents}
                </label>
                {parentOptions.length === 0 ? (
                  <p className="text-xs text-gray-400">{labels.emptyParents}</p>
                ) : (
                  <select
                    multiple
                    value={parentSelections}
                    onChange={(event) =>
                      setParentSelections(Array.from(event.target.selectedOptions).map((option) => option.value))
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm h-28 focus:ring-2 focus:ring-blue-500"
                  >
                    {parentOptions.map((parent) => (
                      <option key={parent.id} value={parent.id}>
                        {parent.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          ) : (
            /* Parent: Shows only Teachers */
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">
                {labels.recipientsTeachers}
              </label>
              {teacherOptions.length === 0 ? (
                <p className="text-xs text-gray-400">{labels.emptyTeachers}</p>
              ) : (
                <select
                  multiple
                  value={teacherSelections}
                  onChange={(event) =>
                    setTeacherSelections(Array.from(event.target.selectedOptions).map((option) => option.value))
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm h-28 focus:ring-2 focus:ring-blue-500"
                >
                  {teacherOptions.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name || teacher.email}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">{labels.message}</label>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={6}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">{labels.attachments}</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg flex items-center gap-2 hover:bg-gray-50"
              >
                <Paperclip className="w-4 h-4" />
                {labels.attachments}
              </button>
              {files.length > 0 && (
                <span className="text-xs text-gray-500">{files.length} file(s) selected</span>
              )}
            </div>
            {files.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {files.map((file, index) => (
                  <span
                    key={`${file.name}-${index}`}
                    className="flex items-center gap-2 text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full"
                  >
                    {file.name}
                    <button
                      onClick={() => removeFile(index)}
                      className="p-0.5 rounded-full hover:bg-gray-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              multiple
              onChange={handleFileChange}
            />
          </div>
        </div>

        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
          >
            {labels.cancel}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg flex items-center gap-2 disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {labels.send}
              </>
            ) : (
              labels.send
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

