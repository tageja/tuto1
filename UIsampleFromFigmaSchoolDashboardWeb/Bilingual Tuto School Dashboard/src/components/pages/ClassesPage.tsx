import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Avatar, AvatarFallback } from '../ui/avatar';
import {
  Users,
  GraduationCap,
  Clock,
  MapPin,
  Plus,
  Edit,
  Eye,
  Mail,
  Phone,
  Calendar,
  Search,
  TrendingUp,
  CheckCircle,
} from 'lucide-react';

const classesData = [
  {
    id: 1,
    name: 'Grade 1A',
    grade: 1,
    section: 'A',
    students: 24,
    capacity: 25,
    teacher: 'Mrs. Emily Johnson',
    teacherEmail: 'emily.j@tutoschool.com',
    assistants: 1,
    room: 'Room 101',
    schedule: 'Mon-Fri, 8:00 AM - 2:00 PM',
    subjects: ['Math', 'English', 'Science', 'Art'],
    avgAttendance: '96%',
    status: 'active',
  },
  {
    id: 2,
    name: 'Grade 1B',
    grade: 1,
    section: 'B',
    students: 22,
    capacity: 25,
    teacher: 'Mr. David Smith',
    teacherEmail: 'david.s@tutoschool.com',
    assistants: 1,
    room: 'Room 102',
    schedule: 'Mon-Fri, 8:00 AM - 2:00 PM',
    subjects: ['Math', 'English', 'Science', 'Art'],
    avgAttendance: '94%',
    status: 'active',
  },
  {
    id: 3,
    name: 'Grade 2A',
    grade: 2,
    section: 'A',
    students: 25,
    capacity: 25,
    teacher: 'Ms. Sarah Wilson',
    teacherEmail: 'sarah.w@tutoschool.com',
    assistants: 1,
    room: 'Room 201',
    schedule: 'Mon-Fri, 8:00 AM - 2:30 PM',
    subjects: ['Math', 'English', 'Science', 'Social Studies', 'Art'],
    avgAttendance: '97%',
    status: 'active',
  },
  {
    id: 4,
    name: 'Grade 2B',
    grade: 2,
    section: 'B',
    students: 23,
    capacity: 25,
    teacher: 'Mrs. Amanda Garcia',
    teacherEmail: 'amanda.g@tutoschool.com',
    assistants: 1,
    room: 'Room 202',
    schedule: 'Mon-Fri, 8:00 AM - 2:30 PM',
    subjects: ['Math', 'English', 'Science', 'Social Studies', 'Art'],
    avgAttendance: '95%',
    status: 'active',
  },
  {
    id: 5,
    name: 'Grade 3A',
    grade: 3,
    section: 'A',
    students: 26,
    capacity: 28,
    teacher: 'Mr. Michael Brown',
    teacherEmail: 'michael.b@tutoschool.com',
    assistants: 1,
    room: 'Room 301',
    schedule: 'Mon-Fri, 8:00 AM - 3:00 PM',
    subjects: ['Math', 'English', 'Science', 'Social Studies', 'Art', 'Music'],
    avgAttendance: '93%',
    status: 'active',
  },
  {
    id: 6,
    name: 'Grade 3B',
    grade: 3,
    section: 'B',
    students: 24,
    capacity: 28,
    teacher: 'Mrs. Jennifer Davis',
    teacherEmail: 'jennifer.d@tutoschool.com',
    assistants: 1,
    room: 'Room 302',
    schedule: 'Mon-Fri, 8:00 AM - 3:00 PM',
    subjects: ['Math', 'English', 'Science', 'Social Studies', 'Art', 'Music'],
    avgAttendance: '92%',
    status: 'active',
  },
];

const studentsInClass = [
  { id: 1, name: 'Emily Chen', rollNo: 'G1A-001', attendance: '98%', performance: 'excellent', parent: 'Mr. Chen', contact: '+1 234-567-8901' },
  { id: 2, name: 'Michael Brown', rollNo: 'G1A-002', attendance: '95%', performance: 'good', parent: 'Mrs. Brown', contact: '+1 234-567-8902' },
  { id: 3, name: 'Sarah Wilson', rollNo: 'G1A-003', attendance: '97%', performance: 'excellent', parent: 'Mr. Wilson', contact: '+1 234-567-8903' },
  { id: 4, name: 'David Lee', rollNo: 'G1A-004', attendance: '94%', performance: 'good', parent: 'Mrs. Lee', contact: '+1 234-567-8904' },
  { id: 5, name: 'Jessica Martinez', rollNo: 'G1A-005', attendance: '100%', performance: 'excellent', parent: 'Mr. Martinez', contact: '+1 234-567-8905' },
  { id: 6, name: 'Ryan Taylor', rollNo: 'G1A-006', attendance: '96%', performance: 'good', parent: 'Mrs. Taylor', contact: '+1 234-567-8906' },
  { id: 7, name: 'Amanda Garcia', rollNo: 'G1A-007', attendance: '99%', performance: 'excellent', parent: 'Mr. Garcia', contact: '+1 234-567-8907' },
  { id: 8, name: 'Kevin Johnson', rollNo: 'G1A-008', attendance: '93%', performance: 'average', parent: 'Mrs. Johnson', contact: '+1 234-567-8908' },
];

const weeklySchedule = [
  { day: 'Monday', slots: ['Math', 'English', 'Science', 'Art', 'PE'] },
  { day: 'Tuesday', slots: ['English', 'Math', 'Social Studies', 'Music', 'Library'] },
  { day: 'Wednesday', slots: ['Math', 'Science', 'English', 'Art', 'PE'] },
  { day: 'Thursday', slots: ['Science', 'Math', 'English', 'Music', 'Computer'] },
  { day: 'Friday', slots: ['English', 'Math', 'Social Studies', 'Art', 'Assembly'] },
];

