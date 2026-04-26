import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import CollapsibleIcon from "./CollapsibleIcon";

const NavItemButton = ({
  text,
  icon,
  lcText,
  theme,
  active,
  navButtonBackgroundColor,
  isDropdown,
  onToggleDropdown,
}) => {
  const isLight = theme.palette.mode === 'light';
  const colorMode = isLight ? 'primary' : 'info';
  
  return (
    <ListItemButton
      onClick={onToggleDropdown}
      sx={{
        borderRadius: "10px",
        padding: { xs: "12px 10px", sm: "8px 10px" },
        minHeight: { xs: "52px", sm: "44px" },
        backgroundColor:
          active === lcText 
            ? isLight 
              ? theme.palette.grey[100] 
              : theme.palette.action.selected
            : "transparent",
        color:
          active === lcText
            ? theme.palette[colorMode].main
            : theme.palette.text.primary,
        transition: theme.transitions.create(
          ["background-color", "color"],
          {
            duration: theme.transitions.duration.shorter,
          }
        ),
        "&:hover": {
          backgroundColor: theme.palette.action.hover,
          color: theme.palette[colorMode].main,
        },
        "&:active": {
          backgroundColor: isLight
            ? theme.palette.grey[200]
            : theme.palette.action.selected,
        },
      }}
    >
      <ListItemIcon
        sx={{
          ml: "0.5rem",
          minWidth: { xs: "40px", sm: "40px" },
          color:
            active === lcText
              ? theme.palette[colorMode].main
              : theme.palette.text.primary,
          transition: "color 0.2s ease",
        }}
      >
        {icon}
      </ListItemIcon>
      <ListItemText
        primary={
          <Typography
            sx={{
              fontSize: { xs: "0.95rem", sm: "0.9rem" },
              fontWeight: active === lcText ? 600 : 500,
              color: active === lcText
                ? theme.palette[colorMode].main
                : theme.palette.text.primary,
            }}
          >
            {text}
          </Typography>
        }
        sx={{
          mx: { xs: "0.5rem", sm: "0" },
        }}
      />
      {isDropdown && (
        <CollapsibleIcon
          isOpen={active === lcText}
          onClick={onToggleDropdown}
        />
      )}
    </ListItemButton>
  );
};

export default NavItemButton;
