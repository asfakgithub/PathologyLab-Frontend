import React from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  Stack,
} from "@mui/material";

// ✅ Format address safely (prevents the 'object not valid' error)
const formatAddress = (address = {}) => {
  if (!address || typeof address !== "object") return "";

  const { street, city, state, zipCode, country } = address;

  return [street, city, state, zipCode, country].filter(Boolean).join(", ");
};

const PatientInfoCard = ({ patient, isConnected, onClick }) => {
  return (
    <Card
      onClick={onClick}
      elevation={isConnected ? 8 : 2}
      sx={{
        maxWidth: 600,
        margin: "0 auto 32px",
        borderRadius: "20px",
        cursor: "pointer",
        transition: "0.25s ease",
        transform: isConnected ? "translateY(-4px)" : "none",
        boxShadow: isConnected
          ? "0 10px 30px rgba(0,0,0,0.25)"
          : "0 3px 12px rgba(0,0,0,0.12)",
        bgcolor: "background.paper",
        p: 1,
        textAlign: "center",
      }}
    >
      <CardContent sx={{ pb: 2 }}>

        {/* ======================= NAME ======================= */}
        <Typography
          variant="h4"
          fontWeight="700"
          sx={{
            mb: 1.5,
            color: "text.primary",
            textShadow:
              "0px 3px 6px rgba(0,0,0,0.2), 0px 1px 2px rgba(0,0,0,0.1)",
          }}
        >
          {patient.name}
        </Typography>

        {/* ======================= BADGES ======================= */}
        <Stack
          direction="row"
          justifyContent="center"
          spacing={1.2}
          sx={{ flexWrap: "wrap", mb: 2 }}
        >
          {patient.age && (
            <Chip
              label={`${patient.age} yrs`}
              color="primary"
              size="small"
              sx={{ fontWeight: 600 }}
            />
          )}

          {patient.gender && (
            <Chip
              label={patient.gender}
              color="secondary"
              size="small"
              sx={{ fontWeight: 600 }}
            />
          )}

          {patient.priority && (
            <Chip
              label={`⚠ ${String(patient.priority).toUpperCase()}`}
              color="warning"
              size="small"
              sx={{ fontWeight: 700 }}
            />
          )}
        </Stack>

        {/* ======================= STATUS ======================= */}
        {patient.status && (
          <Chip
            label={patient.status}
            color="success"
            size="small"
            sx={{ mb: 2, px: 1.5, fontWeight: "bold" }}
          />
        )}

        {/* Divider */}
        <Box
          sx={{
            width: "100%",
            height: "1px",
            bgcolor: "rgba(0,0,0,0.1)",
            my: 2.5,
          }}
        />

        {/* ======================= CONTACT DETAILS ======================= */}
        <Stack spacing={1.2}>

          {/* PHONE */}
          {patient.phone && (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              gap={1}
            >
              <Typography variant="body1" fontWeight={500}>
                📞
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {patient.phone}
              </Typography>
            </Box>
          )}

          {/* EMAIL */}
          {patient.email && (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              gap={1}
            >
              <Typography variant="body1" fontWeight={500}>
                📧
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {patient.email}
              </Typography>
            </Box>
          )}

          {/* ADDRESS */}
          {patient.address && (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              gap={1}
              sx={{ textAlign: "center" }}
            >
              <Typography variant="body1" fontWeight={500}>
                📍
              </Typography>

              <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  maxWidth: 400,
                  lineHeight: 1.3,
                  wordBreak: "break-word",
                }}
              >
                {formatAddress(patient.address)}
              </Typography>
            </Box>
          )}

        </Stack>
      </CardContent>
    </Card>
  );
};

export default PatientInfoCard;
