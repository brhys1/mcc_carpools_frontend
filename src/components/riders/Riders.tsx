import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
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

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

const Riders: React.FC = () => {
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
    axios.get<SheetsResponse>(`${API_BASE_URL}/api/sheets`)
      .then((response) => {
        const names: NameData[] = response.data.data.data.map((item: any) => {
          const name = `${item["First Name"]} ${item["Last Name"]}`;
          const email = item.Uniqname ? `${item.Uniqname}@umich.edu` : '';
          return { name, email };
        });
        setData(names);
      })
      .catch((error: any) => console.error('Error:', error));
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

    axios.post<ApiResponse>(`${API_BASE_URL}/api/riders`, riderData)
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
      <div>
        <h1>MCC Carpools - Riders</h1>
        <p>Welcome riders to the new MCC Carpools Website! We hope you enjoy the new website<br></br>
        Anytime throughout the week you can put in your availability for next week but you must be a member the MCC. If you have paid dues but still don't see your name, fill out this form:<br></br>
        <p><a href='https://docs.google.com/forms/d/e/1FAIpQLSd-BmXMTGXi0ZoZXD_sVy5qMzrHDNYPqMfcn67_kS9FBZe1mg/viewform'>Join MCC</a></p>
        You will recieve an email when you have been paired with a car. This email will also provide you with the address to be picked up at. <br></br>
        You can select pick up in different regions of Ann Arbor. The goal is to get more drivers and in turn, more carpools!<br></br>
        Happy Climbing!
        </p>
        <Autocomplete
          options={data.map((item: NameData) => item.name)}
          value={selectedName}
          onChange={(event: any, newValue: string | null) => {
            const selected = data.find((item: NameData) => item.name === newValue);
            setSelectedName(newValue || '');
            setEmail(selected ? selected.email : '');
          }}
          renderInput={(params: any) => (
            <TextField {...params} label="Select a name" variant="outlined" />
          )}
        />
        <TextField
          label="Email"
          variant="outlined"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          style={{ marginTop: '10px', marginBottom: '20px', display: 'block' }}
        />
        {Object.keys(availability).map((day: string) => (
          <div key={day} style={{ marginBottom: '10px' }}>
            <h3>{day.charAt(0).toUpperCase() + day.slice(1)}</h3>
            {availability[day].map((slot: TimeSlot, index: number) => (
              <div key={index} style={{ marginBottom: '10px' }}>
                <TimePicker
                  label="Start Time"
                  value={slot.start}
                  onChange={(newValue: Dayjs | null) => handleTimeChange(day, index, 'start', newValue)}
                  slotProps={{ textField: { variant: 'outlined' } }}
                />
                <TimePicker
                  label="End Time"
                  value={slot.end}
                  onChange={(newValue: Dayjs | null) => handleTimeChange(day, index, 'end', newValue)}
                  slotProps={{ textField: { variant: 'outlined' } }}
                />
                <button onClick={() => deleteTimeSlot(day, index)}>Delete</button>
              </div>
            ))}
            <button onClick={() => addTimeSlot(day)}>Add Time Slot</button>
          </div>
        ))}
        <div>
          <h3>Select the areas you are willing to get picked up from</h3>
          <p>Note: the more areas you select the more likely you are to be paired because you will be paired with drivers who are leaving from an area you are willing to be picked up</p>
        </div>
        <img 
          src="/pics/divisions.png" 
          alt="Central Campus Divisions" 
          style={{ width: '100%', maxWidth: '600px', marginBottom: '10px' }} 
        />

        <FormGroup>
          <h3>Select Divisions:</h3>
          <FormControlLabel
            control={<Checkbox checked={divisions.kerrytown} onChange={handleDivisionChange} name="kerrytown" />}
            label="Kerrytown"
          />
          <FormControlLabel
            control={<Checkbox checked={divisions.central} onChange={handleDivisionChange} name="central" />}
            label="Central Campus"
          />
          <FormControlLabel
            control={<Checkbox checked={divisions.hill} onChange={handleDivisionChange} name="hill" />}
            label="The Hill"
          />
          <FormControlLabel
            control={<Checkbox checked={divisions.lower_bp} onChange={handleDivisionChange} name="lower_bp" />}
            label="Lower Burns Park"
          />
          <FormControlLabel
            control={<Checkbox checked={divisions.upper_bp} onChange={handleDivisionChange} name="upper_bp" />}
            label="Upper Burns Park"
          />
          <FormControlLabel
            control={<Checkbox checked={divisions.pierpont} onChange={handleDivisionChange} name="pierpont" />}
            label="Pierpont"
          />
        </FormGroup>
        <button onClick={handleSubmit} style={{ marginTop: '10px' }}>Submit</button>
      </div>
    </LocalizationProvider>
  );
};

export default Riders; 