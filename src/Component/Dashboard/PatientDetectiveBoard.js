import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Grid,
  Card,
  CardContent,
  Typography,
  Divider,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import PatientInfoCard from "./PatientInfoCard";
import MedicalHistoryCard from "./MedicalHistoryCard";
import TestsCard from "./TestsCard";
import BillingCard from "./BillingCard";
import ResultsCard from "./ResultsCard";

import { usePatient } from "../../core/hooks/usePatient";
import LoadingSpinner from "../common/LoadingSpinner";

const PatientDetectiveBoard = ({ isOpen, onClose, patientId }) => {
  const [selectedCard, setSelectedCard] = useState(null);
  const { patient, isLoading, error } = usePatient(isOpen ? patientId : null);

  const handleCardClick = (id) =>
    setSelectedCard(selectedCard === id ? null : id);

  const isSelected = (id) => selectedCard === id;

  const pd = patient || {};

  const compactCardStyle = (active) => ({
    cursor: "pointer",
    borderRadius: 2,
    boxShadow: active ? "0 0 0 2px #1976d2 inset" : "0 1px 3px rgba(0,0,0,0.12)",
    transition: "0.15s",
    padding: 0,
  });

  const cardContentStyle = {
    padding: "12px 16px",
  };

  const renderContent = () => {
    if (isLoading)
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
          <LoadingSpinner />
        </Box>
      );

    if (error)
      return (
        <Box textAlign="center" p={3} color="error.main">
          <Typography variant="body1">{error}</Typography>
        </Box>
      );

    if (!patient)
      return (
        <Box textAlign="center" p={3} color="warning.main">
          <Typography>No patient data found</Typography>
        </Box>
      );

    return (
      <Grid container spacing={2} mt={0.5}>
        {/* Patient Card (compact) */}
        <Grid item xs={12}>
          <Card
            elevation={0}
            onClick={() => handleCardClick("patient")}
            sx={compactCardStyle(isSelected("patient"))}
          >
            <CardContent sx={cardContentStyle}>
              <PatientInfoCard patient={pd} compact />
            </CardContent>
          </Card>
        </Grid>

        {/* Grid of small compact cards */}
        <Grid item xs={12} md={6} lg={3}>
          <Card
            elevation={0}
            onClick={() => handleCardClick("medical")}
            sx={compactCardStyle(isSelected("medical"))}
          >
            <CardContent sx={cardContentStyle}>
              <MedicalHistoryCard patient={pd} compact />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card
            elevation={0}
            onClick={() => handleCardClick("tests")}
            sx={compactCardStyle(isSelected("tests"))}
          >
            <CardContent sx={cardContentStyle}>
              <TestsCard patient={pd} compact />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card
            elevation={0}
            onClick={() => handleCardClick("billing")}
            sx={compactCardStyle(isSelected("billing"))}
          >
            <CardContent sx={cardContentStyle}>
              <BillingCard patient={pd} compact />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card
            elevation={0}
            onClick={() => handleCardClick("results")}
            sx={compactCardStyle(isSelected("results"))}
          >
            <CardContent sx={cardContentStyle}>
              <ResultsCard patient={pd} compact />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  return (
    <Dialog
      fullWidth
      maxWidth="lg"
      open={isOpen}
      onClose={onClose}
      PaperProps={{
        sx: {
          height: "85vh",
          borderRadius: 2,
          padding: 0,
        },
      }}
    >
      <DialogTitle
        sx={{
          fontSize: "1.1rem",
          fontWeight: 600,
          padding: "10px 16px",
        }}
      >
        Patient Overview
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 12, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ overflowY: "auto", padding: "12px 16px" }}>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};

export default PatientDetectiveBoard;
