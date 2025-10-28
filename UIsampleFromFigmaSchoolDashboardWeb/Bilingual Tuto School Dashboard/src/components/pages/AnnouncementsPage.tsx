import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { AnnouncementCard } from '../AnnouncementCard';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { Search, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';

const allAnnouncements = [
  {
    id: 1,
    title: 'Annual Sports Day - Registration Open',
    description: 'Register your child for the upcoming Annual Sports Day. All students are welcome to participate in various sports activities including track and field, basketball, and swimming.',
    fullText: 'We are excited to announce that registration is now open for our Annual Sports Day scheduled for November 15, 2025. This is a wonderful opportunity for students to showcase their athletic abilities and team spirit...',
    date: 'Oct 20, 2025',
    priority: 'normal' as const,
    status: 'published' as const,
    attachments: ['sports_day_schedule.pdf', 'registration_form.pdf'],
  },
  {
    id: 2,
    title: 'School Closure Notice - National Holiday',
    description: 'School will be closed on Oct 25 for the national holiday. Classes will resume on Oct 26.',
    fullText: 'Dear Parents and Students, Please note that the school will be closed on October 25, 2025, in observance of the national holiday. All classes and activities are cancelled for this day...',
    date: 'Oct 18, 2025',
    priority: 'urgent' as const,
    status: 'published' as const,
    attachments: [],
  },
  {
    id: 3,
    title: 'Parent-Teacher Conference Schedule',
    description: 'Individual meetings scheduled for Nov 1-5. Check your inbox for appointment times.',
    fullText: 'Parent-Teacher conferences will be held from November 1-5, 2025. Individual appointment times have been sent to your registered email address...',
    date: 'Oct 15, 2025',
    priority: 'high' as const,
    status: 'published' as const,
    attachments: ['conference_guidelines.pdf'],
  },
  {
    id: 4,
    title: 'New Cafeteria Menu Available',
    description: 'Updated menu with healthier options now available. Includes vegetarian and allergy-friendly choices.',
    fullText: 'We have updated our cafeteria menu to include more nutritious and diverse meal options...',
    date: 'Oct 12, 2025',
    priority: 'normal' as const,
    status: 'published' as const,
    attachments: ['cafeteria_menu_oct.pdf'],
  },
  {
    id: 5,
    title: 'Science Fair Preparation Workshop',
    description: 'Join us for a hands-on workshop to prepare for the upcoming Science Fair.',
    date: 'Oct 10, 2025',
    priority: 'normal' as const,
    status: 'expired' as const,
    fullText: 'Science Fair preparation workshop materials...',
    attachments: [],
  },
  {
    id: 6,
    title: 'Draft: Winter Concert Planning',
    description: 'Planning for the annual winter concert. Details to be finalized.',
    date: 'Oct 8, 2025',
    priority: 'normal' as const,
    status: 'draft' as const,
    fullText: 'Draft content for winter concert...',
    attachments: [],
  },
];

export function AnnouncementsPage() {
  const { t } = useApp();
  const [filter, setFilter] = useState<'all' | 'active' | 'urgent' | 'expired'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<typeof allAnnouncements[0] | null>(null);

  const filteredAnnouncements = allAnnouncements.filter(ann => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'active' && ann.status === 'published') ||
      (filter === 'urgent' && ann.priority === 'urgent') ||
      (filter === 'expired' && ann.status === 'expired');
    
    const matchesSearch = ann.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ann.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="m-0">{t('announcements')}</h1>
        <Button>
          <Plus size={16} className="mr-2" />
          {t('addNew')}
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="flex-1">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="urgent">Urgent</TabsTrigger>
            <TabsTrigger value="expired">Expired</TabsTrigger>
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

      {/* Announcements List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredAnnouncements.map(ann => (
          <AnnouncementCard
            key={ann.id}
            {...ann}
            onClick={() => setSelectedAnnouncement(ann)}
          />
        ))}
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selectedAnnouncement} onOpenChange={() => setSelectedAnnouncement(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-start justify-between gap-4">
              <span>{selectedAnnouncement?.title}</span>
              <div className="flex gap-2 flex-shrink-0">
                <Badge variant={selectedAnnouncement?.priority === 'urgent' ? 'destructive' : 'default'}>
                  {selectedAnnouncement?.priority}
                </Badge>
                <Badge variant="outline">{selectedAnnouncement?.status}</Badge>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">{selectedAnnouncement?.date}</p>
            </div>
            
            <div>
              <p>{selectedAnnouncement?.fullText}</p>
            </div>
            
            {selectedAnnouncement?.attachments && selectedAnnouncement.attachments.length > 0 && (
              <div>
                <h4 className="mb-2">Attachments</h4>
                <div className="space-y-2">
                  {selectedAnnouncement.attachments.map((file, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded bg-muted">
                      <span className="text-sm">{file}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setSelectedAnnouncement(null)}>
                {t('close')}
              </Button>
              <Button>{t('edit')}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
