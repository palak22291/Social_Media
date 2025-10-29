import React, { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export default function RHFPasswordField({ name, ...other }) {
  const { control } = useFormContext();
  const [show, setShow] = useState(false);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          {...other}
          variant="outlined"
          type={show ? "text" : "password"}
          error={!!error}
          helperText={error ? error.message : other.helperText || ""}
          fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton 
                onClick={() => setShow(!show)}
                edge="end"
                
                >
                  {show ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      )}
    />
  );
}
