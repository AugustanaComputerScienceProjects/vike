import { Toggle } from "@/components/ui/toggle";

const MenuItem = ({ icon, title, value, ariaLabel, action, isActive }) => {
  return (
    <Toggle
      size="small"
      value={value}
      aria-label={ariaLabel}
      selected={isActive}
      onClick={action}
      title={title}
    >
      {icon}
    </Toggle>
  );
};

export default MenuItem;
