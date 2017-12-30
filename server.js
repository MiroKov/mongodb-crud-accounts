const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const errorHandler = require('errorhandler');
const mongodb = require('mongodb');

const url = 'mongodb://localhost:27017/edx-course-db';

let app = express();
app.use(bodyParser.json()).use(logger('dev')).use(errorHandler());

mongodb.MongoClient.connect(url, (error, db) => {
    if (error) {
        console.log(error);
        return process.exit(1);
    }
    app.get('/accounts', (req, res, next) => {
        db.db('edx-course-db').collection('accounts').find({}, { sort: { _id: -1 } })
            .toArray((error, accounts) => {
                if (error) return next(error);
                return res.status(200).send(accounts);
            })
    });

    app.post('/accounts', (req, res, next) => {
        let newAccount = req.body;
        db.db('edx-course-db').collection('accounts').insert(newAccount, (error, results) => {
            if (error) return next(error);
            res.status(200).send(results);
        });
    });

    app.put('/accounts/:id', (req, res, next) => {
        let newAccount = req.body;
        db.db('edx-course-db').collection('accounts').update({ _id: mongodb.ObjectID(req.params.id) }, { $set: req.body },
            (error, results) => {
                if (error) return next(error);
                return res.status(200).send(results);
            });
    });

    app.delete('/accounts/:id', (req, res, next) => {
        db.db('edx-course-db').collection('accounts').remove({ _id: mongodb.ObjectID(req.params.id) }, (errors, results) => {
            if (error) return next(error);
            return res.status(200).send(results);
        })
    })

    app.use(errorHandler());

    const port = process.env.port || 3000;
    console.log(`server listening at port ${port}`);
    app.listen(process.env.port || 3000);
});