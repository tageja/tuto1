import { supabase } from '../../config/supabase';
import { getCurrentUser } from '../../config/supabase';
import type {
  Feedback,
  FeedbackWithMessages,
  FeedbackMessage,
  CreateFeedback,
  CreateFeedbackMessage,
} from '../../../packages/schemas/src/feedback';

// Helper to resolve school identifier (name or UUID) to UUID
async function resolveSchoolId(schoolIdentifier: string): Promise<string | null> {
  try {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(schoolIdentifier)) {
      return schoolIdentifier;
    }

    if (schoolIdentifier.startsWith('rec')) {
      const { data, error } = await supabase
        .from('schools')
        .select('id')
        .eq('name', 'Tuto Demo School')
        .single();

      if (error || !data) return null;
      return data.id;
    }

    const { data, error } = await supabase
      .from('schools')
      .select('id')
      .eq('name', schoolIdentifier)
      .single();

    if (error || !data) return null;
    return data.id;
  } catch (error) {
    console.error('Error resolving school ID:', error);
    return null;
  }
}

export type FeedbackFilters = {
  category?: 'request' | 'complaint' | 'information' | 'all';
  status?: 'open' | 'overdue' | 'closed' | 'all';
  search?: string;
  sortBy?: 'newest' | 'oldest' | 'deadline';
};

export type FeedbackItem = Feedback & {
  student_name: string | null;
  student_code: string | null;
  parent_name?: string | null;
};

/**
 * Fetch feedback for the authenticated parent (all their children in the school)
 * Mirrors /api/feedback/my
 */
export async function fetchMyFeedback(
  schoolId: string,
  filters: FeedbackFilters = {}
): Promise<FeedbackItem[]> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const resolvedSchoolId = await resolveSchoolId(schoolId);
    if (!resolvedSchoolId) throw new Error('Invalid school ID');

    // Get user profile to find parent_id
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, role')
      .eq('auth_user_id', user.id)
      .single();

    if (profileError || !userProfile) {
      throw new Error('User profile not found');
    }

    if (userProfile.role !== 'parent') {
      throw new Error('Only parents can view their feedback');
    }

    // Build query
    let query = supabase
      .from('feedbacks')
      .select(`
        id,
        code,
        category,
        title,
        description,
        status,
        deadline_at,
        created_at,
        updated_at,
        student_id,
        school_students!feedbacks_student_id_fkey (
          id,
          first_name,
          last_name,
          student_number
        )
      `)
      .eq('school_id', resolvedSchoolId)
      .eq('parent_id', userProfile.id);

    // Apply filters
    if (filters.category && filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }

    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    // Order by newest first
    query = query.order('created_at', { ascending: false });

    const { data: feedbacks, error: feedbackError } = await query;

    if (feedbackError) {
      console.error('Error fetching feedback:', feedbackError);
      throw feedbackError;
    }

    // Format response with student names
    const formattedFeedbacks: FeedbackItem[] = (feedbacks || []).map((fb: any) => ({
      id: fb.id,
      school_id: resolvedSchoolId,
      student_id: fb.student_id,
      parent_id: userProfile.id,
      code: fb.code,
      category: fb.category,
      title: fb.title,
      description: fb.description,
      status: fb.status,
      deadline_at: fb.deadline_at,
      created_at: fb.created_at,
      updated_at: fb.updated_at,
      student_name: fb.school_students
        ? `${fb.school_students.first_name} ${fb.school_students.last_name}`.trim()
        : null,
      student_code: fb.school_students?.student_number || null,
    }));

    return formattedFeedbacks;
  } catch (error) {
    console.error('Error in fetchMyFeedback:', error);
    return [];
  }
}

/**
 * Fetch all feedback for a school (admin view)
 * Mirrors /api/feedback/school
 */
