const Student = require('../models/patient_model').Student;

const addStudent = (req, res, next) => {
    const { basicInfo } = req.body;

    const student = new Student({
        basicInfo: {
            firstName: basicInfo.firstName,
            middleName: basicInfo.middleName,
            lastName: basicInfo.lastName,
            emailAddress: basicInfo.emailAddress,
            dateOfBirth: basicInfo.dateOfBirth,
            age: basicInfo.age,
            gender: basicInfo.gender,
            homeAddress: basicInfo.homeAddress,
        },
        // Add other properties as needed
    });

    student.save()
        .then((result) => {
            res.status(200).send({
                successful: true,
                message: `Successfully added new student. ${basicInfo.first_name} ${basicInfo.last_name}`,
                id: result._id,
            });
        })
        .catch((error) => {
            res.status(500).send({
                successful: false,
                message: error.message,
            });
        });
};

const getAllStudents = async (req, res, next) => {
    try {
        let students = await Student.find();
        if (students.length === 0) {
            res.status(404).send({
                successful: false,
                message: "No students found",
            });
        } else {
            res.status(200).send({
                successful: true,
                message: "Retrieved all students.",
                count: students.length,
                data: students,
            });
        }
    } catch (err) {
        res.status(500).send({
            successful: false,
            message: err.message,
        });
    }
};

const filterStudents = async (req, res, next) => {
    try {
        let students = await Student.find({
            $and: [
                {
                    'basicInfo.firstName': {
                        $regex: req.query.first_name,
                        $options: 'i',
                    },
                },
                {
                    $and: [
                        {
                            'basicInfo.age': { $gte: req.query.lowerage },
                        },
                        {
                            'basicInfo.age': { $lte: req.query.higherage },
                        },
                    ],
                },
            ],
        });

        if (students.length === 0) {
            res.status(404).send({
                successful: false,
                message: "No students found",
            });
        } else {
            res.status(200).send({
                successful: true,
                message: "Successfully retrieved the student.",
                data: students,
            });
        }
    } catch (err) {
        res.status(500).send({
            successful: false,
            message: err.message,
        });
    }
};

const deleteStudent = async (req, res, next) => {
    try {
        let result = await Student.deleteOne({ _id: req.params.id });

        if (result.deletedCount === 1) {
            res.status(200).send({
                successful: true,
                message: "Successfully deleted student.",
            });
        } else {
            res.status(400).send({
                successful: false,
                message: "Student does not exist",
            });
        }
    } catch (err) {
        res.status(500).send({
            successful: false,
            message: err.message,
        });
    }
};

const updateStudent = async (req, res, next) => {
    try {
        let student = await Student.findOne({ _id: req.params.id });

        if (student === null) {
            res.status(404).send({
                successful: false,
                message: "Student does not exist",
            });
        } else {
            student.basicInfo.address = {
                street_name: req.body.street_name,
                brgy_name: req.body.brgy_name,
                city: req.body.city,
                region: req.body.region,
            };

            student.save()
                .then((result) => {
                    res.status(200).send({
                        successful: true,
                        message: "Successfully updated student.",
                    });
                })
                .catch((err) => {
                    res.status(500).send({
                        successful: false,
                        message: err.message,
                    });
                });
        }
    } catch (err) {
        res.status(500).send({
            successful: false,
            message: err.message,
        });
    }
};

module.exports = {
    addStudent,
    getAllStudents,
    filterStudents,
    deleteStudent,
    updateStudent,
};
