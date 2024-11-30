import firebase from "@/firebase/config";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

export interface Group {
  name: string;
  members: string[];
}

export interface UseGroupsResult {
  groups: Group[];
  isLoading: boolean;
  error: Error | null;
  addGroup: (name: string) => Promise<void>;
  removeGroup: (name: string) => Promise<void>;
  addMemberToGroup: (groupName: string, memberEmail: string) => Promise<void>;
  removeMemberFromGroup: (groupName: string, memberEmail: string) => Promise<void>;
}

export const useGroups = (): UseGroupsResult => {
  const { toast } = useToast();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchGroups = async () => {
    try {
      setIsLoading(true);
      const groupsSnapshot = await firebase.database.ref('groups').once('value');
      const membersSnapshot = await firebase.database.ref('groups-to-leaders').once('value');
      
      const groupsData = groupsSnapshot.val() || {};
      const membersData = membersSnapshot.val() || {};

      const groupsWithMembers = Object.values(groupsData).map((groupName: string) => ({
        name: groupName,
        members: membersData[groupName]?.leaders 
          ? Object.keys(membersData[groupName].leaders).map(email => email.replace(',', '.'))
          : []
      }));

      setGroups(groupsWithMembers);
    } catch (error) {
      console.error('Error fetching groups:', error);
      setError(error instanceof Error ? error : new Error('Failed to fetch groups'));
      toast({
        title: "Error",
        description: "Failed to load groups",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [toast]);

  const addGroup = async (name: string) => {
    try {
      const newGroupRef = firebase.database.ref('groups').push();
      await newGroupRef.set(name);
      await fetchGroups();
      toast({
        title: "Success",
        description: `Group "${name}" added successfully`,
      });
    } catch (error) {
      console.error('Error adding group:', error);
      toast({
        title: "Error",
        description: "Failed to add group",
        variant: "destructive",
      });
    }
  };

  const removeGroup = async (name: string) => {
    try {
      const groupsRef = firebase.database.ref('groups');
      const snapshot = await groupsRef.orderByValue().equalTo(name).once('value');
      
      const updates = {};
      snapshot.forEach((child) => {
        updates[child.key] = null;
      });
      
      await groupsRef.update(updates);
      await firebase.database.ref(`groups-to-leaders/${name}`).remove();
      await fetchGroups();
      
      toast({
        title: "Success",
        description: `Group "${name}" removed successfully`,
      });
    } catch (error) {
      console.error('Error removing group:', error);
      toast({
        title: "Error",
        description: "Failed to remove group",
        variant: "destructive",
      });
    }
  };

  const addMemberToGroup = async (groupName: string, memberEmail: string) => {
    try {
      const formattedEmail = memberEmail.replace('.', ',');
      await firebase.database
        .ref(`groups-to-leaders/${groupName}/leaders/${formattedEmail}`)
        .set(true);
      await firebase.database.ref(`leaders/${formattedEmail}`).set(true);
      await fetchGroups();
      
      toast({
        title: "Success",
        description: `Member added to group "${groupName}"`,
      });
    } catch (error) {
      console.error('Error adding member to group:', error);
      toast({
        title: "Error",
        description: "Failed to add member to group",
        variant: "destructive",
      });
    }
  };

  const removeMemberFromGroup = async (groupName: string, memberEmail: string) => {
    try {
      const formattedEmail = memberEmail.replace('.', ',');
      await firebase.database
        .ref(`groups-to-leaders/${groupName}/leaders/${formattedEmail}`)
        .remove();
      await firebase.database.ref(`leaders/${formattedEmail}`).remove();
      await fetchGroups();
      
      toast({
        title: "Success",
        description: `Member removed from group "${groupName}"`,
      });
    } catch (error) {
      console.error('Error removing member from group:', error);
      toast({
        title: "Error",
        description: "Failed to remove member from group",
        variant: "destructive",
      });
    }
  };

  return { 
    groups, 
    isLoading, 
    error, 
    addGroup, 
    removeGroup, 
    addMemberToGroup, 
    removeMemberFromGroup 
  };
}; 