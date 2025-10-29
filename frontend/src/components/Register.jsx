import React, { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";


import axiosInstance from "../utils/axiosInstance";
import {
  registerSchema,
  defaultRegisterValues,
} from "../schemas/registerSchema";
import RHFPasswordField from "../hook-form/RHFPasswordField";
import RHFTextField from "../hook-form/RHFTextField";

export default function Register() {
  const [serverMessage, setServerMessage] = useState(null);
  const [severity, setSeverity] = useState("info");

  const methods = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: defaultRegisterValues,
    mode: "onTouched",
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = methods;

  const onSubmit = async (values) => {
    setServerMessage(null);
    try {
      // pick only fields backend expects
      const payload = {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        password: values.password,
      };

      const res = await axiosInstance.post("/auth/register", payload);

      if (res.status === 200 || res.status === 201) {
        setSeverity("success");
        setServerMessage(res.data?.message || "Registration successful!");
        reset();
      } else {
        setSeverity("error");
        setServerMessage(res.data?.error || "Registration failed. Try again.");
      }
    } catch (err) {
      console.error("Register error:", err?.response || err);
      setSeverity("error");
      const serverErr =
        err?.response?.data?.error || err?.response?.data?.message;
      setServerMessage(serverErr || "Network error. Please try again.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        p: 2,
      }}
    >
      <Card
        elevation={8}
        sx={{ width: "100%", maxWidth: 520, borderRadius: 3 }}
      >
       

        <CardContent sx={{ px: { xs: 3, sm: 6 }, py: 5}}>
          <Typography variant="h4" align="center" fontWeight={700} gutterBottom>
            Welcome To Connectify
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            mb={2}
          >
            
          </Typography>

          {serverMessage && (
            <Alert severity={severity} sx={{ mb: 2 }}>
              {serverMessage}
            </Alert>
          )}

          <FormProvider {...methods}>
            <form noValidate onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={2}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <RHFTextField name="firstName" label="First name" />
                  <RHFTextField name="lastName" label="Last name" />
                </Stack>

                <RHFTextField name="email" label="Email address" />
                <RHFPasswordField name="password" label="Password" />
                <RHFPasswordField
                  name="confirmPassword"
                  label="Confirm password"
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  sx={{
                    mt: 1,
                    py: 1.3,
                    fontWeight: 700,
                    textTransform: "none",
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  }}
                  disabled={isSubmitting}
                  startIcon={
                    isSubmitting ? (
                      <CircularProgress color="inherit" size={18} />
                    ) : null
                  }
                >
                  {isSubmitting ? "Creating..." : "Create Account"}
                </Button>

                <Typography
                  variant="body2"
                  align="center"
                  color="text.secondary"
                >
                  Already have an account?{" "}
                  <Box
                    component="a"
                    href="/login"
                    sx={{
                      color: "#667eea",
                      textDecoration: "none",
                      fontWeight: 600,
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    Sign in
                  </Box>
                </Typography>
              </Stack>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </Box>
  );
}
