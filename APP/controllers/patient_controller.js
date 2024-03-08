const mongoose = require('mongoose')
const { BaseModel, Student, Employee } = require('../models/patient_model')
const utilFunc = require('../../utils')

const updateRecord = async (req, res) => {
    const { patientId, updatedData } = req.body;

    try {
        // Update the BasePatient document
        const updatedBasePatient = await BaseModel.findByIdAndUpdate(patientId, updatedData.basicInfo, { new: true });

        if (!updatedBasePatient) {
            return res.status(404).json({
                successful: false,
                message: 'Patient not found',
            });
        }

        // Update other related documents based on the category
        if (updatedBasePatient.category === 'students') {
            // Find and update the Student document
            const updatedStudent = await Student.findOneAndUpdate({ details: patientId }, updatedData.exclusiveData, { new: true });

            if (!updatedStudent) {
                return res.status(404).json({
                    successful: false,
                    message: 'Student not found',
                });
            }
        } else if (updatedBasePatient.category === 'employees') {
            // Find and update the Employee document
            const updatedEmployee = await Employee.findOneAndUpdate({ details: patientId }, updatedData.exclusiveData, { new: true });

            if (!updatedEmployee) {
                return res.status(404).json({
                    successful: false,
                    message: 'Employee not found',
                });
            }
        }

        // Send a success response
        res.json({
            successful: true,
            message: 'Patient data updated successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            successful: false,
            message: 'Error updating patient data',
            error: error.message,
        });
    }
};

const archivePatient = async (req, res) => {
    const patientId = req.params.id;

    try {
        // Check if the patient is already archived
        const patient = await BaseModel.findById(patientId);

        if (!patient) {
            return res.status(404).json({
                successful: false,
                message: 'Patient not found',
            });
        }

        if (patient.archived) {
            return res.status(400).json({
                successful: false,
                message: 'Patient is already archived',
            });
        }

        // Archive the patient
        patient.archived = true;
        patient.archivedDate = new Date();
        await patient.save();

        res.json({
            successful: true,
            message: 'Patient archived successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            successful: false,
            message: 'Error archiving patient',
            error: error.message,
        });
    }
};

const unarchivePatient = async (req, res) => {
    const patientId = req.params.id;

    try {
        // Check if the patient is archived
        const patient = await BaseModel.findById(patientId);

        if (!patient) {
            return res.status(404).json({
                successful: false,
                message: 'Patient not found',
            });
        }

        if (!patient.archived) {
            return res.status(400).json({
                successful: false,
                message: 'Patient is not archived',
            });
        }

        // Unarchive the patient
        patient.archived = false;
        patient.archivedDate = null;
        await patient.save();

        res.json({
            successful: true,
            message: 'Patient unarchived successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            successful: false,
            message: 'Error unarchiving patient',
            error: error.message,
        });
    }
};

module.exports = {
    getPatientList,
    getPatient,
    searchPatientList,
    addRecord,
    updateRecord,
    archivePatient,
    unarchivePatient
}