export async function fetchSchoolFeedback(
  schoolId: string,
  filters: FeedbackFilters = {}
): Promise<FeedbackItem[]> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const resolvedSchoolId = await resolveSchoolId(schoolId);
    if (!resolvedSchoolId) throw new Error('Invalid school ID');

    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, role')
      .eq('auth_user_id', user.id)
      .single();

    if (profileError || !userProfile) {
      throw new Error('User profile not found');
    }

    // Check if user is admin
    if (userProfile.role !== 'admin' && userProfile.role !== 'school_admin') {
      throw new Error('Only admins can view school feedback');
    }

    // Build query
    let query = supabase
      .from('feedbacks')
      .select(`
        id,
        code,
        category,
        title,
        description,
        status,
        deadline_at,
        created_at,
        updated_at,
        student_id,
        parent_id,
        school_students!feedbacks_student_id_fkey (
          id,
          first_name,
          last_name,
          student_number
        ),
        users!feedbacks_parent_id_fkey (
          id,
          name
        )
      `)
      .eq('school_id', resolvedSchoolId);

    // Apply filters
    if (filters.category && filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }

    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    // Search filter (code or student name)
    if (filters.search) {
      query = query.or(
        `code.ilike.%${filters.search}%,school_students.first_name.ilike.%${filters.search}%,school_students.last_name.ilike.%${filters.search}%`
      );
    }

    // Sort
    if (filters.sortBy === 'oldest') {
      query = query.order('created_at', { ascending: true });
    } else if (filters.sortBy === 'deadline') {
      query = query.order('deadline_at', { ascending: true });
    } else {
      // Default: newest first
      query = query.order('created_at', { ascending: false });
    }

    const { data: feedbacks, error: feedbackError } = await query;

    if (feedbackError) {
      console.error('Error fetching feedback:', feedbackError);
      throw feedbackError;
    }

    // Format response
    const formattedFeedbacks: FeedbackItem[] = (feedbacks || []).map((fb: any) => ({
      id: fb.id,
      school_id: resolvedSchoolId,
      student_id: fb.student_id,
      parent_id: fb.parent_id,
      code: fb.code,
      category: fb.category,
      title: fb.title,
      description: fb.description,
      status: fb.status,
      deadline_at: fb.deadline_at,
      created_at: fb.created_at,
      updated_at: fb.updated_at,
      student_name: fb.school_students
        ? `${fb.school_students.first_name} ${fb.school_students.last_name}`.trim()
        : null,
      student_code: fb.school_students?.student_number || null,
      parent_name: fb.users?.name || null,
    }));

    return formattedFeedbacks;
  } catch (error) {
    console.error('Error in fetchSchoolFeedback:', error);
    return [];
  }
}

/**
 * Fetch feedback detail with messages (parent or admin)
 * Mirrors /api/feedback/my/[feedbackId] or /api/feedback/school/[feedbackId]
 */
export async function fetchFeedbackDetail(
  feedbackId: string,
  isAdmin: boolean = false
): Promise<FeedbackWithMessages | null> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, role')
      .eq('auth_user_id', user.id)
      .single();

    if (profileError || !userProfile) {
      throw new Error('User profile not found');
    }

    // Build feedback query with appropriate joins
    let feedbackQuery = supabase
      .from('feedbacks')
      .select(`
        *,
        school_students!feedbacks_student_id_fkey (
          id,
          first_name,
          last_name,
          student_number
        )
      `)
      .eq('id', feedbackId);

    // For admin, also get parent info
    if (isAdmin) {
      feedbackQuery = supabase
        .from('feedbacks')
        .select(`
          *,
          school_students!feedbacks_student_id_fkey (
            id,
            first_name,
            last_name,
            student_number
          ),
          users!feedbacks_parent_id_fkey (
            id,
            name,
            email
          )
        `)
        .eq('id', feedbackId);
    } else {
      // For parent, verify it's their feedback
      feedbackQuery = feedbackQuery.eq('parent_id', userProfile.id);
    }

    const { data: feedback, error: feedbackError } = await feedbackQuery.single();

    if (feedbackError || !feedback) {
      throw new Error('Feedback not found');
    }

    // Get all messages for this feedback
    const { data: messages, error: messagesError } = await supabase
      .from('feedback_messages')
      .select(`
        *,
        users!feedback_messages_sender_id_fkey (
          id,
          name
        )
      `)
      .eq('feedback_id', feedbackId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      // Continue without messages rather than failing
    }

    // Format response
    const formattedFeedback: FeedbackWithMessages = {
      ...(feedback as Feedback),
      student_name: feedback.school_students
        ? `${feedback.school_students.first_name} ${feedback.school_students.last_name}`.trim()
        : undefined,
      student_code: feedback.school_students?.student_number || undefined,
      parent_name: isAdmin && feedback.users ? feedback.users.name || undefined : undefined,
      messages: (messages || []).map((msg: any) => ({
        id: msg.id,
        feedback_id: msg.feedback_id,
        sender_role: msg.sender_role,
        sender_id: msg.sender_id,
        message: msg.message,
        created_at: msg.created_at,
        sender_name: msg.users?.name || null,
      })),
    };

    return formattedFeedback;
  } catch (error) {
    console.error('Error in fetchFeedbackDetail:', error);
    return null;
  }
}

