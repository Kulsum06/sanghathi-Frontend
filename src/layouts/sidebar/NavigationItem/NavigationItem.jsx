import { ListItem, Box, List, useTheme } from "@mui/material";
import DropdownItem from "./DropdownItem";
import NavItemButton from "./NavItemButton";
import { useNavigate, useLocation } from "react-router-dom";

const NavigationItem = ({
  text,
  icon,
  link,
  dropdownItems,
  active,
  setActive,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const { pathname } = useLocation();

  const normalizeText = (text) => {
    return text.toLowerCase().replace(/[\s_-]/g, "");
  };
  const lcText = normalizeText(text);

  const isActiveRoute =
    Boolean(link) && (pathname === link || pathname.startsWith(`${link}/`));
  const isActive = isActiveRoute ? lcText : "";

  const isDropdown = dropdownItems && dropdownItems.length > 0;

  const onToggleDropdown = () => {
    setActive(active === lcText ? "" : lcText);
  };

  const onItemClick = (itemLink) => {
    navigate(itemLink);
    setActive(lcText);
  };

  return (
    <Box>
      <ListItem
        key={text}
        sx={{
          textAlign: "center",
          px: { xs: "8px", sm: "12px" },
          py: { xs: "4px", sm: "2px" },
        }}
      >
        <NavItemButton
          text={text}
          icon={icon}
          lcText={lcText}
          theme={theme}
          active={isActive}
          isDropdown={isDropdown}
          onToggleDropdown={
            isDropdown ? onToggleDropdown : () => onItemClick(link)
          }
        />
      </ListItem>
      <List sx={{ px: { xs: "8px", sm: "12px" }, py: 0 }}>
        {isDropdown &&
          active === lcText &&
          dropdownItems.map(({ text: itemText, link: itemLink }) => (
            <DropdownItem
              key={itemText}
              itemText={itemText}
              itemLink={itemLink}
              active={active}
              setActive={setActive}
            />
          ))}
      </List>
    </Box>
  );
};

export default NavigationItem;
