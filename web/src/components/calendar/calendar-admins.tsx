import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import firebase from "@/firebase/config";
import { useToast } from "@/hooks/use-toast";
import { Mail, Shield, UserMinus } from "lucide-react";
import React from "react";

const CalendarAdmins = ({ calendarId }) => {
  const { toast } = useToast();
  const [admins, setAdmins] = React.useState([]);
  const [newAdminEmail, setNewAdminEmail] = React.useState("");
  const [isAddingAdmin, setIsAddingAdmin] = React.useState(false);

  React.useEffect(() => {
    const fetchAdmins = async () => {
      const ref = firebase.database.ref(`/calendars/${calendarId}/admins`);
      const snapshot = await ref.once("value");
      const data = snapshot.val() || [];
      setAdmins(Object.values(data));
    };

    fetchAdmins();
  }, [calendarId]);

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (!newAdminEmail) return;

    try {
      setIsAddingAdmin(true);
      const ref = firebase.database.ref(`/calendars/${calendarId}/admins`);
      const newAdmin = {
        email: newAdminEmail,
        addedAt: new Date().toISOString(),
      };
      await ref.push(newAdmin);
      setAdmins([...admins, newAdmin]);
      setNewAdminEmail("");
      toast({
        title: "Success",
        description: "Admin added successfully",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to add admin",
        variant: "destructive",
      });
    } finally {
      setIsAddingAdmin(false);
    }
  };

  const handleRemoveAdmin = async (email) => {
    try {
      const ref = firebase.database.ref(`/calendars/${calendarId}/admins`);
      const filtered = admins.filter(a => a.email !== email);
      await ref.set(filtered);
      setAdmins(filtered);
      toast({
        title: "Success",
        description: "Admin removed successfully",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to remove admin",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Dialog>
        <DialogTrigger asChild>
          <Button>
            <Shield className="mr-2 h-4 w-4" />
            Add Admin
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Admin</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddAdmin} className="space-y-4">
            <Input
              placeholder="Admin email"
              type="email"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
            />
            <Button type="submit" disabled={isAddingAdmin}>
              {isAddingAdmin ? "Adding..." : "Add Admin"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Added Date</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins.map((admin) => (
              <TableRow key={admin.email}>
                <TableCell className="font-medium">{admin.email}</TableCell>
                <TableCell>{new Date(admin.addedAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => window.location.href = `mailto:${admin.email}`}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveAdmin(admin.email)}
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CalendarAdmins; 