const mongoose = require('mongoose')

const Schema = mongoose.Schema

//Base Schema
const baseSchema = new Schema({
    basicInfo: {
        campus: {type: String, required: true},
        firstName: { type: String, required: true },
        middleName: { type: String, required: false },
        lastName: { type: String, required: true },
        emailAddress: {type: String, required: true, match: /^\S+@\S+\.\S+$/}, //match uses a regular expression to validate that the provided value follows a simple email format. This regular expression checks for the presence of @ and . in the email address.
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
    dentalRecord: {
        q1: {type: [String], required: true, default: [""]},
        q2: {type: Date, required: true, default: Date.now},
        q3: {type: String, required: true, default: ""},
        q4: {
            hasDentures: {type: Boolean, required: true, default: false},
            dentureType: {type: String, required: function() {return this.hasDentures}, default: ""},
        },
        q5: {
            hasDentalProcedure: {type: Boolean, required: true, default: false},
            pastDentalSurgery: [{
                name: {type: String, required: function() {return this.hasDentalProcedure}, default: ""},
                date: {type: Date, required: function() {return this.hasDentalProcedure}, default: Date.now}
            }]
        },
        q6: {
            55: {type: [String], required: false, default: [""]},	
            54: {type: [String], required: false, default: [""]},	
            53: {type: [String], required: false, default: [""]},	
            52: {type: [String], required: false, default: [""]},	
            51: {type: [String], required: false, default: [""]},	
            61: {type: [String], required: false, default: [""]},	
            62: {type: [String], required: false, default: [""]},	
            63: {type: [String], required: false, default: [""]},	
            64: {type: [String], required: false, default: [""]},	
            65: {type: [String], required: false, default: [""]},	
            18: {type: [String], required: false, default: [""]},	
            17: {type: [String], required: false, default: [""]},	
            16: {type: [String], required: false, default: [""]},	
            15: {type: [String], required: false, default: [""]},	
            14: {type: [String], required: false, default: [""]},	
            13: {type: [String], required: false, default: [""]},	
            12: {type: [String], required: false, default: [""]},	
            11: {type: [String], required: false, default: [""]},	
            21: {type: [String], required: false, default: [""]},	
            22: {type: [String], required: false, default: [""]},	
            23: {type: [String], required: false, default: [""]},	
            24: {type: [String], required: false, default: [""]},	
            25: {type: [String], required: false, default: [""]},	
            26: {type: [String], required: false, default: [""]},	
            27: {type: [String], required: false, default: [""]},	
            28: {type: [String], required: false, default: [""]},	
            48: {type: [String], required: false, default: [""]},	
            47: {type: [String], required: false, default: [""]},	
            46: {type: [String], required: false, default: [""]},	
            45: {type: [String], required: false, default: [""]},	
            44: {type: [String], required: false, default: [""]},	
            43: {type: [String], required: false, default: [""]},	
            42: {type: [String], required: false, default: [""]},	
            41: {type: [String], required: false, default: [""]},	
            31: {type: [String], required: false, default: [""]},	
            32: {type: [String], required: false, default: [""]},	
            33: {type: [String], required: false, default: [""]},	
            34: {type: [String], required: false, default: [""]},	
            35: {type: [String], required: false, default: [""]},	
            36: {type: [String], required: false, default: [""]},	
            37: {type: [String], required: false, default: [""]},	
            38: {type: [String], required: false, default: [""]},	
            85: {type: [String], required: false, default: [""]},	
            84: {type: [String], required: false, default: [""]},	
            83: {type: [String], required: false, default: [""]},	
            82: {type: [String], required: false, default: [""]},	
            81: {type: [String], required: false, default: [""]},	
            71: {type: [String], required: false, default: [""]},	
            72: {type: [String], required: false, default: [""]},	
            73: {type: [String], required: false, default: [""]},	
            74: {type: [String], required: false, default: [""]},	
            75: {type: [String], required: false, default: [""]}
            
        },
        q7: {
            presenceOfDebris: {type: Boolean, required: true, default: false},
            presenceOfToothStain: {type: Boolean, required: true, default: false},
            presenceOfGingivitis: {type: Boolean, required: true, default: false},
            presenceOfPeriodontalPocket: {type: Boolean, required: true, default: false},
            presenceOfOralBiofilm: {type: Boolean, required: true, default: false},
            underOrthodonticTreatment: {
                hasTreatment: {type: Boolean, required: true, default: false},
                date: {type: Date, required: function() {return this.hasTreatment}, default: Date.now} 
            }
        },
        q8: {
            numTeethPresent: {
                temporary: {type: Number, required: true, default: 0}, 
                permanent: {type: Number, required: true, default: 0}
            }, 
            numCariesFreeTeeth: {
                temporary: {type: Number, required: true, default: 0}, 
                permanent: {type: Number, required: true, default: 0}
            }, 
            numTeethforFilling: {
                temporary: {type: Number, required: true, default: 0}, 
                permanent: {type: Number, required: true, default: 0}
            }, 
            numTeethforExtraction: {
                temporary: {type: Number, required: true, default: 0}, 
                permanent: {type: Number, required: true, default: 0}
            }, 
            totalNumDecayedTeeth: {
                temporary: {type: Number, required: true, default: 0}, 
                permanent: {type: Number, required: true, default: 0}
            }, 
            numFilledTeeth: {
                temporary: {type: Number, required: true, default: 0}, 
                permanent: {type: Number, required: true, default: 0}
            }, 
            numMissingTeeth: {
                temporary: {type: Number, required: true, default: 0}, 
                permanent: {type: Number, required: true, default: 0}
            }, 
            numUneruptedTeeth: {
                temporary: {type: Number, required: true, default: 0}, 
                permanent: {type: Number, required: true, default: 0}
            }
        },
        q9: {
            hasDentofacialAb: {type: Boolean, required: true, default: false},
            name: {type: [String], required: function() {return this.hasDentofacialAb}, default: ""}
        },
        q10: {
            needUpperDenture: {type: Number, required: true, default: 0},
            needLowerDenture: {type: Number, required: true, default: 0}
        },
        notes: {type: String, required: false, default: ""},
        attachments: [
            {
                filename: {type: String, required: false, default: ""},
                urlLink: {type: String, required: false, default: ""}
            }
        ]
    }
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

module.exports = {Student, Employee, BaseModel}