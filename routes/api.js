/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.DB;
let mongoclient = MongoClient.connect(CONNECTION_STRING);

module.exports = function (app) {

    app.route('/api/issues/:project')
        .get(function (req, res) {
            var project = req.params.project;
            let findCondition = req.query || {};
            findCondition.project = project;
            mongoclient.open(function (err, mongoclient) {
                if (err) {
                    res.json("error connecting to database");
                    mongoclient.close();
                } else {
                    const db = mongoclient.db(process.env.DB_NAME);
                    db.collection('Issues').find(findCondition, function (err, result) {
                        if (err) {
                            res.json("error finding data");
                        } else {
                            res.json(result.map(re => { delete re.project; return re; }));
                        }
                        mongoclient.close();
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
            mongoclient.open(function (err, mongoclient) {
                if (err) {
                    res.status(500).json("Error connecting to database");
                    mongoclient.close();
                } else {
                    var db = mongoclient.db(process.env.DB_NAME);
                    db.collection('Issues').insertOne(issueObject, function (err, result) {
                        if (err) {
                            res.status(500).json("Error inserting issue");
                        } else {
                            let { _id, issue_title, issue_text, created_on, updated_on, created_by, assigned_to, open, status_text } = result;
                            res.json({ _id, issue_title, issue_text, created_on, updated_on, created_by, assigned_to, open, status_text });
                        }
                        mongoclient.close();
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
                mongoclient.open(function (err, mongoclient) {
                    if (err) {
                        res.status(500).json("could not update " + _id);
                        mongoclient.close();
                    } else {
                        var db = mongoclient.db(process.env.DB_NAME);
                        db.collection('Issues').update({ _id }, updates, function (err, result) {
                            if (err) {
                                res.status(500).json("could not update " + _id);
                            } else {
                                res.json("successfully updated " + _id);
                            }
                            mongoclient.close();
                        });
                    }
                });
            }
        })
        .delete(function (req, res) {
            var project = req.params.project;
            let _id = req.body._id;
            if (_id === undefined) {
                res.json('_id error');
            } else {
                mongoclient.open(function (err, mongoclient) {
                    if (err) {
                        res.status(500).json('could not delete ' + _id);
                        mongoclient.close();
                    } else {
                        var db = mongoclient.db(process.env.DB_NAME);
                        db.collection('Issues').deleteOne({ _id }, function (err, result) {
                            if (err) {
                                res.status(500).json('could not delete ' + _id);
                            } else {
                                res.json('deleted ' + _id);
                            }
                            mongoclient.close();
                        });
                    }
                });
            }
        });
};
