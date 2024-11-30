"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo,
  Undo,
} from "lucide-react";
import React from "react";

const MenuBar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  const headingItems = [
    {
      icon: <Heading1 className="h-4 w-4" />,
      title: "Heading 1",
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: editor.isActive("heading", { level: 1 }),
    },
    {
      icon: <Heading2 className="h-4 w-4" />,
      title: "Heading 2",
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive("heading", { level: 2 }),
    },
    {
      icon: <Heading3 className="h-4 w-4" />,
      title: "Heading 3",
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: editor.isActive("heading", { level: 3 }),
    },
  ];

  const items = [
    {
      icon: <Bold className="h-4 w-4" />,
      title: "Bold",
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive("bold"),
    },
    {
      icon: <Italic className="h-4 w-4" />,
      title: "Italic",
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive("italic"),
    },
    {
      icon: <List className="h-4 w-4" />,
      title: "Bullet List",
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive("bulletList"),
    },
    {
      icon: <ListOrdered className="h-4 w-4" />,
      title: "Ordered List",
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive("orderedList"),
    },
    {
      icon: <Quote className="h-4 w-4" />,
      title: "Blockquote",
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: editor.isActive("blockquote"),
    },
  ];

  const historyItems = [
    {
      icon: <Undo className="h-4 w-4" />,
      title: "Undo",
      action: () => editor.chain().focus().undo().run(),
      isDisabled: !editor.can().undo(),
    },
    {
      icon: <Redo className="h-4 w-4" />,
      title: "Redo",
      action: () => editor.chain().focus().redo().run(),
      isDisabled: !editor.can().redo(),
    },
  ];

  return (
    <div className="border-b p-1 flex flex-wrap gap-1">
      <div className="flex items-center gap-1">
        {headingItems.map((item, index) => (
          <Button
            key={index}
            onClick={item.action}
            variant={item.isActive ? "secondary" : "ghost"}
            size="sm"
            title={item.title}
          >
            {item.icon}
          </Button>
        ))}
      </div>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <div className="flex items-center gap-1">
        {items.map((item, index) => (
          <Button
            key={index}
            onClick={item.action}
            variant={item.isActive ? "secondary" : "ghost"}
            size="sm"
            title={item.title}
          >
            {item.icon}
          </Button>
        ))}
      </div>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <div className="flex items-center gap-1">
        {historyItems.map((item, index) => (
          <Button
            key={index}
            onClick={item.action}
            variant="ghost"
            size="sm"
            title={item.title}
            disabled={item.isDisabled}
          >
            {item.icon}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default MenuBar;
