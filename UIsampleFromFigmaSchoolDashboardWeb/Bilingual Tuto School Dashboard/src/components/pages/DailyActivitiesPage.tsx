import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Clock,
  UtensilsCrossed,
  Moon,
  Droplets,
  BookOpen,
  Palette,
  Play,
  CheckCircle,
  Clock3,
  AlertCircle,
  ChevronRight,
  Download,
} from 'lucide-react';

const activityTypes = {
  meal: { icon: UtensilsCrossed, label: 'Meal', color: 'text-orange-600' },
  nap: { icon: Moon, label: 'Nap Time', color: 'text-indigo-600' },
  bathroom: { icon: Droplets, label: 'Bathroom', color: 'text-blue-600' },
  learning: { icon: BookOpen, label: 'Learning', color: 'text-green-600' },
  creative: { icon: Palette, label: 'Creative', color: 'text-purple-600' },
  play: { icon: Play, label: 'Play Time', color: 'text-pink-600' },
};

const dailyActivities = [
  {
    id: 1,
    time: '08:30 AM',
    type: 'meal',
    title: 'Breakfast',
    description: 'Oatmeal with fruits and milk',
    status: 'completed',
    teacher: 'Mrs. Johnson',
    class: 'Grade 1A',
    notes: 'Emily ate well, finished everything',
  },
  {
    id: 2,
    time: '09:00 AM',
    type: 'learning',
    title: 'Math Class',
    description: 'Counting and basic addition',
    status: 'completed',
    teacher: 'Mr. Smith',
    class: 'Grade 1A',
    notes: 'Great participation today',
  },
  {
    id: 3,
    time: '10:00 AM',
    type: 'bathroom',
    title: 'Bathroom Break',
    description: 'Regular scheduled break',
    status: 'completed',
    teacher: 'Mrs. Johnson',
    class: 'Grade 1A',
    notes: '',
  },
  {
    id: 4,
    time: '10:15 AM',
    type: 'play',
    title: 'Outdoor Play',
    description: 'Playground activities and games',
    status: 'in-progress',
    teacher: 'Ms. Davis',
    class: 'Grade 1A',
    notes: 'Playing with friends',
  },
  {
    id: 5,
    time: '11:00 AM',
    type: 'creative',
    title: 'Art & Craft',
    description: 'Paper folding and coloring',
    status: 'pending',
    teacher: 'Mrs. Anderson',
    class: 'Grade 1A',
    notes: '',
  },
  {
    id: 6,
    time: '12:00 PM',
    type: 'meal',
    title: 'Lunch Time',
    description: 'Rice, vegetables, chicken, and soup',
    status: 'pending',
    teacher: 'Mrs. Johnson',
    class: 'Grade 1A',
    notes: '',
  },
  {
    id: 7,
    time: '01:00 PM',
    type: 'nap',
    title: 'Afternoon Nap',
    description: 'Rest time after lunch',
    status: 'pending',
    teacher: 'Mrs. Johnson',
    class: 'Grade 1A',
    notes: '',
  },
  {
    id: 8,
    time: '02:30 PM',
    type: 'learning',
    title: 'Story Time',
    description: 'Reading and storytelling session',
    status: 'pending',
    teacher: 'Ms. Brown',
    class: 'Grade 1A',
    notes: '',
  },
];

const StatusBadge = ({ status }: { status: string }) => {
  const config = {
    completed: {
      icon: CheckCircle,
      text: 'Completed',
      className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    },
    'in-progress': {
      icon: Clock3,
      text: 'In Progress',
      className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    },
    pending: {
      icon: Clock,
      text: 'Pending',
      className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
    },
    missed: {
      icon: AlertCircle,
      text: 'Missed',
      className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
    },
  };

  const statusConfig = config[status as keyof typeof config] || config.pending;
  const Icon = statusConfig.icon;

  return (
    <Badge variant="outline" className={statusConfig.className}>
      <Icon size={12} className="mr-1" />
      {statusConfig.text}
    </Badge>
  );
};

