import React from "react";

import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import RedoIcon from "@mui/icons-material/Redo";
import UndoIcon from "@mui/icons-material/Undo";
import { Divider, Paper, Typography } from "@mui/material";
import MenuItem from "./MenuItem";

const MenuBar = ({ editor }) => {
  const headingItems = [
    {
      icon: <Typography fontWeight={800}>H1</Typography>,
      title: "Heading 1",
      action: () =>
        editor
          .chain()
          .focus()
          .toggleHeading({ level: 1 })
          .run(),
      isActive: editor.isActive("heading", { level: 1 }),
      value: "heading1",
      ariaLabel: "Toggle Heading 1",
    },
    {
      icon: <Typography fontWeight={800}>H2</Typography>,
      title: "Heading 2",
      action: () =>
        editor
          .chain()
          .focus()
          .toggleHeading({ level: 2 })
          .run(),
      isActive: editor.isActive("heading", { level: 2 }),
      value: "heading2",
      ariaLabel: "Toggle Heading 2",
    },
    {
      icon: <Typography fontWeight={800}>H3</Typography>,
      title: "Heading 3",
      action: () =>
        editor
          .chain()
          .focus()
          .toggleHeading({ level: 3 })
          .run(),
      isActive: editor.isActive("heading", { level: 3 }),
      value: "heading3",
      ariaLabel: "Toggle Heading 3",
    },
  ];
  const items = [
    {
      icon: <FormatBoldIcon />,
      title: "Bold",
      action: () =>
        editor
          .chain()
          .focus()
          .toggleBold()
          .run(),
      isActive: editor.isActive("bold"),
      value: "bold",
      ariaLabel: "Toggle Bold",
    },
    {
      icon: <FormatItalicIcon />,
      title: "Italic",
      action: () =>
        editor
          .chain()
          .focus()
          .toggleItalic()
          .run(),
      isActive: editor.isActive("italic"),
      value: "italic",
      ariaLabel: "Toggle Italic",
    },

    {
      icon: <FormatListBulletedIcon />,
      title: "Bullet List",
      action: () =>
        editor
          .chain()
          .focus()
          .toggleBulletList()
          .run(),
      isActive: editor.isActive("bulletList"),
      value: "bulletList",
      ariaLabel: "Toggle Bullet List",
    },
    {
      icon: <FormatListNumberedIcon />,
      title: "Ordered List",
      action: () =>
        editor
          .chain()
          .focus()
          .toggleOrderedList()
          .run(),
      isActive: editor.isActive("orderedList"),
      value: "orderedList",
      ariaLabel: "Toggle Ordered List",
    },
    {
      icon: <FormatQuoteIcon />,
      title: "Blockquote",
      action: () =>
        editor
          .chain()
          .focus()
          .toggleBlockquote()
          .run(),
      isActive: editor.isActive("blockquote"),
      value: "blockquote",
      ariaLabel: "Toggle Blockquote",
    },
    {
      icon: <UndoIcon />,
      title: "Undo",
      action: () =>
        editor
          .chain()
          .focus()
          .undo()
          .run(),
      value: "undo",
      ariaLabel: "Undo",
    },
    {
      icon: <RedoIcon />,
      title: "Redo",
      action: () =>
        editor
          .chain()
          .focus()
          .redo()
          .run(),
      value: "redo",
      ariaLabel: "Redo",
    },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        display: "flex",
        flexWrap: "wrap",
      }}
    >
      {headingItems.map((item, index) => (
        <MenuItem key={index} {...item} />
      ))}
      <Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 1 }} />

      {items.map((item, index) => (
        <React.Fragment key={index}>
          {item.type === "divider" ? (
            <div className="divider" />
          ) : (
            <MenuItem {...item} />
          )}
        </React.Fragment>
      ))}
    </Paper>
  );
};

export default MenuBar;
