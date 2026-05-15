import { MenuItem, SelectChangeEvent } from "@mui/material";
import { useTranslation } from "react-i18next";
import { StyledSelect, flagStyle } from "./styles";

const LANGUAGES = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" }
];

const LanguageSelect = () => {
  const { i18n } = useTranslation();

  const handleChange = (event: SelectChangeEvent<unknown>) => {
    i18n.changeLanguage(event.target.value as string);
  };

  return (
    <StyledSelect
      value={i18n.language}
      onChange={handleChange}
      size="small"
      variant="standard"
      disableUnderline
    >
      {LANGUAGES.map(({ code, name, flag }) => (
        <MenuItem key={code} value={code}>
          <span style={flagStyle}>{flag}</span>
          {name}
        </MenuItem>
      ))}
    </StyledSelect>
  );
};

export default LanguageSelect;