import React, { useState } from 'react';
import { User, Lock, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FormField } from '../../components/forms/FormField';
import { Modal } from '../../components/ui/Modal';
import { ChangePasswordForm } from '../../components/features/auth/ChangePasswordForm';
import { useAuth } from '../../hooks/useAuth';
import { formatDate } from '../../utils';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    username: user?.username || '',
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    // This would typically call an API to update profile
    // For now, we'll just show a success message
    alert('Profile update functionality would be implemented here');
  };

  const handlePasswordChangeSuccess = () => {
    setShowChangePassword(false);
    alert('Password changed successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    type="text"
                    name="firstName"
                    label="First Name"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                    required
                  />
                  
                  <FormField
                    type="text"
                    name="lastName"
                    label="Last Name"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                    required
                  />
                </div>

                <FormField
                  type="email"
                  name="email"
                  label="Email Address"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />

                <FormField
                  type="text"
                  name="username"
                  label="Username"
                  value={profileData.username}
                  onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                  required
                />

                <div className="flex gap-4 pt-4">
                  <Button type="submit">
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Account Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Role</div>
                <div className="text-lg font-semibold">{user?.role}</div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-muted-foreground">Last Login</div>
                <div className="text-sm">
                  {user?.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-muted-foreground">Permissions</div>
                <div className="text-sm">
                  {user?.permissions?.length || 0} permissions assigned
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Keep your account secure by regularly updating your password.
                </p>
                
                <Button
                  variant="outline"
                  onClick={() => setShowChangePassword(true)}
                  className="w-full"
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        title="Change Password"
        description="Enter your current password and choose a new one"
        size="md"
      >
        <ChangePasswordForm
          onSuccess={handlePasswordChangeSuccess}
          onCancel={() => setShowChangePassword(false)}
        />
      </Modal>
    </div>
  );
};

export { ProfilePage };
