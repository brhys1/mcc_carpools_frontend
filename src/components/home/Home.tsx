"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Paper,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Divider,
  Modal,
  TextField,
  Autocomplete
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PersonIcon from '@mui/icons-material/Person';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ScheduleIcon from '@mui/icons-material/Schedule';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import GroupIcon from '@mui/icons-material/Group';
import DeleteIcon from '@mui/icons-material/Delete';

const defaultDivisions = {
  kerrytown: false,
  central: false,
  hill: false,
  lower_bp: false,
  upper_bp: false,
  pierpont: false,
};

const Home: React.FC = () => {
  const router = useRouter();
  const [weekDrives, setWeekDrives] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [signupOpen, setSignupOpen] = useState(false);
  const [signupDrive, setSignupDrive] = useState<any>(null);
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);
  const [sheetsNames, setSheetsNames] = useState<{ name: string; email: string }[]>([]);
  const [selectedName, setSelectedName] = useState<string>('');
  const [selectedEmail, setSelectedEmail] = useState<string>('');
  const [removeRiderOpen, setRemoveRiderOpen] = useState(false);
  const [removeRiderDrive, setRemoveRiderDrive] = useState<any>(null);
  const [removeRiderEmail, setRemoveRiderEmail] = useState('');
  const [removeRiderLoading, setRemoveRiderLoading] = useState(false);
  const [removeRiderName, setRemoveRiderName] = useState('');

  useEffect(() => {
    const fetchWeekDrives = async () => {
      try {
        console.log('Fetching /api/current-week-drives...');
        const response = await axios.get('/api/current-week-drives');
        console.log('Received response:', response);
        setWeekDrives(response.data);
      } catch (error: any) {
        console.error('Error fetching week drives:', error);
        if (error.response) {
          console.error('Error response data:', error.response.data);
          console.error('Error response status:', error.response.status);
        }
        if (error.message) {
          console.error('Error message:', error.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWeekDrives();
  }, []);

  // Fetch Sheets names when modal opens
  useEffect(() => {
    if (signupOpen) {
      axios.get('/api/sheets').then(res => {
        // Transform the data to { name, email }
        const names = res.data.data.map((item: any) => ({
          name: `${item["First Name"]} ${item["Last Name"]}`,
          email: item.Uniqname ? `${item.Uniqname}@umich.edu` : ''
        }));
        setSheetsNames(names);
      });
    }
  }, [signupOpen]);

  const handleRiderClick = () => {
    router.push('/riders');
  };

  const handleDriverClick = () => {
    router.push('/drivers');
  };

  const handleDeleteDrive = async (driveId: string) => {
    const phone = prompt('To delete this drive, please enter your phone number:');
    if (!phone) return;
    try {
      await axios.delete('/api/drives/by-phone', {
        data: { phone: phone, drive_id: driveId },
      });
      alert('Drive deleted successfully!');
      // Refresh the drives list
      setLoading(true);
      const response = await axios.get('/api/current-week-drives');
      setWeekDrives(response.data);
    } catch (error: any) {
      alert(error?.response?.data?.error || 'Failed to delete drive.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSignup = (drive: any) => {
    setSignupDrive(drive);
    setSignupOpen(true);
  };

  const handleCloseSignup = () => {
    setSignupOpen(false);
    setSignupDrive(null);
    setSignupName('');
    setSignupEmail('');
  };

  const handleNameChange = (_: any, value: string | { name: string; email: string } | null) => {
    if (typeof value === 'string') {
      setSelectedName(value);
      setSignupName(value);
      setSignupEmail('');
    } else if (value && typeof value === 'object') {
      setSelectedName(value.name);
      setSignupName(value.name);
      setSignupEmail(value.email);
    } else {
      setSelectedName('');
      setSignupName('');
      setSignupEmail('');
    }
  };

  const handleEmailChange = (_: any, value: string | { name: string; email: string } | null) => {
    if (typeof value === 'string') {
      setSelectedEmail(value);
      setSignupEmail(value);
      setSignupName('');
    } else if (value && typeof value === 'object') {
      setSelectedEmail(value.email);
      setSignupEmail(value.email);
      setSignupName(value.name);
    } else {
      setSelectedEmail('');
      setSignupEmail('');
      setSignupName('');
    }
  };

  const isNameValid = sheetsNames.some(n => n.name === signupName && n.email === signupEmail);
  const isEmailValid = sheetsNames.some(n => n.email === signupEmail && n.name === signupName);

  const handleSignupSubmit = async () => {
    if (!signupName || !signupEmail) {
      alert('Name and email are required.');
      return;
    }
    setSignupLoading(true);
    try {
      await axios.post(`/api/drives/${signupDrive.id}/signup`, {
        name: signupName,
        email: signupEmail,
      });
      alert('Signed up for drive!');
      setSignupOpen(false);
      setSignupDrive(null);
      setSignupName('');
      setSignupEmail('');
      setLoading(true);
      const response = await axios.get('/api/current-week-drives');
      setWeekDrives(response.data);
    } catch (error: any) {
      alert(error?.response?.data?.error || 'Failed to sign up.');
    } finally {
      setSignupLoading(false);
      setLoading(false);
    }
  };

  const handleRemoveRider = (driveId: string, riderEmail: string, riderName: string) => {
    setRemoveRiderDrive({ id: driveId });
    setRemoveRiderEmail(''); // Don't pre-fill email
    setRemoveRiderName(riderName);
    setRemoveRiderOpen(true);
  };

  const handleCloseRemoveRider = () => {
    setRemoveRiderOpen(false);
    setRemoveRiderDrive(null);
    setRemoveRiderEmail('');
    setRemoveRiderName('');
  };

  const handleRemoveRiderSubmit = async () => {
    if (!removeRiderEmail) {
      alert('Email is required.');
      return;
    }
    setRemoveRiderLoading(true);
    try {
      await axios.post(`/api/drives/${removeRiderDrive.id}/remove-rider`, {
        email: removeRiderEmail,
      });
      alert('Removed from drive successfully!');
      setRemoveRiderOpen(false);
      setRemoveRiderDrive(null);
      setRemoveRiderEmail('');
      setLoading(true);
      const response = await axios.get('/api/current-week-drives');
      setWeekDrives(response.data);
    } catch (error: any) {
      alert(error?.response?.data?.error || 'Failed to remove from drive.');
    } finally {
      setRemoveRiderLoading(false);
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'success';
      case 'partially_filled':
        return 'warning';
      case 'filled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'partially_filled':
        return 'Partially Filled';
      case 'filled':
        return 'Full';
      default:
        return 'Unknown';
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={24}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <Box
            sx={{
              background: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
              color: 'white',
              py: 6,
              px: 4,
              textAlign: 'center'
            }}
          >
            <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
              MCC Carpools
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Connect with fellow climbers for rides to the gym
            </Typography>
          </Box>

          <CardContent sx={{ p: 6 }}>
            <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', mb: 4, color: '#333' }}>
              Are you a rider or driver?
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 4, justifyContent: 'center' }}>
              <Box sx={{ flex: { xs: '1', sm: '0 1 auto' }, width: { xs: '100%', sm: '45%', md: '40%' } }}>
                <Card
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 8
                    },
                    background: 'linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%)',
                    border: '2px solid #00274C'
                  }}
                  onClick={handleRiderClick}
                >
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <PersonIcon sx={{ fontSize: 60, color: '#00274C', mb: 2 }} />
                    <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#00274C', fontWeight: 'bold' }}>
                      I'm a Rider
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#495057' }}>
                      Need a ride to the gym? Find drivers in your area.
                    </Typography>
                  </CardContent>
                </Card>
              </Box>

              <Box sx={{ flex: { xs: '1', sm: '0 1 auto' }, width: { xs: '100%', sm: '45%', md: '40%' } }}>
                <Card
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 8
                    },
                    background: 'linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%)',
                    border: '2px solid #FFCB05'
                  }}
                  onClick={handleDriverClick}
                >
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <DirectionsCarIcon sx={{ fontSize: 60, color: '#FFCB05', mb: 2 }} />
                    <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#FFCB05', fontWeight: 'bold' }}>
                      I'm a Driver
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#495057' }}>
                      Have space in your car? Help fellow climbers get to the gym.
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </CardContent>
        </Paper>

        {/* Current Week's Drives Section */}
        {!loading && weekDrives && (
          <Paper
            elevation={24}
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              mt: 4
            }}
          >
            <Box
              sx={{
                background: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
                color: 'white',
                py: 3,
                px: 4,
                textAlign: 'center'
              }}
            >
              <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                🚗 Carpools to Planet Rock until {weekDrives.period_end}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                {weekDrives.total_drives} total drives scheduled
              </Typography>
            </Box>

            <Box sx={{ p: 4 }}>
              {weekDrives.total_drives === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No drives scheduled until next Sunday yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Be the first to offer a ride!
                  </Typography>
                </Box>
              ) : (
                Object.entries(weekDrives.drives_by_day)
                  .sort((a, b) => {
                    // Extract MM/DD/YY from 'Monday, 12/16/24'
                    const getDate = (dayStr: string) => {
                      const parts = dayStr.split(', ');
                      return parts.length > 1 ? parts[1] : dayStr;
                    };
                    const parse = (d: string) => {
                      const [month, day, year] = d.split('/').map(Number);
                      return new Date(2000 + year, month - 1, day); // 2-digit year fix
                    };
                    return parse(getDate(a[0])).getTime() - parse(getDate(b[0])).getTime();
                  })
                  .map(([day, drives]: [string, any]) => (
                  <Accordion key={day} sx={{ mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#00274C' }}>
                          {day}
                        </Typography>
                        <Chip 
                          label={`${drives.length} drive${drives.length !== 1 ? 's' : ''}`}
                          size="small"
                          color="primary"
                        />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <List>
                        {drives.map((drive: any, index: number) => (
                          <React.Fragment key={drive.id}>
                            <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 1 }}>
                                <Typography variant="h6" sx={{ color: '#00274C', fontWeight: 'bold' }}>
                                  {drive.driver_name}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Chip 
                                    label={getStatusText(drive.status)}
                                    color={getStatusColor(drive.status) as any}
                                    size="small"
                                  />
                                  <Button
                                    variant="outlined"
                                    color="error"
                                    size="small"
                                    onClick={() => handleDeleteDrive(drive.id)}
                                    sx={{ ml: 1 }}
                                  >
                                    <DeleteIcon />  
                                  </Button>
                                </Box>
                              </Box>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <ScheduleIcon sx={{ fontSize: 16, color: '#666' }} />
                                <Typography variant="body2" color="text.secondary">
                                  {drive.start_time} - {drive.end_time}
                                </Typography>
                              </Box>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <LocationOnIcon sx={{ fontSize: 16, color: '#666' }} />
                                <Typography variant="body2" color="text.secondary">
                                  {drive.pickup_address}
                                </Typography>
                              </Box>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <GroupIcon sx={{ fontSize: 16, color: '#666' }} />
                                <Typography variant="body2" color="text.secondary">
                                  {drive.remaining_capacity}/{drive.total_capacity} spots available
                                </Typography>
                              </Box>
                              
                              {drive.paired_riders.length > 0 && (
                                <Box sx={{ mt: 1 }}>
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                    Riders:
                                  </Typography>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {drive.paired_riders.map((rider: any, riderIndex: number) => (
                                      <Box key={riderIndex} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Chip
                                          label={rider.name}
                                          size="small"
                                          variant="outlined"
                                          sx={{ fontSize: '0.75rem' }}
                                        />
                                        <Button
                                          variant="outlined"
                                          color="error"
                                          size="small"
                                          onClick={() => handleRemoveRider(drive.id, rider.email, rider.name)}
                                          sx={{ ml: 1, fontSize: '0.7rem' }}
                                        >
                                          Remove Me
                                        </Button>
                                      </Box>
                                    ))}
                                  </Box>
                                </Box>
                              )}
                              {drive.remaining_capacity > 0 && (
                                <Button
                                  variant="contained"
                                  color="primary"
                                  size="small"
                                  sx={{ mt: 2, alignSelf: 'flex-end' }}
                                  onClick={() => handleOpenSignup(drive)}
                                >
                                  Sign Up for This Drive
                                </Button>
                              )}
                            </ListItem>
                            {index < drives.length - 1 && <Divider />}
                          </React.Fragment>
                        ))}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                ))
              )}
            </Box>
          </Paper>
        )}
      </Container>
      <Modal open={signupOpen} onClose={handleCloseSignup}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: 2, minWidth: 320 }}>
          <Typography variant="h6" gutterBottom>Sign Up for This Drive</Typography>
          <Autocomplete
            options={sheetsNames}
            getOptionLabel={option => typeof option === 'string' ? option : option.email}
            value={sheetsNames.find(n => n.email === signupEmail) || null}
            onChange={handleEmailChange}
            renderInput={params => (
              <TextField {...params} label="Email" fullWidth margin="normal" required />
            )}
            isOptionEqualToValue={(option, value) => option.email === value.email}
          />
          <TextField
            label="Name"
            value={signupName}
            fullWidth
            margin="normal"
            required
            InputProps={{ readOnly: true }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSignupSubmit}
            fullWidth
            sx={{ mt: 2 }}
            disabled={signupLoading || !isEmailValid}
          >
            {signupLoading ? 'Signing Up...' : 'Sign Up'}
          </Button>
          <Button onClick={handleCloseSignup} fullWidth sx={{ mt: 1 }}>Cancel</Button>
        </Box>
      </Modal>

      {/* Remove Rider Modal */}
      <Modal open={removeRiderOpen} onClose={handleCloseRemoveRider}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: 2, minWidth: 320 }}>
          <Typography variant="h6" gutterBottom>Remove {removeRiderName} from This Drive</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please confirm your email to remove yourself from this drive.
          </Typography>
          <TextField
            label="Email"
            value={removeRiderEmail}
            onChange={(e) => setRemoveRiderEmail(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <Button
            variant="contained"
            color="error"
            onClick={handleRemoveRiderSubmit}
            fullWidth
            sx={{ mt: 2 }}
            disabled={removeRiderLoading || !removeRiderEmail}
          >
            {removeRiderLoading ? 'Removing...' : 'Remove Me'}
          </Button>
          <Button onClick={handleCloseRemoveRider} fullWidth sx={{ mt: 1 }}>Cancel</Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default Home; 