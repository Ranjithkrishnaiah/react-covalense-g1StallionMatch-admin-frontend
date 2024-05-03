import { NavLink as RouterLink } from 'react-router-dom';
// @mui
import { Box, Link, ListItemText, styled } from '@mui/material';
// type
import { NavItemProps } from '../type';
//
import Iconify from '../../Iconify';
import { ListItemStyle, ListItemTextStyle, ListItemIconStyle } from './style';
import { isExternalLink } from '..';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import { toPascalCase } from 'src/utils/customFunctions';
// @mui
import { useTheme, makeStyles } from '@mui/material/styles';
import React from 'react';

// ----------------------------------------------------------------------

const LightTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.white,
    color: 'rgba(0, 0, 0, 0.87)',
    boxShadow: '0px 10px 15px rgba(0, 0, 0, 0.1), 0px 4px 6px rgba(0, 0, 0, 0.05)',
    borderRadius: '8px',
    fontFamily: 'Synthese-Book',
    height: '38px',
    minWidth: '100px',
    display: 'flex',
    alignItems: 'center',
    justifyCcontent: 'center',
    letterSpacing: '-0.01em',
    fontWeight: '350',
    fontSize: '16px',
    lineHeight: '24px',
    padding: '6px 16px 8px',
    textTransform: 'capitalize',
    marginLeft:'26px !important',
    position: 'relative',
    top: '10px',

  },
}));


export function NavItemRoot({ item, isCollapse, open = false, active, onOpen }: NavItemProps) {
  const { title, path, icon, info, children } = item;
  const theme = useTheme();
  const pascalTitle = toPascalCase(title)?.toString();
  const renderContent = (
    <>
      {icon && isCollapse && <LightTooltip title={title}  className="collapseTooltipText" placement="right-end"><ListItemIconStyle>{icon}</ListItemIconStyle></LightTooltip>}
      {icon && !isCollapse && <ListItemIconStyle>{icon}</ListItemIconStyle>}
      <ListItemTextStyle disableTypography primary={title} isCollapse={isCollapse} />
      {!isCollapse && (
        <>
          {info && info}
          {children && <ArrowIcon open={open} />}
        </>
      )}
    </>
  );

  if (children) {
    return (
      <ListItemStyle onClick={onOpen} activeRoot={active}>
        {renderContent}
      </ListItemStyle>
    );
  }

  return isExternalLink(path) ? (
    <ListItemStyle component={Link} href={path} target="_blank" rel="noopener">
      {renderContent}
    </ListItemStyle>
  ) : (
    <ListItemStyle component={RouterLink} to={path} activeRoot={active}>
      {renderContent}
    </ListItemStyle>
  );
}

// ----------------------------------------------------------------------

type NavItemSubProps = Omit<NavItemProps, 'isCollapse'>;

export function NavItemSub({ item, open = false, active = false, onOpen }: NavItemSubProps) {
  const { title, path, info, children } = item;

  const renderContent = (
    <>
      <DotIcon active={active} />
      <ListItemText disableTypography primary={title} />
      {info && info}
      {children && <ArrowIcon open={open} />}
    </>
  );

  if (children) {
    return (
      <ListItemStyle onClick={onOpen} activeSub={active} subItem>
        {renderContent}
      </ListItemStyle>
    );
  }

  return isExternalLink(path) ? (
    <ListItemStyle component={Link} href={path} target="_blank" rel="noopener" subItem>
      {renderContent}
    </ListItemStyle>
  ) : (
    <ListItemStyle component={RouterLink} to={path} activeSub={active} subItem>
      {renderContent}
    </ListItemStyle>
  );
}

// ----------------------------------------------------------------------

type DotIconProps = {
  active: boolean;
};

export function DotIcon({ active }: DotIconProps) {
  return (
    <ListItemIconStyle>
      <Box
        component="span"
        sx={{
          width: 4,
          height: 4,
          borderRadius: '50%',
          bgcolor: 'text.disabled',
          transition: (theme) =>
            theme.transitions.create('transform', {
              duration: theme.transitions.duration.shorter,
            }),
          ...(active && {
            transform: 'scale(2)',
            bgcolor: 'primary.main',
          }),
        }}
      />
    </ListItemIconStyle>
  );
}

// ----------------------------------------------------------------------

type ArrowIconProps = {
  open: boolean;
};

export function ArrowIcon({ open }: ArrowIconProps) {
  return (
    <Iconify
      icon={open ? 'eva:arrow-ios-downward-fill' : 'eva:arrow-ios-forward-fill'}
      sx={{ width: 16, height: 16, ml: 1 }}
    />
  );
}
