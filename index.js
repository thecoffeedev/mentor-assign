const express = require("express");
const mongodb = require("mongodb");
const cors = require("cors");
const dotenv = require("dotenv")

const app = express();
app.use(express.json());
app.use(cors());
dotenv.config();

const port = process.env.PORT || 3000;
const dbURL = process.env.DB_URL
const mongoClient = mongodb.MongoClient;


app.get("/students-list", async (req, res) => {
    try {
        let client = await mongoClient.connect(dbURL);
        let db = client.db("mentor_assign_db");
        let result = await db
            .collection("students")
            .find()
            .project({ _id: 0 })
            .toArray();
        res.status(200).json({ message: "students list", result });
        client.close();
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

app.get("/mentors-list", async (req, res) => {
    try {
        let client = await mongoClient.connect(dbURL);
        let db = client.db("mentor_assign_db");
        let result = await db
            .collection("mentors")
            .find()
            .project({ _id: 0 })
            .toArray();
        res.status(200).json({ message: "mentors list", result });
        client.close();
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

app.get("/students-under-mentor/:mentor_id", async (req, res) => {
    try {
        let client = await mongoClient.connect(dbURL);
        let db = client.db("mentor_assign_db");
        let mentorId = +req.params.mentor_id;
        let result = await db
            .collection("students")
            .find({ mentor_id: mentorId })
            .project({ _id: 0 })
            .toArray();
        res.status(200).json({
            message: `students under mentor_id: ${mentorId}`,
            result,
        });
        client.close();
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

app.get("/idle-students", async (req, res) => {
    try {
        let client = await mongoClient.connect(dbURL);
        let db = client.db("mentor_assign_db");
        let result = await db
            .collection("students")
            .find({ mentor_id: null })
            .project({_id: 0})
            .toArray();
        res.status(200).json({
            message: "list of students without a mentor",
            result,
        });
        client.close();
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

app.post("/create-mentor", async (req, res) => {
    try {
        let client = await mongoClient.connect(dbURL);
        let db = client.db("mentor_assign_db");
        let result = db.collection("mentors").insertOne(req.body);
        res.status(200).json({ message: "mentor created" });
        client.close();
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

app.post("/create-student", async (req, res) => {
    try {
        let client = await mongoClient.connect(dbURL);
        let db = client.db("mentor_assign_db");
        let result = db.collection("students").insertOne(req.body);
        res.status(200).json({ message: "student created" });
        client.close();
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

app.put("/assign-mentor", async (req, res) => {
    try {
        let client = await mongoClient.connect(dbURL);
        let db = client.db("mentor_assign_db");
        await db
            .collection("students")
            .updateMany(
                { student_id: { $in: req.body.students_id } },
                { $set: { mentor_id: req.body.mentor_id } }
            );
        let result = await db
            .collection("students")
            .find({ student_id: { $in: req.body.students_id } })
            .toArray();
        res.status(200).json({ message: "mentor assigned", result });
        client.close();
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

app.put("/assign-student", async (req, res) => {
    try {
        let client = await mongoClient.connect(dbURL);
        let db = client.db("mentor_assign_db");
        let result = await db
            .collection("students")
            .findOneAndUpdate(
                { student_id: req.body.student_id },
                { $set: { mentor_id: req.body.mentor_id } }
            );
        res.status(200).json({
            message: "mentor assigned or changed to a particular student",
            result,
        });
        client.close();
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

app.listen(port, () => console.log(port));
