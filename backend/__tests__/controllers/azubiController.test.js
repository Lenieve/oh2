const request = require('supertest');
const app = require('../app'); // Assuming the Express app is exported from app.js

describe('Azubi Controller', () => {
  describe('POST /azubi', () => {
    it('should create a new Azubi', async () => {
      const response = await request(app)
        .post('/azubi')
        .send({
          name: 'John Doe',
          birthday: '1990-01-01',
          ausbildung: 'validAusbildungId'
        });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('John Doe');
      expect(response.body.birthday).toBe('1990-01-01');
      expect(response.body.ausbildung).toBe('validAusbildungId');
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/azubi')
        .send({
          name: 'John Doe',
          birthday: '1990-01-01'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Alle Felder müssen ausgefüllt sein');
    });

    it('should return 400 if ausbildung is invalid', async () => {
      const response = await request(app)
        .post('/azubi')
        .send({
          name: 'John Doe',
          birthday: '1990-01-01',
          ausbildung: 'invalidAusbildungId'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Ungültige Ausbildung');
    });
  });

  describe('GET /azubi/:id', () => {
    it('should get an Azubi by ID', async () => {
      const response = await request(app).get('/azubi/validAzubiId');

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('John Doe');
      expect(response.body.birthday).toBe('1990-01-01');
      expect(response.body.ausbildung).toBe('validAusbildungId');
    });

    it('should return 404 if Azubi is not found', async () => {
      const response = await request(app).get('/azubi/invalidAzubiId');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Azubi nicht gefunden');
    });
  });

  describe('PUT /azubi/:id', () => {
    it('should update an Azubi', async () => {
      const response = await request(app)
        .put('/azubi/validAzubiId')
        .send({
          name: 'Jane Smith',
          birthday: '1995-02-02',
          ausbildung: 'validAusbildungId'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Azubi erfolgreich aktualisiert');
      expect(response.body.data.name).toBe('Jane Smith');
      expect(response.body.data.birthday).toBe('1995-02-02');
      expect(response.body.data.ausbildung).toBe('validAusbildungId');
    });

    it('should return 400 if Azubi ID is invalid', async () => {
      const response = await request(app)
        .put('/azubi/invalidAzubiId')
        .send({
          name: 'Jane Smith',
          birthday: '1995-02-02',
          ausbildung: 'validAusbildungId'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Ungültige Azubi ID: invalidAzubiId');
    });

    it('should return 400 if ausbildung is invalid', async () => {
      const response = await request(app)
        .put('/azubi/validAzubiId')
        .send({
          name: 'Jane Smith',
          birthday: '1995-02-02',
          ausbildung: 'invalidAusbildungId'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Ungültige Ausbildung ID: invalidAusbildungId');
    });

    it('should return 404 if Azubi is not found', async () => {
      const response = await request(app)
        .put('/azubi/invalidAzubiId')
        .send({
          name: 'Jane Smith',
          birthday: '1995-02-02',
          ausbildung: 'validAusbildungId'
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Azubi nicht gefunden');
    });
  });

  describe('DELETE /azubi/:id', () => {
    it('should delete an Azubi', async () => {
      const response = await request(app).delete('/azubi/validAzubiId');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Azubi erfolgreich gelöscht');
    });

    it('should return 404 if Azubi is not found', async () => {
      const response = await request(app).delete('/azubi/invalidAzubiId');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Azubi nicht gefunden');
    });
  });

  describe('GET /azubi', () => {
    it('should get all Azubis', async () => {
      const response = await request(app).get('/azubi');

      expect(response.status).toBe(200);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });
});


describe('Azubi Controller', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/testdb', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Azubi.deleteMany();
    await Ausbildung.deleteMany();
    await Kalender.deleteMany();
  });

  describe('createAzubi', () => {
    it('should create a new Azubi', async () => {
      const ausbildung = new Ausbildung({ name: 'Ausbildung 1' });
      await ausbildung.save();

      const response = await request(app)
        .post('/api/azubis')
        .send({ name: 'John Doe', birthday: '1990-01-01', ausbildung: ausbildung._id });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('John Doe');
      expect(response.body.birthday).toBe('1990-01-01');
      expect(response.body.ausbildung).toBe(ausbildung._id.toString());

      const azubi = await Azubi.findById(response.body._id);
      expect(azubi).toBeDefined();
      expect(azubi.name).toBe('John Doe');
      expect(azubi.birthday.toISOString()).toBe('1990-01-01T00:00:00.000Z');
      expect(azubi.ausbildung.toString()).toBe(ausbildung._id.toString());

      const updatedAusbildung = await Ausbildung.findById(ausbildung._id);
      expect(updatedAusbildung.azubis).toContainEqual(azubi._id);
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/azubis')
        .send({ name: 'John Doe' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Alle Felder müssen ausgefüllt sein');
    });

    it('should return 400 if ausbildung is invalid', async () => {
      const response = await request(app)
        .post('/api/azubis')
        .send({ name: 'John Doe', birthday: '1990-01-01', ausbildung: 'invalidId' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Ungültige Ausbildung');
    });

    it('should return 500 if there is a server error', async () => {
      jest.spyOn(Ausbildung, 'findById').mockRejectedValueOnce(new Error('Server error'));

      const response = await request(app)
        .post('/api/azubis')
        .send({ name: 'John Doe', birthday: '1990-01-01', ausbildung: 'validId' });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Serverfehler');
    });
  });

  describe('getAzubiById', () => {
    it('should return the Azubi with the given ID', async () => {
      const azubi = new Azubi({ name: 'John Doe', birthday: '1990-01-01' });
      await azubi.save();

      const response = await request(app).get(`/api/azubis/${azubi._id}`);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('John Doe');
      expect(response.body.birthday).toBe('1990-01-01');
    });

    it('should return 404 if Azubi is not found', async () => {
      const response = await request(app).get('/api/azubis/nonexistentId');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Azubi nicht gefunden');
    });

    it('should return 500 if there is a server error', async () => {
      jest.spyOn(Azubi, 'findById').mockRejectedValueOnce(new Error('Server error'));

      const response = await request(app).get('/api/azubis/validId');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Serverfehler');
    });
  });

  describe('updateAzubi', () => {
    it('should update the Azubi with the given ID', async () => {
      const azubi = new Azubi({ name: 'John Doe', birthday: '1990-01-01' });
      await azubi.save();

      const response = await request(app)
        .put(`/api/azubis/${azubi._id}`)
        .send({ name: 'Jane Smith', birthday: '1995-02-02' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Azubi erfolgreich aktualisiert');
      expect(response.body.data.name).toBe('Jane Smith');
      expect(response.body.data.birthday).toBe('1995-02-02');

      const updatedAzubi = await Azubi.findById(azubi._id);
      expect(updatedAzubi.name).toBe('Jane Smith');
      expect(updatedAzubi.birthday.toISOString()).toBe('1995-02-02T00:00:00.000Z');
    });

    it('should return 400 if azubiId is invalid', async () => {
      const response = await request(app)
        .put('/api/azubis/invalidId')
        .send({ name: 'Jane Smith', birthday: '1995-02-02' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Ungültige Azubi ID: invalidId');
    });

    it('should return 400 if ausbildung is invalid', async () => {
      const azubi = new Azubi({ name: 'John Doe', birthday: '1990-01-01' });
      await azubi.save();

      const response = await request(app)
        .put(`/api/azubis/${azubi._id}`)
        .send({ ausbildung: 'invalidId' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Ungültige Ausbildung ID: invalidId');
    });

    it('should return 404 if Azubi is not found', async () => {
      const response = await request(app)
        .put('/api/azubis/nonexistentId')
        .send({ name: 'Jane Smith', birthday: '1995-02-02' });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Azubi nicht gefunden');
    });

    it('should return 500 if there is a server error', async () => {
      jest.spyOn(Azubi, 'findById').mockRejectedValueOnce(new Error('Server error'));

      const response = await request(app)
        .put('/api/azubis/validId')
        .send({ name: 'Jane Smith', birthday: '1995-02-02' });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Serverfehler');
    });
  });

  describe('deleteAzubi', () => {
    it('should delete the Azubi with the given ID', async () => {
      const azubi = new Azubi({ name: 'John Doe', birthday: '1990-01-01' });
      await azubi.save();

      const response = await request(app).delete(`/api/azubis/${azubi._id}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Azubi erfolgreich gelöscht');

      const deletedAzubi = await Azubi.findById(azubi._id);
      expect(deletedAzubi).toBeNull();

      const ausbildung = await Ausbildung.findById(azubi.ausbildung);
      expect(ausbildung.azubis).not.toContainEqual(azubi._id);
    });

    it('should return 404 if Azubi is not found', async () => {
      const response = await request(app).delete('/api/azubis/nonexistentId');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Azubi nicht gefunden');
    });

    it('should return 500 if there is a server error', async () => {
      jest.spyOn(Azubi, 'findById').mockRejectedValueOnce(new Error('Server error'));

      const response = await request(app).delete('/api/azubis/validId');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Serverfehler');
    });
  });

  describe('getAllAzubis', () => {
    it('should return all Azubis', async () => {
      const azubi1 = new Azubi({ name: 'John Doe', birthday: '1990-01-01' });
      const azubi2 = new Azubi({ name: 'Jane Smith', birthday: '1995-02-02' });
      await azubi1.save();
      await azubi2.save();

      const response = await request(app).get('/api/azubis');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      expect(response.body[0].name).toBe('John Doe');
      expect(response.body[0].birthday).toBe('1990-01-01');
      expect(response.body[1].name).toBe('Jane Smith');
      expect(response.body[1].birthday).toBe('1995-02-02');
    });

    it('should return 500 if there is a server error', async () => {
      jest.spyOn(Azubi, 'find').mockRejectedValueOnce(new Error('Server error'));

      const response = await request(app).get('/api/azubis');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Serverfehler');
    });
  });
});
