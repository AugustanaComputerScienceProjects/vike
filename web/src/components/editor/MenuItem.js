import { ToggleButton } from "@mui/material";

const MenuItem = ({ icon, title, value, ariaLabel, action, isActive }) => {
  return (
    <ToggleButton
      size="small"
      value={value}
      aria-label={ariaLabel}
      selected={isActive}
      onClick={action}
      title={title}
    >
      {icon}
    </ToggleButton>
  );
};

export default MenuItem;
