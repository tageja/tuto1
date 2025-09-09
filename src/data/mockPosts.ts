import { Post } from '../screens/FeedScreen';

export const mockPosts: Post[] = [
  // Teacher Posts
  {
    id: '1',
    author: {
      id: 'teacher1',
      name: 'Nguyễn Thị Anh',
      role: 'teacher',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    },
    content: {
      text: 'Just finished an amazing math session with my students! We explored quadratic equations using real-world examples. The way their faces lit up when they finally understood the concept was priceless. 🧮✨\n\nRemember: Math is not about memorizing formulas, it\'s about understanding patterns and solving problems creatively!',
      media: {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop',
      },
    },
    type: 'text',
    subjects: ['Math', 'Education'],
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    interactions: {
      likes: 24,
      comments: 8,
      shares: 3,
      saves: 12,
    },
    isLiked: false,
    isSaved: false,
    privacy: 'public',
  },
  {
    id: '2',
    author: {
      id: 'teacher2',
      name: 'Trần Văn Minh',
      role: 'teacher',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    },
    content: {
      text: '📚 English Literature Tip of the Day:\n\nWhen analyzing poetry, remember the acronym TPCASTT:\n• Title - What does the title suggest?\n• Paraphrase - What is the poem about?\n• Connotation - What do the words suggest?\n• Attitude - What is the speaker\'s tone?\n• Shifts - Are there any changes?\n• Title - What does the title mean now?\n• Theme - What is the poet saying?\n\nThis method helps students understand poetry more deeply!',
    },
    type: 'text',
    subjects: ['English', 'Literature'],
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    interactions: {
      likes: 31,
      comments: 15,
      shares: 7,
      saves: 18,
    },
    isLiked: true,
    isSaved: true,
    privacy: 'public',
  },
  {
    id: '3',
    author: {
      id: 'teacher3',
      name: 'Lê Thu Hà',
      role: 'teacher',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    },
    content: {
      text: '🎹 Piano Practice Tip:\n\nToday we worked on finger independence exercises. Remember: slow and steady wins the race! Practice each hand separately before combining them.\n\nMy students are making incredible progress! 🎵',
      media: {
        type: 'video',
        url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1520523839897-b3840d05432d?w=400&h=300&fit=crop',
      },
    },
    type: 'video',
    subjects: ['Music', 'Piano'],
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    interactions: {
      likes: 42,
      comments: 12,
      shares: 5,
      saves: 25,
    },
    isLiked: false,
    isSaved: false,
    privacy: 'public',
  },

  // Parent Posts
  {
    id: '4',
    author: {
      id: 'parent1',
      name: 'Phạm Thị Mai',
      role: 'parent',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    },
    content: {
      text: 'So proud of my daughter! She just completed her first science project and got an A+! 🌟\n\nShe worked so hard on her volcano experiment and presented it with such confidence. Thank you to all the amazing teachers who inspire our children every day! 🙏',
      media: {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=300&fit=crop',
      },
    },
    type: 'text',
    subjects: ['Science', 'Education'],
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    interactions: {
      likes: 18,
      comments: 6,
      shares: 2,
      saves: 8,
    },
    isLiked: false,
    isSaved: false,
    privacy: 'public',
  },
  {
    id: '5',
    author: {
      id: 'parent2',
      name: 'Nguyễn Văn Hùng',
      role: 'parent',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    },
    content: {
      text: 'Looking for recommendations for a good math tutor for my 12-year-old son. He\'s struggling with algebra and needs some extra help. Any suggestions from other parents? 📚\n\nPreferably someone who can explain concepts clearly and make math fun!',
    },
    type: 'text',
    subjects: ['Math', 'Tutoring'],
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    interactions: {
      likes: 5,
      comments: 14,
      shares: 1,
      saves: 3,
    },
    isLiked: false,
    isSaved: false,
    privacy: 'public',
  },

  // Student Posts
  {
    id: '6',
    author: {
      id: 'student1',
      name: 'Trần Minh Anh',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    },
    content: {
      text: 'Just finished my English essay and I\'m so happy with how it turned out! 📝✨\n\nMy teacher said it was one of the best in the class. All those hours of practice really paid off! 💪\n\n#English #Writing #StudentLife',
    },
    type: 'text',
    subjects: ['English', 'Writing'],
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    interactions: {
      likes: 15,
      comments: 4,
      shares: 1,
      saves: 6,
    },
    isLiked: true,
    isSaved: false,
    privacy: 'public',
  },
  {
    id: '7',
    author: {
      id: 'student2',
      name: 'Lê Hoàng Nam',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    },
    content: {
      text: '🎨 Finally completed my art project! It took me 3 weeks but I\'m really proud of the result.\n\nMy art teacher said it shows "great creativity and technique." Can\'t wait to see it displayed in the school gallery! 🖼️',
      media: {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop',
      },
    },
    type: 'text',
    subjects: ['Art', 'Creativity'],
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    interactions: {
      likes: 28,
      comments: 9,
      shares: 4,
      saves: 15,
    },
    isLiked: false,
    isSaved: true,
    privacy: 'public',
  },
  {
    id: '8',
    author: {
      id: 'student3',
      name: 'Phạm Thị Linh',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    },
    content: {
      text: '⚽ Had an amazing soccer practice today! Coach taught us some new dribbling techniques and I actually scored 3 goals! 🥅\n\nSports are such a great way to stay active and make friends. Love being part of the school team! 💪\n\n#Soccer #Sports #TeamWork',
    },
    type: 'text',
    subjects: ['Sports', 'Soccer'],
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    interactions: {
      likes: 22,
      comments: 7,
      shares: 3,
      saves: 10,
    },
    isLiked: false,
    isSaved: false,
    privacy: 'public',
  },
  {
    id: '9',
    author: {
      id: 'teacher4',
      name: 'Đỗ Quang Huy',
      role: 'teacher',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    },
    content: {
      text: '💻 Computer Science Update:\n\nToday we explored basic programming concepts using Scratch. My students created their first interactive games! The excitement in the classroom was incredible.\n\nProgramming isn\'t just about coding - it\'s about problem-solving, creativity, and logical thinking. Every student has the potential to be a great programmer! 🚀',
    },
    type: 'text',
    subjects: ['Computer Science', 'Programming'],
    timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000), // 7 hours ago
    interactions: {
      likes: 35,
      comments: 11,
      shares: 6,
      saves: 20,
    },
    isLiked: false,
    isSaved: false,
    privacy: 'public',
  },
  {
    id: '10',
    author: {
      id: 'parent3',
      name: 'Vũ Thị Lan',
      role: 'parent',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    },
    content: {
      text: '🎵 My son had his first piano recital today and he was absolutely amazing! I was so nervous for him, but he played beautifully.\n\nThank you to his wonderful piano teacher who has been so patient and encouraging. Music education is so important for children\'s development! 🎹',
      media: {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1520523839897-b3840d05432d?w=400&h=300&fit=crop',
      },
    },
    type: 'text',
    subjects: ['Music', 'Piano'],
    timestamp: new Date(Date.now() - 9 * 60 * 60 * 1000), // 9 hours ago
    interactions: {
      likes: 26,
      comments: 8,
      shares: 4,
      saves: 12,
    },
    isLiked: false,
    isSaved: false,
    privacy: 'public',
  },
]; 