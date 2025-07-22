"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Card, 
  CardContent, 
  Alert,
  IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs, { Dayjs } from 'dayjs';
import { DriveDetail, DriverData, ApiResponse } from '../../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

const Drivers: React.FC = () => {
  const router = useRouter();
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [capacity, setCapacity] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [driveDetails, setDriveDetails] = useState<DriveDetail[]>([]);
  

  const handleAddDrive = () => {
    setDriveDetails([...driveDetails, { date: null, start: null, end: null }]);
  };

  const handleDeleteDrive = (index: number) => {
    const updatedDrives = driveDetails.filter((_: DriveDetail, i: number) => i !== index);
    setDriveDetails(updatedDrives);
  };

  const handleDriveChange = (index: number, field: keyof DriveDetail, value: Dayjs | null) => {
    const updatedDrives = [...driveDetails];
    updatedDrives[index][field] = value;
    setDriveDetails(updatedDrives);
  };

  const handleSubmit = () => {
    if (!name || !email || !address || !phone) {
      alert('Name, email, address, and phone are required.');
      return;
    }
    const driverData: DriverData = { 
      name, 
      email,
      address, 
      phone,
      drives: driveDetails.map((drive: DriveDetail) => {
        const formattedDate = drive.date ? drive.date.format('dddd, MM/DD/YY') : null;
        return {
          [formattedDate || '']: [{
            start: drive.start ? drive.start.format('HH:mm A') : null,
            end: drive.end ? drive.end.format('HH:mm A') : null,
            capacity: capacity || null
          }]
        };
      })
    };

    console.log(driverData);

    axios.post<ApiResponse>(`${API_BASE_URL}/api/drivers`, driverData, {
      headers: {
        'x-api-key': API_KEY,
      },
    })
      .then((response) => {
        console.log(response.data);
        alert('Driver saved successfully!');
      })
      .catch((error: any) => {
        console.error('Error saving driver:', error);
        alert('Failed to save driver.');
      });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          py: 4
        }}
      >
        <Container maxWidth="lg">
          <Paper
            elevation={24}
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              mb: 4
            }}
          >
            <Box
              sx={{
                background: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
                color: 'white',
                py: 4,
                px: 4,
                textAlign: 'center',
                position: 'relative'
              }}
            >
              <IconButton
                onClick={() => router.push('/')}
                sx={{
                  position: 'absolute',
                  left: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                🚗 Driver Registration
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Help fellow climbers get to the gym
              </Typography>
            </Box>

            <Box sx={{ p: 4 }}>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body1" gutterBottom>
                  <strong>Welcome to MCC Carpools!</strong> Help fellow climbers by offering rides to the gym.
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Pick up can be anywhere on central campus. North campus pickups are at Pierpont.
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Every drive earns you an entry into our monthly REI gift card giveaway!
                </Typography>
              </Alert>

              <Card sx={{ mb: 4, p: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ color: '#333', mb: 3 }}>
                  👤 Personal Information
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                  <TextField
                    label="Name"
                    variant="outlined"
                    value={name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                    fullWidth
                    margin="normal"
                    required
                  />
                  <TextField
                    label="Email"
                    variant="outlined"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    fullWidth
                    margin="normal"
                    required
                  />
                  <TextField
                    label="Phone Number"
                    variant="outlined"
                    value={phone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                    fullWidth
                    margin="normal"
                    required
                    type="tel"
                    inputProps={{ pattern: '[0-9\-\+\(\) ]*' }}
                  />
                </Box>
              </Card>

              <Card sx={{ mb: 4, p: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ color: '#333', mb: 3 }}>
                  🚗 Vehicle Information
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                  <TextField
                    label="Pickup Address"
                    variant="outlined"
                    value={address}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)}
                    fullWidth
                    margin="normal"
                    required
                  />
                  <TextField
                    label="Car Capacity"
                    variant="outlined"
                    value={capacity}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCapacity(e.target.value)}
                    fullWidth
                  />
                </Box>
              </Card>

              <Card sx={{ mb: 4, p: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ color: '#333', mb: 3 }}>
                  ⏰ Drive Schedule
                </Typography>
                <Typography variant="body2" sx={{ mb: 3, color: '#666' }}>
                  Add your available drive times for the next week.
                </Typography>
                
                {driveDetails.map((drive: DriveDetail, index: number) => (
                  <Card key={index} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0' }}>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: 'center' }}>
                      <Box sx={{ flex: 1 }}>
                        <DatePicker
                          label="Drive Date"
                          value={drive.date}
                          onChange={(newValue: Dayjs | null) => handleDriveChange(index, 'date', newValue)}
                          slotProps={{ textField: { variant: 'outlined', fullWidth: true } }}
                          disablePast
                          maxDate={dayjs().add(7, 'day')}
                        />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <TimePicker
                          label="Start Time"
                          value={drive.start}
                          onChange={(newValue: Dayjs | null) => handleDriveChange(index, 'start', newValue)}
                          slotProps={{ textField: { variant: 'outlined', fullWidth: true } }}
                        />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <TimePicker
                          label="End Time"
                          value={drive.end}
                          onChange={(newValue: Dayjs | null) => handleDriveChange(index, 'end', newValue)}
                          slotProps={{ textField: { variant: 'outlined', fullWidth: true } }}
                          minTime={drive.start || undefined}
                        />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => handleDeleteDrive(index)}
                          fullWidth
                        >
                          Delete
                        </Button>
                      </Box>
                    </Box>
                  </Card>
                ))}
                
                <Button
                  variant="outlined"
                  onClick={handleAddDrive}
                  sx={{ mt: 2 }}
                >
                  Add Drive Time
                </Button>
              </Card>

              <Box sx={{ textAlign: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleSubmit}
                  sx={{
                    background: 'linear-gradient(135deg, #00274C 0%, #1a4a7a 100%)',
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #001a33 0%, #0d2b4a 100%)'
                    }
                  }}
                >
                  Submit Driver Registration
                </Button>
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>
    </LocalizationProvider>
  );
};

export default Drivers; 