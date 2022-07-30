import React from "react";
import PropTypes from "prop-types";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import CustomEditor from "./custom-editor/ckeditor.js"; // '@ckeditor/ckeditor5-build-classic';
import styled from "styled-components";

const Wrapper = styled.div`
  .ck-editor__main {
    min-height: 200px;
    max-height: 800px;
    > div {
      min-height: 200px;
      max-height: 800px;
    }
  }
`;

const configuration = {
  toolbar: [
    "heading",
    "bold",
    "italic",
    "strikethrough",
    "underline",
    "link",
    "fontColor",
    "fontBackgroundColor",
    "highlight",
    "|",
    "blockQuote",
    "insertTable",
    "|",
    "horizontalLine",
    "indent",
    "outdent",
    "|",
    "specialCharacters",
    "numberedList",
    "alignment",
    "bulletedList",
    "|",
    "removeFormat",
    "|",
    "undo",
    "redo",
    "|",
    "mediaEmbed",
  ],
  image: {
    toolbar: [
      "imageTextAlternative",
      "|",
      "imageStyle:alignLeft",
      "imageStyle:alignCenter",
      "imageStyle:alignRight",
      "|",
      "linkImage",
      "|",
      "imageResize",
    ],
    styles: ["alignLeft", "alignCenter", "alignRight"],
  },
  mediaEmbed: {
    previewsInData: false,
  },
  table: {
    contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
  },
  link: {
    decorators: {
      isExternal: {
        mode: 'manual',
        label: 'Open in a new tab',
        attributes: {
          target: '_blank'
        }
      }
    }
  }
};

const Editor = ({ onChange, onBlur, name, value }) => {
  return (
    <Wrapper>
      <CKEditor
        editor={CustomEditor}
        config={configuration}
        data={value}
        onChange={(event, editor) => {
          const data = editor.getData();
          onChange({ target: { name, value: data } });
        }}
        onBlur={(event, editor) => {
          // const selection = editor.model.document.selection;

          // editor.model.change((writer) => {
            // console.log("writer", writer);
            // var newElement = writer.createElement("paragraph", {
            //   alignment: "center",
            // });

            // working version:
            // let imageElement = writer.createElement("image", {
            //   alignment: "center",
            //   src: "http://localhost:1337/uploads/bfnpidoplfoflffg_5a5b151a77.png"
            // });

            // writer.append(imageElement, newElement);

            // writer.insert(
            //   newElement,
            //   selection.getFirstPosition(),
            //   "before"
            // );
          // });
          onBlur({ editor });
        }}
      />
    </Wrapper>
  );
};

Editor.propTypes = {
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string,
};

export default Editor;
