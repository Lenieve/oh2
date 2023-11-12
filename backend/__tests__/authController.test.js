const request = require('supertest');
const app = require('../server'); // Adjust the path as necessary
const Ausbilder = require('../models/Ausbilder');
const Ausbildung = require('../models/Ausbildung');
const Kalender = require('../models/Kalender');
const Azubi = require('../models/Azubi');
const bcrypt = require('bcrypt');


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
  
  expect(res.statusCode).toEqual(201);
  expect(res.body.token).toBeDefined();
  expect(res.body.user.username).toEqual('newuser');
  expect(res.body.user.name).toEqual('New Ausbilder');
  expect(res.body.user.role).toEqual('Ausbilder');
  expect(res.body.user.ausbildung).toEqual(expect.arrayContaining([ausbildungId]));

  const savedAusbilder = await Ausbilder.findOne({ username: 'newuser' });
  expect(savedAusbilder.ausbildung.map(id => id.toString())).toStrictEqual([ausbildungId]);
  
  const birthdayEvent = await Kalender.findOne({ relatedId: savedAusbilder._id });
  expect(birthdayEvent).toBeDefined();
  
});


beforeAll(async () => {
  // Clear relevant collections
  await Ausbilder.deleteMany({});
  await Ausbildung.deleteMany({});
  await Azubi.deleteMany({});

  // Create and save the Ausbildung document
  const ausbildung = new Ausbildung({ /* ... */ });
  const ausbildungSaveResult = await ausbildung.save();
  ausbildungId = ausbildungSaveResult._id.toString();
  console.log('Ausbildung created with ID:', ausbildungId); // Debugging line
});

let ausbilderId; // Variable to store Ausbilder ID

beforeAll(async () => {
  // Clear the database or specific collections if necessary
  await Ausbilder.deleteMany({});
  await Ausbildung.deleteMany({});
  await Azubi.deleteMany({});

  // Create an Ausbildung document and use its ID
  const ausbildung = new Ausbildung({ /* ... */ });
  const ausbildungSaveResult = await ausbildung.save();
  ausbildungId = ausbildungSaveResult._id.toString();
  console.log('Ausbildung created with ID:', ausbildungId); // Debugging line

  // Create an Ausbilder document and use its ID
  const ausbilder = new Ausbilder({ /* ... */ });
  const ausbilderSaveResult = await ausbilder.save();
  ausbilderId = ausbilderSaveResult._id.toString();
  console.log('Ausbilder created with ID:', ausbilderId); // Debugging line
});

it('should register a new Azubi', async () => {
  console.log('Creating Azubi with Ausbildung ID:', ausbildungId, 'and Ausbilder ID:', ausbilderId);

  const res = await request(app)
    .post('/auth/register')
    .send({
      username: 'newazubi',
      password: 'password',
      role: 'Azubi',
      name: 'New Azubi',
      birthday: "2000-05-15",
      ausbildung: ausbildungId,
      ausbilder: ausbilderId  // Include Ausbilder ID in the request
    })
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json');

  if (res.statusCode !== 201) {
    console.log('Response body:', res.body); // Log the response body for debugging
  }

  // Assertions to verify the response
  expect(res.statusCode).toEqual(201);
  expect(res.body.token).toBeDefined();
  expect(res.body.user.username).toEqual('newazubi');
  expect(res.body.user.name).toEqual('New Azubi');
  expect(res.body.user.role).toEqual('Azubi');
  expect(res.body.user.ausbildung).toEqual(ausbildungId);
  expect(res.body.user.ausbilder).toEqual(ausbilderId); // Assert Ausbilder ID

  // Find the saved Azubi in the database
  const savedAzubi = await Azubi.findOne({ username: 'newazubi' });
  console.log('Saved Azubi:', savedAzubi); // Log the entire saved Azubi object

  // Assertions to verify the saved Azubi data
  expect(savedAzubi).toBeDefined();
  expect(savedAzubi.username).toEqual('newazubi');
  expect(savedAzubi.name).toEqual('New Azubi');
  expect(savedAzubi.ausbildung.toString()).toEqual(ausbildungId.toString()); // Check Ausbildung ID
  expect(savedAzubi.ausbilder.toString()).toEqual(ausbilderId.toString()); // Check Ausbilder ID

  // Find the birthday event in the Kalender
  const birthdayEvent = await Kalender.findOne({ relatedId: savedAzubi._id });
  console.log('Birthday Event:', birthdayEvent); // This will show you what the birthdayEvent object contains
});

