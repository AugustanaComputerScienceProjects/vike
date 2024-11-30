"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { useDebounce } from "@/components/ui/multi-selector";
import firebase from "@/firebase/config";
import { Plus, Search, Trash } from "lucide-react";
import { useEffect, useState } from "react";

const GroupsPage = () => {
  const [groups, setGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newGroup, setNewGroup] = useState("");
  const [adding, setAdding] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    const readGroups = () => {
      const ref = firebase.database.ref("/groups");
      ref.on("value", (snapshot) => {
        const groupsList = [];
        snapshot.forEach((child) => {
          groupsList.push([child.key, child.val()]);
        });
        setGroups(groupsList);
      });
    };

    readGroups();
  }, []);

  const handleSave = (data) => {
    firebase.database.ref("/groups").push().set(data);
    setNewGroup("");
    setAdding(false);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleNewGroupChange = (event) => {
    setNewGroup(event.target.value);
  };

  const handleCreateGroup = () => {
    handleSave(newGroup);
    setNewGroup("");
    setAdding(false);
  };

  const handleCancel = () => {
    setAdding(false);
  };

  const deleteGroup = (key) => {
    firebase.database.ref(`/groups/${key}`).remove();
  };

  const addAction = () => {
    setAdding(true);
  };

  const filteredGroups = groups.filter(([key, group]) =>
    group.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col flex-1 overflow-y-auto p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Groups</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 w-5 h-5" />
          <Input
            className="bg-white dark:bg-gray-950 pl-10 pr-4 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:border-gray-700 dark:focus:ring-primary-500 dark:focus:border-primary-500"
            placeholder="Search groups..."
            type="text"
            onChange={handleSearchChange}
          />
        </div>
        <Button size="sm" variant="secondary" onClick={addAction}>
          <Plus className="mr-2 w-4 h-4" />
          Add Group
        </Button>
      </div>
      {adding && (
        <div className="mt-4 p-4 border rounded-lg bg-white dark:bg-gray-950">
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Group name
            </label>
            <Input
              value={newGroup}
              onChange={handleNewGroupChange}
              placeholder="Group name"
              className="mt-1"
            />
          </div>
          <div className="mt-4 flex space-x-2">
            <Button variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="default" onClick={handleCreateGroup}>
              Create Group
            </Button>
          </div>
        </div>
      )}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredGroups.map(([key, group]) => (
          <Card key={key} className="flex items-center justify-between p-4">
            <div>
              <h2 className="text-lg font-medium">{group}</h2>
            </div>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => deleteGroup(key)}
            >
              <Trash className="w-4 h-4" />
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default GroupsPage;
