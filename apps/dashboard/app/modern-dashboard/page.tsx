'use client'

import { useState, useEffect } from 'react'

// Modern animated components
const AnimatedCard = ({ children, delay = 0, className = "" }: { 
  children: React.ReactNode; 
  delay?: number; 
  className?: string;
}) => {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])
  
  return (
    <div 
      className={`transform transition-all duration-700 ease-out ${
        isVisible 
          ? 'translate-y-0 opacity-100' 
          : 'translate-y-8 opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  )
}

const GradientCard = ({ children, className = "", gradient = "from-blue-500/10 to-purple-500/10" }: {
  children: React.ReactNode;
  className?: string;
  gradient?: string;
}) => (
  <div className={`relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br ${gradient} backdrop-blur-sm shadow-xl ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
    <div className="relative z-10">{children}</div>
  </div>
)

const GlassButton = ({ 
  children, 
  onClick, 
  variant = "primary",
  className = "",
  icon
}: { 
  children: React.ReactNode; 
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  icon?: React.ReactNode;
}) => {
  const baseClasses = "group relative inline-flex items-center justify-center px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ease-out transform hover:scale-105 active:scale-95"
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-blue-500/25 hover:shadow-2xl",
    secondary: "bg-white/10 backdrop-blur-md border border-white/20 text-gray-700 hover:bg-white/20",
    ghost: "text-gray-600 hover:text-gray-900 hover:bg-gray-100/50"
  }
  
  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  )
}

const FloatingElement = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`transform transition-all duration-300 hover:scale-105 ${className}`}>
    {children}
  </div>
)

const ModernTable = ({ children }: { children: React.ReactNode }) => (
  <div className="overflow-hidden rounded-2xl border border-gray-200/50 bg-white/80 backdrop-blur-sm shadow-xl">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200/50">
        {children}
      </table>
    </div>
  </div>
)

const TableHeader = ({ children }: { children: React.ReactNode }) => (
  <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50">
    {children}
  </thead>
)

const TableBody = ({ children }: { children: React.ReactNode }) => (
  <tbody className="bg-white/50 divide-y divide-gray-200/30">
    {children}
  </tbody>
)

const TableRow = ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
  <tr 
    className={`transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 cursor-pointer ${onClick ? 'hover:shadow-md' : ''}`}
    onClick={onClick}
  >
    {children}
  </tr>
)

const TableHead = ({ children }: { children: React.ReactNode }) => (
  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
    {children}
  </th>
)

