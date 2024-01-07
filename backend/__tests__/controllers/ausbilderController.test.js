const request = require('supertest');
const app = require('../../server'); // Adjust the path as necessary
const Ausbildung = require('../../models/Ausbildung'); // Adjust the path as needed
const Ausbilder = require('../../models/Ausbilder'); // Adjust the path as needed
const Azubi = require('../../models/Azubi.js'); // Adjust the path to the correct location of your Azubi model
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

describe('Ausbilder Controller', () => {
  let token;
  let ausbildungId;
  let ausbilderId;

  beforeAll(async () => {
    // Create a test Ausbilder with a hashed password
    const hashedPassword = bcrypt.hashSync('wort', 10);
    const testAusbilder = new Ausbilder({
      username: 'test',
      password: hashedPassword, // Assuming hashedPassword is correctly defined
      name: 'Test Ausbilder', // Make sure this matches your assertion
      birthday: new Date('1980-01-01'), // Add the birthday
      role: 'Ausbilder',
      ausbildung: [ausbildungId], // Assuming ausbildungId is correctly defined
      // ... any other required fields
    });
    
    await testAusbilder.save();

    // Create and save an Ausbildung instance
    const ausbildung = new Ausbildung({ /* ... */ });
    const ausbildungSaveResult = await ausbildung.save();
    ausbildungId = ausbildungSaveResult._id.toString();
    
    // Log in to get a token
    const loginRes = await request(app)
      .post('/auth/login') // Correct endpoint if necessary
      .send({ username: 'test', password: 'wort' });
    token = loginRes.body.token;

    ausbilderId = testAusbilder._id.toString();
  });

  afterAll(async () => {
    await Ausbilder.deleteOne({ _id: ausbilderId });
    await Ausbildung.findByIdAndDelete(ausbildungId);
  });
  
  it('should create an Ausbilder with valid data', async () => {
    // Generate a unique username
    const uniqueUsername = `neuerausbilder_${Date.now()}`;
  
    const newAusbilderData = {  
      name: 'Neuer Ausbilder',
      birthday: '1985-12-15',
      ausbildung: [ausbildungId],
      username: uniqueUsername,
      password: 'sicheresPasswort123'
    };
  
    const res = await request(app)
      .post('/ausbilder')
      .send(newAusbilderData);
  
    // Debugging
    console.log(res.body);
  
    expect(res.status).toBe(201);
  
    // Clean up: Delete the created Ausbilder
    await Ausbilder.findOneAndDelete({ username: uniqueUsername });
  
    // ... rest of your test assertions
  });
  
  it('should return 400 for missing fields', async () => {
    const incompleteData = {
      // Example: missing 'name' and 'birthday'
      ausbildung: [ausbildungId],
      username: 'neuerausbilder',
      password: 'sicheresPasswort123'
    };
  
    const res = await request(app)
      .post('/ausbilder')
      .send(incompleteData);
  
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'Alle Felder müssen ausgefüllt sein');
  });

  
  it('should return 400 for invalid Ausbildung IDs', async () => {
    const dataWithInvalidId = {
      name: 'Ausbilder mit ungültiger Ausbildung',
      birthday: '1985-12-15',
      ausbildung: ['invalidAusbildungId'],
      username: 'neuerausbilder',
      password: 'sicheresPasswort123'
    };
  
    const res = await request(app)
      .post('/ausbilder')
      .send(dataWithInvalidId);
  
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', expect.stringContaining('Ungültige Ausbildung mit der ID'));
  
    // Clean up: Delete any created Ausbilder with this username
    await Ausbilder.deleteOne({ username: 'neuerausbilder' });
  });
  beforeEach(async () => {
    // Delete existing Ausbilder if they exist
    await Ausbilder.deleteMany({ username: { $in: ['existingausbilder', 'neuerausbilder'] } });
  });
  
  it('should return 400 if Ausbildung already has an Ausbilder', async () => {
    // Create an Ausbilder for the Ausbildung
    const initialAusbilder = new Ausbilder({
      name: 'Existing Ausbilder',
      birthday: '1975-10-10',
      ausbildung: [ausbildungId],
      username: 'existingausbilder',
      password: 'sicheresPasswort123'
    });
    await initialAusbilder.save();
  
    // Try to create another Ausbilder for the same Ausbildung
    const newAusbilderData = {
      name: 'Neuer Ausbilder',
      birthday: '1985-12-15',
      ausbildung: [ausbildungId],
      username: 'neuerausbilder',
      password: 'sicheresPasswort123'
    };
  
    const res = await request(app)
      .post('/ausbilder')
      .send(newAusbilderData);
  
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', expect.stringContaining('bereits einen Ausbilder'));
  
    // Clean up: Delete the created Ausbilder
    await Ausbilder.deleteMany({ username: { $in: ['existingausbilder', 'neuerausbilder'] } });
  });
  

  describe('GET /ausbilder/:id', () => {
    beforeAll(async () => {
      // Additional setup if required
    });
  
    afterAll(async () => {
      // Clean up specific to this test block
    });
  
    it('should return an Ausbilder for a valid ID', async () => {
      const res = await request(app)
        .get(`/ausbilder/${ausbilderId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id', ausbilderId);
      expect(res.body).toHaveProperty('name', 'Test Ausbilder');
      // Add more assertions as needed
    });
  
    it('should return 404 for a non-existent Ausbilder ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/ausbilder/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('message', 'Ausbilder nicht gefunden');
    });
  
    it('should return 400 or 500 for an invalid ID format', async () => {
      const invalidId = '123';
      const res = await request(app)
        .get(`/ausbilder/${invalidId}`)
        .set('Authorization', `Bearer ${token}`);

      // Check for either 400 or 500 status code, depending on your application's behavior
      expect([400, 500]).toContain(res.status);
    });
    
  });





  
  describe('DELETE /ausbilder/:id', () => {
    const hashedPassword = bcrypt.hashSync('wort', 10);  
  
    it('should successfully delete an Ausbilder without Azubis', async () => {
      const ausbilder = new Ausbilder({
          username: 'test',
          password: hashedPassword, // Assuming hashedPassword is correctly defined
          name: 'Test Ausbilder', // Make sure this matches your assertion
          birthday: new Date('1980-01-01'), // Add the birthday
          role: 'Ausbilder',
          ausbildung: [ausbildungId], // Assuming ausbildungId is correctly defined
          // ... any other required fields
      });
      const azubi = new Azubi({
        username: 'testazubi',
        password: bcrypt.hashSync('password', 10),
        role: 'Azubi',
        name: 'Azubi Name',
        birthday: "2000-05-15",
        ausbildung: ausbildungId,
        ausbilder: ausbilder._id,
      });

      await ausbilder.save();
      await azubi.save();
    
      // Attempt to delete the Ausbilder
      const res = await request(app)
        .delete(`/ausbilder/${ausbilder._id}`)
        .set('Authorization', `Bearer ${token}`);
    
      // Assertions
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Dieser Ausbilder hat noch Azubis und kann nicht gelöscht werden.');
    
      // Cleanup
      await Azubi.findByIdAndDelete(azubi._id);
      await Ausbilder.findByIdAndDelete(ausbilder._id);
      
    });
  
    it('should not delete an Ausbilder who still has Azubis', async () => {
      // Create an Ausbilder and associate Azubis
      const ausbilder = new Ausbilder({
        // ... necessary fields
      });
      const azubi = new Azubi({
        ausbilder: ausbilder._id,
        // ... other necessary fields
      });
      await ausbilder.save();
      await azubi.save();
    
      // Attempt to delete the Ausbilder
      const res = await request(app)
        .delete(`/ausbilder/${ausbilder._id}`)
        .set('Authorization', `Bearer ${token}`);
    
      // Assertions
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Dieser Ausbilder hat noch Azubis und kann nicht gelöscht werden.');
    
      // Cleanup
      await Azubi.findByIdAndDelete(azubi._id);
      await Ausbilder.findByIdAndDelete(ausbilder._id);
    });
    
  
    it('should return an error for invalid Ausbilder ID', async () => {
      const invalidId = '123abc';
    
      // Attempt to delete with invalid ID
      const res = await request(app)
        .delete(`/ausbilder/${invalidId}`)
        .set('Authorization', `Bearer ${token}`);
    
      // Assertions
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', `Ungültige Ausbilder ID: ${invalidId}`);
    });
    
  
    it('should return an error if the Ausbilder is not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
    
      // Attempt to delete non-existent Ausbilder
      const res = await request(app)
        .delete(`/ausbilder/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`);
    
      // Assertions
      // Note: You need to modify the actual function to handle 'not found' cases and return a 404 status
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('message', 'Ausbilder nicht gefunden');
    });
    

  });
  
  describe('PUT /ausbilder/:id', () => {
    const hashedPassword = bcrypt.hashSync('wort', 10); 

    it('should successfully update an Ausbilder with valid changes', async () => {
      // Create an Ausbilder for updating
      const ausbilder = new Ausbilder({
        username: 'test',
        password: hashedPassword, // Assuming hashedPassword is correctly defined
        name: 'Test Ausbilder', // Make sure this matches your assertion
        birthday: new Date('1980-01-01'), // Add the birthday
        role: 'Ausbilder',
        ausbildung: [ausbildungId], // Assuming ausbildungId is correctly defined
        // ... any other required fields
      });
      await ausbilder.save();
    
      const updatedData = {
        username: 'test',
        password: hashedPassword, // Assuming hashedPassword is correctly defined
        name: 'Test Geupdatet', // Make sure this matches your assertion
        birthday: new Date('1980-01-01'), // Add the birthday
        role: 'Ausbilder',
        ausbildung: [ausbildungId], // Assuming ausbildungId is correctly defined
      };
    
      // Perform the update operation
      const res = await request(app)
        .put(`/ausbilder/${ausbilder._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedData);
    
      // Assertions
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data.name).toBe(updatedData.name);
    
      // Cleanup
      await Ausbilder.findByIdAndDelete(ausbilder._id);
    });

    it('should return an error for invalid Ausbilder ID', async () => {
      const invalidId = '123abc';
      const updateData = {
        name: 'Updated Name',
        birthday: '1990-01-01',
        ausbildung: [ausbildungId]
      };
    
      const res = await request(app)
        .put(`/ausbilder/${invalidId}`)
        .send(updateData)
        .set('Authorization', `Bearer ${token}`);
    
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', `Ungültige Ausbilder ID: ${invalidId}`);
    });
    it('should return an error if the Ausbilder is not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const updateData = {
        // ... valid update data
      };
    
      const res = await request(app)
        .put(`/ausbilder/${nonExistentId}`)
        .send(updateData)
        .set('Authorization', `Bearer ${token}`);
    
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('message', 'Ausbilder nicht gefunden');
    });
    
    
    
  });

  describe('GET ausbilder/:id/azubis', () => {


    it('should return an error when no Azubis are found for an Ausbilder ID', async () => {
      const ausbilderIdWithNoAzubis = '6554a1f2525339f6fe270c69';
      
      const res = await request(app)
        .get(`/ausbilder/${ausbilderIdWithNoAzubis}/azubis`)
        .set('Authorization', `Bearer ${token}`);
    
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('message', 'Keine Azubis gefunden');
    });

    it('should return an error for invalid Ausbilder ID', async () => {
      const invalidAusbilderId = 'invalidId';
      
      const res = await request(app)
        .get(`/ausbilder/${invalidAusbilderId}/azubis`)
        .set('Authorization', `Bearer ${token}`);
    
      // Depending on how your API handles invalid IDs, expect either 400 or 404
      expect([400, 404]).toContain(res.status);
      expect(res.body).toHaveProperty('message');
    });
    

  });
});