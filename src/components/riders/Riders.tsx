"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  Autocomplete, 
  Checkbox, 
  FormControlLabel, 
  FormGroup, 
  Button, 
  Paper, 
  Card, 
  CardContent, 
  Alert, 
  Link,
  Divider,
  Chip,
  IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Grid from '@mui/material/Grid';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs, { Dayjs } from 'dayjs';
import { 
  NameData, 
  TimeSlot, 
  Availability, 
  Divisions, 
  FormattedTimeSlot, 
  FormattedAvailability, 
  RiderData, 
  SheetsResponse, 
  ApiResponse 
} from '../../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;


const Riders: React.FC = () => {
  const router = useRouter();
  const [data, setData] = useState<NameData[]>([]);
  const [selectedName, setSelectedName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [availability, setAvailability] = useState<Availability>(() => {
    const today = dayjs();
    const startOfNextWeek = today.day() === 0 ? today.add(1, 'day') : today.add(8 - today.day(), 'day');
    const daysOfWeek = Array.from({ length: 7 }, (_, i) => startOfNextWeek.add(i, 'day').format('dddd, MM/DD/YY'));
    
    return daysOfWeek.reduce((acc: Availability, day: string) => {
      acc[day.toLowerCase()] = [];
      return acc;
    }, {});
  });
  const [divisions, setDivisions] = useState<Divisions>({
    kerrytown: false,
    central: false,
    hill: false,
    lower_bp: false,
    upper_bp: false,
    pierpont: false,
  });

  useEffect(() => {
    console.log('API_BASE_URL:', API_BASE_URL);
    axios.get<SheetsResponse>(`${API_BASE_URL}/api/sheets`, {
      headers: {
        'x-api-key': API_KEY,
      },
    })
      .then((response) => {        
        const dataArray = response.data.data;
        console.log('Raw data from API:', dataArray);
        const names: NameData[] = dataArray.map((item: any) => {
          const name = `${item["First Name"]} ${item["Last Name"]}`;
          const email = item.Uniqname ? `${item.Uniqname}@umich.edu` : '';
          console.log('Processing item:', item, 'Name:', name, 'Email:', email);
          return { name, email };
        });
        console.log('Processed names:', names);
        setData(names);
      })
      .catch((error: any) => {
        console.error('Error fetching data:', error);
        console.error('Error response:', error.response?.data);
        console.error('API URL attempted:', `${API_BASE_URL}/api/sheets`);
      });
  }, []);
  

  const handleDivisionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDivisions({ ...divisions, [event.target.name]: event.target.checked });
  };

  const handleSubmit = () => {
    if (!selectedName) {
      alert('Name is required.');
      return;
    }

    if (!email) {
      alert('Email is required.');
      return;
    }    
    
    const formattedAvailability: FormattedAvailability = {};
  
    Object.keys(availability).forEach((day: string) => {
      formattedAvailability[day] = availability[day].map((slot: TimeSlot) => ({
        start: slot.start ? slot.start.format('HH:mm A') : null,
        end: slot.end ? slot.end.format('HH:mm A') : null,
        driver: null
      }));
    });
  
    const riderData: RiderData = { name: selectedName, email, availability: formattedAvailability, divisions };

    console.log('Submitting Rider Data:', JSON.stringify(riderData, null, 2));

    axios.post<ApiResponse>(`${API_BASE_URL}/api/riders`, riderData, {
      headers: {
        'x-api-key': API_KEY,
      },
    })
      .then((response) => {
        console.log(response.data);
        alert('Rider saved successfully!');
      })
      .catch((error: any) => {
        console.error('Error saving rider:', error);
        alert('Failed to save rider.');
      });
  };

  const handleTimeChange = (day: string, index: number, type: 'start' | 'end', value: Dayjs | null) => {
    const updatedAvailability = { ...availability };
    updatedAvailability[day][index][type] = value;
    setAvailability(updatedAvailability);
  };

  const addTimeSlot = (day: string) => {
    setAvailability((prev: Availability) => ({
      ...prev,
      [day]: [...prev[day], { start: null, end: null }],
    }));
  };

  const deleteTimeSlot = (day: string, index: number) => {
    setAvailability((prev: Availability) => ({
      ...prev,
      [day]: prev[day].filter((_: TimeSlot, i: number) => i !== index),
    }));
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
                🧗‍♀️ Rider Registration
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Find your perfect ride to the gym
              </Typography>
            </Box>

            <Box sx={{ p: 4 }}>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body1" gutterBottom>
                  <strong>Welcome to MCC Carpools!</strong> You can submit your availability for next week anytime throughout the week. 
                  You must be an MCC member to participate.
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  If you've paid dues but don't see your name, please{' '}
                  <Link href="https://docs.google.com/forms/d/e/1FAIpQLSd-BmXMTGXi0ZoZXD_sVy5qMzrHDNYPqMfcn67_kS9FBZe1mg/viewform" target="_blank" color="inherit">
                    fill out this form to join MCC
                  </Link>.
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  You'll receive an email when paired with a driver, including pickup location details.
                </Typography>
              </Alert>
              <Card sx={{ mb: 4, p: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ color: '#333', mb: 3 }}>
                  👤 Personal Information
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                  <Box sx={{ flex: 1 }}>
                    <Autocomplete
                      options={data.map((item: NameData) => item.email)}
                      value={email}
                      onChange={(event: any, newValue: string | null) => {
                        console.log('Autocomplete onChange - newValue:', newValue);
                        console.log('Available data:', data);
                        const selected = data.find((item: NameData) => item.email === newValue);
                        console.log('Selected item:', selected);
                        setSelectedName(selected ? selected.name : '');
                        setEmail(newValue || '');
                      }}
                      renderInput={(params: any) => (
                        <TextField {...params} label="Select your email" variant="outlined" fullWidth />
                      )}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      label="Name"
                      variant="outlined"
                      value={selectedName}
                      InputProps={{ readOnly: true }}
                      fullWidth
                    />
                  </Box>
                </Box>
              </Card>
              <Card sx={{ mb: 4, p: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ color: '#333', mb: 3 }}>
                  ⏰ Availability Schedule
                </Typography>
                <Typography variant="body2" sx={{ mb: 3, color: '#666' }}>
                  Select your available times for next week. Add multiple time slots per day if needed.
                </Typography>
                
                {Object.keys(availability).map((day: string) => (
                  <Card key={day} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0' }}>
                    <Typography variant="h6" gutterBottom sx={{ color: '#333', fontWeight: 'bold' }}>
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </Typography>
                    {availability[day].map((slot: TimeSlot, index: number) => (
                      <Box key={index} sx={{ mb: 2, p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: 'center' }}>
                          <Box sx={{ flex: 1 }}>
                            <TimePicker
                              label="Start Time"
                              value={slot.start}
                              onChange={(newValue: Dayjs | null) => handleTimeChange(day, index, 'start', newValue)}
                              slotProps={{ textField: { variant: 'outlined', fullWidth: true } }}
                            />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <TimePicker
                              label="End Time"
                              value={slot.end}
                              onChange={(newValue: Dayjs | null) => handleTimeChange(day, index, 'end', newValue)}
                              slotProps={{ textField: { variant: 'outlined', fullWidth: true } }}
                            />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Button
                              variant="outlined"
                              color="error"
                              onClick={() => deleteTimeSlot(day, index)}
                              fullWidth
                            >
                              Delete
                            </Button>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                    <Button
                      variant="outlined"
                      onClick={() => addTimeSlot(day)}
                      sx={{ mt: 1 }}
                    >
                      + Add Time Slot
                    </Button>
                  </Card>
                ))}
              </Card>
              <Card sx={{ mb: 4, p: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ color: '#333', mb: 3 }}>
                  🗺️ Pickup Locations
                </Typography>
                <Typography variant="body2" sx={{ mb: 3, color: '#666' }}>
                  Select the areas you're willing to get picked up from. The more areas you select, the more likely you are to be paired with a driver.
                </Typography>
                
                <Box sx={{ mb: 3, textAlign: 'center' }}>
                  <img 
                    src="/divisions.png" 
                    alt="Central Campus Divisions" 
                    style={{ 
                      width: '100%', 
                      maxWidth: '600px', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                    }} 
                  />
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ minWidth: { xs: '100%', sm: '200px', md: '150px' } }}>
                    <FormControlLabel
                      control={<Checkbox checked={divisions.kerrytown} onChange={handleDivisionChange} name="kerrytown" />}
                      label={<Typography variant="body1">Kerrytown</Typography>}
                    />
                  </Box>
                  <Box sx={{ minWidth: { xs: '100%', sm: '200px', md: '150px' } }}>
                    <FormControlLabel
                      control={<Checkbox checked={divisions.central} onChange={handleDivisionChange} name="central" />}
                      label={<Typography variant="body1">Central Campus</Typography>}
                    />
                  </Box>
                  <Box sx={{ minWidth: { xs: '100%', sm: '200px', md: '150px' } }}>
                    <FormControlLabel
                      control={<Checkbox checked={divisions.hill} onChange={handleDivisionChange} name="hill" />}
                      label={<Typography variant="body1">The Hill</Typography>}
                    />
                  </Box>
                  <Box sx={{ minWidth: { xs: '100%', sm: '200px', md: '150px' } }}>
                    <FormControlLabel
                      control={<Checkbox checked={divisions.lower_bp} onChange={handleDivisionChange} name="lower_bp" />}
                      label={<Typography variant="body1">Lower Burns Park</Typography>}
                    />
                  </Box>
                  <Box sx={{ minWidth: { xs: '100%', sm: '200px', md: '150px' } }}>
                    <FormControlLabel
                      control={<Checkbox checked={divisions.upper_bp} onChange={handleDivisionChange} name="upper_bp" />}
                      label={<Typography variant="body1">Upper Burns Park</Typography>}
                    />
                  </Box>
                  <Box sx={{ minWidth: { xs: '100%', sm: '200px', md: '150px' } }}>
                    <FormControlLabel
                      control={<Checkbox checked={divisions.pierpont} onChange={handleDivisionChange} name="pierpont" />}
                      label={<Typography variant="body1">Pierpont</Typography>}
                    />
                  </Box>
                </Box>
              </Card>

              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleSubmit}
                  sx={{
                    background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
                    color: 'white',
                    px: 6,
                    py: 2,
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #ff8a8e 0%, #febfef 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: 4
                    }
                  }}
                >
                  🚀 Submit Registration
                </Button>
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>
    </LocalizationProvider>
  );
};

export default Riders; 