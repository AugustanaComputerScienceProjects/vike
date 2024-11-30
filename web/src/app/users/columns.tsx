"use client";

import { AddUserForm } from "@/app/users/add-user-form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import firebase from "@/firebase/config";
import { ArrowUpDown, Ellipsis } from "lucide-react";

type UserActionsProps = {
  onEditUser: (oldData: any, newData: any) => Promise<void>;
  roles: { label: string; value: string }[];
  groups: { label: string; value: string }[];
  codeGroup: (group: string) => string;
};

export const createColumns = ({ onEditUser, roles, codeGroup }: UserActionsProps) => [
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    filterFn: (row, id, value: string) => {
      return row.getValue(id).toLowerCase().includes(value.toLowerCase());
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },

  {
    accessorKey: "group",
    header: "Group",
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;

      const handleEdit = async (newData) => {
        try {
          await onEditUser(user, newData);
        } catch (error) {
          console.error("Failed to edit user:", error);
        }
      };

      const handleDelete = async () => {
        const userEmail = user.email.replace(".", ",");
        try {
          if (user.role.toLowerCase() === "leader") {
            const org = codeGroup(user.group);
            await firebase.database
              .ref(`/groups-to-leaders/${org}/leaders/${userEmail}`)
              .remove();
            await firebase.database
              .ref(`/leaders/${userEmail}`)
              .remove();
          } else if (user.role.toLowerCase() === "admin") {
            await firebase.database
              .ref(`/admin/${userEmail}`)
              .remove();
          }
        } catch (error) {
          console.error("Failed to delete user:", error);
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
            >
              <Ellipsis className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <Dialog>
              <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  Edit
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit User</DialogTitle>
                </DialogHeader>
                <AddUserForm
                  roles={roles}
                  onAddUser={handleEdit}
                  initialData={user}
                />
              </DialogContent>
            </Dialog>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  Delete
                  <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Are you sure you want to remove this user?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the user and remove their data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Confirm
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
