// @mui
import { Box } from '@mui/material';
// components
import { IconButtonAnimate } from '../../../components/animate';

// ----------------------------------------------------------------------

type Props = {
  onToggleCollapse: VoidFunction;
  collapseClick: boolean;
};

export default function CollapseButton({ onToggleCollapse, collapseClick }: Props) {
  return (
    <IconButtonAnimate onClick={onToggleCollapse} className='collapseBtnwrapper'>
      <Box
      className='collapseBtn'
        sx={{
          lineHeight: 0,
          transition: (theme) =>
            theme.transitions.create('transform', {
              duration: theme.transitions.duration.shorter,
            }),
          ...(collapseClick && {
            // transform: 'rotate(180deg)',
             transform: 'scaleX(-1)',
          }),
        }}
      >
        {icon}
      </Box>
    </IconButtonAnimate>
  );
}

// ----------------------------------------------------------------------

const icon = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<g opacity="0.4">
<path d="M21 18V20H3V18H21ZM6.95 3.55V13.45L2 8.5L6.95 3.55ZM21 11V13H12V11H21ZM21 4V6H12V4H21Z" fill="white"/>
</g>
</svg>
);
