import { CircularProgress, Grow, Box, Toolbar, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { User } from "../../api/services/User/store";
import AvatarMenu from "../AvatarMenu";
import LanguageSelect from "../LanguageSelect";
import {
  AppBar,
  appBarStyle,
  centerSectionStyle,
  containerStyle,
  rightSectionStyle,
  spacerStyle,
  spinnerWrapperStyle,
  titleStyle,
  toolbarStyle,
  typoStyle
} from "./styles";

interface AppHeaderProps {
  user: User;
  pageTitle: string;
}

const AppHeader = React.forwardRef<HTMLDivElement, AppHeaderProps>((props, ref) => {
  const { user, pageTitle } = props;
  const { t } = useTranslation("app");

  const [count, setCount] = useState(0);
  const hours = 1;
  const minutes = hours * 60;
  const seconds = minutes * 60;
  const countdown = seconds - count;
  const countdownMinutes = `${~~(countdown / 60)}`.padStart(2, "0");
  const countdownSeconds = (countdown % 60).toFixed(0).padStart(2, "0");

  useEffect(() => {
    const id = setInterval(() => {
      setCount((c) => c + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <AppBar ref={ref} position="fixed" sx={appBarStyle}>
      <Toolbar sx={toolbarStyle}>
        <Box sx={containerStyle}>
          <Box>
            <Typography variant="h6" component="div" color="primary">
              {countdownMinutes}:{countdownSeconds}
            </Typography>
          </Box>
          <Box sx={spacerStyle} />
          <Box sx={centerSectionStyle}>
            <Typography sx={titleStyle} variant="h6" component="div">
              {t("appTitle").toLocaleUpperCase()}
            </Typography>
            <Typography sx={typoStyle} variant="overline" component="div" noWrap>
              {pageTitle.toLocaleUpperCase()}
            </Typography>
          </Box>
          <Box sx={rightSectionStyle}>
            <LanguageSelect />
            {user && user.eMail ? (
              <Grow in={Boolean(user && user.eMail)}>
                <AvatarMenu user={user} />
              </Grow>
            ) : (
              <Box sx={spinnerWrapperStyle}>
                <CircularProgress size={24} color="inherit" thickness={4} />
              </Box>
            )}
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
});

export default AppHeader;
