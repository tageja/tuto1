/**
 * Alias table for auto-mapping school CSV/Excel columns to our schema.
 * Key = our target field, Value = array of possible source column names (case-insensitive match).
 */
import type { ImportEntity } from './types';

export const COLUMN_ALIASES: Record<ImportEntity, Record<string, string[]>> = {
  teachers: {
    name: ['Teacher Name', 'Name', 'Full Name', 'Tên', 'Họ tên', 'Teacher'],
    email: ['Email', 'E-mail', 'Email Address', 'Địa chỉ email'],
    phone: ['Phone', 'Phone Number', 'Tel', 'Mobile', 'Số điện thoại', 'Điện thoại'],
    subjects: ['Subjects', 'Subject', 'Môn học', 'Subjects Taught'],
    qualifications: ['Qualifications', 'Qualification', 'Bằng cấp', 'Education'],
    hire_date: ['Hire Date', 'Start Date', 'Joined', 'Ngày vào làm', 'Date of Hire'],
  },
  classes: {
    name: ['Class Name', 'Name', 'Class', 'Lớp', 'Tên lớp'],
    grade_level: ['Grade Level', 'Grade', 'Level', 'Khối', 'Lớp học'],
    academic_year: ['Academic Year', 'Year', 'Năm học', 'School Year'],
    teacher_id: ['Teacher', 'Teacher Name', 'Homeroom Teacher', 'Giáo viên', 'Class Teacher'],
    room_number: ['Room Number', 'Room', 'Phòng', 'Room No'],
    capacity: ['Capacity', 'Max Students', 'Sĩ số', 'Student Capacity'],
  },
  students: {
    first_name: ['First Name', 'Given Name', 'Tên', 'Tên riêng', 'Student First Name'],
    last_name: ['Last Name', 'Family Name', 'Surname', 'Họ', 'Họ và tên đệm', 'Student Last Name'],
    student_number: ['Student ID', 'Student Number', 'ID', 'Mã học sinh', 'Student Code', 'Roll No'],
    class_id: ['Class', 'Class Name', 'Lớp', 'Class ID', 'Tên lớp'],
    date_of_birth: ['Date of Birth', 'DOB', 'Birth Date', 'Ngày sinh', 'Birthday'],
    gender: ['Gender', 'Sex', 'Giới tính', 'M/F'],
    parent_name: ['Parent Name', 'Guardian Name', 'Parent', 'Tên phụ huynh', 'Guardian'],
    parent_email: [
      'Parent Email',
      'Guardian Email',
      "Parent's Email",
      'Email of Parent',
      'Guardian Email Address',
      'Email phụ huynh',
      'Địa chỉ email phụ huynh',
    ],
    parent_phone: [
      'Parent Phone',
      'Guardian Phone',
      "Parent's Phone",
      'Contact Phone',
      'Số điện thoại phụ huynh',
      'Điện thoại phụ huynh',
    ],
    address: ['Address', 'Địa chỉ', 'Home Address', 'Residence'],
  },
};

/** Normalize header for matching (trim, lowercase) */
export function normalizeHeader(header: string): string {
  return header.trim().toLowerCase();
}

/** Find target field for a source column using aliases */
export function findTargetField(
  sourceColumn: string,
  entity: ImportEntity
): string | null {
  const normalized = normalizeHeader(sourceColumn);
  const aliases = COLUMN_ALIASES[entity];

  for (const [targetField, possibleNames] of Object.entries(aliases)) {
    const match = possibleNames.some(
      (name) => normalizeHeader(name) === normalized
    );
    if (match) return targetField;
  }
  return null;
}
