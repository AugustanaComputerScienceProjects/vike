import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React, { useEffect } from "react";
import MenuBar from "./menu-bar";

const Editor = ({ content, onUpdate }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML());
    },
  });

  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  return (
    <div className="border border-gray-300 p-2.5 rounded-md ">
      <div className="outline-none bg-transparent">
        {editor && <MenuBar editor={editor} />}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default Editor;
