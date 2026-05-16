import { Box, Container, Typography } from "@mui/material";
import { observer } from "mobx-react";
import React from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import { Trans, useTranslation } from "react-i18next";

const ISSUES = [
  { icon: "🐞", key: "consoleKeyError" },
  { icon: "🐞", key: "boldKnown" },
  { icon: "🐞", key: "missingAvatar" },
  { icon: "🐞", key: "countdownGlitch" },
  { icon: "⭐️", key: "languageSwitch" }
];

const Home = () => {
  const { t } = useTranslation("app");

  return (
    <Box p={2} maxHeight="calc(100vh - 64px)" overflow={["auto", "auto"]}>
      <Container>
        <Typography variant="h1" textAlign="center">
          {t("home.welcome")}
        </Typography>
        <Typography variant="subtitle1" textAlign="center">
          <Trans i18nKey="home.intro" t={t} components={{ b: <b /> }} />{" "}
        </Typography>
        <Typography variant="body2" textAlign="center" color="textSecondary">
          {t("home.sidenote")}
        </Typography>
        <List>
          {ISSUES.map(({ icon, key }) => (
            <ListItem key={key}>
              <Typography variant="h5" sx={{ p: 2 }}>
                {icon}
              </Typography>
              <ListItemText
                primary={t(`home.issues.${key}.title`)}
                secondary={t(`home.issues.${key}.description`)}
              />
            </ListItem>
          ))}
        </List>
      </Container>
    </Box>
  );
};

export default observer(Home);
