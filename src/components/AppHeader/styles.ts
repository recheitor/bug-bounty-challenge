import { SxProps, Theme } from "@mui/material";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import { styled } from "@mui/material/styles";

interface AppBarProps extends MuiAppBarProps {
  theme?: Theme;
}

export const AppBar = styled(MuiAppBar)<AppBarProps>(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  backgroundColor: theme.palette.common.black,
  color: theme.palette.common.white,
  height: theme.tokens.header.height
}));

export const appBarStyle: SxProps<Theme> = {
  width: "100vw"
};

export const toolbarStyle: SxProps<Theme> = {
  background: "#08140C 0% 0% no-repeat padding-box"
};

export const containerStyle: SxProps<Theme> = {
  width: "100%",
  flexDirection: "row",
  display: "flex"
};

export const spacerStyle: SxProps<Theme> = {
  width: 20,
  height: 20,
  flex: 1
};

export const centerSectionStyle: SxProps<Theme> = {
  flex: 2
};

export const typoStyle = {
  display: "flex",
  alignContent: "center",
  justifyContent: "center",
  lineHeight: 1
} as const;

export const titleStyle: SxProps<Theme> = (theme) => ({
  ...typoStyle,
  color: theme.palette.primary.main,
  mb: theme.spacing(0.5)
});

export const rightSectionStyle: SxProps<Theme> = {
  flex: 1,
  justifyContent: "flex-end",
  display: "flex",
  alignItems: "center",
  gap: 2
};

export const spinnerWrapperStyle: SxProps<Theme> = {
  width: 40,
  height: 40,
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};