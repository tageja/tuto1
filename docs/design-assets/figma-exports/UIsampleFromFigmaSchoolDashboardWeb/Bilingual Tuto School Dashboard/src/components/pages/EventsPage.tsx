import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { Search, Plus, Calendar, MapPin, Users } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

const eventsData = [
  {
    id: 1,
    title: 'Annual Sports Day',
    type: 'school',
    date: 'Nov 15, 2025',
    time: '9:00 AM - 3:00 PM',
    location: 'Main Sports Field',
    status: 'upcoming',
    participants: 245,
    capacity: 300,
    description: 'Annual athletics competition featuring track and field events, team sports, and award ceremonies.',
  },
  {
    id: 2,
    title: 'Parent-Teacher Conference',
    type: 'school',
    date: 'Nov 1-5, 2025',
    time: '2:00 PM - 6:00 PM',
    location: 'Individual Classrooms',
    status: 'upcoming',
    participants: 180,
    capacity: 200,
    description: 'One-on-one meetings between parents and teachers to discuss student progress.',
  },
  {
    id: 3,
    title: 'Science Fair',
    type: 'competition',
    date: 'Dec 10, 2025',
    time: '10:00 AM - 4:00 PM',
    location: 'School Auditorium',
    status: 'upcoming',
    participants: 85,
    capacity: 100,
    description: 'Student science projects exhibition and competition with prizes for top projects.',
  },
  {
    id: 4,
    title: 'Grade 5A Field Trip - Science Museum',
    type: 'class',
    date: 'Oct 28, 2025',
    time: '8:00 AM - 2:00 PM',
    location: 'National Science Museum',
    status: 'upcoming',
    participants: 42,
    capacity: 45,
    description: 'Educational trip to explore interactive science exhibits.',
  },
  {
    id: 5,
    title: 'Art Workshop - Watercolor Techniques',
    type: 'workshop',
    date: 'Nov 8, 2025',
    time: '1:00 PM - 3:00 PM',
    location: 'Art Room 2',
    status: 'upcoming',
    participants: 20,
    capacity: 25,
    description: 'Hands-on workshop teaching advanced watercolor painting techniques.',
  },
  {
    id: 6,
    title: 'Halloween Celebration',
    type: 'school',
    date: 'Oct 31, 2025',
    time: '2:00 PM - 4:00 PM',
    location: 'School Courtyard',
    status: 'upcoming',
    participants: 320,
    capacity: 400,
    description: 'Costume parade, games, and treats for all students.',
  },
  {
    id: 7,
    title: 'Math Olympiad - Regional',
    type: 'competition',
    date: 'Oct 15, 2025',
    time: '9:00 AM - 12:00 PM',
    location: 'Regional Center',
    status: 'completed',
    participants: 15,
    capacity: 15,
    description: 'Regional mathematics competition.',
  },
  {
    id: 8,
    title: 'Music Recital',
    type: 'school',
    date: 'Oct 10, 2025',
    time: '6:00 PM - 8:00 PM',
    location: 'School Auditorium',
    status: 'completed',
    participants: 65,
    capacity: 70,
    description: 'Student performances showcasing musical talents.',
  },
];

export function EventsPage() {
  const { t } = useApp();
  const [filter, setFilter] = useState<'all' | 'school' | 'class' | 'competition' | 'workshop'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEvents = eventsData.filter(event => {
    const matchesFilter = filter === 'all' || event.type === filter;
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch && event.status === 'upcoming';
  });

  const upcomingCount = eventsData.filter(e => e.status === 'upcoming').length;
  const completedCount = eventsData.filter(e => e.status === 'completed').length;

  const TypeBadge = ({ type }: { type: string }) => {
    const colors: Record<string, string> = {
      school: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
      class: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
      competition: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
      workshop: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
    };
    
    return (
      <Badge variant="outline" className={colors[type]}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="m-0">{t('events')}</h1>
        <Button>
          <Plus size={16} className="mr-2" />
          Create Event
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Events</p>
          <p className="text-2xl m-0">{eventsData.length}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Upcoming</p>
          <p className="text-2xl text-primary m-0">{upcomingCount}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Completed</p>
          <p className="text-2xl text-green-600 m-0">{completedCount}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Participants</p>
          <p className="text-2xl m-0">972</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="flex-1">
          <TabsList>
            <TabsTrigger value="all">All Events</TabsTrigger>
            <TabsTrigger value="school">School</TabsTrigger>
            <TabsTrigger value="class">Class</TabsTrigger>
            <TabsTrigger value="competition">Competitions</TabsTrigger>
            <TabsTrigger value="workshop">Workshops</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            type="text"
            placeholder={t('search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEvents.map(event => (
          <div key={event.id} className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <TypeBadge type={event.type} />
              <Badge variant="outline">
                {event.participants}/{event.capacity}
              </Badge>
            </div>
            
            <h3 className="m-0 mb-3">{event.title}</h3>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar size={14} />
                <span>{event.date}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>🕐</span>
                <span>{event.time}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin size={14} />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users size={14} />
                <span>{event.participants} participants</span>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{event.description}</p>
            
            <div className="flex gap-2">
              <Button size="sm" className="flex-1">View Details</Button>
              <Button size="sm" variant="outline">Register</Button>
            </div>
          </div>
        ))}
      </div>

      {/* Events Table (Alternative View) */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="m-0">Event Schedule</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Participants</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEvents.slice(0, 5).map((event) => (
              <TableRow key={event.id}>
                <TableCell>
                  <div>
                    <p className="m-0">{event.title}</p>
                    <p className="text-sm text-muted-foreground m-0 line-clamp-1">
                      {event.description}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <TypeBadge type={event.type} />
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <p className="m-0">{event.date}</p>
                    <p className="text-muted-foreground m-0">{event.time}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <MapPin size={14} />
                    <span className="text-sm">{event.location}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{event.participants}/{event.capacity}</span>
                    <div className="w-16 bg-muted rounded-full h-1.5">
                      <div
                        className="bg-primary h-1.5 rounded-full"
                        style={{ width: `${(event.participants / event.capacity) * 100}%` }}
                      />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">View</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
