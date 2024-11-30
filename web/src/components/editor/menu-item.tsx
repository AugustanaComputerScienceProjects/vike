import { Toggle } from "@/components/ui/toggle";

const MenuItem = ({ icon, title, value, ariaLabel, action, isActive }) => {
  return (
    <Toggle
      size="sm"
      value={value}
      aria-label={ariaLabel}
      pressed={isActive}
      onClick={action}
      title={title}
    >
      {icon}
    </Toggle>
  );
};

export default MenuItem;
