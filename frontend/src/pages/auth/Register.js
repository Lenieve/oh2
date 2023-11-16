import React, { useState, useEffect } from 'react';
import '../../css/authcss.css';
import axios from 'axios';

const RegistrationForm = () => {
  const [role, setRole] = useState('azubi'); // 'azubi' or 'dual'
  const [ausbilders, setAusbilders] = useState([]);
  const [ausbildungen, setAusbildungen] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3000/ausbilder')
      .then(response => {
        console.log('Ausbilders fetched:', response.data); // Logs when the data is fetched
        setAusbilders(response.data);
      })
      .catch(error => {
        console.error('Error fetching ausbilders:', error);
      });
  
      axios.get('http://localhost:3000/ausbildung')
      .then(response => {
        console.log('Ausbildungen fetched:', response.data); // Logs when the data is fetched
        setAusbildungen(response.data);
      })
      .catch(error => {
        console.error('Error fetching ausbildungen:', error);
      });
  }, []);
  
  
  
  

  return (
    <form>
      <label>
        Role:
        <select value={role} onChange={e => setRole(e.target.value)}>
          <option value="azubi">Azubi</option>
          <option value="dual">Ausbilder</option>
        </select>
      </label>

      <input type="text" name="name" placeholder="Name" required />
      <input type="date" name="birthday" placeholder="Birthday" required />

      {role === 'dual' && (
        <>
          <input type="text" name="username" placeholder="Username" required />
          <input type="password" name="password" placeholder="Password" required />
          <select name="ausbildung">
            {ausbildungen.map(ausbildung => (
              <option key={ausbildung.id} value={ausbildung.name}>
                {ausbildung.name}
              </option>
            ))}
          </select>
        </>
      )}

      {role === 'azubi' && (
        <>
          <select name="ausbildung">
            {ausbildungen.map(ausbildung => (
              <option key={ausbildung.id} value={ausbildung.name}>
                {ausbildung.name}
              </option>
            ))}
          </select>
          <select name="ausbilder">
            {ausbilders.map(ausbilder => (
              <option key={ausbilder.id} value={ausbilder.name}>
                {ausbilder.name}
              </option>
            ))}
          </select>
          <input type="text" name="username" placeholder="Username" required />
          <input type="password" name="password" placeholder="Password" required />
        </>
      )}

      <button type="submit">Register</button>
    </form>
  );
};

export default RegistrationForm;
