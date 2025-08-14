import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Shield, Calendar } from 'lucide-react';
<<<<<<< HEAD

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
=======
import { useToast } from '@/hooks/use-toast';

export default function Profile() {
  const { user, updateProfile, refreshUser } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
>>>>>>> productsDetail
  });

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSave = async () => {
<<<<<<< HEAD
    // TODO: Implement profile update API call
    console.log('Saving profile:', formData);
    setIsEditing(false);
    // await updateProfile(formData);
    // await refreshUser();
=======
    try {
      setIsLoading(true);
      
      // Prepare the update data - only include fields that are not empty
      const updateData: any = {};
      
      if (formData.name.trim() !== user.name) {
        updateData.name = formData.name.trim();
      }
      
      if (formData.email.trim() !== user.email) {
        updateData.email = formData.email.trim();
      }
      
      if (formData.newPassword.trim()) {
        if (!formData.currentPassword.trim()) {
          toast({
            title: 'Error',
            description: 'Current password is required to change password',
            variant: 'destructive',
          });
          return;
        }
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }
      
      if (Object.keys(updateData).length === 0) {
        setIsEditing(false);
        return;
      }
      
      await updateProfile(updateData);
      setIsEditing(false);
      
      // Clear password fields after successful update
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
      }));
      
      toast({
        title: 'Success',
        description: 'Profile updated successfully!',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
>>>>>>> productsDetail
  };

  const handleCancel = () => {
    setFormData({
      name: user.name,
      email: user.email,
<<<<<<< HEAD
=======
      currentPassword: '',
      newPassword: '',
>>>>>>> productsDetail
    });
    setIsEditing(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Helmet>
        <title>Profile Settings — Da Nang Discovery Hub</title>
        <meta name="description" content="Manage your profile settings and account information." />
      </Helmet>

      <div className="mb-8">
        <h1 className="font-display text-3xl mb-2">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your account information and preferences.
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User size={20} />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm text-muted-foreground">Profile Picture</p>
                <Button variant="outline" size="sm" className="mt-1">
                  Change Avatar
                </Button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your full name"
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 bg-muted rounded">
                    <User size={16} />
                    <span>{user.name}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter your email"
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 bg-muted rounded">
                    <Mail size={16} />
                    <span>{user.email}</span>
                  </div>
                )}
              </div>

<<<<<<< HEAD
=======
              {isEditing && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={formData.currentPassword}
                      onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                      placeholder="Enter current password (required for changes)"
                    />
                    <p className="text-xs text-muted-foreground">
                      Required to save any changes to your profile
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      placeholder="Enter new password (optional)"
                    />
                    <p className="text-xs text-muted-foreground">
                      Leave blank to keep current password
                    </p>
                  </div>
                </>
              )}

>>>>>>> productsDetail
              <div className="space-y-2">
                <Label>Account Role</Label>
                <div className="flex items-center gap-2 p-2 bg-muted rounded">
                  <Shield size={16} />
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role === 'admin' ? 'Administrator' : 'User'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Member Since</Label>
                <div className="flex items-center gap-2 p-2 bg-muted rounded">
                  <Calendar size={16} />
                  <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              {isEditing ? (
                <>
<<<<<<< HEAD
                  <Button onClick={handleSave}>
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
=======
                  <Button onClick={handleSave} disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
>>>>>>> productsDetail
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Account Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Account Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-muted rounded-lg">
<<<<<<< HEAD
                <div className="text-2xl font-bold text-primary">0</div>
=======
                <div className="text-2xl font-bold text-primary">{user.favorites?.length || 0}</div>
>>>>>>> productsDetail
                <p className="text-sm text-muted-foreground">Places Favorited</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">0</div>
                <p className="text-sm text-muted-foreground">Reviews Written</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