/**
 * Create new feedback (parent only)
 * Mirrors /api/feedback/create
 */
export async function createFeedback(data: CreateFeedback): Promise<Feedback | null> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { schoolId: schoolIdentifier, studentId, category, title, description } = data;

    // Get user profile to find parent_id
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, role')
      .eq('auth_user_id', user.id)
      .single();

    if (profileError || !userProfile) {
      throw new Error('User profile not found');
    }

    if (userProfile.role !== 'parent') {
      throw new Error('Only parents can create feedback');
    }

    // Resolve school ID
    const schoolId = await resolveSchoolId(schoolIdentifier);
    if (!schoolId) {
      throw new Error('School not found');
    }

    // Verify student belongs to parent and school
    const { data: studentCheck } = await supabase
      .from('school_parent_students')
      .select('student_id')
      .eq('school_id', schoolId)
      .eq('parent_user_id', userProfile.id)
      .eq('student_id', studentId)
      .single();

    if (!studentCheck) {
      throw new Error('Student not found or not associated with parent');
    }

    // Calculate deadline (7 days from now)
    const deadlineAt = new Date();
    deadlineAt.setDate(deadlineAt.getDate() + 7);

    // Retry logic for code generation (handles race conditions)
    let feedback: Feedback | null = null;
    let attempts = 0;
    const maxAttempts = 3;

    while (!feedback && attempts < maxAttempts) {
      attempts++;

      // Generate feedback code
      const { data: codeData, error: codeError } = await supabase.rpc('get_feedback_code');
      if (codeError) {
        console.error('Error generating feedback code:', codeError);
        // Fallback to timestamp-based code if RPC fails
        const fallbackCode = `FB-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
        const { data: fallbackFeedback, error: fallbackError } = await supabase
          .from('feedbacks')
          .insert({
            school_id: schoolId,
            student_id: studentId,
            parent_id: userProfile.id,
            code: fallbackCode,
            category,
            title: title.trim(),
            description: description.trim(),
            status: 'open',
            deadline_at: deadlineAt.toISOString(),
          })
          .select()
          .single();

        if (!fallbackError && fallbackFeedback) {
          feedback = fallbackFeedback as Feedback;
          break;
        }
        throw new Error('Failed to generate feedback code');
      }

      const feedbackCode = codeData || `FB-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

      // Insert feedback
      const { data: insertedFeedback, error: insertError } = await supabase
        .from('feedbacks')
        .insert({
          school_id: schoolId,
          student_id: studentId,
          parent_id: userProfile.id,
          code: feedbackCode,
          category,
          title: title.trim(),
          description: description.trim(),
          status: 'open',
          deadline_at: deadlineAt.toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        // If it's a unique constraint violation on code, retry with a new code
        if (insertError.code === '23505' && insertError.message?.includes('code')) {
          console.warn(`Code collision detected (${feedbackCode}), retrying... (attempt ${attempts}/${maxAttempts})`);
          // Wait a bit before retrying to avoid immediate collision
          await new Promise((resolve) => setTimeout(resolve, 100 * attempts));
          continue;
        }
        console.error('Error creating feedback:', insertError);
        throw insertError;
      }

      if (insertedFeedback) {
        feedback = insertedFeedback as Feedback;
        break;
      }
    }

    if (!feedback) {
      throw new Error('Failed to create feedback after multiple attempts');
    }

    return feedback as Feedback;
  } catch (error) {
    console.error('Error in createFeedback:', error);
    throw error;
  }
}

/**
 * Update feedback status (mark as closed)
 * Mirrors /api/feedback/[feedbackId]/status
 */