export function ClassesPage() {
  const { t } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedClass, setSelectedClass] = useState<typeof classesData[0] | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleClassClick = (classData: typeof classesData[0]) => {
    setSelectedClass(classData);
    setIsDialogOpen(true);
  };

  const filteredClasses = classesData.filter((cls) => {
    const matchesSearch = cls.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade = selectedGrade === 'all' || cls.grade.toString() === selectedGrade;
    return matchesSearch && matchesGrade;
  });

  const totalStudents = classesData.reduce((sum, cls) => sum + cls.students, 0);
  const totalCapacity = classesData.reduce((sum, cls) => sum + cls.capacity, 0);
  const avgAttendance = (
    classesData.reduce((sum, cls) => sum + parseFloat(cls.avgAttendance), 0) / classesData.length
  ).toFixed(1);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="m-0 mb-1">{t('classes')}</h1>
          <p className="text-sm text-muted-foreground m-0">
            Manage classes, view student rosters, and track class performance
          </p>
        </div>
        <Button>
          <Plus size={16} className="mr-2" />
          Add New Class
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-0.5">Total Classes</p>
              <p className="text-xl m-0">{classesData.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <GraduationCap size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-0.5">Total Students</p>
              <p className="text-xl m-0">{totalStudents}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-0.5">Capacity</p>
              <p className="text-xl m-0">{totalStudents}/{totalCapacity}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <TrendingUp size={20} className="text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-0.5">Avg Attendance</p>
              <p className="text-xl m-0">{avgAttendance}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search classes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div>
            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                <SelectItem value="1">Grade 1</SelectItem>
                <SelectItem value="2">Grade 2</SelectItem>
                <SelectItem value="3">Grade 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClasses.map((classItem) => {
          const utilizationRate = (classItem.students / classItem.capacity) * 100;
          
          return (
            <div
              key={classItem.id}
              className="bg-card rounded-xl border border-border p-5 hover:shadow-lg transition-all cursor-pointer"
              onClick={() => handleClassClick(classItem)}
            >
              {/* Class Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#0B5FFF] to-[#6366F1] flex items-center justify-center">
                    <span className="text-white">{classItem.grade}{classItem.section}</span>
                  </div>
                  <div>
                    <h3 className="text-base m-0">{classItem.name}</h3>
                    <p className="text-sm text-muted-foreground m-0">Grade {classItem.grade}</p>
                  </div>
                </div>
                <Badge variant={utilizationRate >= 90 ? 'destructive' : 'default'}>
                  {classItem.status}
                </Badge>
              </div>

              {/* Teacher Info */}
              <div className="bg-muted/50 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <GraduationCap size={14} className="text-muted-foreground" />
                  <span className="text-sm">{classItem.teacher}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{classItem.teacherEmail}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Students</p>
                  <p className="text-base m-0">{classItem.students}/{classItem.capacity}</p>
                  <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                    <div
                      className="bg-primary h-1.5 rounded-full"
                      style={{ width: `${utilizationRate}%` }}
                    />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Attendance</p>
                  <p className="text-base text-green-600 m-0">{classItem.avgAttendance}</p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin size={12} />
                  <span>{classItem.room}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={12} />
                  <span>{classItem.schedule}</span>
                </div>
              </div>

              {/* Action */}
              <div className="mt-4 pt-4 border-t border-border">
                <Button variant="ghost" size="sm" className="w-full">
                  <Eye size={14} className="mr-2" />
                  View Details
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Class Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#0B5FFF] to-[#6366F1] flex items-center justify-center">
                  <span className="text-white text-xl">
                    {selectedClass?.grade}{selectedClass?.section}
                  </span>
                </div>
                <div>
                  <DialogTitle>{selectedClass?.name}</DialogTitle>
                  <p className="text-sm text-muted-foreground">
                    {selectedClass?.teacher} • {selectedClass?.room}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Edit size={14} className="mr-2" />
                Edit Class
              </Button>
            </div>
          </DialogHeader>

          <Tabs defaultValue="students" className="mt-4">
            <TabsList>
              <TabsTrigger value="students">Students</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="subjects">Subjects</TabsTrigger>
            </TabsList>

            <TabsContent value="students" className="mt-4">
              <div className="bg-card rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Roll No</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Parent</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead className="text-center">Attendance</TableHead>
                      <TableHead className="text-center">Performance</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentsInClass.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>{student.rollNo}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {student.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span>{student.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{student.parent}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {student.contact}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-100">
                            {student.attendance}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              student.performance === 'excellent' ? 'default' :
                              student.performance === 'good' ? 'secondary' : 'outline'
                            }
                          >
                            {student.performance}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Eye size={14} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="mt-4">
              <div className="bg-card rounded-lg border border-border p-4">
                <h3 className="mb-4">Weekly Schedule</h3>
                <div className="space-y-3">
                  {weeklySchedule.map((day, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="w-24 flex-shrink-0">
                        <Badge variant="outline" className="w-full justify-center">
                          {day.day}
                        </Badge>
                      </div>
                      <div className="flex-1 flex flex-wrap gap-2">
                        {day.slots.map((subject, idx) => (
                          <Badge key={idx} variant="secondary">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="subjects" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedClass?.subjects.map((subject, index) => (
                  <div key={index} className="bg-card rounded-lg border border-border p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="text-primary">📚</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm m-0">{subject}</h4>
                        <p className="text-xs text-muted-foreground m-0">5 hours/week</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
