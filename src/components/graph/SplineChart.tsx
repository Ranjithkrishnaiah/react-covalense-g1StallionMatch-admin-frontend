import React from "react";
// import "./styles.css";
import { Container, Grid, Box, StyledEngineProvider, Typography, Divider, Stack, IconButton, Avatar } from '@mui/material';

import { Line } from "react-chartjs-2";

const data = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    {
      label: "First dataset",
      data: [33, 53, 85, 41, 44, 65],
      fill: false,
      backgroundColor: "rgba(75,192,192,0.2)",
      borderColor: "rgba(75,192,192,1)"
    },
    {
      label: "Second dataset",
      data: [33, 25, 35, 51, 54, 76],
      fill: false,
      borderColor: "#742774"
    }
  ]
};

export default function SplineChart() {
  return (
    <Box className="App">
      <Line data={data} />
    </Box>
  );
}
