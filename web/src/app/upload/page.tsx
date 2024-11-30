"use client";

import { Button } from "@/components/ui/button";
import firebase from "@/firebase/config";
import { useState } from "react";
import CSVReader from "react-csv-reader";
import { toast } from "sonner";

const DemographicsUpload = () => {
  const [demographicsFile, setDemographicsFile] = useState(null);
  console.log(demographicsFile);

  const handleFileChanged = (data) => {
    setDemographicsFile(data);
  };

  const uploadDemographics = () => {
    if (!demographicsFile) {
      toast.error("Please select a file to upload.");
    } else {
      demographicsFile.slice(1).forEach((row) => {
        if (row.length > 1) {
          const person = {
            ID: row[0],
            LastName: row[2],
            Pref_FirstName: row[3],
            PersonType: row[4],
            Class: row[5],
            Transfer: row[6],
            ResidenceHall: row[7],
            Gender: row[8],
            Race: row[9],
            Race_Desc: row[10],
            International: row[11] || "No",
          };
          const idNum = row[0];
          const email = row[1];
          firebase.database.ref("/id-to-email-test").child(idNum).set(email);
          firebase.database.ref("/demographics-test").child(email).set(person);
        }
      });
      setDemographicsFile(null);
      toast.info(
        "Please leave this window open for 5 minutes to allow the file to finish uploading.",
      );
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between mx-auto">
        <h1 className="text-lg font-bold">Demographics Upload</h1>
      </div>
      <div className="flex justify-center p-4">
        <div>
          <h2 className="text-center mb-4">Choose a file to upload.</h2>
          <CSVReader onFileLoaded={handleFileChanged} />
          <div className="flex justify-center mt-4">
            <Button onClick={uploadDemographics} size="sm">
              Submit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemographicsUpload;
