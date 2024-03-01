const { Student, Employee, BaseModel } = require('../models/patient_model');

const addRecord = async (req, res) => {

    const { basicInfo, laboratory, vaccination, medicalHistory, dentalRecords, exclusiveData, category } = req.body;

    // Create a new BasePatient document
    const basePatient = new BaseModel({
      basicInfo,
      laboratory,
      vaccination,
      medicalHistory,
      dentalRecords,
    });
  
    // Save the BasePatient document
    basePatient.save()
      .then(savedBasePatient => {
        if (category === 'students') {
          // If the category is a student, create a new Student document
          const studentData = { ...exclusiveData, details: savedBasePatient._id };
          const student = new Student(studentData);
  
          // Save the Student document
          return student.save();
        } else if (category === 'employees') {
          // If the category is an employee, create a new Employee document
          const employeeData = { ...exclusiveData, details: savedBasePatient._id };
          const employee = new Employee(employeeData);
  
          // Save the Employee document
          return employee.save();
        } else {
          // Handle other categories as needed
          return Promise.resolve();
        }
      })
      .then(() => {
        res.json({
          successful: true,
          message: 'Patient data added successfully',
        });
      })
      .catch(error => {
        console.error(error);
        res.status(500).json({
          successful: false,
          message: 'Error adding patient data',
          error: error.message,
        });
      });
  }


module.exports = { addRecord };
