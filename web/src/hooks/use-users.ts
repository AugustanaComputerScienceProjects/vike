import firebase from "@/firebase/config";
import { UserRole } from "@/firebase/types";
import { useEffect, useState } from "react";

const decodeGroup = (codedGroup: string): string => {
  let group = codedGroup;
  group = group.replace(/\*%&/g, ".");
  group = group.replace(/@%\*/g, "$");
  group = group.replace(/\*<=/g, "[");
  group = group.replace(/<@\+/g, "]");
  group = group.replace(/!\*>/g, "#");
  group = group.replace(/!<\^/g, "/");
  return group;
};

const useUsers = () => {
  const [admins, setAdmins] = useState<string[]>([]);
  const [leaders, setLeaders] = useState<string[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [users, setUsers] = useState<UserRole[]>([]);
  const [groupLeaders, setGroupLeaders] = useState<Map<string, string[]>>(new Map());

  useEffect(() => {
    const fetchUsers = async () => {
      await readAdministrators();
      await readLeaders();
      await readGroups();
      await readGroupsWithLeaders();
    };

    fetchUsers();
  }, []);

  const readAdministrators = () => {
    let ref = firebase.database.ref("/admin");
    ref.on("value", (snapshot) => {
      let admins = [];
      snapshot.forEach((child) => {
        admins.push(child.key.replace(",", "."));
      });
      setAdmins(admins);
    });
  };

  const readLeaders = () => {
    let ref = firebase.database.ref("/leaders");
    ref.on("value", (snapshot) => {
      let leaders = [];
      snapshot.forEach((child) => {
        leaders.push(child.key.replace(",", "."));
      });
      setLeaders(leaders);
    });
  };

  const readGroups = () => {
    let ref = firebase.database.ref("/groups").orderByValue();
    ref.on("value", (snapshot) => {
      let groupsList = [];
      snapshot.forEach((child) => {
        groupsList.push(child.val());
      });
      setGroups(groupsList);
    });
  };

  const readGroupsWithLeaders = () => {
    let ref = firebase.database.ref("/groups-to-leaders");
    ref.on("value", function (snapshot) {
      if (!snapshot.exists()) {
        setGroupLeaders(new Map());
      }
      let groups = new Map();
      snapshot.forEach((child) => {
        let leaders = [];
        let decodedGroup = child.key;
        child.child("leaders").forEach((leader) => {
          leaders.push(leader.key.replace(",", "."));
        });
        groups.set(decodedGroup, leaders);
        setGroupLeaders(groups);
      });
      console.log("Map: " + groupLeaders);
    });
  };
  const transformUsersData = () => {
    const combinedUsers = [...admins, ...leaders].map((email) => {
      let userGroup = "No Group";
      let role = "Leader";

      if (admins.includes(email)) {
        role = "Admin";
      } else {
        for (const [group, leaders] of Array.from(groupLeaders.entries())) {
          if (leaders.includes(email)) {
            userGroup = group;
            break;
          }
        }
      }

      return {
        id: email,
        role: role,
        group: userGroup,
        email: email,
      };
    });
    setUsers(combinedUsers as UserRole[]);
  };

  useEffect(() => {
    if (
      admins.length > 0 &&
      leaders.length > 0 &&
      groups.length > 0 &&
      groupLeaders.size > 0
    ) {
      transformUsersData();
    }
  }, [admins, leaders, groups, groupLeaders]);

  const addUser = async (userData: { email: string; role: string; group?: string }) => {
    const { email, role, group } = userData;
    const formattedEmail = email.replace(".", ",");

    if (role === "Admin") {
      await firebase.database.ref(`/admin/${formattedEmail}`).set(true);
    } else if (role === "Leader" && group) {
      const codedGroup = codeGroup(group);
      await firebase.database.ref(`/leaders/${formattedEmail}`).set(true);
      await firebase.database
        .ref(`/groups-to-leaders/${codedGroup}/leaders/${formattedEmail}`)
        .set(true);
    }
  };

  const editUser = async (oldData: UserRole, newData: { role: string; group?: string }) => {
    const { role, group } = newData;
    const formattedEmail = oldData.email.replace(".", ",");

    // Remove old role
    if (oldData.role === "Admin") {
      await firebase.database.ref(`/admin/${formattedEmail}`).remove();
    } else if (oldData.role === "Leader" && oldData.group) {
      const oldCodedGroup = codeGroup(oldData.group);
      await firebase.database
        .ref(`/groups-to-leaders/${oldCodedGroup}/leaders/${formattedEmail}`)
        .remove();
      await firebase.database.ref(`/leaders/${formattedEmail}`).remove();
    }

    // Add new role
    if (role === "Admin") {
      await firebase.database.ref(`/admin/${formattedEmail}`).set(true);
    } else if (role === "Leader" && group) {
      const newCodedGroup = codeGroup(group);
      await firebase.database.ref(`/leaders/${formattedEmail}`).set(true);
      await firebase.database
        .ref(`/groups-to-leaders/${newCodedGroup}/leaders/${formattedEmail}`)
        .set(true);
    }
  };

  const codeGroup = (uncodedGroup: string): string => {
    let group = uncodedGroup;
    const replacements = {
      ".": "*%&",
      "$": "@%*",
      "[": "*&@",
      "]": "<@+",
      "#": "!*>",
      "/": "!<^",
    };

    Object.entries(replacements).forEach(([char, replacement]) => {
      group = group.replaceAll(char, replacement);
    });

    return group;
  };

  return { 
    users, 
    addUser, 
    editUser, 
    codeGroup,
    decodeGroup,
    isLoading: false,
    error: null
  };
};

export default useUsers;
