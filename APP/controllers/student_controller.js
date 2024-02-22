const Student = require('../models/student_model')
//bago
//another one
//another two
const addStudent = (req, res, next)=>{
    const {first_name, last_name, age, gender, address, subject} = req.body

    let student = new Student ({
        first_name: first_name,
        last_name: last_name,
        age: age,
        gender: gender,
        address: address,
        subject: []
    })

    student.save()
    .then((result)=>{
        res.status(200).send({
            successful: true,
            message: `Successfully added new student. ${first_name} ${last_name}`,
            id: result._id
        })
    })
    .catch((error)=>{
        res.status(500).send({
            successful: false,
            message: error.message
        })
    })

    
}

const getAllStudents = async(req,res,next)=>{
    try{
        let student = await Student.find()
        if (student === ""){
            res.status(404).send({
                successful: false,
                message: "No students found"
            })
        }
        else {
            res.status(200).send({
                successful: true,
                message: "Retrieved all students.",
                count: student.length,
                data: student
            })
        }
    }
    catch(err){
        res.status(500).send({
            successful: false,
            message: err.message
        })
    }
}
const filterStudents = async (req, res, next)=>{
    try {
        // let student = await Student.find().where("age").gt(req.query.age)
        let student = await Student.find({
            $and:
            [
                {
                    first_name: {$regex: req.query.first_name, $options: "i"}
                },
                {
                    $and: [
                        {
                            age: {$gte: req.query.lowerage}
                        },
                        {
                            age: {$lte: req.query.higherage}
                        }
                    ]
                }
            ]
        })
        
        if (student === ""){
            res.status(404).send({
                successful: false,
                message: "No students found"
            })
        }
        else {
            res.status(200).send({
                successful: true,
                message: "Successfully retrieved the student.",
                data: student
            })
        }
    }

    catch(err){
        res.status(500).send({
            successful: false,
            message: err.message
        })   
    }
}
//test
const deleteStudent = async(req,res,next)=>{
    try{
        let result = await Student.deleteOne({_id: req.params.id})

        if (result.deletedCount == 1){
            res.status(200).send({
                successful: true,
                message: "Successfully deleted student."
            })
        }
        else {
            res.status(400).send({
                succesful: false,
                message: "Student does not exist"
            })
        }
    }
    catch(err){
        res.status(500).send({
            successful: false,
            message: err.message
        })   
    }
}

const updateStudent = async(req, res, next)=>{
    try {
        let student = await Student.findOne({ _id: req.params.id})

        if(student === null) {
            res.status(404).send({
                successful: false,
                message: "Student does not exist"
            })
        }

        else {
            student.address = {
                street_name: req.body.street_name,
                brgy_name: req.body.brgy_name,
                city: req.body.city,
                region: req.body.region
            }
            student.save()
            .then((result)=>{
                res.status(200).send({
                    successful: true,
                    message: "Successfully updated student."
                })
            })
            .catch((err)=>{
                res.status(500).send({
                    successful: false,
                    message: err.message
                })   
            })   
        }
    }
    
    catch(err){
        res.status(500).send({
            successful: false,
            message: err.message
        })   
    }
}

module.exports = {
    addStudent,
    getAllStudents,
    filterStudents,
    deleteStudent,
    updateStudent
}

//hello world