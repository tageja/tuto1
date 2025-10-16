// AUTO-GENERATED. Do not edit.
// Base: app34330Do0nm4qvM  Generated: 2025-10-08T08:24:22.304Z

export type TableName =
  | "Teachers"
  | "Institutes"
  | "Students"
  | "Student Performance Records"
  | "Courses"
  | "Assignments"
  | "Attendance Records"
  | "Class Schedules"
  | "Booking"
  | "TestTableScript"
  | "Subjects"
  | "Parents"
  | "Bookings"
  | "Reviews"
  | "Payments"
  | "Homework"
  | "Posts"
  | "TutoTeachers"
  | "TutoStudents"
  | "TutoParents"
  | "TutoSubjects"
  | "TutoBookings"
  | "TutoReviews"
  | "TutoPayments"
  | "TutoHomework"
  | "TutoPosts"
  | "TutoComments"
  | "ConsentTemplates"
  | "Users"
  | "GuardianStudentLinks"
  | "InviteCodes"
  | "ConsentRecords"
  | "Providers"
  | "StudentProfiles"
  | "Favorites"
  | "TutoSchools"
  | "TutoSchoolInvitations"
  | "TutoSchoolClasses"
  | "TutoSchoolStudents"
  | "TutoSchoolTeachers"
  | "TutoDailyActivities"
  | "TutoMessages"
  | "TutoAbsenceRequests"
  | "TutoAnnouncements"
  | "TutoHealthRecords"
  | "TutoMedicineReminders"
  | "TutoPhotoAlbums"
  | "TutoExtracurricularActivities"
  | "TutoSurveys"
  | "TutoSchoolPayments"
  | "TutoSubscriptions"
  | "TutoSchoolEvents"
  | "TutoHomeworkAssignments"
  | "TutoProgressReports"
  | "TutoAttendanceRecords"
  | "TutoSchoolProgressReports"
  | "TutoSchoolProgressSubjects"
  | "TutoClassSubjects"
  | "TutoStudentSubjectOverrides";

