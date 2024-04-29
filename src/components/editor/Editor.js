import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import styled from "styled-components";
import MenuBar from "./MenuBar";

import React, { useEffect } from "react";

const EditorRoot = styled.div`
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 5px;
  div[contenteditable="true"] {
    border: none;
    background-color: transparent;
    outline: none;
  }
`;

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
    <EditorRoot>
      {editor && <MenuBar editor={editor} />}
      <EditorContent editor={editor} />
    </EditorRoot>
  );
};

export default Editor;
