import React from 'react';
import { useApp } from '../AppContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Check, Globe, Moon, Sun } from 'lucide-react';

export function SettingsPage() {
  const { t, language, setLanguage, theme, setTheme, role } = useApp();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <h1 className="m-0">{t('settings')}</h1>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="m-0 mb-6">Profile Information</h3>
            
            <div className="flex items-start gap-6 mb-6">
              <Avatar className="w-20 h-20">
                <AvatarImage src="" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Button variant="outline" className="mb-2">Upload Photo</Button>
                <p className="text-sm text-muted-foreground m-0">
                  JPG, GIF or PNG. Max size of 2MB
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" defaultValue="John Administrator" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="admin@sunrise-school.edu" />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" defaultValue="+1 234 567 8900" />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Input id="role" value={role.charAt(0).toUpperCase() + role.slice(1)} disabled />
              </div>
            </div>

            <div className="mt-6">
              <Label htmlFor="school">Linked School</Label>
              <div className="flex items-center gap-2 mt-2">
                <Input id="school" value="Sunrise International School" disabled />
                <Badge variant="default">
                  <Check size={12} className="mr-1" />
                  Active
                </Badge>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button>{t('save')}</Button>
              <Button variant="outline">{t('cancel')}</Button>
            </div>
          </div>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="m-0 mb-6">Appearance & Language</h3>
            
            <div className="space-y-6">
              {/* Theme */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
                  <div>
                    <p className="m-0">Theme</p>
                    <p className="text-sm text-muted-foreground m-0">
                      Current: {theme.charAt(0).toUpperCase() + theme.slice(1)} mode
                    </p>
                  </div>
                </div>
                <Switch
                  checked={theme === 'dark'}
                  onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                />
              </div>

              {/* Language */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe size={20} />
                  <div>
                    <p className="m-0">Language</p>
                    <p className="text-sm text-muted-foreground m-0">
                      Current: {language === 'en' ? 'English' : 'Tiếng Việt'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={language === 'en' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setLanguage('en')}
                  >
                    EN
                  </Button>
                  <Button
                    variant={language === 'vi' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setLanguage('vi')}
                  >
                    VI
                  </Button>
                </div>
              </div>

              {/* Date Format */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="m-0">Date Format</p>
                  <p className="text-sm text-muted-foreground m-0">MM/DD/YYYY</p>
                </div>
                <Button variant="outline" size="sm">Change</Button>
              </div>

              {/* Time Zone */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="m-0">Time Zone</p>
                  <p className="text-sm text-muted-foreground m-0">GMT+7 (Bangkok, Hanoi)</p>
                </div>
                <Button variant="outline" size="sm">Change</Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="m-0 mb-6">Connected Services</h3>
            
            <div className="space-y-4">
              {/* Airtable */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#0B5FFF] flex items-center justify-center text-white">
                    A
                  </div>
                  <div>
                    <p className="m-0">Airtable</p>
                    <p className="text-sm text-muted-foreground m-0">
                      <Badge variant="default" className="mr-2">
                        <Check size={12} className="mr-1" />
                        Connected
                      </Badge>
                      Last synced 2 min ago
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Configure</Button>
              </div>

              {/* Google Classroom */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#4285F4] flex items-center justify-center text-white">
                    G
                  </div>
                  <div>
                    <p className="m-0">Google Classroom</p>
                    <p className="text-sm text-muted-foreground m-0">
                      <Badge variant="secondary">Available</Badge>
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Connect</Button>
              </div>

              {/* Stripe */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#635BFF] flex items-center justify-center text-white">
                    S
                  </div>
                  <div>
                    <p className="m-0">Stripe</p>
                    <p className="text-sm text-muted-foreground m-0">
                      <Badge variant="secondary">Available</Badge>
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Connect</Button>
              </div>

              {/* Twilio */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#F22F46] flex items-center justify-center text-white">
                    T
                  </div>
                  <div>
                    <p className="m-0">Twilio</p>
                    <p className="text-sm text-muted-foreground m-0">
                      <Badge variant="secondary">Available</Badge>
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Connect</Button>
              </div>

              {/* Firebase */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#FFCA28] flex items-center justify-center text-white">
                    F
                  </div>
                  <div>
                    <p className="m-0">Firebase</p>
                    <p className="text-sm text-muted-foreground m-0">
                      <Badge variant="secondary">Available</Badge>
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Connect</Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="m-0 mb-6">Notification Preferences</h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="m-0">Email Notifications</p>
                  <p className="text-sm text-muted-foreground m-0">
                    Receive email updates for important events
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="m-0">Push Notifications</p>
                  <p className="text-sm text-muted-foreground m-0">
                    Get notified about new messages and announcements
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="m-0">SMS Notifications</p>
                  <p className="text-sm text-muted-foreground m-0">
                    Receive text messages for urgent updates
                  </p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="m-0">Weekly Reports</p>
                  <p className="text-sm text-muted-foreground m-0">
                    Get a weekly summary of school activities
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
