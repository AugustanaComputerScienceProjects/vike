import { Autocomplete, Chip, FormControl, TextField } from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import React from "react";
import Editor from "../editor/Editor";

const AddEventForm = ({
  formData,
  groups,
  databaseTags,
  handleInputChange,
  handleDateChange,
  setFormData,
}) => {
  return (
    <>
      <TextField
        autoFocus
        margin="dense"
        name="name"
        label="Event Name"
        fullWidth
        required
        value={formData.name}
        onChange={handleInputChange}
      />
      <LocalizationProvider dateAdapter={AdapterMoment}>
        <DateTimePicker
          label="Start Date"
          value={formData.startDate}
          onChange={(date) => handleDateChange("startDate", date)}
          renderInput={(params) => (
            <TextField {...params} margin="dense" fullWidth required />
          )}
        />
        <DateTimePicker
          label="End Date"
          value={formData.endDate}
          onChange={(date) => handleDateChange("endDate", date)}
          renderInput={(params) => (
            <TextField {...params} margin="dense" fullWidth required />
          )}
        />
      </LocalizationProvider>
      <TextField
        margin="dense"
        name="location"
        label="Location"
        fullWidth
        required
        value={formData.location}
        onChange={handleInputChange}
      />
      <FormControl margin="dense" fullWidth>
        <Autocomplete
          margin="dense"
          fullWidth
          options={groups}
          getOptionLabel={(option) => option}
          value={formData.organization}
          onChange={(event, newValue) => {
            setFormData((prevFormData) => ({
              ...prevFormData,
              organization: newValue,
            }));
          }}
          renderInput={(params) => (
            <TextField {...params} label="Organization" required />
          )}
        />
      </FormControl>
      <FormControl margin="dense" fullWidth>
        <Autocomplete
          multiple
          margin="dense"
          fullWidth
          options={databaseTags}
          getOptionLabel={(option) => option}
          value={formData.tags}
          onChange={(event, newValue) => {
            setFormData((prevFormData) => ({
              ...prevFormData,
              tags: newValue,
            }));
          }}
          renderInput={(params) => <TextField {...params} label="Tags" />}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip key={option} label={option} {...getTagProps({ index })} />
            ))
          }
        />
      </FormControl>
      <TextField
        margin="dense"
        name="webLink"
        label="Web Link"
        fullWidth
        value={formData.webLink}
        onChange={handleInputChange}
      />
      <Editor
        content={formData.description}
        onUpdate={(newDescription) => {
          setFormData((prevFormData) => ({
            ...prevFormData,
            description: newDescription,
          }));
        }}
      />
    </>
  );
};

export default AddEventForm;
