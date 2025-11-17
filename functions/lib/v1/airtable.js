"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.airtableService = void 0;
const airtable_1 = __importDefault(require("airtable"));
// Lazy initialization to avoid runtime errors during deployment
let _airtableBase = null;
function getAirtable() {
    if (!_airtableBase) {
        if (!process.env.AIRTABLE_PAT) {
            throw new Error('AIRTABLE_PAT environment variable is not set');
        }
        if (!process.env.AIRTABLE_BASE_ID) {
            throw new Error('AIRTABLE_BASE_ID environment variable is not set');
        }
        _airtableBase = new airtable_1.default({
            apiKey: process.env.AIRTABLE_PAT
        }).base(process.env.AIRTABLE_BASE_ID);
    }
    return _airtableBase;
}
exports.airtableService = {
    // ═══════════════════════════════════════════════════════════════════════
    // TEACHERS - School Dashboard
    // ═══════════════════════════════════════════════════════════════════════
    async getSchoolTeachers(schoolId, filters) {
        const page = filters?.page || 1;
        const limit = filters?.limit || 20;
        const offset = (page - 1) * limit;
        // If parent email provided, filter by children's classes
        let teacherNames = null;
        if (filters?.parentEmail) {
            try {
                // Get student's classes taught by teachers
                const students = await getAirtable()('TutoSchoolStudents')
                    .select({
                    filterByFormula: `AND({School Name} = "${schoolId}", {Parent Email} = "${filters.parentEmail}")`,
                    fields: ['Class Name']
                })
                    .all();
                if (students.length > 0) {
                    const classNames = [...new Set(students.map(s => s.fields['Class Name']).filter(Boolean))];
                    if (classNames.length > 0) {
                        // Get teachers for these classes
                        // Note: This assumes there's a way to link teachers to classes
                        // For now, we'll return all active teachers as a fallback
                        teacherNames = []; // Will be populated when class-teacher linking is implemented
                    }
                }
                else {
                    // No students found for this parent
                    return {
                        records: [],
                        total: 0,
                        hasMore: false
                    };
                }
            }
            catch (error) {
                console.error('Error filtering teachers by parent:', error);
                // Fallback to showing all active teachers
            }
        }
        // Build filter formula
        const filterParts = [`{School Name} = "${schoolId}"`];
        if (filters?.status) {
            filterParts.push(`{Status} = "${filters.status}"`);
        }
        if (filters?.subject) {
            filterParts.push(`FIND("${filters.subject}", {Subjects})`);
        }
        if (filters?.q) {
            filterParts.push(`SEARCH(LOWER("${filters.q}"), LOWER({Teacher Name}))`);
        }
        // If parent filtering resulted in specific teacher names, add that constraint
        if (teacherNames && teacherNames.length > 0) {
            const teacherNamesFilter = teacherNames.map(name => `{Teacher Name} = "${name}"`).join(', ');
            filterParts.push(`OR(${teacherNamesFilter})`);
        }
        const filterFormula = filterParts.length > 1
            ? `AND(${filterParts.join(', ')})`
            : filterParts[0];
        const records = await getAirtable()('TutoSchoolTeachers')
            .select({
            filterByFormula: filterFormula,
            maxRecords: limit + 1, // Fetch one extra to check if there are more
            sort: [{ field: 'Teacher Name', direction: 'asc' }]
        })
            .all();
        const hasMore = records.length > limit;
        const resultRecords = records.slice(0, limit);
        return {
            records: resultRecords.map((record) => ({
                id: record.id,
                fields: record.fields
            })),
            total: resultRecords.length, // Note: Airtable doesn't provide total count easily
            hasMore
        };
    },
    async getSchoolTeacherById(teacherId) {
        try {
            const record = await getAirtable()('TutoSchoolTeachers').find(teacherId);
            return {
                id: record.id,
                fields: record.fields
            };
        }
        catch (error) {
            return null;
        }
    },
    async createSchoolTeacher(data) {
        const record = await getAirtable()('TutoSchoolTeachers').create({
            ...data,
            'Created Date': new Date().toISOString().split('T')[0],
            Status: data.Status || 'Active'
        });
        return {
            id: record.id,
            fields: record.fields
        };
    },
    async updateSchoolTeacher(id, data) {
        const record = await getAirtable()('TutoSchoolTeachers').update(id, data);
        return {
            id: record.id,
            fields: record.fields
        };
    },
    async getTeacherAttendance(teacherName, schoolId, days) {
        const daysAgo = days || 90;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysAgo);
        const startDateStr = startDate.toISOString().split('T')[0];
        const filterFormula = `AND({Teacher Name} = "${teacherName}", {School Name} = "${schoolId}", IS_AFTER({Date}, "${startDateStr}"))`;
        const records = await getAirtable()('TutoSchoolTeacherAttendance')
            .select({
            filterByFormula: filterFormula,
            sort: [{ field: 'Date', direction: 'desc' }]
        })
            .all()
            .catch(() => []);
        return records.map((record) => ({
            id: record.id,
            fields: record.fields
        }));
    },
    async getTeacherFeedback(teacherName, schoolId, limit) {
        const filterFormula = `AND({Teacher Name} = "${teacherName}", {School Name} = "${schoolId}", {Status} = "Active")`;
        const records = await getAirtable()('TutoSchoolFeedback')
            .select({
            filterByFormula: filterFormula,
            maxRecords: limit || 50,
            sort: [{ field: 'Created At', direction: 'desc' }]
        })
            .all()
            .catch(() => []);
        return records.map((record) => ({
            id: record.id,
            fields: record.fields
        }));
    },
    async getTeachingHours(teacherName, schoolId, weeks) {
        const weeksAgo = weeks || 12;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - (weeksAgo * 7));
        const startDateStr = startDate.toISOString().split('T')[0];
        const filterFormula = `AND({Teacher Name} = "${teacherName}", {School Name} = "${schoolId}", IS_AFTER({Week Of}, "${startDateStr}"))`;
        const records = await getAirtable()('TutoSchoolTeachingHours')
            .select({
            filterByFormula: filterFormula,
            sort: [{ field: 'Week Of', direction: 'desc' }]
        })
            .all()
            .catch(() => []);
        return records.map((record) => ({
            id: record.id,
            fields: record.fields
        }));
    },
    async getTeacherKPIs(schoolId) {
        const records = await getAirtable()('TutoSchoolTeachers')
            .select({
            filterByFormula: `{School Name} = "${schoolId}"`,
            fields: ['Status', 'Rating']
        })
            .all();
        const total = records.length;
        const active = records.filter((r) => r.fields.Status === 'Active').length;
        const onLeave = records.filter((r) => r.fields.Status === 'On Leave').length;
        const ratingsArr = records
            .map((r) => r.fields.Rating)
            .filter((r) => typeof r === 'number' && r > 0);
        const avgRating = ratingsArr.length > 0
            ? ratingsArr.reduce((sum, r) => sum + r, 0) / ratingsArr.length
            : 0;
        return {
            total,
            active,
            onLeave,
            avgRating: Math.round(avgRating * 10) / 10
        };
    },
    // ═══════════════════════════════════════════════════════════════════════
    // LEGACY TEACHERS (for backward compatibility)
    // ═══════════════════════════════════════════════════════════════════════
    async getTeachers(schoolId) {
        const records = await getAirtable()('TutoTeachers')
            .select({
            filterByFormula: `{School ID} = "${schoolId}"`
        })
            .all();
        return records.map((record) => ({
            id: record.id,
            fields: record.fields
        }));
    },
    async createTeacher(data) {
        const record = await getAirtable()('TutoTeachers').create(data);
        return {
            id: record.id,
            fields: record.fields
        };
    },
    async updateTeacher(id, data) {
        const record = await getAirtable()('TutoTeachers').update(id, data);
        return {
            id: record.id,
            fields: record.fields
        };
    },
    // ═══════════════════════════════════════════════════════════════════════
    // CLASSES - School Dashboard
    // ═══════════════════════════════════════════════════════════════════════
    async getSchoolClasses(schoolId, filters) {
        const filterParts = [`{School Name} = "${schoolId}"`];
        if (filters?.grade) {
            filterParts.push(`{Grade Level} = "${filters.grade}"`);
        }
        if (filters?.search) {
            filterParts.push(`SEARCH(LOWER("${filters.search}"), LOWER({Class Name}))`);
        }
        const filterFormula = filterParts.length > 1 ? `AND(${filterParts.join(', ')})` : filterParts[0];
        const records = await getAirtable()('TutoSchoolClasses')
            .select({ filterByFormula: filterFormula })
            .all();
        return records.map((record) => ({
            id: record.id,
            fields: record.fields
        }));
    },
    async getSchoolClassById(classId) {
        try {
            const record = await getAirtable()('TutoSchoolClasses').find(classId);
            return {
                id: record.id,
                fields: record.fields
            };
        }
        catch (error) {
            return null;
        }
    },
    async getDistinctGrades(schoolId) {
        try {
            const records = await getAirtable()('TutoSchoolClasses')
                .select({
                filterByFormula: `{School Name} = "${schoolId}"`,
                fields: ['Grade Level']
            })
                .all();
            const grades = new Set();
            records.forEach((record) => {
                const grade = record.fields['Grade Level'];
                if (grade)
                    grades.add(grade);
            });
            return Array.from(grades).sort();
        }
        catch (error) {
            return [];
        }
    },
    async getAttendanceRecords(schoolId, filters) {
        const filterParts = [`{School Name} = "${schoolId}"`];
        if (filters?.className) {
            filterParts.push(`{Class Name} = "${filters.className}"`);
        }
        if (filters?.date) {
            filterParts.push(`{Date} = "${filters.date}"`);
        }
        if (filters?.startDate) {
            filterParts.push(`IS_AFTER({Date}, "${filters.startDate}")`);
        }
        const filterFormula = filterParts.length > 1 ? `AND(${filterParts.join(', ')})` : filterParts[0];
        try {
            const records = await getAirtable()('TutoAttendanceRecords')
                .select({ filterByFormula: filterFormula })
                .all();
            return records.map((record) => ({
                id: record.id,
                fields: record.fields
            }));
        }
        catch (error) {
            return [];
        }
    },
    // ═══════════════════════════════════════════════════════════════════════
    // STUDENTS - School Dashboard  
    // ═══════════════════════════════════════════════════════════════════════
    async getSchoolStudents(schoolId, filters) {
        const filterParts = [`{School Name} = "${schoolId}"`];
        if (filters?.className) {
            filterParts.push(`{Class Name} = "${filters.className}"`);
        }
        if (filters?.classId) {
            filterParts.push(`{Class Name} = "${filters.classId}"`);
        }
        if (filters?.grade) {
            filterParts.push(`{Grade Level} = "${filters.grade}"`);
        }
        const filterFormula = filterParts.length > 1 ? `AND(${filterParts.join(', ')})` : filterParts[0];
        const records = await getAirtable()('TutoSchoolStudents')
            .select({
            filterByFormula: filterFormula
        })
            .all();
        return records.map((record) => ({
            id: record.id,
            fields: record.fields
        }));
    },
    async getSchoolStudentById(studentId) {
        try {
            const record = await getAirtable()('TutoSchoolStudents').find(studentId);
            return {
                id: record.id,
                fields: record.fields
            };
        }
        catch (error) {
            return null;
        }
    },
    // ═══════════════════════════════════════════════════════════════════════
    // LEGACY STUDENTS (for backward compatibility)
    // ═══════════════════════════════════════════════════════════════════════
    async getStudents(schoolId) {
        const records = await getAirtable()('TutoStudents')
            .select({
            filterByFormula: `{School ID} = "${schoolId}"`
        })
            .all();
        return records.map((record) => ({
            id: record.id,
            fields: record.fields
        }));
    },
    async createStudent(data) {
        const record = await getAirtable()('TutoStudents').create(data);
        return {
            id: record.id,
            fields: record.fields
        };
    },
    async updateStudent(id, data) {
        const record = await getAirtable()('TutoStudents').update(id, data);
        return {
            id: record.id,
            fields: record.fields
        };
    },
    // Bookings
    async getBookings(schoolId, status) {
        let filterFormula = `{School ID} = "${schoolId}"`;
        if (status) {
            filterFormula += ` AND {Status} = "${status}"`;
        }
        const records = await getAirtable()('TutoBookings')
            .select({
            filterByFormula: filterFormula
        })
            .all();
        return records.map((record) => ({
            id: record.id,
            fields: record.fields
        }));
    },
    async updateBookingStatus(id, status) {
        const record = await getAirtable()('TutoBookings').update(id, { Status: status });
        return {
            id: record.id,
            fields: record.fields
        };
    },
    // Reviews
    async getReviews(schoolId, status) {
        let filterFormula = `{School ID} = "${schoolId}"`;
        if (status) {
            filterFormula += ` AND {Status} = "${status}"`;
        }
        const records = await getAirtable()('TutoReviews')
            .select({
            filterByFormula: filterFormula
        })
            .all();
        return records.map((record) => ({
            id: record.id,
            fields: record.fields
        }));
    },
    async updateReviewStatus(id, status) {
        const record = await getAirtable()('TutoReviews').update(id, { Status: status });
        return {
            id: record.id,
            fields: record.fields
        };
    },
    // Payments
    async getPayments(schoolId) {
        const records = await getAirtable()('TutoPayments')
            .select({
            filterByFormula: `{School ID} = "${schoolId}"`
        })
            .all();
        return records.map((record) => ({
            id: record.id,
            fields: record.fields
        }));
    }
};
