"use client";

import Button from "@/components/ui/button";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import firebase from "@/firebase/config";
import React, { useEffect, useState } from "react";

const TagsPage = () => {
  const [state, setState] = useState({
    tags: [],
    groups: [],
    key: "",
    data: "",
    adding: false,
    ref: "",
    type: "",
    deleting: false,
    adminSignedIn: false,
    leaderSignedIn: false,
    hidden: "visible",
  });

  useEffect(() => {
    const readTags = () => {
      const ref = firebase.database.ref("/tags");
      ref.on("value", (snapshot) => {
        const tagsList = [];
        snapshot.forEach((child) => {
          tagsList.push([child.key, child.val()]);
        });
        setState((prevState) => ({ ...prevState, tags: tagsList }));
      });
    };

    const readGroups = () => {
      const ref = firebase.database.ref("/groups");
      ref.on("value", (snapshot) => {
        const groupsList = [];
        snapshot.forEach((child) => {
          groupsList.push([child.key, child.val()]);
        });
        setState((prevState) => ({ ...prevState, groups: groupsList }));
      });
    };

    readTags();
    readGroups();

    const off = firebase.auth.onAuthStateChanged((user) => {
      if (user) {
        checkRole(user, "leader");
        checkRole(user, "admin");
      }
    });
  }, []);

  const handleDeleteClose = () => {
    setState((prevState) => ({ ...prevState, deleting: false }));
  };

  const handleDeleteOpen = () => {
    setState((prevState) => ({ ...prevState, deleting: true }));
  };

  const handleOpen = () => {
    setState((prevState) => ({ ...prevState, adding: true }));
  };

  const handleClose = () => {
    setState((prevState) => ({ ...prevState, adding: false }));
  };

  const handleSave = () => {
    firebase.database.ref(state.ref).push().set(state.data);
    handleClose();
  };

  const handleChange = (event) => {
    setState((prevState) => ({ ...prevState, data: event.target.value }));
  };

  const deleteData = () => {
    firebase.database.ref(`${state.ref}/${state.key}`).remove();
    handleDeleteClose();
  };

  const checkRole = (user, role) => {
    firebase.database
      .ref(role)
      .once("value")
      .then((snapshot) => {
        if (snapshot.hasChild(user.email.replace(".", ","))) {
          if (role === "admin") {
            setState((prevState) => ({ ...prevState, adminSignedIn: true }));
          } else if (role === "leaders" && !state.adminSignedIn) {
            setState((prevState) => ({ ...prevState, leaderSignedIn: true }));
          }
        }
      });
  };

  const addAction = (ref, type) => {
    setState((prevState) => ({ ...prevState, data: "", ref: ref, type: type }));
    handleOpen();
  };

  const removeAction = (ref, data, key, type) => {
    setState({ key: key, data: data, ref: ref, type: type });
    handleDeleteOpen();
  };

  return (
    <div>
      {/* Render tags and groups */}
      <Dialog open={state.adding} onClose={handleClose}>
        <DialogTitle>Add {state.type}</DialogTitle>
        <DialogContent>
          <Input autoFocus value={state.data} onChange={handleChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSave}>Add</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={state.deleting} onClose={handleDeleteClose}>
        <DialogTitle>
          Are you sure you want to remove this {state.type}?
        </DialogTitle>
        <DialogContent>
          <label>{state.data}</label>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose}>Cancel</Button>
          <Button onClick={deleteData} autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TagsPage;
