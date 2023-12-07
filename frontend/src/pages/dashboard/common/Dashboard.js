import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // Corrected import statement
import axios from 'axios';
import './Dashboard.css'; // Adjust the path to where your CSS file is located


// Greeting.js component
const Greeting = ({ name }) => (
  <div>
    <h1 className="greeting">Hello, <span className="greeting-name">{name}</span></h1>
  </div>
);

// UpNext.js component
const UpNext = () => {
  const [nextBirthday, setNextBirthday] = useState('');
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    axios.get('http://localhost:3000/next-birthday')
      .then(response => {
        setNextBirthday(response.data.user.name);
        setCountdown(response.data.countdown);
      })
      .catch(error => {
        console.error('Error fetching next birthday:', error);
      });
  }, []);

  return (
    <div className="up-next">
      <h2 className="up-next-title">Up Next</h2>
      <p className="up-next-name">{nextBirthday}</p>
      <p className="up-next-countdown">
        {countdown.days} days, {countdown.hours} hours, {countdown.minutes} minutes
      </p>
    </div>
  );
};

// Calendar.js component
const Calendar = () => (
  <div className="calendar">
    <h2 className="calendar-title">Calendar</h2>
    <p>[Calendar will be displayed here]</p>
  </div>
);

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [ausbildungenDetails, setAusbildungenDetails] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const decodedToken = jwtDecode(token);
        const { userId, role } = decodedToken.data;

        const response = await axios.get(`http://localhost:3000/${role.toLowerCase()}/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(response.data);

        // Fetch Ausbildung details if user is an Ausbilder
        if (role === 'Ausbilder' && response.data.ausbildung.length > 0) {
          const details = await Promise.all(
            response.data.ausbildung.map(ausbildungId =>
              axios.get(`http://localhost:3000/ausbildung/${ausbildungId}`, {
                headers: { Authorization: `Bearer ${token}` },
              }).then(response => response.data)
            )
          );
          setAusbildungenDetails(details);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }

  // Profile.js component
  const Profile = ({ user }) => {
    return (
      <div className="profile">
        <div>
          <h2 className="profile-title">My Profile</h2>
          <div className="profile-picture"></div>
          <h3 className="profile-name">{user.name}</h3>
          <button className="profile-button">Edit Profile</button>
        </div>
        <div><hr className="profile-line" /></div>
        <div>
          <h2 className="overview">{user.role === 'Azubi' ? 'My Wishlist' : 'Ausbildung Overview'}</h2>
          <ul>
            {ausbildungenDetails.length > 0 ? (
              ausbildungenDetails.map(ausbildung => (
                <li key={ausbildung._id}>
                  {ausbildung.name} - Azubis: {ausbildung.azubis.length}
                </li>
              ))
            ) : (
              <li>No training sessions found for this instructor.</li>
            )}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard">
      <Greeting name={user.name} />
      <div className="dashboard-content">
        <div className="left-column">
          <UpNext />
          <Calendar />
        </div>
        <div className="right-column">
          <Profile user={user} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
