import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGroups } from "@/hooks/use-groups";
import { useState } from "react";

interface AddUserFormProps {
  roles: { label: string; value: string }[];
  onAddUser: (data: { email: string; role: string; group?: string }) => Promise<void>;
  initialData?: { email: string; role: string; group?: string };
}

export function AddUserForm({ roles, onAddUser, initialData }: AddUserFormProps) {
  const { groups } = useGroups();
  const [email, setEmail] = useState(initialData?.email || "");
  const [role, setRole] = useState(initialData?.role || "");
  const [selectedGroup, setSelectedGroup] = useState(initialData?.group || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddUser = async () => {
    if (!email || !role) return;
    
    setIsSubmitting(true);
    try {
      await onAddUser({ email, role, group: selectedGroup });
      if (!initialData) {
        setEmail("");
        setRole("");
        setSelectedGroup("");
      }
    } catch (error) {
      console.error("Failed to add user:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="email" className="text-right">
            Email
          </Label>
          <Input
            id="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="role" className="text-right">
            Role
          </Label>
          <Select 
            onValueChange={(value) => setRole(value)} 
            defaultValue={role}
          >
            <SelectTrigger>
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {role === "Leader" && (
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="group" className="text-right">
              Group
            </Label>
            <Select 
              value={selectedGroup} 
              onValueChange={setSelectedGroup}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select group" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((group) => (
                  <SelectItem key={group.name} value={group.name}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      <DialogFooter>
        <Button 
          onClick={handleAddUser} 
          disabled={isSubmitting || !email || !role}
          className="w-full"
        >
          {isSubmitting ? "Adding..." : "Add User"}
        </Button>
      </DialogFooter>
    </>
  );
}
