import { Select, styled } from "@mui/material";

export const StyledSelect = styled(Select)(({ theme }) => ({
  color: theme.palette.common.white,
  "& .MuiSelect-icon": {
    color: theme.palette.common.white
  }
}));

export const flagStyle = {
  marginRight: 8
};