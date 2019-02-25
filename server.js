const express = require('express');
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt-nodejs");
const cors = require("cors");
const knex = require('knex');


// creates the smart-brain-api database

const database = knex ({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      user : 'postgres',
      password : 'test',
      database : 'smart-brain-api'
    }
  });


// Middleware

const app = express();
app.use(bodyParser.json());
app.use(cors());


//Returns the database of users

app.get('/', (req, res) => {
    database.select('*').from('users').then(users => res.json(users));
})


// Returns a user from the database based on the request ID

app.get('/profile/:id', (req, res) => {
    const { id } = req.params;
    database.select('*').from('users').where({id}) // selects all ids from the users table
    .then(user => { // user is an array, which contains one object
        if (user.length) {
            res.json(user[0])
        }
        else {
            res.status(400).json('Not found');
        }
    }).catch(err => res.status(400).json('Error getting user'))
})


// Updates entries amount in the database

app.put('/image', (req,res) => {
    const { id } = req.body;
    

    database('users').where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then( entries => {
        res.json(entries[0])
    })
    .catch(err => res.status(400).json("unable to get entries"))
})


// Checks for the user who is signing in in the database, if they exist: allow access to site

app.post('/signin', (req, res) => {
    const {email, password} = req.body; // destruct variables
    
    database.select('email', 'hash').from('login') // retuns email and hash from login table
    .where('email', '=', email) // where email matches to req body email
    .then(data => { // data is an array with one object, which cointains the hash attached to the email in login table
        const isValid = bcrypt.compareSync(password, data[0].hash);
        if (isValid) { // if the user exists on the database
            return database.select('*').from('users') // select everything from users
                .where('email', '=', email)// checks if email matches to the request email, returns the match
                .then(user => { // 
                    res.json(user[0])
                })
                .catch(err => res.status(400).json('unable to get user'))
        }
        else {
            res.status(400).json('wrong credentials')
        }
    })
    .catch(err => res.status(400).json("Wrong credentials"))
})



// registers a user in the database, based on the constraits of the server (no dublicate usernames)

app.post('/register', (req, res) => {
    const {email, name, password } = req.body; // defactors body

    const hash = bcrypt.hashSync(password); // creates a hash from the body.password

    database.transaction(trx => { // first updates the email from login table => then gets the login email from login table => responds the request with the user who is in the login table
        trx.insert({ // inserts the following objects
            hash : hash,
            email: email
        })
        .into('login') // inserts into login table
        .returning('email') // returns email from login table
        .then(loginEmail => { // with that login email, 
            return trx('users') 
                .returning('*')
                .insert({
                    email: loginEmail[0],
                    name: name,
                    joined: new Date()
                })
                .then(user => {
                    res.json(user[0]); // returns the new user created
            })
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err => res.status(400).json("unable to register"));
    
})


// Port

app.listen(3000, () => {
    console.log("app is running on port 3000");
})