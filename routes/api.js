/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;

const CONNECTION_STRING = `${process.env.DB}/${process.env.DB_NAME}`;

module.exports = function (app) {

    app.route('/api/issues/:project')
        .get(function (req, res) {
            var project = req.params.project;
            let findCondition = req.query || {};
            findCondition.project = project;
            MongoClient.connect(CONNECTION_STRING, function (err, db) {
                if (err) {
                    console.log(err);
                    res.status(500).json("could not connect to database", err);
                } else {
                    db.collection('Issues').find(findCondition).toArray(function (err, result) {
                        if (err) {
                            console.log(err);
                            res.json("error finding data");
                        } else {
                            console.log(result);
                            result.forEach(re => delete re.project);
                            res.json(result);
                        }
                        db.close();
                    });
                }
            });
        })
        .post(function (req, res) {
            var project = req.params.project;
            let issue_title = req.body.issue_title;
            let issue_text = req.body.issue_text;
            let created_by = req.body.created_by;
            if ([issue_title, issue_text, created_by].includes(undefined)) {
                return res.status(500).json("required fields not passed");
            }
            // Optional data
            let assigned_to = req.body.assigned_to || '';
            let status_text = req.body.status_text || '';
            // Additional info
            let dateNowUTC = (new Date()).toUTCString();
            let created_on = dateNowUTC;
            let updated_on = dateNowUTC;
            let open = true;
            var issueObject = { project, issue_title, issue_text, created_by, assigned_to, status_text, created_on, updated_on, open };
            MongoClient.connect(CONNECTION_STRING, function (err, db) {
                if (err) {
                    console.log(err);
                    res.status(500).json("could not connect to database");
                } else {
                    db.collection('Issues').insertOne(issueObject, function (err, result) {
                        if (err) {
                            console.log(err);
                            res.status(500).json("Error inserting issue");
                        } else {
                            let { _id, issue_title, issue_text, created_on, updated_on, created_by, assigned_to, open, status_text } = result;
                            res.json({ _id, issue_title, issue_text, created_on, updated_on, created_by, assigned_to, open, status_text });
                        }
                        db.close();
                    });
                }
            });
        })
        .put(function (req, res) {
            var project = req.params.project;
            let _id = req.body._id;
            if (_id === undefined) {
                return res.status(500).json("no id sent");
            }
            let updates = { ...req.body };
            delete updates._id;
            if (Object.keys(updates).length === 0) {
                res.json("no updated field sent");
            } else {
                updates.updated_on = (new Date()).toUTCString();
                MongoClient.connect(CONNECTION_STRING, function (err, db) {
                    if (err) {
                        console.log(err);
                        res.status(500).json("could not connect to database", err);
                    } else {
                        db.collection('Issues').update({ _id }, updates, function (err, result) {
                            if (err) {
                                console.log(err);
                                res.status(500).json("could not update " + _id);
                            } else {
                                res.json("successfully updated " + _id);
                            }
                            db.close();
                        });
                    }
                });
            }
        })
        .delete(function (req, res) {
            var project = req.params.project;
            let _id = req.body._id;
            if (_id === undefined) {
                res.status(500).json('_id error');
            } else {
                MongoClient.connect(CONNECTION_STRING, function (err, db) {
                    if (err) {
                        console.log(err);
                        res.status(500).json('could not delete ' + _id);
                    } else {
                        db.collection('Issues').deleteOne({ _id }, function (err, result) {
                            if (err) {
                                console.log(err);
                                res.status(500).json('could not delete ' + _id);
                            } else {
                                res.json('deleted ' + _id);
                            }
                            db.close();
                        });
                    }
                });
            }
        });
};
