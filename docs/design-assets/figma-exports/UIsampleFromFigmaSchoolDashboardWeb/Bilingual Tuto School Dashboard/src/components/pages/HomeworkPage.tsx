import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { BookOpen, Calendar, Download, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { ChartWidget } from '../ChartWidget';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

const homeworkData = [
  {
    id: 1,
    subject: 'Mathematics',
    title: 'Problem Set 3.2 - Algebra',
    class: 'Grade 5A',
    dueDate: 'Oct 26, 2025',
    status: 'pending',
    difficulty: 'medium',
    description: 'Complete problems 1-15 from the algebra workbook. Show all your work and explain your reasoning.',
    attachments: ['problem_set_3.2.pdf'],
    submissions: 18,
    totalStudents: 25,
  },
  {
    id: 2,
    subject: 'Science',
    title: 'Lab Report - Photosynthesis',
    class: 'Grade 6B',
    dueDate: 'Oct 27, 2025',
    status: 'pending',
    difficulty: 'hard',
    description: 'Write a detailed lab report on the photosynthesis experiment conducted in class.',
    attachments: ['lab_guidelines.pdf', 'report_template.docx'],
    submissions: 12,
    totalStudents: 22,
  },
  {
    id: 3,
    subject: 'English',
    title: 'Essay on Climate Change',
    class: 'Grade 5A',
    dueDate: 'Oct 28, 2025',
    status: 'pending',
    difficulty: 'medium',
    description: 'Write a 500-word essay discussing the impact of climate change on local ecosystems.',
    attachments: ['essay_rubric.pdf'],
    submissions: 20,
    totalStudents: 25,
  },
  {
    id: 4,
    subject: 'History',
    title: 'Timeline Project',
    class: 'Grade 6A',
    dueDate: 'Oct 22, 2025',
    status: 'completed',
    difficulty: 'easy',
    description: 'Create a visual timeline of major events in World War II.',
    attachments: [],
    submissions: 24,
    totalStudents: 24,
  },
];

const difficultyData = [
  { name: 'Easy', value: 35 },
  { name: 'Medium', value: 45 },
  { name: 'Hard', value: 20 },
];

export function HomeworkPage() {
  const { t } = useApp();
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [selectedHomework, setSelectedHomework] = useState<typeof homeworkData[0] | null>(null);

  const filteredHomework = homeworkData.filter(hw => 
    filter === 'all' || hw.status === filter
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="m-0">{t('homework')}</h1>
        <Button>
          <BookOpen size={16} className="mr-2" />
          Create Assignment
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Assignments</p>
          <p className="text-2xl m-0">{homeworkData.length}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Pending</p>
          <p className="text-2xl text-yellow-600 m-0">
            {homeworkData.filter(h => h.status === 'pending').length}
          </p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Completed</p>
          <p className="text-2xl text-green-600 m-0">
            {homeworkData.filter(h => h.status === 'completed').length}
          </p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Avg Completion Rate</p>
          <p className="text-2xl text-primary m-0">78%</p>
        </div>
      </div>

      {/* Chart and Filter */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
            <TabsList>
              <TabsTrigger value="all">All Assignments</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="lg:col-span-1" />
      </div>

      {/* Table and AI Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Homework Table */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHomework.map((hw) => (
                <TableRow key={hw.id}>
                  <TableCell>
                    <Badge variant="outline">{hw.subject}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div>
                      <p className="m-0">{hw.title}</p>
                      <p className="text-sm text-muted-foreground m-0">
                        Difficulty: {hw.difficulty}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{hw.class}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span className="text-sm">{hw.dueDate}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={hw.status === 'completed' ? 'default' : 'secondary'}>
                      {hw.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm m-0">
                        {hw.submissions}/{hw.totalStudents}
                      </p>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${(hw.submissions / hw.totalStudents) * 100}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedHomework(hw)}
                    >
                      <Eye size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* AI Difficulty Analysis */}
        <div className="space-y-6">
          <ChartWidget
            data={difficultyData}
            title="AI Difficulty Analysis"
            defaultType="pie"
          />
          
          <div className="bg-gradient-to-br from-[#0B5FFF]/10 to-[#6366F1]/10 rounded-xl border border-[#0B5FFF]/20 p-6">
            <div className="flex items-start gap-2 mb-3">
              <Badge variant="secondary">Coming Soon</Badge>
            </div>
            <h4 className="m-0 mb-2">Adaptive Exercises</h4>
            <p className="text-sm text-muted-foreground m-0">
              AI-powered personalized homework recommendations based on student performance and learning style.
            </p>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selectedHomework} onOpenChange={() => setSelectedHomework(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedHomework?.title}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <Badge>{selectedHomework?.subject}</Badge>
              <Badge variant="outline">{selectedHomework?.class}</Badge>
              <Badge variant={selectedHomework?.status === 'completed' ? 'default' : 'secondary'}>
                {selectedHomework?.status}
              </Badge>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-1">Due Date</p>
              <p className="m-0">{selectedHomework?.dueDate}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-1">Description</p>
              <p className="m-0">{selectedHomework?.description}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-1">Submission Progress</p>
              <p className="m-0">
                {selectedHomework?.submissions} / {selectedHomework?.totalStudents} students submitted
              </p>
            </div>
            
            {selectedHomework?.attachments && selectedHomework.attachments.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Attachments</p>
                <div className="space-y-2">
                  {selectedHomework.attachments.map((file, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded bg-muted">
                      <span className="text-sm">{file}</span>
                      <Button variant="ghost" size="sm">
                        <Download size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setSelectedHomework(null)}>
                {t('close')}
              </Button>
              <Button>View Submissions</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