export function DailyActivitiesPage() {
  const { t } = useApp();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  const summaryStats = {
    total: 8,
    completed: 3,
    inProgress: 1,
    pending: 4,
    completionRate: '50%',
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="m-0 mb-1">{t('dailyActivities')}</h1>
          <p className="text-sm text-muted-foreground m-0">
            Track daily activities, meals, and learning progress
          </p>
        </div>
        <Button variant="outline">
          <Download size={16} className="mr-2" />
          {t('export')}
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Activities</p>
          <p className="text-2xl m-0">{summaryStats.total}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">{t('completed')}</p>
          <p className="text-2xl text-green-600 m-0">{summaryStats.completed}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">In Progress</p>
          <p className="text-2xl text-blue-600 m-0">{summaryStats.inProgress}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">{t('pending')}</p>
          <p className="text-2xl text-gray-600 m-0">{summaryStats.pending}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Completion Rate</p>
          <p className="text-2xl text-primary m-0">{summaryStats.completionRate}</p>
        </div>
      </div>

      {/* Filters and Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Calendar and Filters */}
        <div className="space-y-4">
          {/* Calendar */}
          <div className="bg-card rounded-xl border border-border p-4">
            <h3 className="text-sm mb-3">Select Date</h3>
            <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md" />
          </div>

          {/* Filters */}
          <div className="bg-card rounded-xl border border-border p-4 space-y-3">
            <h3 className="text-sm mb-3">Filters</h3>
            
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Class</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  <SelectItem value="1a">Grade 1A</SelectItem>
                  <SelectItem value="1b">Grade 1B</SelectItem>
                  <SelectItem value="2a">Grade 2A</SelectItem>
                  <SelectItem value="2b">Grade 2B</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Activity Type</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="meal">Meals</SelectItem>
                  <SelectItem value="nap">Nap Time</SelectItem>
                  <SelectItem value="learning">Learning</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                  <SelectItem value="play">Play Time</SelectItem>
                  <SelectItem value="bathroom">Bathroom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Main Content - Activities Timeline */}
        <div className="lg:col-span-3">
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="mb-4">Today's Timeline</h2>
            
            <Tabs defaultValue="timeline" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="timeline">Timeline View</TabsTrigger>
                <TabsTrigger value="grid">Grid View</TabsTrigger>
              </TabsList>

              <TabsContent value="timeline" className="space-y-4">
                {dailyActivities.map((activity, index) => {
                  const ActivityIcon = activityTypes[activity.type as keyof typeof activityTypes].icon;
                  const iconColor = activityTypes[activity.type as keyof typeof activityTypes].color;

                  return (
                    <div
                      key={activity.id}
                      className="flex gap-4 pb-4 border-b border-border last:border-0 last:pb-0"
                    >
                      {/* Time & Icon */}
                      <div className="flex flex-col items-center gap-2 flex-shrink-0 w-20">
                        <p className="text-sm m-0 text-muted-foreground">{activity.time}</p>
                        <div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center ${iconColor}`}>
                          <ActivityIcon size={20} />
                        </div>
                        {index < dailyActivities.length - 1 && (
                          <div className="flex-1 w-0.5 bg-border min-h-[20px]" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pt-1">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-base m-0">{activity.title}</h3>
                              <StatusBadge status={activity.status} />
                            </div>
                            <p className="text-sm text-muted-foreground m-0">
                              {activity.description}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <ChevronRight size={16} />
                          </Button>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>👤 {activity.teacher}</span>
                          <span>📚 {activity.class}</span>
                        </div>

                        {activity.notes && (
                          <div className="mt-2 p-2 rounded-lg bg-muted">
                            <p className="text-sm m-0">💬 {activity.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </TabsContent>

              <TabsContent value="grid">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dailyActivities.map((activity) => {
                    const ActivityIcon = activityTypes[activity.type as keyof typeof activityTypes].icon;
                    const iconColor = activityTypes[activity.type as keyof typeof activityTypes].color;

                    return (
                      <div
                        key={activity.id}
                        className="p-4 rounded-lg border border-border hover:shadow-md transition-shadow cursor-pointer"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0 ${iconColor}`}>
                            <ActivityIcon size={20} />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm m-0 mb-1">{activity.title}</h3>
                            <p className="text-xs text-muted-foreground m-0">
                              {activity.time}
                            </p>
                          </div>
                          <StatusBadge status={activity.status} />
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{activity.description}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>👤 {activity.teacher}</span>
                          <span>📚 {activity.class}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
