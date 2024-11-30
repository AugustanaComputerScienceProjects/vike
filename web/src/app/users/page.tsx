"use client";

import useUsers from "@/hooks/use-users";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { columns } from "./columns";
import { DataTable } from "./data-table";

const UsersPage = () => {
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [demographicsFile, setDemographicsFile] = useState(null);
  const [data, setData] = useState([]);
  const { users, usersTableData } = useUsers();

  const [adding, setAdding] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const roles = useMemo(() => {
    const roleSet = new Set(users.map((user) => user.role));
    return Array.from(roleSet).map((role) => {
      console.log("role", role);
      return {
        label: role,
        value: role,
      };
    });
  }, [users]);

  const groups = useMemo(() => {
    const groupSet = new Set(users.map((user) => user.group));
    return Array.from(groupSet).map((group) => ({
      label: group,
      value: group,
    }));
  }, [users]);

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handleDeleteUser = async () => {
    // Delete user logic here
    toast("User deleted successfully");
  };

  const handleSaveUser = async () => {
    // Save user logic here
    toast("User added successfully");
  };

  const handleFileUpload = (data) => {
    setDemographicsFile(data);
  };

  const handleUploadLeaders = async () => {
    // Upload leaders logic here
    toast("Leaders uploaded successfully");
  };

  return (
    <div className="container mx-auto my-8">
      {users && groups && roles && (
        <DataTable
          columns={columns}
          data={users}
          roles={roles}
          groups={groups}
        />
      )}
    </div>
    // <div>
    //   <Button>Add User</Button>
    //   <Dialog open={adding} onClose={() => setAdding(false)}>
    //     <DialogTitle>Add User</DialogTitle>
    //     <DialogContent>
    //       <Input
    //         value={email}
    //         onChange={handleEmailChange}
    //         placeholder="Email"
    //       />
    //       <Select
    //         value={organization}
    //         onChange={(value) => setOrganization(value)}
    //         options={groups.map((group) => ({
    //           label: group,
    //           value: group,
    //         }))}
    //       />
    //     </DialogContent>
    //     <DialogActions>
    //       <Button onClick={handleSaveUser}>Save</Button>
    //     </DialogActions>
    //   </Dialog>

    //   <Dialog open={uploading} onClose={() => setUploading(false)}>
    //     <DialogTitle>Upload Leaders</DialogTitle>
    //     <DialogContent>
    //       <CSVReader onFileLoaded={handleFileUpload} />
    //     </DialogContent>
    //     <DialogActions>
    //       <Button onClick={handleUploadLeaders}>Upload</Button>
    //     </DialogActions>
    //   </Dialog>

    //   <Dialog open={deleting} onClose={() => setDeleting(false)}>
    //     <DialogTitle>Confirm Delete</DialogTitle>
    //     <DialogContent>
    //       Are you sure you want to delete this user?
    //     </DialogContent>
    //     <DialogActions>
    //       <Button onClick={handleDeleteUser}>Confirm</Button>
    //     </DialogActions>
    //   </Dialog>
    // </div>
  );
};

export default UsersPage;
