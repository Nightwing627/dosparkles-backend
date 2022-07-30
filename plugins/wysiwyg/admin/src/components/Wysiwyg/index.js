import React, { useState } from "react";
import PropTypes from "prop-types";
import { isEmpty } from "lodash";
import { Button } from "@buffetjs/core";
import { Label, InputDescription, InputErrors } from "strapi-helper-plugin";
import Editor from "../CKEditor";
import MediaLib from "../MediaLib";

let tempStartPos = 0;
const Wysiwyg = ({
  inputDescription,
  errors,
  label,
  name,
  noErrorsDescription,
  onChange,
  value,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editorCache, setEditorCache] = useState(null);
  let spacer = !isEmpty(inputDescription) ? (
    <div style={{ height: ".4rem" }} />
  ) : (
    <div />
  );

  if (!noErrorsDescription && !isEmpty(errors)) {
    spacer = <div />;
  }

  const onBlur = (data) => {
    const { editor } = data;
    setEditorCache(editor);
  };

  const handleChange = (data) => {
    if (!editorCache) {
      let tag = "";
      if (data.mime.includes("image"))
        tag = `<p><img src="${data.url}" caption="${data.caption}" alt="${data.alternativeText}"></img></p>`;
      else if (data.mime.includes("pdf"))
        tag = `<a href="${data.url}" target="_blank">${
          data.caption && data.caption.trim().length > 0
            ? data.caption
            : "PDF file"
        }</a>`;

      let newValue = !value ? tag : `${tag}${value}`;

      onChange({ target: { name, value: newValue } });
      return;
    }

    const selectionPos = editorCache.model.document.selection.getFirstPosition();

    editorCache.model.change((writer) => {
      let newElement = null;

      if (data.mime.includes("image")) {
        newElement = writer.createElement("image", {
          alignment: "center",
          src: data.url,
          caption: data.caption,
          alt: data.alternativeText,
        });
      } else if (data.mime.includes("pdf")) {
        const pdfName =
          data.caption && data.caption.trim().length > 0
            ? data.caption
            : "PDF";

        newElement = writer.createText(pdfName, {
          linkHref: data.url,
          target: "_blank",
        });
      }

      writer.insert(newElement, selectionPos, "before");
    });

    // Handle videos and other type of files by adding some code
  };

  const handleToggle = () => setIsOpen((prev) => !prev);

  return (
    <div
      style={{
        marginBottom: "1.6rem",
        fontSize: "1.3rem",
        fontFamily: "Lato",
      }}
    >
      <Label htmlFor={name} message={label} style={{ marginBottom: 10 }} />
      <div>
        <Button color="primary" onClick={handleToggle}>
          Media Library
        </Button>
      </div>
      <Editor name={name} onChange={onChange} value={value} onBlur={onBlur} />
      <InputDescription
        message={inputDescription}
        style={!isEmpty(inputDescription) ? { marginTop: "1.4rem" } : {}}
      />
      <InputErrors
        errors={(!noErrorsDescription && errors) || []}
        name={name}
      />
      {spacer}
      <MediaLib
        onToggle={handleToggle}
        isOpen={isOpen}
        onChange={handleChange}
      />
    </div>
  );
};

Wysiwyg.defaultProps = {
  errors: [],
  inputDescription: null,
  label: "",
  noErrorsDescription: false,
  value: "",
};

Wysiwyg.propTypes = {
  errors: PropTypes.array,
  inputDescription: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.func,
    PropTypes.shape({
      id: PropTypes.string,
      params: PropTypes.object,
    }),
  ]),
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.func,
    PropTypes.shape({
      id: PropTypes.string,
      params: PropTypes.object,
    }),
  ]),
  name: PropTypes.string.isRequired,
  noErrorsDescription: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string,
};

export default Wysiwyg;