const TableCell = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 ${className}`}>
    {children}
  </td>
)

const StatCard = ({ 
  title, 
  value, 
  change, 
  icon, 
  gradient,
  delay = 0 
}: { 
  title: string; 
  value: string; 
  change?: string; 
  icon: React.ReactNode;
  gradient: string;
  delay?: number;
}) => (
  <AnimatedCard delay={delay}>
    <GradientCard gradient={gradient} className="p-6 hover:shadow-2xl transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className="text-sm text-green-600 mt-1">
              <span className="inline-flex items-center">
                ↗️ {change}
              </span>
            </p>
          )}
        </div>
        <div className="text-4xl opacity-20">{icon}</div>
      </div>
    </GradientCard>
  </AnimatedCard>
)

const ProgressBar = ({ percentage, color = "blue" }: { percentage: number; color?: string }) => {
  const colorClasses = {
    blue: "bg-gradient-to-r from-blue-500 to-blue-600",
    green: "bg-gradient-to-r from-green-500 to-green-600",
    purple: "bg-gradient-to-r from-purple-500 to-purple-600",
    orange: "bg-gradient-to-r from-orange-500 to-orange-600"
  }
  
  return (
    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
      <div 
        className={`h-full ${colorClasses[color as keyof typeof colorClasses]} transition-all duration-1000 ease-out rounded-full`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}

// Enhanced demo data
const demoTeachers = [
  { 
    id: '1', 
    name: 'Dr. John Smith', 
    email: 'john.smith@school.edu', 
    subjects: ['Mathematics', 'Physics'], 
    rating: 4.8,
    students: 45,
    experience: '8 years',
    status: 'Active',
    avatar: '👨‍🏫'
  },
  { 
    id: '2', 
    name: 'Prof. Sarah Johnson', 
    email: 'sarah.johnson@school.edu', 
    subjects: ['English Literature', 'Creative Writing'], 
    rating: 4.6,
    students: 32,
    experience: '5 years',
    status: 'Active',
    avatar: '👩‍🏫'
  },
  { 
    id: '3', 
    name: 'Dr. Michael Chen', 
    email: 'michael.chen@school.edu', 
    subjects: ['Chemistry', 'Biology'], 
    rating: 4.9,
    students: 58,
    experience: '12 years',
    status: 'Active',
    avatar: '👨‍🔬'
  }
]

const demoStudents = [
  { 
    id: '1', 
    name: 'Alice Williams', 
    email: 'alice.williams@student.edu', 
    grade: 'Grade 10', 
    status: 'Active',
    progress: 85,
    courses: ['Mathematics', 'Physics'],
    avatar: '👩‍🎓'
  },
  { 
    id: '2', 
    name: 'Bob Davis', 
    email: 'bob.davis@student.edu', 
    grade: 'Grade 11', 
    status: 'Active',
    progress: 92,
    courses: ['English Literature', 'History'],
    avatar: '👨‍🎓'
  },
  { 
    id: '3', 
    name: 'Carol Martinez', 
    email: 'carol.martinez@student.edu', 
    grade: 'Grade 9', 
    status: 'Active',
    progress: 78,
    courses: ['Chemistry', 'Biology'],
    avatar: '👩‍🔬'
  }
]

export default function ModernDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'teachers' | 'students'>('overview')
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const handleExportCSV = () => {
    const csvContent = [
      ['Name', 'Email', 'Grade', 'Status', 'Progress'],
      ...demoStudents.map(student => [student.name, student.email, student.grade, student.status, `${student.progress}%`])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `students_export_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">🎓</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Tuto School
                </h1>
                <p className="text-sm text-gray-600 font-medium">Management Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">Live</span>
              </div>
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm">JD</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="relative z-10 bg-white/60 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { key: 'overview', label: '📊 Overview', icon: '📊' },
              { key: 'teachers', label: '👨‍🏫 Teachers', icon: '👨‍🏫' },
              { key: 'students', label: '👨‍🎓 Students', icon: '👨‍🎓' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`relative py-4 px-1 font-semibold text-sm transition-all duration-300 ${
                  activeTab === tab.key
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Teachers"
                value="3"
                change="+12% this month"
                icon="👨‍🏫"
                gradient="from-blue-500/10 to-cyan-500/10"
                delay={100}
              />
              <StatCard
                title="Active Students"
                value="3"
                change="+8% this month"
                icon="👨‍🎓"
                gradient="from-green-500/10 to-emerald-500/10"
                delay={200}
              />
              <StatCard
                title="Active Classes"
                value="12"
                change="+15% this month"
                icon="📚"
                gradient="from-purple-500/10 to-pink-500/10"
                delay={300}
              />
              <StatCard
                title="Monthly Revenue"
                value="$24.5K"
                change="+23% this month"
                icon="💰"
                gradient="from-orange-500/10 to-red-500/10"
                delay={400}
              />
            </div>

            {/* Charts and Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <AnimatedCard delay={500}>
                <GradientCard gradient="from-white/60 to-blue-50/60" className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Student Progress</h3>
                  <div className="space-y-4">
                    {demoStudents.map((student, index) => (
                      <div key={student.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{student.avatar}</span>
                          <div>
                            <p className="font-semibold text-gray-900">{student.name}</p>
                            <p className="text-sm text-gray-600">{student.grade}</p>
                          </div>
                        </div>
                        <div className="w-24">
                          <ProgressBar percentage={student.progress} color={index % 2 === 0 ? 'blue' : 'green'} />
                          <p className="text-xs text-gray-600 mt-1 text-center">{student.progress}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </GradientCard>
              </AnimatedCard>

              <AnimatedCard delay={600}>
                <GradientCard gradient="from-white/60 to-purple-50/60" className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h3>
                  <div className="space-y-4">
                    {[
                      { action: 'New enrollment', student: 'Alice Williams', time: '2 hours ago', type: 'success' },
                      { action: 'Grade updated', student: 'Bob Davis', time: '4 hours ago', type: 'info' },
                      { action: 'Payment received', student: 'Carol Martinez', time: '6 hours ago', type: 'success' }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 rounded-xl bg-white/50">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.type === 'success' ? 'bg-green-400' : 'bg-blue-400'
                        }`}></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                          <p className="text-xs text-gray-600">{activity.student}</p>
                        </div>
                        <span className="text-xs text-gray-500">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </GradientCard>
              </AnimatedCard>
            </div>
          </div>
        )}

        {activeTab === 'teachers' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Teaching Staff
                </h2>
                <p className="text-gray-600 mt-2">Manage your world-class educators</p>
              </div>
              <GlassButton icon="➕" variant="primary">
                Add Teacher
              </GlassButton>
            </div>

            <AnimatedCard delay={100}>
              <ModernTable>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Subjects</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {demoTeachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{teacher.avatar}</span>
                          <div>
                            <p className="font-semibold text-gray-900">{teacher.name}</p>
                            <p className="text-sm text-gray-600">{teacher.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {teacher.subjects.map((subject, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {subject}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-gray-900">{teacher.students}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <span className="text-yellow-400">⭐</span>
                          <span className="font-semibold text-gray-900">{teacher.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          {teacher.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <GlassButton variant="ghost" className="px-3 py-1 text-xs">
                            ✏️ Edit
                          </GlassButton>
                          <GlassButton variant="ghost" className="px-3 py-1 text-xs text-red-600 hover:bg-red-50">
                            🗑️ Delete
                          </GlassButton>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </ModernTable>
            </AnimatedCard>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Student Management
                </h2>
                <p className="text-gray-600 mt-2">Track progress and manage enrollments</p>
              </div>
              <div className="flex space-x-3">
                <GlassButton 
                  icon="📥" 
                  variant="secondary" 
                  onClick={handleExportCSV}
                >
                  Export CSV
                </GlassButton>
                <GlassButton icon="➕" variant="primary">
                  Add Student
                </GlassButton>
              </div>
            </div>

            <AnimatedCard delay={100}>
              <ModernTable>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Courses</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {demoStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{student.avatar}</span>
                          <div>
                            <p className="font-semibold text-gray-900">{student.name}</p>
                            <p className="text-sm text-gray-600">{student.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-gray-900">{student.grade}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {student.courses.map((course, index) => (
                            <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                              {course}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="w-20">
                          <ProgressBar percentage={student.progress} color="blue" />
                          <p className="text-xs text-gray-600 mt-1 text-center">{student.progress}%</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          {student.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <GlassButton variant="ghost" className="px-3 py-1 text-xs">
                            👁️ View
                          </GlassButton>
                          <GlassButton variant="ghost" className="px-3 py-1 text-xs">
                            ✏️ Edit
                          </GlassButton>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </ModernTable>
            </AnimatedCard>
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <FloatingElement>
          <button className="w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-2xl flex items-center justify-center text-white text-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-110 active:scale-95">
            💬
          </button>
        </FloatingElement>
      </div>

      {/* Success Toast */}
      <div className="fixed bottom-8 left-8 z-50">
        <AnimatedCard delay={1000}>
          <div className="bg-white/90 backdrop-blur-sm border border-green-200 rounded-xl p-4 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600">✅</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Dashboard Loaded</p>
                <p className="text-xs text-gray-600">All systems operational</p>
              </div>
            </div>
          </div>
        </AnimatedCard>
      </div>
    </div>
  )
}
