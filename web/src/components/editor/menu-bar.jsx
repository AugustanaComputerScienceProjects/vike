import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo,
  Undo,
} from "lucide-react";
import React from "react";
import MenuItem from "./menu-item";

const MenuBar = ({ editor }) => {
  const headingItems = [
    {
      icon: <span className="font-bold text-sm">H1</span>,
      title: "Heading 1",
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: editor.isActive("heading", { level: 1 }),
      value: "heading1",
      ariaLabel: "Toggle Heading 1",
    },
    {
      icon: <span className="font-bold text-sm">H2</span>,
      title: "Heading 2",
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive("heading", { level: 2 }),
      value: "heading2",
      ariaLabel: "Toggle Heading 2",
    },
    {
      icon: <span className="font-bold text-sm">H3</span>,
      title: "Heading 3",
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: editor.isActive("heading", { level: 3 }),
      value: "heading3",
      ariaLabel: "Toggle Heading 3",
    },
  ];

  const items = [
    {
      icon: <Bold className="h-4 w-4 shrink-0" />,
      title: "Bold",
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive("bold"),
      value: "bold",
      ariaLabel: "Toggle Bold",
    },
    {
      icon: <Italic className="h-4 w-4 shrink-0" />,
      title: "Italic",
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive("italic"),
      value: "italic",
      ariaLabel: "Toggle Italic",
    },
    {
      icon: <List className="h-4 w-4 shrink-0" />,
      title: "Bullet List",
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive("bulletList"),
      value: "bulletList",
      ariaLabel: "Toggle Bullet List",
    },
    {
      icon: <ListOrdered className="h-4 w-4 shrink-0" />,
      title: "Ordered List",
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive("orderedList"),
      value: "orderedList",
      ariaLabel: "Toggle Ordered List",
    },
    {
      icon: <Quote className="h-4 w-4 shrink-0" />,
      title: "Blockquote",
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: editor.isActive("blockquote"),
      value: "blockquote",
      ariaLabel: "Toggle Blockquote",
    },
    {
      icon: <Undo className="h-4 w-4 shrink-0" />,
      title: "Undo",
      action: () => editor.chain().focus().undo().run(),
      value: "undo",
      ariaLabel: "Undo",
    },
    {
      icon: <Redo className="h-4 w-4 shrink-0" />,
      title: "Redo",
      action: () => editor.chain().focus().redo().run(),
      value: "redo",
      ariaLabel: "Redo",
    },
  ];

  return (
    <div className="flex flex-wrap gap-1">
      {headingItems.map((item, index) => (
        <MenuItem key={index} {...item} />
      ))}
      <div
        className="h-full bg-gray-300 mx-0.5 my-1"
        style={{ width: "1px" }}
      />
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {item.type === "divider" ? (
            <div className="w-full h-px bg-gray-300 my-2" />
          ) : (
            <MenuItem {...item} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default MenuBar;
