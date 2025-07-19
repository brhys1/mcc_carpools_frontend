"use client";

import React, { useState } from 'react';
import axios from 'axios';
import TextField from '@mui/material/TextField';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs, { Dayjs } from 'dayjs';
import { DriveDetail, DriverData, ApiResponse } from '../../types';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

const Drivers: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [capacity, setCapacity] = useState<string>('');
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
    const driverData: DriverData = { 
      name, 
      email,
      address, 
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

    axios.post<ApiResponse>(`${API_BASE_URL}/api/drivers`, driverData)
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
      <div>
        <h1>MCC Carpools - Drivers</h1>
        <p>Welcome drivers to the new MCC Carpools Website!<br></br>
          Our goal with this is to make the carpool system work better for the drivers.<br></br>
          Enter your name, email, and the pick up address. <br></br>
          In this system, the pick up address can be anywhere on central campus (full map is on the rider page). <br></br>
          This means you can just leave from your house :). <br></br>
          North campus is still at pierpont but we would love to hear feedback if this is the best system.<br></br>
          One last thing. Everytime you drive, you get an extra entry into a pool from which we will be giving away an REI gift card each month!
        </p>
        <TextField
          label="Name"
          variant="outlined"
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          style={{ marginBottom: '10px', display: 'block' }}
        />
        <TextField
          label="Email"
          variant="outlined"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          style={{ marginTop: '10px', marginBottom: '10px', display: 'block' }}
        />
        <TextField
          label="Car Capcity"
          variant="outlined"
          value={capacity}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCapacity(e.target.value)}
          style={{ marginTop: '10px', marginBottom: '10px', display: 'block' }}
        />
        <TextField
          label="Pickup Address"
          variant="outlined"
          value={address}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)}
          style={{ marginBottom: '10px', display: 'block' }}
        />
        <p>Note: if picking up on North Campus, just enter 'Pierpont Commons.'</p>
        {driveDetails.map((drive: DriveDetail, index: number) => (
          <div key={index} style={{ marginBottom: '10px' }}>
            <DatePicker
              label="Drive Date"
              value={drive.date}
              onChange={(newValue: Dayjs | null) => handleDriveChange(index, 'date', newValue)}
              slotProps={{ textField: { variant: 'outlined' } }}
              disablePast
              maxDate={dayjs().add(7, 'day')}
            />
            <TimePicker
              label="Start Time"
              value={drive.start}
              onChange={(newValue: Dayjs | null) => handleDriveChange(index, 'start', newValue)}
              slotProps={{ textField: { variant: 'outlined' } }}
            />
            <TimePicker
              label="End Time"
              value={drive.end}
              onChange={(newValue: Dayjs | null) => handleDriveChange(index, 'end', newValue)}
              slotProps={{ textField: { variant: 'outlined' } }}
              minTime={drive.start || undefined}
            />
            <button onClick={() => handleDeleteDrive(index)} style={{ marginLeft: '10px' }}>Delete</button>
          </div>
        ))}
        <button onClick={handleAddDrive} style={{ marginTop: '10px' }}>Add Drive Time</button>
        <div></div>
        <button onClick={handleSubmit} style={{ marginTop: '10px' }}>Submit</button>
      </div>
    </LocalizationProvider>
  );
};

export default Drivers; 