export type FieldsOf_Teachers = "Teacher Name" | "Qualifications" | "Subjects Taught" | "Availability" | "Profile Photo" | "Institute" | "Contact Information" | "Students" | "Rating" | "Fee" | "Distance" | "Course 1" | "Course 2" | "Institute Name" | "Booking";
export type FieldsOf_Institutes = "Institute Name" | "Location" | "Courses Offered" | "Contact Details" | "Institute Photo" | "Teachers" | "Students" | "Courses" | "Teachers 2" | "Teachers 3";
export type FieldsOf_Students = "Student ID" | "First Name" | "Last Name" | "Date of Birth" | "Email" | "Phone Number" | "Profile Photo" | "Enrolled Courses" | "Address" | "Emergency Contact" | "Teacher" | "Performance Records" | "Attendance Records" | "Assignments" | "Class Schedules" | "Parents";
export type FieldsOf_Student_Performance_Records = "Course" | "Student" | "Subject" | "Grade" | "Feedback" | "Progress Report Date" | "Performance Photo";
export type FieldsOf_Courses = "Course Name" | "Course Duration" | "Syllabus" | "Schedule" | "Instructor" | "Institute" | "Course Materials" | "Attendance Records" | "Assignments" | "Teachers";
export type FieldsOf_Assignments = "Assignment Title" | "Due Date" | "Submission Status" | "Course" | "Student" | "Grade" | "Feedback";
export type FieldsOf_Attendance_Records = "Name" | "Attendance Date" | "Student" | "Course" | "Presence Status" | "Excused Absence" | "Notes";
export type FieldsOf_Class_Schedules = "Class Name" | "Teacher" | "Students" | "Start Time" | "End Time" | "Location" | "Recurring" | "Classroom Resources" | "Special Notes" | "Courses";
export type FieldsOf_Booking = "Name" | "Grade" | "Age" | "Adress" | "Preferred Days" | "Trial Lesson Date" | "Phone number" | "Email" | "Teacher Name" | "Teacher Name (from Teacher Name)";
export type FieldsOf_TestTableScript = "Column1" | "Column2" | "NewColumnTest";
export type FieldsOf_Subjects = "Name" | "Name Vietnamese" | "Icon" | "Category" | "Description" | "Description Vietnamese" | "Color" | "Status";
export type FieldsOf_Parents = "Name" | "Email" | "Phone" | "Address" | "Children" | "Payment Method" | "Status";
export type FieldsOf_Bookings = "Student ID" | "Teacher ID" | "Parent ID" | "Subject" | "Date" | "Time" | "Duration" | "Status" | "Notes" | "Payment Status" | "Created At";
export type FieldsOf_Reviews = "Teacher ID" | "Student ID" | "Rating" | "Comment" | "Created At";
export type FieldsOf_Payments = "Booking ID" | "Amount" | "Currency" | "Status" | "Payment Method" | "Transaction ID" | "Created At";
export type FieldsOf_Homework = "Student ID" | "Teacher ID" | "Subject" | "Title" | "Description" | "Due Date" | "Status" | "Adaptive Level" | "Created At";
export type FieldsOf_Posts = "Author ID" | "Author Name" | "Author Role" | "Author Avatar" | "Content Text" | "Content Media Type" | "Content Media URL" | "Content Media Thumbnail" | "Post Type" | "Subjects" | "Timestamp" | "Likes Count" | "Comments Count" | "Shares Count" | "Saves Count" | "Privacy" | "Status";
export type FieldsOf_TutoTeachers = "Name" | "Email" | "Phone" | "Avatar" | "Subjects" | "Qualifications" | "Experience" | "Hourly Rate" | "Rating" | "Review Count" | "Location Address" | "Latitude" | "Longitude" | "Availability Days" | "Availability Time Slots" | "Languages" | "Description" | "Status" | "ID" | "Location" | "Availability";
export type FieldsOf_TutoStudents = "Name" | "Age" | "Grade" | "Parent ID" | "Subjects of Interest" | "Address" | "Phone" | "Email" | "Status" | "ID";
export type FieldsOf_TutoParents = "Name" | "Email" | "Phone" | "Address" | "Payment Method" | "Status" | "Password Hash" | "ID" | "Children";
export type FieldsOf_TutoSubjects = "Name" | "Name Vietnamese" | "Icon" | "Category" | "Description" | "Description Vietnamese" | "Color" | "Status" | "ID" | "Name (Vietnamese)";
export type FieldsOf_TutoBookings = "Student ID" | "Teacher ID" | "Parent ID" | "Subject" | "Date" | "Time" | "Duration" | "Status" | "Notes" | "Payment Status" | "Created At" | "ID";
export type FieldsOf_TutoReviews = "Teacher ID" | "Student ID" | "Rating" | "Comment" | "Created At" | "ID";
export type FieldsOf_TutoPayments = "Booking ID" | "Amount" | "Currency" | "Status" | "Payment Method" | "Transaction ID" | "Created At" | "ID";
export type FieldsOf_TutoHomework = "Student ID" | "Teacher ID" | "Subject" | "Title" | "Description" | "Due Date" | "Status" | "Adaptive Level" | "Created At" | "ID";
export type FieldsOf_TutoPosts = "Author ID" | "Author Name" | "Author Role" | "Author Avatar" | "Content Text" | "Content Media Type" | "Content Media URL" | "Content Media Thumbnail" | "Post Type" | "Subjects" | "Timestamp" | "Likes Count" | "Comments Count" | "Shares Count" | "Saves Count" | "Privacy" | "Status" | "ID" | "Is Liked" | "Is Saved" | "Created At";
export type FieldsOf_TutoComments = "ID" | "Post ID" | "Author ID" | "Author Name" | "Content" | "Created At";
export type FieldsOf_ConsentTemplates = "Template ID" | "Title" | "Version" | "Active";
export type FieldsOf_Users = "UID" | "Email" | "Name" | "Role" | "PhotoURL" | "Created At";
export type FieldsOf_GuardianStudentLinks = "Guardian UID" | "Student ID" | "Status" | "Method" | "Invite Code" | "QR Token" | "Created At" | "Approved At";
export type FieldsOf_InviteCodes = "Code" | "Student ID" | "Issued By UID" | "Expires At" | "Used" | "Used At";
export type FieldsOf_ConsentRecords = "Record ID" | "Template ID" | "Guardian UID" | "Student ID" | "Signature Path" | "Signed At" | "Status";
export type FieldsOf_Providers = "type" | "displayName" | "subjects" | "priceMin" | "priceMax" | "currency" | "rating" | "ratingCount" | "lat" | "lng" | "addressLine" | "city" | "district" | "modalities.online" | "modalities.in_person" | "bio" | "photos" | "availability" | "createdAt";
export type FieldsOf_StudentProfiles = "guardianUserId" | "fullName" | "grade" | "yearOfBirth" | "notes" | "createdAt";
export type FieldsOf_Favorites = "userId" | "providerId" | "createdAt";
export type FieldsOf_TutoSchools = "School Name" | "School Code" | "Address" | "Phone" | "Email" | "Website" | "Principal Name" | "Principal Email" | "Principal Phone" | "School Type" | "Grade Levels" | "Student Count" | "Teacher Count" | "Founded Year" | "Status" | "Created Date" | "Updated Date";
export type FieldsOf_TutoSchoolInvitations = "Invitation Code" | "School Name" | "Created By" | "Created Date" | "Expiry Date" | "Max Uses" | "Current Uses" | "Status" | "Used By";
export type FieldsOf_TutoSchoolClasses = "Class Name" | "School Name" | "Grade Level" | "Academic Year" | "Student Count" | "Schedule" | "Room Number" | "Status" | "Created Date";
export type FieldsOf_TutoSchoolStudents = "Student Name" | "School Name" | "Class Name" | "Student ID" | "Date of Birth" | "Gender" | "Grade Level" | "Parent Name" | "Parent Email" | "Parent Phone" | "Address" | "Emergency Contact" | "Emergency Phone" | "Medical Notes" | "Status" | "Enrollment Date" | "Created Date";
export type FieldsOf_TutoSchoolTeachers = "Teacher Name" | "School Name" | "Email" | "Phone" | "Position" | "Subjects" | "Grade Levels" | "Experience Years" | "Education" | "Bio" | "Status" | "Hire Date" | "Created Date";
export type FieldsOf_TutoDailyActivities = "Activity Title" | "School Name" | "Class Name" | "Date" | "Activity Type" | "Description" | "Location" | "Start Time" | "End Time" | "Students Present" | "Notes" | "Status" | "Created Date";
export type FieldsOf_TutoMessages = "Message Subject" | "School Name" | "From User" | "From Role" | "To User" | "To Role" | "Message Content" | "Priority" | "Status" | "Sent Date" | "Read Date" | "Created Date";
export type FieldsOf_TutoAbsenceRequests = "Request ID" | "School Name" | "Student Name" | "Parent Name" | "Request Type" | "Start Date" | "End Date" | "Reason" | "Status" | "Approved By" | "Approval Date" | "Notes" | "Created Date";
export type FieldsOf_TutoAnnouncements = "Announcement Title" | "School Name" | "Content" | "Category" | "Target Audience" | "Priority" | "Publish Date" | "Expiry Date" | "Author" | "Status" | "Created Date";
export type FieldsOf_TutoHealthRecords = "Record ID" | "School Name" | "Student Name" | "Record Type" | "Date" | "Description" | "Doctor Name" | "Hospital/Clinic" | "Allergies" | "Medications" | "Emergency Contact" | "Emergency Phone" | "Notes" | "Created Date";
export type FieldsOf_TutoMedicineReminders = "Reminder ID" | "School Name" | "Student Name" | "Medicine Name" | "Dosage" | "Frequency" | "Time" | "Start Date" | "End Date" | "Instructions" | "Administered By" | "Status" | "Notes" | "Created Date";
export type FieldsOf_TutoPhotoAlbums = "Album Title" | "School Name" | "Event Type" | "Date" | "Description" | "Class Name" | "Privacy" | "Status" | "Created Date";
export type FieldsOf_TutoExtracurricularActivities = "Activity Name" | "School Name" | "Activity Type" | "Description" | "Schedule" | "Location" | "Max Students" | "Current Students" | "Grade Levels" | "Fee" | "Status" | "Start Date" | "End Date" | "Created Date" | "Name";
export type FieldsOf_TutoSurveys = "Survey Title" | "School Name" | "Survey Type" | "Description" | "Questions" | "Target Audience" | "Start Date" | "End Date" | "Responses" | "Status" | "Created By" | "Created Date";
export type FieldsOf_TutoSchoolPayments = "Payment ID" | "School Name" | "Student Name" | "Parent Name" | "Payment Type" | "Amount" | "Due Date" | "Payment Date" | "Payment Method" | "Status" | "Notes" | "Created Date";
export type FieldsOf_TutoSubscriptions = "Subscription ID" | "School Name" | "Plan Name" | "Features" | "Monthly Price" | "Annual Price" | "Start Date" | "End Date" | "Status" | "Payment Status" | "Next Billing Date" | "Notes" | "Created Date";
export type FieldsOf_TutoSchoolEvents = "Event Title" | "School Name" | "Event Type" | "Description" | "Start Date" | "End Date" | "Start Time" | "End Time" | "Location" | "Organizer" | "Target Audience" | "Registration Required" | "Max Attendees" | "Current Attendees" | "Status" | "Created Date";
export type FieldsOf_TutoHomeworkAssignments = "Assignment Title" | "School Name" | "Class Name" | "Subject" | "Description" | "Due Date" | "Total Students" | "Submitted Count" | "Status" | "Created Date";
export type FieldsOf_TutoProgressReports = "Report ID" | "School Name" | "Student Name" | "Class Name" | "Academic Year" | "Term" | "Subject" | "Grade" | "Percentage" | "Teacher Comments" | "Parent Comments" | "Report Date" | "Status" | "Created Date";
export type FieldsOf_TutoAttendanceRecords = "Record ID" | "School Name" | "Class Name" | "Date" | "Student Name" | "Status" | "Arrival Time" | "Departure Time" | "Notes" | "Recorded By" | "Created Date";
export type FieldsOf_TutoSchoolProgressReports = "Name" | "School Name" | "Student Name" | "Subject" | "Grade" | "Term" | "Percentage" | "Report Date";
export type FieldsOf_TutoSchoolProgressSubjects = "Name" | "School Name" | "Subject" | "Current Percentage" | "Previous Percentage" | "Updated At";
export type FieldsOf_TutoClassSubjects = "Name" | "School Name" | "Class Name" | "Subject" | "Enabled";
export type FieldsOf_TutoStudentSubjectOverrides = "Name" | "School Name" | "Student Name" | "Subject" | "Enabled";
