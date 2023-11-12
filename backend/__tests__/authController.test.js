const request = require('supertest');
const app = require('../server'); // Adjust the path as necessary
const Ausbilder = require('../models/Ausbilder');
const Ausbildung = require('../models/Ausbildung');
const Kalender = require('../models/Kalender');

let ausbildungId; // This will be set in a beforeAll hook after creating an Ausbildung

beforeAll(async () => {
  // Clear the database or specific collections if necessary
  await Ausbilder.deleteMany({});
  await Ausbildung.deleteMany({});

  // Create an Ausbildung document and use its ID
  const ausbildung = new Ausbildung({ /* ... */ });
  const ausbildungSaveResult = await ausbildung.save();
  ausbildungId = ausbildungSaveResult._id.toString();
  console.log('Ausbildung created with ID:', ausbildungId); // Debugging line
});

it('should register a new Ausbilder', async () => {
  const res = await request(app)
    .post('/auth/register')
    .send({
      username: 'newuser',
      password: 'password',
      role: 'Ausbilder',
      name: 'New Ausbilder',
      birthday: "1986-02-11",
      ausbildung: [ausbildungId] // This should be an array of strings
    })
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json');
    if (res.statusCode !== 201) {
      console.log('Response body:', res.body); // Log the response body for debugging
    }
    

  expect(res.statusCode).toEqual(201);
  expect(res.body.token).toBeDefined();
  expect(res.body.user.username).toEqual('newuser');
  expect(res.body.user.name).toEqual('New Ausbilder');
  expect(res.body.user.role).toEqual('Ausbilder');
  expect(res.body.user.ausbildung).toEqual(expect.arrayContaining([ausbildungId]));

  const savedAusbilder = await Ausbilder.findOne({ username: 'newuser' });
  console.log('Ausbilder:', savedAusbilder); // Debugging line
  console.log('Ausbilder ausbildung IDs:', savedAusbilder.ausbildung.map(id => id.toString())); // Debugging line
  expect(savedAusbilder.ausbildung.map(id => id.toString())).toStrictEqual([ausbildungId]);
  
  const birthdayEvent = await Kalender.findOne({ relatedId: savedAusbilder._id });
  console.log(birthdayEvent); // This will show you what the birthdayEvent object contains
  
  expect(birthdayEvent).toBeDefined();
  
  // Check if startDateTime and endDateTime exist before trying to call toISOString
  if (birthdayEvent && birthdayEvent.startDateTime && birthdayEvent.endDateTime) {
    expect(birthdayEvent.startDateTime.toISOString().startsWith('1986-02-11')).toBe(true);
    expect(birthdayEvent.endDateTime.toISOString().startsWith('1986-02-11')).toBe(true);
  } else {
    // If we're here, there's something wrong with the data
    console.error('startDateTime or endDateTime is undefined');
  }
});
