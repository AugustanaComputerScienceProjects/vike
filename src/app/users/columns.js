"use client";

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import firebase from "@/firebase/config";
import { ArrowUpDown, Ellipsis } from "lucide-react";
import { useEffect, useState } from "react";

function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <input
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}

export const columns = [
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

      const codeGroup = (uncodedGroup) => {
        let group = uncodedGroup;
        if (typeof group === "string" || group instanceof String) {
          while (group.includes(".")) {
            group = group.replace(".", "*%&");
          }
          while (group.includes("$")) {
            group = group.replace("$", "@%*");
          }
          while (group.includes("[")) {
            group = group.replace("[", "*&@");
          }
          while (group.includes("]")) {
            group = group.replace("]", "<@+");
          }
          while (group.includes("#")) {
            group = group.replace("#", "!*>");
          }
          while (group.includes("/")) {
            group = group.replace("/", "!<^");
          }
        }
        console.log("CODED GROUP: " + group);
        return group;
      };
      const deleteUser = () => {
        let userEmail = user.email.replace(".", ",");
        if (user.role.toLowerCase() === "leader") {
          let org = codeGroup(user.groupLeaderRemoved);
          firebase.database
            .ref("/groups-to-leaders/" + org + "/leaders/" + userEmail)
            .remove();
          firebase.database
            .ref("/leaders/" + userEmail + "/groups/" + org)
            .remove();
        } else {
          firebase.database.ref(user.ref + userEmail).remove();
        }
        handleDeleteClose();
      };

      return (
        <>
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
              <DropdownMenuItem>Edit</DropdownMenuItem>
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
                    <AlertDialogAction onClick={deleteUser}>
                      Confirm
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      );
    },
  },
];
