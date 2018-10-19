const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const knex = require ('knex');


const { authenticate } = require('./middlewares');

const dbConfig = require('../knexfile');
const db = knex(dbConfig.development);

module.exports = server => {
  server.post('/api/register', register);
  server.post('/api/login', login);
  server.get('/api/jokes', authenticate, getJokes);
};

function generateToken(user) {
  const jwtSecret = 'This is a secret, shhh!';
  const jwtPayload = {
    username: user.username,
    
  }
  const jwtOptions = {
    expiresIn: '1h'
  }
  return jwt.sign(jwtPayload, jwtSecret, jwtOptions);
}

function register(req, res) {
  // implement user registration
  const creds = req.body;
  const hash = bcrypt.hashSync(creds.password, 10);
  creds.password = hash;
  if ( !creds || !creds.username || !creds.password) {
    res.status(400).json({
      message: "Both fields are required."
    })
  } else {
    db('users')
      .insert(creds)
      .then( user => {
        const token = generateToken(user);
        res.status(201).json({ id: user.id, token });
      })
      .catch( err => { res.status(500).json( err.message )});
  }
}

function login(req, res) {
  // implement user login
}

function getJokes(req, res) {
  axios
    .get(
      'https://08ad1pao69.execute-api.us-east-1.amazonaws.com/dev/random_ten'
    )
    .then(response => {
      res.status(200).json(response.data);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error Fetching Jokes', error: err });
    });
}
