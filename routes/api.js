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

const CONNECTION_STRING = process.env.DB;
let mongoclient = MongoClient.connect(CONNECTION_STRING);

module.exports = function (app) {

    app.route('/api/issues/:project')

        .get(function (req, res) {
            var project = req.params.project;

        })

        .post(function (req, res) {
            var project = req.params.project;

        })

        .put(function (req, res) {
            var project = req.params.project;

        })

        .delete(function (req, res) {
            var project = req.params.project;

        });

};
