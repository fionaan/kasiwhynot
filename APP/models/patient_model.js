const mongoose = require('mongoose')

const Schema = mongoose.Schema

//Base Schema
const baseSchema = new Schema({
    basicInfo: {
        firstName: {type: String, required: true},
        middleName: {type: String, required: false},
        lastName: {type: String, required: true},
        emailAddress: {type: String, required: true, match: /^[^\s@]+@[^\s@]+.[^\s@]+$/}, //match uses a regular expression to validate that the provided value follows a simple email format. This regular expression checks for the presence of @ and . in the email address.
        dateOfBirth: {type: Date, required: true},
        age: {type: Number, required: true}, //should be automatic based on date of birth and current date next time
        gender: {type: String, required: true},
        campus:{type: String, required: true},
        homeAddress: {type: String, required: true},
        contactNo: {type: Number, required: true},
        nationality: {type: String, required: true},
        religion: {type: String, required: true},
        bloodType: {type: String, required: true},
        civilStatus: {type: String, required: true},
        height: {type: Number, required: true},
        weight: {type: Number, required: true},
        bmi: {type: Number, required: true},
        guardianName: {type: String, required: true},
        guardianContactNo: {type: Number, required: true},
        guardianRelationship: {type: String, required: true},
        attachment: {type: String, required: true} //temporarily a string
    },

    laboratory: {
        chestXray: {
            findings: {type: String, required: false},
            date: {type: Date, required: true}
        },
        cbc: {
            findings: {type: String, required: true},
            date: {type: Date, required: true}
        },
        hepatitisProfile: {
            hbsag: {type: String, required: true},
            antiHbs: {type: String, required: true},
            antiHbcIgg: {type: String, required: true},
            antiHbcIgm: {type: String, required: true},
        },
        drugTest: {
            methamphethamineResults: {type: String, required: false},
            methamphethamineRemarks: {type: String, required: false},
            tetrahydrocannabinolResults: {type: String, required: false},
            tetrahydrocannabinolRemarks: {type: String, required: false},
        },
        urinalysis: {
            color: {type: String, required: true},
            transparency: {type: String, required: true},
            blood: {type: String, required: true},
            bilirubin: {type: String, required: true},
            urobilinogen: {type: String, required: true},
            ketones: {type: String, required: true},
            glutones: {type: String, required: true},
            protein: {type: String, required: true},
            nitrite: {type: String, required: true},
            leukocyte: {type: String, required: true},
            phLevel: {type: Number, required: true},
            spGravity: {type: String, required: true},
            wbc: {type: String, required: true},
            rbc: {type: String, required: true},
            bacteria: {type: String, required: true},
            epithelialCells: {type: String, required: true},
            amorphousUrates: {type: String, required: true},
            mucusThreads: {type: String, required: true}
        },
        fecalysis: {
            color: {type: String, required: true},
            consistency: {type: String, required: true},
            wbc: {type: String, required: true},
            rbc: {type: String, required: true},
            fatGlobules: {type: String, required: true},
            muscleFibers: {type: String, required: true},
            results: {type: String, required: true}
        },
        others: {
            pregnancyTest: {type: String, required: true}
        },
        attachments: {type: String, required: true}
    },
    vaccination: {
        covidVaccination: {
            firstDose: {type: String, required: true},
            dateGiven: {type: Date, required: true}
        },
        fluVaccination: {
            firstDose: {type: String, required: true},
            dateGiven: {type: Date, required: true}
        },
        hepatitisBVaccination: {
            firstDose: {type: String, required: true},
            dateGiven: {type: Date, required: true}
        },
        pneumoniaVaccination: {
            firstDose: {type: String, required: true},
            dateGiven: {type: Date, required: true}
        },
        attachments: {type: String, required: true}
    },
    medicalHistory: {
        tattoo: {type: Boolean, required: true, default: false},
        bloodPressure: {
            systolic: {type: Number, required: true},
            diastolic: {type: Number, required: true}
        },
        conditions: {
            anemia: {type: Boolean, required: true, default: false},
            asthma: {type: Boolean, required: true, default: false},
            blackJointProblem: {type: Boolean, required: true, default: false},
            heartDiseases: {type: Boolean, required: true, default: false},
            hepatitis: {type: Boolean, required: true, default: false},
            highBloodPressure: {type: Boolean, required: true, default: false},
            kidneyProblem: {type: Boolean, required: true, default: false},
            chronicDiseases: {type: Boolean, required: true, default: false},
            thyroidProblems: {type: Boolean, required: true, default: false},
            bloodDyscrasia: {type: Boolean, required: true, default: false},
            others: {type: Boolean, required: true, default: false}
        },
        q1: {
            yesOrNo: {type: Boolean, required: true, default: false},
            doctorName: {type: String, required: true},
            phone: {type: Number, required: true},
            homeAddress: {type: String, required: true},
            forWhatCondition: {type: String, required: true}
        },
        q2: {
            yesOrNo: {type: Boolean, required: true, default: false},
            pastIllnessSurgery: {type: String, required: true}
        },
        q3: {
            yesOrNo: {type: Boolean, required: true, default: false},
            drugFoodAllergies: {type: String, required: true}
        },
        q4: {
            yesOrNo: {type: Boolean, required: true, default: false},
            nameOfMedication: {type: String, required: true},
            type: {type: String, required: true},
            brand: {type: String, required: true},
            others: {type: String, required: true},
        },
        q5: {
            yesOrNo: {type: Boolean, required: true, default: false},
            physicalLearningDisability: {type: String, required: true},
        },
        attachments: {type: String, required: true}
    },
    dentalRecords: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DentalRecord' }]
 })

// Student Schema
const studentSchema = new mongoose.Schema({
    studentNo: {type: String, required: true},
    course: {type: String, required: true},
    year: {type: String, required: true},
    section: {type: String, required: true},
    details: {
        type: mongoose.ObjectId,
        ref: "BasePatients"
    }
})
//Employee Schema
const employeeSchema = new mongoose.Schema({
    employeeNo: {type: String, required: true},
    department: {type: String, required: true},
    details: {
        type: mongoose.ObjectId,
        ref: "BasePatients"
    }
})

const BaseModel = mongoose.model('BasePatients', baseSchema)

const Student = mongoose.model('Students',studentSchema)

const Employee = mongoose.model('Employees', employeeSchema)


module.exports = {Student, Employee, BaseModel};