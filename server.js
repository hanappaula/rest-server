var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;
var bodyParser = require('body-parser');

var STUDENTS_COLLECTION = "students";

var app = express();
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
  extended: true
}));

// parse application/json
app.use(bodyParser.json())

var db;
var mongoURI = "mongodb://apso:2016@ds119768.mlab.com:19768/sd-service"

mongodb.MongoClient.connect(mongoURI, function (err, database) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  db = database;
  console.log("Database connection ready");

  var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });
});

function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

/*
    {
      "_id": <ObjectId>,
      "createDate": <Date>,
      "name": <string>,
      "email": <string>,
      "course": <string>,
      "subjects": { <string> }
    }
*/



/*  "/students"
 *    GET: finds all students
 *    POST: creates a new student
 */

app.get("/students", function(req, res) {
    db.collection(STUDENTS_COLLECTION).find({}).toArray(function(err, docs) {
        if (err) {
            handleError(res, err.message, "Failed to get contacts.");
        } else {
            res.status(200).json(docs);
        }
    });
});

app.post("/students", function(req, res) {
    var newStudent = req.body;
    newStudent.createDate = new Date();
    
    if (!(req.body._id || req.body.name || req.body.course)) {
        handleError(res, "Entrada inválida", /*"Nome, curso e disciplinas devem ser fornecidos."*/newStudent, 400);
    } else {
        db.collection(STUDENTS_COLLECTION).insertOne(newStudent, function(err, doc) {
            if (err) {
              handleError(res, err.message, "Falha ao inserir estudante.");
            } else {
              res.status(201).json(doc.ops[0]);
            }
        });
    }
});

/*  "/students/:id"
 *    GET: find student by id
 *    PUT: update student by id
 *    DELETE: deletes student by id
 */

app.get("/students/:id", function(req, res) {
    db.collection(STUDENTS_COLLECTION).findOne({ _id: req.params.id }, function(err, doc) {
        if (err) {
          handleError(res, err.message, "Falha ao buscar estudante.");
        } else {
          res.status(200).json(doc);
        }
    });
});

app.put("/students/:id", function(req, res) {
    var updateDoc = req.body;

    db.collection(STUDENTS_COLLECTION).updateOne({_id: req.params.id}, updateDoc, function(err, doc) {
        if (err) {
          handleError(res, err.message, "Falha ao atualizar estudante.");
        } else {
          res.status(204).end();
        }
    });
});

app.delete("/students/:id", function(req, res) {
    db.collection(STUDENTS_COLLECTION).deleteOne({_id: req.params.id}, function(err, result) {
        if (err) {
          handleError(res, err.message, "Falha ao deletar estudante.");
        } else {
          res.status(204).end();
        }
    });
});