beforeAll(async () => {
  // Clear relevant collections
  await Ausbilder.deleteMany({});
  await Ausbildung.deleteMany({});
  await Azubi.deleteMany({});

  // Create and save the Ausbildung document
  const ausbildung = new Ausbildung({ /*... */ });
  const ausbildungSaveResult = await ausbildung.save();
  ausbildungId = ausbildungSaveResult._id.toString();
  console.log('Ausbildung created with ID:', ausbildungId); // Debugging line

  // Create an Ausbilder document and use its ID
  const ausbilder = new Ausbilder({ /* ... */ });
  const ausbilderSaveResult = await ausbilder.save();
  ausbilderId = ausbilderSaveResult._id.toString();
  console.log('Ausbilder created with ID:', ausbilderId); // Debugging line
});

describe('Registration with missing fields', () => {
  const baseAusbilderData = {
    username: 'ausbilderuser',
    password: 'password',
    role: 'Ausbilder',
    name: 'Ausbilder Name',
    birthday: "1980-01-01",
    ausbildung: [ausbildungId], // Assuming this is an array of Ausbildung IDs
    ausbilder: ausbilderId
  };

  const requiredFieldsAusbilder = ['username', 'password', 'role', 'name', 'birthday', 'ausbildung', 'ausbilder'];

  requiredFieldsAusbilder.forEach(field => {
    it(`should fail to register an Ausbilder without ${field}`, async () => {
      const ausbilderData = { ...baseAusbilderData };
      delete ausbilderData[field];

      const res = await request(app)
        .post('/auth/register')
        .send(ausbilderData)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json');

      expect(res.statusCode).not.toEqual(201);
      expect(res.body).toHaveProperty('message');
    });
  });

  const baseAzubiData = {
    username: 'azubiuser',
    password: 'password',
    role: 'Azubi',
    name: 'Azubi Name',
    birthday: "2000-05-15",
    ausbildung: ausbildungId // Assuming this is a single Ausbildung ID
  };

  const requiredFieldsAzubi = ['username', 'password', 'role', 'name', 'birthday', 'ausbildung'];

  requiredFieldsAzubi.forEach(field => {
    it(`should fail to register an Azubi without ${field}`, async () => {
      const azubiData = { ...baseAzubiData };
      delete azubiData[field];

      const res = await request(app)
        .post('/auth/register')
        .send(azubiData)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json');

      expect(res.statusCode).not.toEqual(201);
      expect(res.body).toHaveProperty('message');
    });
  }); 
});

it('should fail to register an Ausbilder with an invalid ausbildung array', async () => {
  const invalidAusbildungArray = ['invalid-id1', 'invalid-id2']; // Example of invalid Ausbildung IDs
  const ausbilderData = {
    username: 'invalidausbilder',
    password: 'password',
    role: 'Ausbilder',
    name: 'Invalid Ausbilder',
    birthday: "1980-01-01",
    ausbildung: invalidAusbildungArray
  };

  const res = await request(app)
    .post('/auth/register')
    .send(ausbilderData)
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json');

  expect(res.statusCode).not.toEqual(201);
  expect(res.body).toHaveProperty('message');
});
it('should fail to register an Azubi with an invalid ausbildung ID', async () => {
  const azubiData = {
    username: 'invalidazubi',
    password: 'password',
    role: 'Azubi',
    name: 'Invalid Azubi',
    birthday: "2000-05-15",
    ausbildung: 'invalid-ausbildung-id',
    ausbilder: ausbilderId // Assuming a valid Ausbilder ID is used
  };

  const res = await request(app)
    .post('/auth/register')
    .send(azubiData)
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json');

  expect(res.statusCode).not.toEqual(201);
  expect(res.body).toHaveProperty('message');
});
it('should fail to register an Azubi with an invalid ausbilder ID', async () => {
  const azubiData = {
    username: 'azubiwithinvalidausbilder',
    password: 'password',
    role: 'Azubi',
    name: 'Azubi Invalid Ausbilder',
    birthday: "2000-05-15",
    ausbildung: ausbildungId, // Assuming a valid Ausbildung ID is used
    ausbilder: 'invalid-ausbilder-id'
  };

  const res = await request(app)
    .post('/auth/register')
    .send(azubiData)
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json');

  expect(res.statusCode).not.toEqual(201);
  expect(res.body).toHaveProperty('message');
});


