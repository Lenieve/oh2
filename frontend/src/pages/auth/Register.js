import React, { useState, useEffect } from 'react';
import '../../css/authcss2.css';

import axios from 'axios';
import { useNavigate } from 'react-router-dom';


const RegistrationForm = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('Azubi'); // Initialize as 'Azubi'
  const [ausbilders, setAusbilders] = useState([]);
  const [ausbildungen, setAusbildungen] = useState([]);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [ausbildung, setAusbildung] = useState('');
  const [ausbilder, setAusbilder] = useState('');
  const toggleRole = () => {
    setRole(role === 'Azubi' ? 'Ausbilder' : 'Azubi');
  };


  useEffect(() => {
    axios.get('http://localhost:3000/ausbilder')
      .then(response => {
        setAusbilders(response.data);
      })
      .catch(error => {
        console.error('Error fetching ausbilders:', error);
      });

    axios.get('http://localhost:3000/ausbildung')
      .then(response => {
        setAusbildungen(response.data);
      })
      .catch(error => {
        console.error('Error fetching ausbildungen:', error);
      });
  }, []);

  const handleSubmit = async (e) => {
    
    e.preventDefault();
  
    let userData = {
      username,
      password,
      role,
      name,
      birthday,
    };
  
    if (role === 'Ausbilder') {
      userData = { ...userData, ausbildung }; // Already an array, no need for split
      console.log('Registering Ausbilder:', userData);
    } else { // Azubi
      userData = { ...userData, ausbildung: ausbildung, ausbilder };
      console.log('Registering Azubi:', userData);
    }

    try {
        const response = await axios.post('http://localhost:3000/auth/register', userData);
        console.log('User registered:', response.data);
        // Redirect to login page after successful registration
        navigate('/login');
      } catch (error) {
      console.error('Error registering user:', error);
      // Handle errors (e.g., show error message)
    }
  };

  return (
    <div className="background">
      <div className="registration-form">

        <form onSubmit={handleSubmit}>
          <div className="role-selection">
            <label className="switch">
                <input type="checkbox" className="input-field" checked={role === 'Ausbilder'} onChange={toggleRole} />
                <span className="slider round"></span> {/* The 'round' class here is just for border-radius */}
            </label>

            <span className="role-label">{role === 'Ausbilder' ? 'Ausbilder' : 'Azubi'}</span>
          </div>

          <div className="form-columns">
            <div className="form-column">
              {/* Common fields and fields specific to Azubi on the left */}
              <input type="text" className="input-field" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required />
              <input type="text" className="input-field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required />
              {role === 'Azubi' && (
                <select className="select-field" value={ausbilder} onChange={(e) => setAusbilder(e.target.value)} name="ausbilder">
                  {ausbilders.map(item => (
                    <option key={item._id} value={item._id}>{item.name}</option>
                  ))}
                </select>
              )}
              {role === 'Ausbilder' && (
                <input type="date"className="input-field" value={birthday} onChange={(e) => setBirthday(e.target.value)} placeholder="Birthday" required />
              )}
            </div>
            <div className="form-column">
              {/* Common fields and fields specific to Ausbilder on the right */}
              <input type="password" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
              {role === 'Ausbilder' && (
                <select multiple className="select-field" value={ausbildung} onChange={(e) => setAusbildung(Array.from(e.target.selectedOptions, option => option.value))} name="ausbildung">
                  {ausbildungen.map(ausbildung => (
                    <option key={ausbildung._id} value={ausbildung._id}>{ausbildung.name}</option>
                  ))}
                </select>
              )}
              {role === 'Azubi' && (
                <>
                  <input type="date" className="input-field" value={birthday} onChange={(e) => setBirthday(e.target.value)} placeholder="Birthday" required />
                  <select className="select-field" value={ausbildung} onChange={(e) => setAusbildung(e.target.value)} name="ausbildung">
                    {ausbildungen.map(item => (
                      <option key={item._id} value={item._id}>{item.name}</option>
                    ))}
                  </select>
                </>
              )}
            </div>
          </div>
          <button type="submit" className="register-button">Register</button>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;