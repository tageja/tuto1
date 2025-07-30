import { MaterialIcons } from '@expo/vector-icons';

export interface Subject {
  key: string;
  nameEn: string;
  nameVi: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  category: 'academic' | 'extracurricular';
}

export const subjects: Subject[] = [
  // Academic Subjects
  {
    key: 'math',
    nameEn: 'Mathematics',
    nameVi: 'Toán học',
    icon: 'calculate',
    category: 'academic'
  },
  {
    key: 'physics',
    nameEn: 'Physics',
    nameVi: 'Vật lý',
    icon: 'science',
    category: 'academic'
  },
  {
    key: 'chemistry',
    nameEn: 'Chemistry',
    nameVi: 'Hóa học',
    icon: 'biotech',
    category: 'academic'
  },
  {
    key: 'biology',
    nameEn: 'Biology',
    nameVi: 'Sinh học',
    icon: 'spa',
    category: 'academic'
  },
  {
    key: 'english',
    nameEn: 'English',
    nameVi: 'Tiếng Anh',
    icon: 'language',
    category: 'academic'
  },
  {
    key: 'literature',
    nameEn: 'Literature',
    nameVi: 'Văn học',
    icon: 'menu-book',
    category: 'academic'
  },
  {
    key: 'history',
    nameEn: 'History',
    nameVi: 'Lịch sử',
    icon: 'history-edu',
    category: 'academic'
  },
  {
    key: 'geography',
    nameEn: 'Geography',
    nameVi: 'Địa lý',
    icon: 'public',
    category: 'academic'
  },
  {
    key: 'informatics',
    nameEn: 'Informatics',
    nameVi: 'Tin học',
    icon: 'computer',
    category: 'academic'
  },
  {
    key: 'french',
    nameEn: 'French',
    nameVi: 'Tiếng Pháp',
    icon: 'translate',
    category: 'academic'
  },
  {
    key: 'japanese',
    nameEn: 'Japanese',
    nameVi: 'Tiếng Nhật',
    icon: 'translate',
    category: 'academic'
  },
  {
    key: 'korean',
    nameEn: 'Korean',
    nameVi: 'Tiếng Hàn',
    icon: 'translate',
    category: 'academic'
  },
  {
    key: 'chinese',
    nameEn: 'Chinese',
    nameVi: 'Tiếng Trung',
    icon: 'translate',
    category: 'academic'
  },

  // Extracurricular Activities
  {
    key: 'piano',
    nameEn: 'Piano',
    nameVi: 'Đàn Piano',
    icon: 'piano',
    category: 'extracurricular'
  },
  {
    key: 'guitar',
    nameEn: 'Guitar',
    nameVi: 'Đàn Guitar',
    icon: 'music-note',
    category: 'extracurricular'
  },
  {
    key: 'violin',
    nameEn: 'Violin',
    nameVi: 'Đàn Violin',
    icon: 'music-note',
    category: 'extracurricular'
  },
  {
    key: 'drawing',
    nameEn: 'Drawing',
    nameVi: 'Vẽ',
    icon: 'brush',
    category: 'extracurricular'
  },
  {
    key: 'painting',
    nameEn: 'Painting',
    nameVi: 'Hội họa',
    icon: 'palette',
    category: 'extracurricular'
  },
  {
    key: 'dancing',
    nameEn: 'Dancing',
    nameVi: 'Khiêu vũ',
    icon: 'directions-run',
    category: 'extracurricular'
  },
  {
    key: 'ballet',
    nameEn: 'Ballet',
    nameVi: 'Ba lê',
    icon: 'accessibility-new',
    category: 'extracurricular'
  },
  {
    key: 'swimming',
    nameEn: 'Swimming',
    nameVi: 'Bơi lội',
    icon: 'pool',
    category: 'extracurricular'
  },
  {
    key: 'basketball',
    nameEn: 'Basketball',
    nameVi: 'Bóng rổ',
    icon: 'sports-basketball',
    category: 'extracurricular'
  },
  {
    key: 'football',
    nameEn: 'Football',
    nameVi: 'Bóng đá',
    icon: 'sports-soccer',
    category: 'extracurricular'
  },
  {
    key: 'volleyball',
    nameEn: 'Volleyball',
    nameVi: 'Bóng chuyền',
    icon: 'sports-volleyball',
    category: 'extracurricular'
  },
  {
    key: 'badminton',
    nameEn: 'Badminton',
    nameVi: 'Cầu lông',
    icon: 'sports-tennis',
    category: 'extracurricular'
  },
  {
    key: 'tabletennis',
    nameEn: 'Table Tennis',
    nameVi: 'Bóng bàn',
    icon: 'sports-tennis',
    category: 'extracurricular'
  },
  {
    key: 'martialarts',
    nameEn: 'Martial Arts',
    nameVi: 'Võ thuật',
    icon: 'sports-kabaddi',
    category: 'extracurricular'
  },
  {
    key: 'chess',
    nameEn: 'Chess',
    nameVi: 'Cờ vua',
    icon: 'extension',
    category: 'extracurricular'
  },
  {
    key: 'cooking',
    nameEn: 'Cooking',
    nameVi: 'Nấu ăn',
    icon: 'restaurant',
    category: 'extracurricular'
  },
  {
    key: 'photography',
    nameEn: 'Photography',
    nameVi: 'Nhiếp ảnh',
    icon: 'camera-alt',
    category: 'extracurricular'
  }
];

export const getSubjectsByCategory = (category: 'academic' | 'extracurricular'): Subject[] => {
  return subjects.filter(subject => subject.category === category);
};