/*-----------------------------------------*/ 
describe('AuthController Login Functionality', () => {
  let ausbildungId, ausbilderId;

  beforeAll(async () => {
    // Clearing the collections. Be cautious with this in a real database.
    await Azubi.deleteMany({});
    await Ausbilder.deleteMany({});
    await Ausbildung.deleteMany({});

    // Create and save an Ausbildung instance
    const ausbildung = new Ausbildung({ /* ... */ });
    const ausbildungSaveResult = await ausbildung.save();
    ausbildungId = ausbildungSaveResult._id.toString();
    console.log('Ausbildung created with ID:', ausbildungId);

    // Create and save an Ausbilder instance
    const ausbilder = new Ausbilder({
      username: 'testausbilder',
      password: bcrypt.hashSync('password', 10),
      role: 'Ausbilder',
      name: 'New Ausbilder',
      birthday: "1986-02-11",
      ausbildung: [ausbildungId] // Assuming ausbildung is an array of IDs
    });
    const savedAusbilder = await ausbilder.save();
    ausbilderId = savedAusbilder._id;

    // Create a test Azubi with the Ausbilder ID and Ausbildung ID
    const testAzubi = new Azubi({
      username: 'testazubi',
      password: bcrypt.hashSync('password', 10),
      role: 'Azubi',
      name: 'Azubi Name',
      birthday: "2000-05-15",
      ausbildung: ausbildungId,
      ausbilder: ausbilderId
    });

    await testAzubi.save();
  });

  it('Successful Login for Azubi', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        username: 'testazubi',
        password: 'password'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token'); // Ensure a token is returned
    expect(res.body.message).toEqual('Erfolgreich angemeldet.');
  });

  it('Successful Login for Ausbilder', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        username: 'testausbilder', // Use the username of the test Ausbilder
        password: 'password'       // Use the password of the test Ausbilder
      });
  
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token'); // Ensure a token is returned
    expect(res.body.message).toEqual('Erfolgreich angemeldet.');
  });

  it('should fail login without username', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        password: 'password' // Username is missing
      });
  
    expect(res.statusCode).toEqual(400);
    expect(res.text).toEqual('Benutzername und Passwort müssen angegeben werden.');
  });
  
  it('should fail login without password', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        username: 'testuser' // Password is missing
      });
  
    expect(res.statusCode).toEqual(400);
    expect(res.text).toEqual('Benutzername und Passwort müssen angegeben werden.');
  });

  it('should fail login with an invalid username', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        username: 'nonexistentuser', // This username does not exist in the database
        password: 'somepassword'
      });
  
    expect(res.statusCode).toEqual(401);
    expect(res.text).toEqual('Anmeldedaten sind ungültig.'); // Assuming this is the error message your API returns
  });
  it('should fail login with a valid username but incorrect password', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        username: 'existinguser', // Use a valid username that exists in your test database
        password: 'wrongpassword' // Use an incorrect password
      });
  
    expect(res.statusCode).toEqual(401);
    expect(res.text).toEqual('Anmeldedaten sind ungültig.'); // Assuming this is the error message your API returns
  });
  it('should handle server errors gracefully', async () => {
    // Mock the findOne method to simulate a database error
    jest.spyOn(Ausbilder, 'findOne').mockImplementation(() => {
      throw new Error('Simulated database error');
    });

    const res = await request(app)
      .post('/auth/login')
      .send({
        username: 'validusername',
        password: 'validpassword'
      });

    expect(res.statusCode).toEqual(500);
    expect(res.text).toEqual('Ein Fehler ist aufgetreten.'); // Assuming this is the error message your API returns

    // Restore the original implementation after the test
    Ausbilder.findOne.mockRestore();
  });    

  // ... Additional tests ...

});
