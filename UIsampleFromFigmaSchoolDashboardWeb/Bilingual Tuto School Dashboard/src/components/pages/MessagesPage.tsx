import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { MessageCard } from '../MessageCard';
import { Button } from '../ui/button';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Search, Plus, Send } from 'lucide-react';
import { Badge } from '../ui/badge';

const messageData = [
  {
    id: 1,
    from: 'Ms. Sarah Johnson',
    subject: 'Math homework clarification needed',
    preview: 'Could you please clarify the instructions for problem set 3.2? Some students are confused about...',
    fullText: 'Dear Admin,\n\nCould you please clarify the instructions for problem set 3.2? Some students are confused about whether they need to show all work or just the final answers. Also, is the deadline still October 26th?\n\nThank you,\nMs. Sarah Johnson',
    date: '2h ago',
    priority: 'normal' as const,
    read: false,
    folder: 'inbox' as const,
  },
  {
    id: 2,
    from: 'Principal Office',
    subject: 'Monthly newsletter ready for review',
    preview: 'The October newsletter is ready for your approval before publishing to all parents...',
    fullText: 'Hello,\n\nThe October newsletter is ready for your approval before publishing to all parents. Please review and let us know if any changes are needed.\n\nBest regards,\nPrincipal Office',
    date: '5h ago',
    priority: 'high' as const,
    read: false,
    folder: 'inbox' as const,
  },
  {
    id: 3,
    from: 'Mr. David Chen',
    subject: 'Field trip permission forms',
    preview: 'All permission forms for the science museum field trip have been collected...',
    fullText: 'Hi,\n\nAll permission forms for the science museum field trip have been collected. We have 42 out of 45 students participating.\n\nMr. David Chen',
    date: '1 day ago',
    priority: 'normal' as const,
    read: true,
    folder: 'inbox' as const,
  },
  {
    id: 4,
    from: 'Parent - Emily Chen',
    subject: 'Request for meeting',
    preview: 'I would like to schedule a meeting to discuss my daughter Emily\'s progress...',
    fullText: 'Dear Teachers,\n\nI would like to schedule a meeting to discuss my daughter Emily\'s progress in Mathematics. When would be a good time for you?\n\nThank you,\nMrs. Chen',
    date: '2 days ago',
    priority: 'normal' as const,
    read: true,
    folder: 'inbox' as const,
  },
];

const sentMessages = [
  {
    id: 5,
    from: 'Me',
    to: 'All Parents - Grade 5A',
    subject: 'Reminder: Parent-Teacher Conference',
    preview: 'This is a reminder about the upcoming Parent-Teacher Conference scheduled for...',
    fullText: 'Dear Parents,\n\nThis is a reminder about the upcoming Parent-Teacher Conference scheduled for November 1-5. Please check your email for your assigned time slot.\n\nBest regards,\nSchool Administration',
    date: '3h ago',
    priority: 'normal' as const,
    read: true,
    folder: 'sent' as const,
  },
];

export function MessagesPage() {
  const { t } = useApp();
  const [folder, setFolder] = useState<'inbox' | 'sent' | 'unread'>('inbox');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<typeof messageData[0] | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);

  const allMessages = folder === 'sent' ? sentMessages : messageData;
  const filteredMessages = allMessages.filter(msg => {
    const matchesFolder = 
      folder === 'inbox' ? msg.folder === 'inbox' :
      folder === 'sent' ? msg.folder === 'sent' :
      folder === 'unread' ? !msg.read : true;
    
    const matchesSearch = msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.from.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFolder && matchesSearch;
  });

  const unreadCount = messageData.filter(m => !m.read).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="m-0">{t('messages')}</h1>
        <Button onClick={() => setComposeOpen(true)}>
          <Plus size={16} className="mr-2" />
          Compose
        </Button>
      </div>

      {/* Tabs and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <Tabs value={folder} onValueChange={(v) => setFolder(v as any)} className="flex-1">
          <TabsList>
            <TabsTrigger value="inbox">
              Inbox
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2 px-1.5 py-0 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sent">Sent</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
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

      {/* Two-Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message List */}
        <div className="lg:col-span-1 space-y-2">
          {filteredMessages.map(msg => (
            <MessageCard
              key={msg.id}
              {...msg}
              onClick={() => setSelectedMessage(msg)}
            />
          ))}
          {filteredMessages.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No messages found</p>
            </div>
          )}
        </div>

        {/* Message Preview */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6">
          {selectedMessage ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between pb-4 border-b border-border">
                <div className="flex-1">
                  <h3 className="m-0 mb-2">{selectedMessage.subject}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>From: {selectedMessage.from}</span>
                    <span>•</span>
                    <span>{selectedMessage.date}</span>
                  </div>
                </div>
                <Badge variant={selectedMessage.priority === 'high' ? 'destructive' : 'default'}>
                  {selectedMessage.priority}
                </Badge>
              </div>
              
              <div className="py-4">
                <p className="whitespace-pre-line">{selectedMessage.fullText}</p>
              </div>
              
              <div className="flex gap-2 pt-4 border-t border-border">
                <Button>
                  <Send size={16} className="mr-2" />
                  Reply
                </Button>
                <Button variant="outline">Forward</Button>
                <Button variant="outline">Delete</Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Search size={24} className="text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">Select a message to read</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compose Dialog */}
      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Compose Message</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="to">To</Label>
              <Input id="to" placeholder="Select recipients..." />
            </div>
            
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" placeholder="Message subject" />
            </div>
            
            <div>
              <Label htmlFor="priority">Priority</Label>
              <select id="priority" className="w-full px-3 py-2 rounded-lg border border-input bg-background">
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="low">Low</option>
              </select>
            </div>
            
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Write your message here..."
                rows={8}
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button>
                <Send size={16} className="mr-2" />
                Send
              </Button>
              <Button variant="outline" onClick={() => setComposeOpen(false)}>
                {t('cancel')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
