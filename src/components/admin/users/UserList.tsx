
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  MoreHorizontal, 
  Activity,
  UserCog,
  Bell
} from 'lucide-react';
import { UserNotificationDialog } from './UserNotificationDialog';
import { UserRoleChangeDialog } from './UserRoleChangeDialog';

interface UserListProps {
  users: any[];
  onUserSelect: (userId: string) => void;
  onDetailedView: (userId: string) => void;
  onRefresh: () => void;
}

export function UserList({ users, onUserSelect, onDetailedView, onRefresh }: UserListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [showRoleChangeDialog, setShowRoleChangeDialog] = useState(false);

  const filteredUsers = users.filter(user =>
    user.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.matricule?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generateAvatar = (firstName: string, lastName: string) => {
    const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
    return (
      <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
        {initials}
      </div>
    );
  };

  const handleNotificationClick = (user: any) => {
    setSelectedUser(user);
    setShowNotificationDialog(true);
  };

  const handleRoleChangeClick = (user: any) => {
    setSelectedUser(user);
    setShowRoleChangeDialog(true);
  };

  return (
    <>
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher des utilisateurs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Matricule</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {user.photo_profil_url ? (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.photo_profil_url} />
                        <AvatarFallback>
                          {user.prenom?.[0]}{user.nom?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      generateAvatar(user.prenom, user.nom)
                    )}
                    <div>
                      <div className="font-medium">{user.prenom} {user.nom}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant="outline">{user.matricule || 'N/A'}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{user.role || 'user'}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.statut === 'active' ? 'default' : 'destructive'}>
                    {user.statut || 'active'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onDetailedView(user.id)}>
                        <Activity className="h-4 w-4 mr-2" />
                        Profil détaillé
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleRoleChangeClick(user)}>
                        <UserCog className="h-4 w-4 mr-2" />
                        Changer rôle
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleNotificationClick(user)}>
                        <Bell className="h-4 w-4 mr-2" />
                        Envoyer notification
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedUser && (
        <>
          <UserNotificationDialog
            user={selectedUser}
            open={showNotificationDialog}
            onOpenChange={setShowNotificationDialog}
          />
          <UserRoleChangeDialog
            user={selectedUser}
            open={showRoleChangeDialog}
            onOpenChange={setShowRoleChangeDialog}
            onSuccess={onRefresh}
          />
        </>
      )}
    </>
  );
}