export async function updateFeedbackStatus(
  feedbackId: string,
  status: 'closed'
): Promise<Feedback | null> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, role')
      .eq('auth_user_id', user.id)
      .single();

    if (profileError || !userProfile) {
      throw new Error('User profile not found');
    }

    // Get feedback to verify access
    const { data: feedback, error: feedbackError } = await supabase
      .from('feedbacks')
      .select('id, parent_id, school_id, status')
      .eq('id', feedbackId)
      .single();

    if (feedbackError || !feedback) {
      throw new Error('Feedback not found');
    }

    // Verify access: parent can close their own feedback, admin can close any feedback in their school
    const isParent = userProfile.role === 'parent' && feedback.parent_id === userProfile.id;
    const isAdmin = userProfile.role === 'admin' || userProfile.role === 'school_admin';

    if (!isParent && !isAdmin) {
      throw new Error('Access denied');
    }

    // Update status
    const { data: updatedFeedback, error: updateError } = await supabase
      .from('feedbacks')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', feedbackId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating feedback status:', updateError);
      throw updateError;
    }

    return updatedFeedback as Feedback;
  } catch (error) {
    console.error('Error in updateFeedbackStatus:', error);
    throw error;
  }
}

/**
 * Add a message to feedback conversation
 * Mirrors /api/feedback/[feedbackId]/reply
 */
export async function addFeedbackMessage(
  feedbackId: string,
  message: string
): Promise<FeedbackMessage | null> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, role')
      .eq('auth_user_id', user.id)
      .single();

    if (profileError || !userProfile) {
      throw new Error('User profile not found');
    }

    // Get feedback to verify access
    const { data: feedback, error: feedbackError } = await supabase
      .from('feedbacks')
      .select('id, parent_id, school_id, status')
      .eq('id', feedbackId)
      .single();

    if (feedbackError || !feedback) {
      throw new Error('Feedback not found');
    }

    // Determine sender role and verify access
    let senderRole: 'parent' | 'admin';
    if (userProfile.role === 'admin' || userProfile.role === 'school_admin') {
      senderRole = 'admin';
    } else if (userProfile.role === 'parent' && feedback.parent_id === userProfile.id) {
      senderRole = 'parent';
    } else {
      throw new Error('Access denied');
    }

    // Insert message
    const { data: newMessage, error: insertError } = await supabase
      .from('feedback_messages')
      .insert({
        feedback_id: feedbackId,
        sender_role: senderRole,
        sender_id: userProfile.id,
        message: message.trim(),
      })
      .select(`
        *,
        users!feedback_messages_sender_id_fkey (
          id,
          name
        )
      `)
      .single();

    if (insertError) {
      console.error('Error creating message:', insertError);
      throw insertError;
    }

    // Format response
    const formattedMessage: FeedbackMessage = {
      id: newMessage.id,
      feedback_id: newMessage.feedback_id,
      sender_role: newMessage.sender_role,
      sender_id: newMessage.sender_id,
      message: newMessage.message,
      created_at: newMessage.created_at,
    };

    return formattedMessage;
  } catch (error) {
    console.error('Error in addFeedbackMessage:', error);
    throw error;
  }
}

/**
 * Fetch students for a parent in a school
 */
export async function fetchParentStudents(schoolId: string): Promise<
  Array<{
    id: string;
    first_name: string;
    last_name: string;
    student_number: string | null;
    full_name: string;
  }>
> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const resolvedSchoolId = await resolveSchoolId(schoolId);
    if (!resolvedSchoolId) throw new Error('Invalid school ID');

    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, role')
      .eq('auth_user_id', user.id)
      .single();

    if (profileError || !userProfile) {
      throw new Error('User profile not found');
    }

    // Get students linked to this parent in this school
    const { data: students, error: studentsError } = await supabase
      .from('school_parent_students')
      .select(
        `
        student_id,
        school_students!school_parent_students_student_id_fkey (
          id,
          first_name,
          last_name,
          student_number,
          status
        )
      `
      )
      .eq('school_id', resolvedSchoolId)
      .eq('parent_user_id', userProfile.id);

    if (studentsError) {
      throw studentsError;
    }

    // Format response - filter by student status and map
    return (students || [])
      .map((item: any) => {
        const student = item.school_students;
        if (!student) return null;
        // Only include active students
        if (student.status && student.status.toLowerCase() !== 'active') {
          return null;
        }
        return {
          id: student.id,
          first_name: student.first_name,
          last_name: student.last_name,
          student_number: student.student_number,
          full_name: `${student.first_name} ${student.last_name}`.trim(),
        };
      })
      .filter(Boolean) as Array<{
      id: string;
      first_name: string;
      last_name: string;
      student_number: string | null;
      full_name: string;
    }>;
  } catch (error) {
    console.error('Error in fetchParentStudents:', error);
    return [];
  }
}

