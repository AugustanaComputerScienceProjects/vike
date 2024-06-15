"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import firebase from "@/firebase/config";
import React, { useRef, useState } from "react";
import { toast } from "sonner";

const Pepsico = () => {
  const [studentIdentifier, setStudentIdentifier] = useState("");
  const idNumTextField = useRef(null);

  const entryChange = (e) => {
    setStudentIdentifier(e.target.value);
  };

  const onSubmit = (e) => {
    let idNum = studentIdentifier;
    if (idNum[0] === ";" && idNum.length === 16) {
      idNum = idNum.slice(3, 10);
      checkIdEntered(idNum);
    } else if (!isNaN(idNum[0])) {
      while (idNum.length < 7) {
        idNum = "0" + idNum;
      }
      checkIdEntered(idNum);
    } else {
      checkUserIdEntered(idNum);
    }
    setStudentIdentifier("");
    idNumTextField.current.focus();
  };

  const checkIdEntered = (idNum) => {
    console.log("SID: " + idNum);
    let reference = firebase.database.ref("/id-to-email");
    let demoReference = firebase.database.ref("/demographics");
    demoReference.remove();
    reference.once("value").then(function (snapshot) {
      if (snapshot.hasChild(idNum)) {
        let email = snapshot.child(idNum).val();
        checkedIn(email, snapshot);
      } else {
        failedCheckIn();
      }
    });
  };

  const checkUserIdEntered = (userId) => {
    console.log("User ID: " + userId);
    let reference = firebase.database.ref("/demographics");
    reference.once("value").then(function (snapshot) {
      if (snapshot.hasChild(userId)) {
        checkedIn(userId, snapshot);
      } else {
        failedCheckIn();
      }
    });
  };

  const checkedIn = (userId, snapshot) => {
    let currentDate = new Date();
    let checkInTime = currentDate.toLocaleTimeString();
    console.log(checkInTime);
    toast(userId + " has checked in.");

    firebase.database
      .ref("/pepsico")
      .once("value")
      .then(function (snapshot) {
        snapshot.forEach(function (child) {
          let eventKey = child.key;
          firebase.database
            .ref("/pepsico")
            .child(eventKey)
            .child("users")
            .child(userId)
            .child(checkInTime)
            .set(true);
        });
      });
  };

  const failedCheckIn = () => {
    toast("Not a student/faculty.");
  };

  const keyPress = (e) => {
    if (e.keyCode === 13) {
      onSubmit(e);
    }
  };

  return (
    <div>
      <div className="mt-12 flex justify-center">
        <div className="min-w-lg max-w-lg min-h-32 max-h-32 bg-white p-4 shadow border border-gray-300 rounded">
          <div className="flex flex-col items-center justify-center">
            <div>
              <Input
                autoFocus
                className="min-w-64 p-2  rounded"
                placeholder="Swipe card or enter student id"
                ref={idNumTextField}
                value={studentIdentifier}
                onChange={entryChange}
                onKeyDown={keyPress}
              />
            </div>
            <Button className=" p-2 mt-4 rounded" onClick={onSubmit}>
              Submit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pepsico;
