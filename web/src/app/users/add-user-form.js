import { DataTableFacetedFilter } from "@/components/table/faceted-filter";
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
import React, { useState } from "react";

export function AddUserForm({ roles, groups, onAddUser }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [group, setGroup] = useState("");

  const handleAddUser = () => {
    onAddUser({ email, role, group });
    setEmail("");
    setRole("");
    setGroup("");
  };
  console.log(role);

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
          <Select onValueChange={(value) => setRole(value)} defaultValue={role}>
            <SelectTrigger className="w-full">
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
            <DataTableFacetedFilter
              id="group"
              column={{ setFilterValue: setGroup }}
              title="Group"
              options={groups}
              className="col-span-3"
            />
          </div>
        )}
      </div>
      <DialogFooter>
        <Button onClick={handleAddUser}>Add User</Button>
      </DialogFooter>
    </>
  );
}
