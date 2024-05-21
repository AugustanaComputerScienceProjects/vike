import {
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
} from "@/components/ui";
import React, { useState } from "react";

const AddCalendarForm = ({
  formData,
  groups,
  handleInputChange,
  setFormData,
}) => {
  const [organization, setOrganization] = useState(formData.organization);

  const handleOrganizationChange = (event) => {
    const newValue = event.target.value;
    setOrganization(newValue);
    setFormData((prevFormData) => ({
      ...prevFormData,
      organization: newValue,
    }));
  };

  return (
    <>
      {/* Calendar Name */}
      <FormControl>
        <FormLabel htmlFor="name">Calendar Name</FormLabel>
        <Input
          autoFocus
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Ex: Welcome Week"
          required
        />
      </FormControl>
      {/* Organization */}
      <FormControl>
        <FormLabel htmlFor="organization">Organization</FormLabel>
        <Select
          id="organization"
          name="organization"
          value={organization}
          onChange={handleOrganizationChange}
        >
          {groups.map((group, index) => (
            <option key={index} value={group}>
              {group}
            </option>
          ))}
        </Select>
      </FormControl>
      {/* Description */}
      <FormControl>
        <FormLabel htmlFor="description">Description</FormLabel>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={4}
          required
        />
      </FormControl>
    </>
  );
};

export default AddCalendarForm;
