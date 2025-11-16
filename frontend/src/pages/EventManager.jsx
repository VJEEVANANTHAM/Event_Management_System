import React, { useEffect } from 'react';
import { useStore } from '../store/useStore';
import ProfileDropdown from '../components/ProfileDropdown';
import EventForm from '../components/EventForm';
import EventList from '../components/EventList';

export default function EventManager() {
  const { fetchProfiles } = useStore(state => ({ 
    fetchProfiles: state.fetchProfiles 
  }));
  
  useEffect(() => { 
    fetchProfiles(); 
  }, [fetchProfiles]);

  return (
    <div className="app-container">
      <div className="app-header">
        <div className="app-header-left">
          <h1>Event Management</h1>
          <p className="subtitle">Create and manage events across multiple timezones</p>
        </div>
        <div className="app-header-right">
          <ProfileDropdown />
        </div>
      </div>
      
      <div className="board">
        <div className="left-column card">
          <EventForm />
        </div>
        <div className="right-column card">
          <EventList />
        </div>
      </div>
    </div>
  );
}