import { MaterialIcons } from '@expo/vector-icons';

export interface Subject {
  id: string;
  key: string;
  nameEn: string;
  nameVi: string;
  name: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  category: 'academic' | 'extracurricular';
  color: string;
  description: string;
  descriptionVi: string;
}

export const subjects: Subject[] = [
  // Academic Subjects
  {
    id: 'math',
    key: 'math',
    nameEn: 'Mathematics',
    nameVi: 'Toán học',
    name: 'Mathematics',
    icon: 'calculate',
    category: 'academic',
    color: '#FF6B6B',
    description: 'Advanced mathematics and problem solving',
    descriptionVi: 'Toán học nâng cao và giải quyết vấn đề'
  },
  {
    id: 'physics',
    key: 'physics',
    nameEn: 'Physics',
    nameVi: 'Vật lý',
    name: 'Physics',
    icon: 'science',
    category: 'academic',
    color: '#4ECDC4',
    description: 'Understanding the laws of nature',
    descriptionVi: 'Hiểu biết về các quy luật tự nhiên'
  },
  {
    id: 'chemistry',
    key: 'chemistry',
    nameEn: 'Chemistry',
    nameVi: 'Hóa học',
    name: 'Chemistry',
    icon: 'biotech',
    category: 'academic',
    color: '#45B7D1',
    description: 'Study of matter and its properties',
    descriptionVi: 'Nghiên cứu về vật chất và tính chất'
  },
  {
    id: 'biology',
    key: 'biology',
    nameEn: 'Biology',
    nameVi: 'Sinh học',
    name: 'Biology',
    icon: 'spa',
    category: 'academic',
    color: '#96CEB4',
    description: 'Study of living organisms',
    descriptionVi: 'Nghiên cứu về các sinh vật sống'
  },
  {
    id: 'english',
    key: 'english',
    nameEn: 'English',
    nameVi: 'Tiếng Anh',
    name: 'English',
    icon: 'language',
    category: 'academic',
    color: '#FFEAA7',
    description: 'English language and literature',
    descriptionVi: 'Ngôn ngữ và văn học tiếng Anh'
  },
  {
    id: 'literature',
    key: 'literature',
    nameEn: 'Literature',
    nameVi: 'Văn học',
    name: 'Literature',
    icon: 'menu-book',
    category: 'academic',
    color: '#DDA0DD',
    description: 'Study of written works',
    descriptionVi: 'Nghiên cứu về các tác phẩm văn học'
  },
  {
    id: 'history',
    key: 'history',
    nameEn: 'History',
    nameVi: 'Lịch sử',
    name: 'History',
    icon: 'history-edu',
    category: 'academic',
    color: '#F8B195',
    description: 'Study of past events',
    descriptionVi: 'Nghiên cứu về các sự kiện trong quá khứ'
  },
  {
    id: 'geography',
    key: 'geography',
    nameEn: 'Geography',
    nameVi: 'Địa lý',
    name: 'Geography',
    icon: 'public',
    category: 'academic',
    color: '#A8E6CF',
    description: 'Study of Earth and its features',
    descriptionVi: 'Nghiên cứu về Trái Đất và đặc điểm'
  },
  {
    id: 'informatics',
    key: 'informatics',
    nameEn: 'Informatics',
    nameVi: 'Tin học',
    name: 'Informatics',
    icon: 'computer',
    category: 'academic',
    color: '#FFB347',
    description: 'Computer science and programming',
    descriptionVi: 'Khoa học máy tính và lập trình'
  },
  {
    id: 'french',
    key: 'french',
    nameEn: 'French',
    nameVi: 'Tiếng Pháp',
    name: 'French',
    icon: 'translate',
    category: 'academic',
    color: '#FF6B9D',
    description: 'French language and culture',
    descriptionVi: 'Ngôn ngữ và văn hóa Pháp'
  },
  {
    id: 'japanese',
    key: 'japanese',
    nameEn: 'Japanese',
    nameVi: 'Tiếng Nhật',
    name: 'Japanese',
    icon: 'translate',
    category: 'academic',
    color: '#FF8A80',
    description: 'Japanese language and culture',
    descriptionVi: 'Ngôn ngữ và văn hóa Nhật Bản'
  },
  {
    id: 'korean',
    key: 'korean',
    nameEn: 'Korean',
    nameVi: 'Tiếng Hàn',
    name: 'Korean',
    icon: 'translate',
    category: 'academic',
    color: '#FFD54F',
    description: 'Korean language and culture',
    descriptionVi: 'Ngôn ngữ và văn hóa Hàn Quốc'
  },
  {
    id: 'chinese',
    key: 'chinese',
    nameEn: 'Chinese',
    nameVi: 'Tiếng Trung',
    name: 'Chinese',
    icon: 'translate',
    category: 'academic',
    color: '#FF7043',
    description: 'Chinese language and culture',
    descriptionVi: 'Ngôn ngữ và văn hóa Trung Quốc'
  },

  // Extracurricular Activities
  {
    id: 'piano',
    key: 'piano',
    nameEn: 'Piano',
    nameVi: 'Đàn Piano',
    name: 'Piano',
    icon: 'piano',
    category: 'extracurricular',
    color: '#9C27B0',
    description: 'Learn to play the piano',
    descriptionVi: 'Học chơi đàn piano'
  },
  {
    id: 'guitar',
    key: 'guitar',
    nameEn: 'Guitar',
    nameVi: 'Đàn Guitar',
    name: 'Guitar',
    icon: 'music-note',
    category: 'extracurricular',
    color: '#FF9800',
    description: 'Learn to play the guitar',
    descriptionVi: 'Học chơi đàn guitar'
  },
  {
    id: 'violin',
    key: 'violin',
    nameEn: 'Violin',
    nameVi: 'Đàn Violin',
    name: 'Violin',
    icon: 'music-note',
    category: 'extracurricular',
    color: '#795548',
    description: 'Learn to play the violin',
    descriptionVi: 'Học chơi đàn violin'
  },
  {
    id: 'drawing',
    key: 'drawing',
    nameEn: 'Drawing',
    nameVi: 'Vẽ',
    name: 'Drawing',
    icon: 'brush',
    category: 'extracurricular',
    color: '#607D8B',
    description: 'Learn drawing and sketching',
    descriptionVi: 'Học vẽ và phác thảo'
  },
  {
    id: 'painting',
    key: 'painting',
    nameEn: 'Painting',
    nameVi: 'Hội họa',
    name: 'Painting',
    icon: 'palette',
    category: 'extracurricular',
    color: '#E91E63',
    description: 'Learn painting techniques',
    descriptionVi: 'Học các kỹ thuật vẽ tranh'
  },
  {
    id: 'dancing',
    key: 'dancing',
    nameEn: 'Dancing',
    nameVi: 'Khiêu vũ',
    name: 'Dancing',
    icon: 'directions-run',
    category: 'extracurricular',
    color: '#2196F3',
    description: 'Learn various dance styles',
    descriptionVi: 'Học các phong cách nhảy múa'
  },
  {
    id: 'ballet',
    key: 'ballet',
    nameEn: 'Ballet',
    nameVi: 'Ba lê',
    name: 'Ballet',
    icon: 'accessibility-new',
    category: 'extracurricular',
    color: '#FF5722',
    description: 'Learn classical ballet',
    descriptionVi: 'Học múa ba lê cổ điển'
  },
  {
    id: 'swimming',
    key: 'swimming',
    nameEn: 'Swimming',
    nameVi: 'Bơi lội',
    name: 'Swimming',
    icon: 'pool',
    category: 'extracurricular',
    color: '#00BCD4',
    description: 'Learn swimming techniques',
    descriptionVi: 'Học các kỹ thuật bơi lội'
  },
  {
    id: 'basketball',
    key: 'basketball',
    nameEn: 'Basketball',
    nameVi: 'Bóng rổ',
    name: 'Basketball',
    icon: 'sports-basketball',
    category: 'extracurricular',
    color: '#FF5722',
    description: 'Learn basketball skills',
    descriptionVi: 'Học các kỹ năng bóng rổ'
  },
  {
    id: 'football',
    key: 'football',
    nameEn: 'Football',
    nameVi: 'Bóng đá',
    name: 'Football',
    icon: 'sports-soccer',
    category: 'extracurricular',
    color: '#4CAF50',
    description: 'Learn football skills',
    descriptionVi: 'Học các kỹ năng bóng đá'
  },
  {
    id: 'volleyball',
    key: 'volleyball',
    nameEn: 'Volleyball',
    nameVi: 'Bóng chuyền',
    name: 'Volleyball',
    icon: 'sports-volleyball',
    category: 'extracurricular',
    color: '#FF9800',
    description: 'Learn volleyball skills',
    descriptionVi: 'Học các kỹ năng bóng chuyền'
  },
  {
    id: 'badminton',
    key: 'badminton',
    nameEn: 'Badminton',
    nameVi: 'Cầu lông',
    name: 'Badminton',
    icon: 'sports-tennis',
    category: 'extracurricular',
    color: '#8BC34A',
    description: 'Learn badminton skills',
    descriptionVi: 'Học các kỹ năng cầu lông'
  },
  {
    id: 'tabletennis',
    key: 'tabletennis',
    nameEn: 'Table Tennis',
    nameVi: 'Bóng bàn',
    name: 'Table Tennis',
    icon: 'sports-tennis',
    category: 'extracurricular',
    color: '#FFC107',
    description: 'Learn table tennis skills',
    descriptionVi: 'Học các kỹ năng bóng bàn'
  },
  {
    id: 'martialarts',
    key: 'martialarts',
    nameEn: 'Martial Arts',
    nameVi: 'Võ thuật',
    name: 'Martial Arts',
    icon: 'sports-kabaddi',
    category: 'extracurricular',
    color: '#795548',
    description: 'Learn martial arts techniques',
    descriptionVi: 'Học các kỹ thuật võ thuật'
  },
  {
    id: 'chess',
    key: 'chess',
    nameEn: 'Chess',
    nameVi: 'Cờ vua',
    name: 'Chess',
    icon: 'extension',
    category: 'extracurricular',
    color: '#607D8B',
    description: 'Learn chess strategies',
    descriptionVi: 'Học các chiến lược cờ vua'
  },
  {
    id: 'cooking',
    key: 'cooking',
    nameEn: 'Cooking',
    nameVi: 'Nấu ăn',
    name: 'Cooking',
    icon: 'restaurant',
    category: 'extracurricular',
    color: '#FF5722',
    description: 'Learn cooking techniques',
    descriptionVi: 'Học các kỹ thuật nấu ăn'
  },
  {
    id: 'photography',
    key: 'photography',
    nameEn: 'Photography',
    nameVi: 'Nhiếp ảnh',
    name: 'Photography',
    icon: 'camera-alt',
    category: 'extracurricular',
    color: '#9C27B0',
    description: 'Learn photography skills',
    descriptionVi: 'Học các kỹ năng nhiếp ảnh'
  }
];

export const getSubjectsByCategory = (category: 'academic' | 'extracurricular'): Subject[] => {
  return subjects.filter(subject => subject.category === category);
};