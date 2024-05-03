import Dialog from '@mui/material/Dialog';

export default function FullScreenDialog(props: any) {
  if (props.open) {
    return (
      <Dialog
        disablePortal
        fullScreen
        open={props.open}
        onClose={() => props.setOpen(false)}
        className={props.className}
      >
        {props.children}
      </Dialog>
    );
  }
  return <>{props.children}</>;
}
