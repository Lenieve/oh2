import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // Corrected import statement
import axios from 'axios';
import './Dashboard.css'; // Adjust the path to where your CSS file is located


const Dashboard = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const decodedToken = jwtDecode(token); // Correct variable name
        
        // Now use decodedToken instead of decoded
        const { userId, role } = decodedToken.data; // Assuming the JWT structure

        // Based on the role, fetch the user data
        const response = await axios.get(`http://localhost:3000/${role.toLowerCase()}/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(response.data); // Set the user data in state
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Handle error (e.g., redirect to login)
      }
    };

    fetchUserData();
  }, []);

  // If user data has not been loaded yet, show a loading indicator or return null
  if (!user) {
    return <div>Loading...</div>;
  }

  // Greeting.js
const Greeting = ({ name }) => {
  return (
    <div>
      <h1 className="greeting">Hello, <span className="greeting-name">{name}</span></h1>
    </div>
  );
};
// UpNext.js
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
        {countdown.days} days, {countdown.hours} hours, {countdown.minutes} minutes, {countdown.seconds} seconds
      </p>
    </div>
  );
};
// Calendar.js
const Calendar = () => {
  return (
    <div className="calendar">
      <h2 className="calendar-title">Calendar</h2>
      {/* Placeholder for calendar */}
      <p>[Calendar will be displayed here]</p>
    </div>
  );
};

// Profile.js
const Profile = ({ user }) => {
  const [data, setData] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        let response;
        if (user.role === 'Ausbilder') {
          response = await axios.get(`http://localhost:3000/ausbilder/${user.id}/ausbildungs`, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } else {
          response = await axios.get(`http://localhost:3000/azubi/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Handle error
      }
    };

    if (user && user.id) {
      fetchData();
    }
  }, [user, token]);

  if (!user) {
    return <div>Loading user data...</div>;
  }


  return (
<div className="profile">
      {/* Now it's safe to access user.name and user.role */}
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
          {data.map(item => (
            <li key={item._id}>{item.name || item.beschreibung}</li> // Adjust according to your data structure
          ))}
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
