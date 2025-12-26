const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'translations', 'index.ts');
let content = fs.readFileSync(filePath, 'utf8');

// For EN section: Add keys after searchPlaceholder
const enPattern = /(searchPlaceholder: 'Search students\.\.\.',)\s*(kpis: \{)/;
const enReplacement = `$1
        filters: 'Filters',
        allClasses: 'All Classes',
        allStudents: 'All Students',
        search: 'Search students or medicine...',
        class: 'Class',
        dosage: 'Dosage',
        log: 'Log',
        view: 'View',
        admin: {
          title: 'Medicine Management',
          subtitle: 'Manage medicine reminders and administration logs',
          loadError: 'Failed to load medicine data',
        },
        $2`;

// For VI section: Add keys after searchPlaceholder
const viPattern = /(searchPlaceholder: 'Tìm kiếm học sinh\.\.\.'\,)\s*(kpis: \{)/;
const viReplacement = `$1
        filters: 'Bộ lọc',
        allClasses: 'Tất cả lớp',
        allStudents: 'Tất cả học sinh',
        search: 'Tìm kiếm học sinh hoặc thuốc...',
        class: 'Lớp',
        dosage: 'Liều lượng',
        log: 'Ghi nhật ký',
        view: 'Xem',
        admin: {
          title: 'Quản lý thuốc',
          subtitle: 'Quản lý nhắc nhở thuốc và nhật ký sử dụng',
          loadError: 'Không thể tải dữ liệu thuốc',
        },
        $2`;

content = content.replace(enPattern, enReplacement);
content = content.replace(viPattern, viReplacement);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Translations fixed successfully!');



