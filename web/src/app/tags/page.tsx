"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { useDebounce } from "@/components/ui/multi-selector";
import firebase from "@/firebase/config";
import { Plus, Search, Trash } from "lucide-react";
import { useEffect, useState } from "react";

const TagsPage = () => {
  const [tags, setTags] = useState([]);
  const [groups, setGroups] = useState([]);
  const [key, setKey] = useState("");
  const [data, setData] = useState("");
  const [adding, setAdding] = useState(false);
  const [type, setType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [newTag, setNewTag] = useState("");

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    const readTags = () => {
      const ref = firebase.database.ref("/tags");
      ref.on("value", (snapshot) => {
        const tagsList = [];
        snapshot.forEach((child) => {
          tagsList.push([child.key, child.val()]);
        });
        setTags(tagsList);
      });
    };

    readTags();
  }, []);

  const handleSave = (data) => {
    firebase.database.ref("/tags").push().set(data);
    setNewTag("");
    setAdding(false);
  };

  const handleChange = (event) => {
    setData(event.target.value);
  };

  const deleteTag = (key) => {
    firebase.database.ref(`/tags/${key}`).remove();
  };

  const addAction = (ref, type) => {
    setAdding(true);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleNewTagChange = (event) => {
    const { name, value } = event.target;
    setNewTag(value);
  };

  const handleCreateTag = () => {
    handleSave(newTag);
    setNewTag("");
    setAdding(false);
  };

  const handleCancel = () => {
    setAdding(false);
  };

  const filteredTags = tags.filter(([key, tag]) =>
    tag.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col flex-1 overflow-y-auto p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tags</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 w-5 h-5" />
          <Input
            className="bg-white dark:bg-gray-950 pl-10 pr-4 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:border-gray-700 dark:focus:ring-primary-500 dark:focus:border-primary-500"
            placeholder="Search tags..."
            type="text"
            onChange={handleSearchChange}
          />
        </div>
        <Button
          size="sm"
          variant="default"
          onClick={() => addAction("/tags", "Tag")}
        >
          <Plus className="mr-2 w-4 h-4" />
          Add Tag
        </Button>
      </div>
      {adding && (
        <div className="mt-4 p-4 border rounded-lg bg-white dark:bg-gray-950">
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tag name
            </label>
            <Input
              name="name"
              value={newTag}
              onChange={handleNewTagChange}
              placeholder="Tag name"
              className="mt-1"
            />
          </div>
          <div className="mt-4 flex space-x-2">
            <Button variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="default" onClick={handleCreateTag}>
              Create tag
            </Button>
          </div>
        </div>
      )}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTags.map(([key, tag]) => (
          <Card key={key} className="flex items-center justify-between p-4">
            <div>
              <h2 className="text-lg font-medium">{tag}</h2>
            </div>
            <Button size="sm" variant="destructive" onClick={() => deleteTag(key)}>
              <Trash className="w-4 h-4" />
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TagsPage;
