"use client";

import useUsers from "@/hooks/use-users";
import { useMemo } from "react";
import { createColumns } from "./columns";
import { DataTable } from "./data-table";

const UsersPage = () => {
  const { users, addUser, editUser, codeGroup } = useUsers();

  const roles = useMemo(() => {
    if (!users?.length) return [];
    const roleSet = new Set(users.map((user) => user.role));
    return Array.from(roleSet).map((role) => ({
      label: role,
      value: role,
    }));
  }, [users]);

  const groups = useMemo(() => {
    if (!users?.length) return [];
    const groupSet = new Set(users.map((user) => user.group).filter(Boolean));
    return Array.from(groupSet).map((group) => ({
      label: group,
      value: group,
    }));
  }, [users]);

  const columns = useMemo(() => 
    createColumns({ 
      onEditUser: editUser, 
      roles, 
      groups, 
      codeGroup 
    }), 
    [editUser, roles, groups, codeGroup]
  );

  if (!users?.length) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto my-8">
      <DataTable
        columns={columns}
        data={users}
        roles={roles}
        groups={groups}
        onAddUser={addUser}
        onEditUser={editUser}
      />
    </div>
  );
};

export default UsersPage;
