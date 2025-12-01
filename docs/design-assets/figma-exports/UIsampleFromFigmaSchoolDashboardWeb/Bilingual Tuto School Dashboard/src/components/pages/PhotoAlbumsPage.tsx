import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
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
} from '../ui/dialog';
import {
  Images,
  Calendar,
  Lock,
  Unlock,
  Eye,
  Download,
  Share2,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

const photoAlbums = [
  {
    id: 1,
    title: 'Field Trip to Science Museum',
    date: 'October 15, 2025',
    coverImage: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837',
    photoCount: 45,
    privacy: 'public',
    event: 'Field Trip',
    class: 'Grade 5A',
    description: 'Amazing day exploring science exhibits and interactive displays',
  },
  {
    id: 2,
    title: 'Sports Day 2025',
    date: 'October 10, 2025',
    coverImage: 'https://images.unsplash.com/photo-1517649763962-0c623066013b',
    photoCount: 120,
    privacy: 'public',
    event: 'Sports Event',
    class: 'All Classes',
    description: 'Annual sports day with track events, games, and team activities',
  },
  {
    id: 3,
    title: 'Art & Craft Week',
    date: 'October 5, 2025',
    coverImage: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f',
    photoCount: 32,
    privacy: 'private',
    event: 'Learning Activity',
    class: 'Grade 1A',
    description: 'Creative artwork from our talented young artists',
  },
  {
    id: 4,
    title: 'Halloween Party',
    date: 'October 31, 2024',
    coverImage: 'https://images.unsplash.com/photo-1509557965875-b88c97052f0e',
    photoCount: 78,
    privacy: 'public',
    event: 'Special Event',
    class: 'All Classes',
    description: 'Costumes, games, and fun activities for Halloween celebration',
  },
  {
    id: 5,
    title: 'Music Recital',
    date: 'September 28, 2025',
    coverImage: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae',
    photoCount: 54,
    privacy: 'public',
    event: 'Performance',
    class: 'Grade 3A, 4A',
    description: 'Students showcase their musical talents',
  },
  {
    id: 6,
    title: 'Classroom Activities - Week 40',
    date: 'September 25, 2025',
    coverImage: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b',
    photoCount: 28,
    privacy: 'private',
    event: 'Daily Activity',
    class: 'Grade 2B',
    description: 'Regular classroom learning and group activities',
  },
  {
    id: 7,
    title: 'Outdoor Nature Walk',
    date: 'September 20, 2025',
    coverImage: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb',
    photoCount: 40,
    privacy: 'public',
    event: 'Field Trip',
    class: 'Grade 1B',
    description: 'Exploring nature and learning about plants and animals',
  },
  {
    id: 8,
    title: 'Cooking Class Fun',
    date: 'September 15, 2025',
    coverImage: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74',
    photoCount: 36,
    privacy: 'private',
    event: 'Learning Activity',
    class: 'Grade 3B',
    description: 'Students learn basic cooking skills and healthy eating',
  },
];

const albumPhotos = [
  { id: 1, url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837', caption: 'Exploring the dinosaur exhibit' },
  { id: 2, url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158', caption: 'Interactive science experiments' },
  { id: 3, url: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789', caption: 'Group photo at the museum entrance' },
  { id: 4, url: 'https://images.unsplash.com/photo-1581092162384-8987c1d64718', caption: 'Learning about space exploration' },
  { id: 5, url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758', caption: 'Hands-on physics demonstrations' },
  { id: 6, url: 'https://images.unsplash.com/photo-1581092162384-8987c1d64718', caption: 'Students taking notes' },
];

export function PhotoAlbumsPage() {
  const { t } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPrivacy, setSelectedPrivacy] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [selectedAlbum, setSelectedAlbum] = useState<typeof photoAlbums[0] | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAlbumClick = (album: typeof photoAlbums[0]) => {
    setSelectedAlbum(album);
    setIsDialogOpen(true);
  };

  const filteredAlbums = photoAlbums.filter((album) => {
    const matchesSearch = album.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrivacy = selectedPrivacy === 'all' || album.privacy === selectedPrivacy;
    const matchesEvent = selectedEvent === 'all' || album.event === selectedEvent;
    return matchesSearch && matchesPrivacy && matchesEvent;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="m-0 mb-1">{t('photoAlbums')}</h1>
          <p className="text-sm text-muted-foreground m-0">
            Browse and manage photo albums from school events and activities
          </p>
        </div>
        <Button>
          <Plus size={16} className="mr-2" />
          Create Album
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Images size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-0.5">Total Albums</p>
              <p className="text-xl m-0">{photoAlbums.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Calendar size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-0.5">This Month</p>
              <p className="text-xl m-0">4</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Unlock size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-0.5">Public</p>
              <p className="text-xl m-0">5</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Lock size={20} className="text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-0.5">Private</p>
              <p className="text-xl m-0">3</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search albums..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div>
            <Select value={selectedPrivacy} onValueChange={setSelectedPrivacy}>
              <SelectTrigger>
                <SelectValue placeholder="Privacy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Albums</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
              <SelectTrigger>
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="Field Trip">Field Trips</SelectItem>
                <SelectItem value="Sports Event">Sports</SelectItem>
                <SelectItem value="Learning Activity">Learning</SelectItem>
                <SelectItem value="Special Event">Special Events</SelectItem>
                <SelectItem value="Performance">Performances</SelectItem>
                <SelectItem value="Daily Activity">Daily Activities</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Albums Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredAlbums.map((album) => (
          <div
            key={album.id}
            className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => handleAlbumClick(album)}
          >
            {/* Cover Image */}
            <div className="relative aspect-video overflow-hidden bg-muted">
              <ImageWithFallback
                src={album.coverImage}
                alt={album.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              {/* Privacy Badge */}
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="bg-white/90 text-gray-900">
                  {album.privacy === 'public' ? (
                    <><Unlock size={12} className="mr-1" /> Public</>
                  ) : (
                    <><Lock size={12} className="mr-1" /> Private</>
                  )}
                </Badge>
              </div>

              {/* Photo Count */}
              <div className="absolute bottom-2 right-2">
                <Badge className="bg-black/60 text-white border-0">
                  <Images size={12} className="mr-1" />
                  {album.photoCount}
                </Badge>
              </div>
            </div>

            {/* Album Info */}
            <div className="p-4">
              <h3 className="text-base m-0 mb-1 line-clamp-1">{album.title}</h3>
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{album.description}</p>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {new Date(album.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <Badge variant="outline" className="text-xs">
                  {album.event}
                </Badge>
              </div>

              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground">📚 {album.class}</span>
                <Button variant="ghost" size="sm" className="h-7 px-2">
                  <Eye size={14} className="mr-1" />
                  View
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Album Viewer Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle>{selectedAlbum?.title}</DialogTitle>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {selectedAlbum?.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Images size={14} />
                    {selectedAlbum?.photoCount} photos
                  </span>
                  <Badge variant="outline">{selectedAlbum?.event}</Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Share2 size={14} className="mr-1" />
                  Share
                </Button>
                <Button variant="outline" size="sm">
                  <Download size={14} className="mr-1" />
                  Download
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-4">{selectedAlbum?.description}</p>
            
            {/* Photo Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {albumPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="aspect-square rounded-lg overflow-hidden bg-muted hover:opacity-90 transition-opacity cursor-pointer group relative"
                >
                  <ImageWithFallback
                    src={photo.url}
                    alt={photo.caption}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white text-sm text-center px-4">{photo.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
