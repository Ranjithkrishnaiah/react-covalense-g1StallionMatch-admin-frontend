import { Theme } from '@mui/material/styles';

// ----------------------------------------------------------------------

export default function Input(theme: Theme) {
  return {
    MuiInputBase: {
      styleOverrides: {
        root: {
          height: '40px',
          background: '#ffffff',
          borderRadius: '4px !important',
          '&.Mui-disabled': {
            '& svg': { color: theme.palette.text.disabled },
          },
        },
        input: {
          borderRadius: '4px',
          '&::placeholder': {
            opacity: 1,
            color: theme.palette.text.disabled,
          },
        },
      },
    },
    MuiInput: {
      styleOverrides: {
        borderRadius: '4px',
        underline: {
          '&:before': {
            borderBottomColor: theme.palette.grey[500_56],
          },
        },
        '&.Mui-focused': {
            border: 'solid 1px #d4d4d4'
        },
      },
    },
    MuiFilledInput: {
      styleOverrides: {
        root: {
          backgroundColor: theme.palette.grey[500_12],
          '&:hover': {
            
          },
          '&.Mui-focused': {
            
          },
          '&.Mui-disabled': {
            backgroundColor: theme.palette.action.disabledBackground,
          },
        },
        underline: {
          '&:before': {
            borderBottomColor: theme.palette.grey[500_56],
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
            // borderColor: theme.palette.grey[500_32],
            border: 'solid 1px #d4d4d4'
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            border: 'solid 1px #161716'
        },
          '&.Mui-disabled': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.palette.action.disabledBackground,
              border: 'solid 1px #d4d4d4'
            },
          },
        },
      },
    },
  };
}
