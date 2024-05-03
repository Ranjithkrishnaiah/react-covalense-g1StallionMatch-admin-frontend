import React, { ReactNode, useEffect } from 'react';
import ReactQuill, { ReactQuillProps, UnprivilegedEditor } from 'react-quill';
// @mui
import { styled } from '@mui/material/styles';
import { Box, BoxProps, Typography } from '@mui/material';
//
import EditorToolbar, { formats, redoChange, undoChange } from './EditorToolbar';

// ----------------------------------------------------------------------

const RootStyle = styled(Box)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  border: `solid 1px ${theme.palette.grey[500_32]}`,
  '& .ql-container.ql-snow': {
    borderColor: 'transparent',
    ...theme.typography.body1,
    fontFamily: theme.typography.fontFamily,
  },
  '& .ql-editor': {
    minHeight: 172,
    '&.ql-blank::before': {
      fontStyle: 'normal',
      color: theme.palette.text.disabled,
    },
    '& pre.ql-syntax': {
      ...theme.typography.body2,
      padding: theme.spacing(2),
      borderRadius: theme.shape.borderRadius,
      backgroundColor: theme.palette.grey[900],
    },
  },
}));

// ----------------------------------------------------------------------

export interface Props extends ReactQuillProps {
  id?: string;
  error?: boolean;
  simple?: boolean;
  helperText?: ReactNode;
  sx?: BoxProps;
  maxLength?: number;
  messageEditor?: string;
}

export default function Editor({
  id = 'minimal-quill',
  error,
  value,
  onChange,
  simple = false,
  helperText,
  messageEditor,
  sx,
  ...other
}: Props) {
  console.log("Current value:", value);
  const modules = {
    toolbar: {
      container: `#${id}`,
      handlers: {
        undo: undoChange,
        redo: redoChange,
      },
    },
    history: {
      delay: 500,
      maxStack: 100,
      userOnly: true,
    },
    syntax: true,
    clipboard: {
      matchVisual: false,
    },
  };

  const maxCharCount = 275;
  let [ count, setCount ] = React.useState(0);
  let [ editorCount, setEditorCount ] = React.useState(11);
  const stripHtmlTags = (html:any) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };
  
  const checkCharacterCount = (event: any) => {
    let charLength = stripHtmlTags(value).length;
    if (charLength > 275 && event.key !== 'Backspace') {
      // event.preventDefault();
    } else {
      setCount(charLength);
    }
  }

  useEffect(() => {
    if(value) {
      // setCount(value?.length);
      let charLength = stripHtmlTags(value).length;
      setCount(charLength);
    }
  }, [value])
  
  
  return (
    <div>
      <RootStyle
        sx={{
          ...(error && {
            border: (theme:any) => `solid 1px ${theme.palette.error.main}`,
          }),
          ...sx,
        }}
      >
        
        <ReactQuill
          value={value}
          onKeyDown={checkCharacterCount}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder="Description"
          {...other}
        />
        <Typography variant="subtitle2" className='count-text' textAlign='center'>{count}/275</Typography>
        <EditorToolbar id={id} isSimple={simple} messageEditor={messageEditor} />
        
      </RootStyle>

      {helperText && helperText}
    </div>
  );
}
