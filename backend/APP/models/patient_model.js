const mongoose = require('mongoose')
const validator = require('validator')
const utils = require('../../utils')

const Schema = mongoose.Schema

// FOR ATTACHMENTS
function generateAttachments(name) {
    return { // optional -- multiple
        required: [true, `(${name}) Attachments field is required`],
        default: undefined,
        type: [ // Need index here
            {
                filename: {  // *
                    type: String,
                    required: [true, `(${name}) Filename is required`],
                    trim: true,
                    index: {
                        unique: true,
                        partialFilterExpression: { filename: { $type: "string" } }
                    },
                    // minlength: [5, `(${name}) Filename must contain at least 5 characters or more`],
                    maxlength: [255, `(${name}) Filename exceeded 255 character limit (255)`]
                },
                urlLink: { // *
                    type: String,
                    required: [true, `(${name}) URL Link is required`],
                    trim: true,
                    // minlength: [5, `(${name}) URL Link must contain at least 5 characters or more`],
                }
            }
        ]
    }
}

// FOR URINALYSIS
function generateUrinFecFields(name) {
    return {
        type: String,
        required: [true, `${name} is required`],
        trim: true,
        // minlength: [1, `Entered text for ${name} is too short (1)`],
        maxlength: [255, `Maximum text entered for ${name} reached (255)`],
        match: [utils.textOpRegex, `${name} can only contain letters and a few common symbols`]
    };
}

// FOR VACCINATIONS
function generateVaccFields(name) {
    return {
        required: [true, `${name} Vaccination field is required`],
        default: undefined,
        type: [
            {
                dose: {
                    type: String,
                    required: [true, `(${name} Vaccination) Dose is required`],
                    trim: true,
                    maxlength: [255, `Maximum text entered for (${name} Vaccination) Dose reached (255)`]
                },
                dateGiven: {
                    type: Date,
                    required: [true, `(${name} Vaccination) Date is required`],
                    min: [new Date('1969-12-31T00:00:00Z'), `(${name} Vaccination) Date must be later than approximately (January 1, 1970)`],
                    max: [new Date(), `(${name} Vaccination) Date exceeds the current date`]
                }
            }],
        validate: {
            validator: function (arr) {
                return (arr.length !== 0)
            },
            message: `At least 1 ${name} Vaccine record is required`
        }
    };
}

// FOR MEDICAL HISTORY CONDITIONS
function generateConditionFields(condition) {
    return {
        type: Boolean,
        required: [true, `(Medical History) ${condition} value is required`]
    }
}

// FOR HEPA-B PROFILE
function generateHepaBFields(variant) {
    return { // *
        type: String,
        required: [true, `${variant} is required`],
        trim: true,
        enum: {
            values: ["Normal", "High", "Low", "N?"],
            message: `Invalid ${variant} result`
        }
    }
}

// FOR (DENTAL RECORD) Q6 SCHEMA
function generateQ6Fields(fieldNumbers) {
    const fields = {}
    fieldNumbers.forEach(num => {
        fields[num] = {
            type: [String],
            required: [true, `(Dental Record) #${num} tooth value is required`],
            default: undefined,
            validate: {
                validator: function (arr) {
                    return arr.every(str => { utils.q6Values.includes(str) })
                },
                message: `Invalid #${num} Odotongram value`
            }
        }
    })
    return fields
}

const fieldNumbers = [
    55, 54, 53, 52, 51, 61, 62, 63, 64, 65, 18, 17, 16, 15, 14, 13, 12, 11,
    21, 22, 23, 24, 25, 26, 27, 28, 48, 47, 46, 45, 44, 43, 42, 41, 31, 32,
    33, 34, 35, 36, 37, 38, 85, 84, 83, 82, 81, 71, 72, 73, 74, 75
]

const q6SchemaDefinition = generateQ6Fields(fieldNumbers)
// FOR (DENTAL RECORD) Q7 SCHEMA
function generateQ7Field(fieldName) {
    return {
        type: Boolean,
        required: [true, `(Dental Record) Q7 ${fieldName} value is required`]
    }
}

// FOR (DENTAL RECORD) Q8 SCHEMA
function generateQ8Field(title) {
    return {
        temporary: {
            type: Number,
            required: [true, `(Dental Record) Q8 ${title} (temporary) value is required`],
            min: [0, `(Dental Record) Q8 ${title} (temporary) value must be >= 0`],
            max: [50, `(Dental Record) Q8 ${title} (temporary) value must be <= 50`]
        },
        permanent: {
            type: Number,
            required: [true, `(Dental Record) Q8 ${title} (permanent) value is required`],
            min: [0, `(Dental Record) Q8 ${title} (permanent) value must be >= 0`],
            max: [50, `(Dental Record) Q8 ${title} (permanent) value must be <= 50`]
        }
    }
}

//Base Schema
const baseSchema = new Schema({
    basicInfo: {
        fullName: {
            firstName: { // *
                type: String,
                required: [true, "Firstname is required"],
                trim: true,
                // minlength: [2, "Firstname must contain at least 2 characters"],
                maxlength: [255, "Firstname must only contain 255 characters or fewer"],
                match: [utils.textRegex, "Firstname can only contain letters and a few common symbols"]
            },
            middleName: { // optional
                type: String,
                required: [true, "Middlename is required or put N/A"],
                trim: true,
                // minlength: [2, "Middlename must contain at least 2 characters"], // -- TEST if works when null & if need match
                maxlength: [255, "Middlename must only contain 255 characters or fewer"],
                match: [utils.textOpRegex, "Middlename can only contain letters and a few common symbols"]
            },
            lastName: { // *
                type: String,
                required: [true, "Lastname is required"],
                trim: true,
                // minlength: [2, "Lastname must contain at least 2 characters"],
                maxlength: [255, "Lastname must only contain 255 characters or fewer"],
                match: [utils.textRegex, "Lastname can only contain letters and a few common symbols"]
            },
        },
        emailAddress: { // *
            type: String,
            required: [true, 'Email address is required'],
            trim: true,
            match: [utils.emailRegex, "Invalid email format"]
        },
        dateOfBirth: { // *
            type: Date,
            required: [true, "Birthdate is required"],
            min: [new Date('1969-12-31T00:00:00Z'), "Birthdate must be later than approximately (January 1, 1970)"],
            max: [new Date().setFullYear(new Date().getFullYear() - 15), "Date of birth precedes expected range (Minimum of 15 year difference from current date)"] // Checks if bdate is > current date - 15 years
        },
        age: { // *
            type: Number,
            required: [true, 'Age is required'],
            min: [10, "Age must be at least 10 years or older"],
            max: [99, "Age must be 99 yrs. or below only"]
        }, //should be automatic based on date of birth and current date next time
        gender: { // *
            type: String,
            required: [true, 'Gender is required'],
            trim: true,
            enum: {
                values: ['Male', 'Female'],
                message: 'Invalid gender'
            }
        },
        campus: { // *
            type: String,
            required: [true, 'Campus is required'],
            trim: true,
            enum: {
                values: ['LV', 'GP', 'LV/GP'],
                message: 'Invalid campus'
            }
        },
        homeAddress: { // *
            type: String,
            required: [true, 'Home address is required'],
            trim: true,
            // minlength: [20, "Home address must contain at least 20 characters"],
            maxlength: [255, "Home address must only contain 255 characters or fewer"],
            match: [utils.aNSRegex, "Home address must contain letter/s"]
        },
        contactNo: { // *
            type: String,
            required: [true, 'Contact number is required'],
            trim: true,
            validate: {
                validator: function (value) {
                    return /^09\d{9}$/.test(value) || /^639\d{9}$/.test(value)
                },
                message: "{VALUE} is an invalid contact number"
            }
        },
        nationality: { // *
            type: String,
            required: [true, 'Nationality is required'],
            trim: true,
            enum: {
                values: [
                    'Afghan', 'Albanian', 'Algerian', 'American', 'Andorran', 'Angolan', 'Anguillan', 'Argentine', 'Armenian', 'Australian',
                    'Austrian', 'Azerbaijani', 'Bahamian', 'Bahraini', 'Bangladeshi', 'Barbadian', 'Belarusian', 'Belgian', 'Belizean',
                    'Beninese', 'Bermudian', 'Bhutanese', 'Bolivian', 'Botswanan', 'Brazilian', 'British', 'British Virgin Islander', 'Bruneian',
                    'Bulgarian', 'Burkinan', 'Burmese', 'Burundian', 'Cambodian', 'Cameroonian', 'Canadian', 'Cape Verdean', 'Cayman Islander',
                    'Central African', 'Chadian', 'Chilean', 'Chinese', 'Citizen of Antigua and Barbuda', 'Citizen of Bosnia and Herzegovina',
                    'Citizen of Guinea-Bissau', 'Citizen of Kiribati', 'Citizen of Seychelles', 'Citizen of the Dominican Republic', 'Citizen of Vanuatu',
                    'Colombian', 'Comoran', 'Congolese (Congo)', 'Congolese (DRC)', 'Cook Islander', 'Costa Rican', 'Croatian', 'Cuban', 'Cymraes',
                    'Cymro', 'Cypriot', 'Czech', 'Danish', 'Djiboutian', 'Dominican', 'Dutch', 'East Timorese', 'Ecuadorean', 'Egyptian', 'Emirati',
                    'English', 'Equatorial Guinean', 'Eritrean', 'Estonian', 'Ethiopian', 'Faroese', 'Fijian', 'Filipino', 'Finnish', 'French', 'Gabonese',
                    'Gambian', 'Georgian', 'German', 'Ghanaian', 'Gibraltarian', 'Greek', 'Greenlandic', 'Grenadian', 'Guamanian', 'Guatemalan', 'Guinean',
                    'Guyanese', 'Haitian', 'Honduran', 'Hong Konger', 'Hungarian', 'Icelandic', 'Indian', 'Indonesian', 'Iranian', 'Iraqi', 'Irish', 'Israeli',
                    'Italian', 'Ivorian', 'Jamaican', 'Japanese', 'Jordanian', 'Kazakh', 'Kenyan', 'Kittitian', 'Kosovan', 'Kuwaiti', 'Kyrgyz', 'Lao', 'Latvian',
                    'Lebanese', 'Liberian', 'Libyan', 'Liechtenstein citizen', 'Lithuanian', 'Luxembourger', 'Macanese', 'Macedonian', 'Malagasy', 'Malawian',
                    'Malaysian', 'Maldivian', 'Malian', 'Maltese', 'Marshallese', 'Martiniquais', 'Mauritanian', 'Mauritian', 'Mexican', 'Micronesian', 'Moldovan',
                    'Monegasque', 'Mongolian', 'Montenegrin', 'Montserratian', 'Moroccan', 'Mosotho', 'Mozambican', 'Namibian', 'Nauruan', 'Nepalese', 'New Zealander',
                    'Nicaraguan', 'Nigerian', 'Nigerien', 'Niuean', 'North Korean', 'Northern Irish', 'Norwegian', 'Omani', 'Pakistani', 'Palauan', 'Palestinian',
                    'Panamanian', 'Papua New Guinean', 'Paraguayan', 'Peruvian', 'Pitcairn Islander', 'Polish', 'Portuguese', 'Prydeinig', 'Puerto Rican', 'Qatari',
                    'Romanian', 'Russian', 'Rwandan', 'Salvadorean', 'Sammarinese', 'Samoan', 'Sao Tomean', 'Saudi Arabian', 'Scottish', 'Senegalese', 'Serbian',
                    'Sierra Leonean', 'Singaporean', 'Slovak', 'Slovenian', 'Solomon Islander', 'Somali', 'South African', 'South Korean', 'South Sudanese', 'Spanish',
                    'Sri Lankan', 'St Helenian', 'St Lucian', 'Stateless', 'Sudanese', 'Surinamese', 'Swazi', 'Swedish', 'Swiss', 'Syrian', 'Taiwanese', 'Tajik',
                    'Tanzanian', 'Thai', 'Togolese', 'Tongan', 'Trinidadian', 'Tristanian', 'Tunisian', 'Turkish', 'Turkmen', 'Turks and Caicos Islander', 'Tuvaluan',
                    'Ugandan', 'Ukrainian', 'Uruguayan', 'Uzbek', 'Vatican citizen', 'Venezuelan', 'Vietnamese', 'Vincentian', 'Wallisian', 'Welsh', 'Yemeni', 'Zambian',
                    'Zimbabwean'
                ],
                message: 'Nationality is not recognized'
            },
        },
        religion: { // *
            type: String,
            required: [true, 'Religion is required'],
            trim: true,
            match: [utils.textRegex, 'Religion can only contain letters and a few common symbols']
        },
        bloodType: { // *
            type: String,
            required: [true, 'Bloodtype is required'],
            trim: true,
            enum: {
                values: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
                message: "Invalid bloodtype"
            }
        },
        civilStatus: { // *
            type: String,
            required: [true, 'Civil Status is required'],
            trim: true,
            enum: {
                values: ["Single", "Married", "Divorced", "Separated", "Widowed"],
                message: "Invalid civil status"
            }
        },
        height: { // in centimeter (cm) *
            type: Number,
            required: [true, 'Height is required'],
            min: [1, "Height value must be at least 1 centimeter or above"],
            max: [200, "Height value must not exceed 200 centimeters (cm)"]
        },
        weight: { // in kilogram (kg) *
            type: Number,
            required: [true, 'Weight is required'],
            min: [1, "Weight value must be at least 1 kilogram or above"],
            max: [499, "Weight value must not exceed 499 kilograms (kg)"]
        },
        bmi: { // *
            type: Number,
            required: [true, 'BMI is required'],
            min: [1, "BMI value must be at least 1 or above"],
            max: [50, "BMI value must not exceed 50"]
        },
        guardianName: { // *
            type: String,
            required: [true, 'Guardian name is required'],
            trim: true,
            // minlength: [2, "Guardian name must contain at least 2 characters"],
            maxlength: [255, "Guardian name must only contain 255 characters or fewer"],
            match: [utils.textRegex, "Guardian name can only contain letters and a few common symbols"]
        },
        guardianContactNo: { // *
            type: String,
            required: [true, 'Guardian contact no. is required'],
            trim: true,
            validate: {
                validator: function (value) {
                    return /^09\d{9}$/.test(value) || /^639\d{9}$/.test(value)
                },
                message: "{VALUE} is an invalid contact number (use 639- or 09XXXXXXXXX format)"
            }
        },
        guardianRelationship: { // *
            type: String,
            required: [true, 'Guardian relationship is required'],
            trim: true,
            match: [/^(?![\s'-])[a-zA-Z0-9\s'-]+$/, 'Guardian relationship can only contain alphanumeric and a few common symbols']
        },
        attachments: generateAttachments('Basic Info')
    },

    laboratory: {
        chestXray: { // single
            findings: { // *
                type: String,
                required: [true, '(Chest Xray) Findings is required'],
                trim: true,
                // minlength: [5, 'Entered text for (Chest Xray) Findings is too short (5)'],
                maxlength: [255, 'Maximum text entered for (Chest Xray) Findings reached (255)']
            },
            date: { // *
                type: Date,
                required: [true, "(Chest Xray) Date is required"],
                min: [new Date('1969-12-31T00:00:00Z'), "(Chest Xray) Date must be later than approximately (January 1, 1970)"],
                max: [new Date(), "(Chest Xray) Date exceeds the current date"]
            }
        },
        cbc: { // single 
            findings: { // *
                type: String,
                required: [true, '(CBC) Findings is required'],
                trim: true,
                // minlength: [5, 'Entered text for (CBC) Findings is too short (5)'],
                maxlength: [255, 'Maximum text entered for (CBC) Findings reached (255)']
            },
            date: { // *
                type: Date,
                required: [true, "(CBC) Date is required"],
                min: [new Date('1969-12-31T00:00:00Z'), "(CBC) Date must be later than approximately (January 1, 1970)"],
                max: [new Date(), "(CBC) Date exceeds the current date"]
            }
        },
        hepatitisProfile: { // single
            hbsag: generateHepaBFields('HBsAg'),
            antiHbs: generateHepaBFields('Anti-HBs'),
            antiHbcIgg: generateHepaBFields('Anti-HBc(IgG)'),
            antiHbcIgm: generateHepaBFields('Anti-HBc(IgM)')
        },
        drugTest: { // single -- optional
            methamphetamineResult: { // optional
                type: String,
                required: [true, '(Methamphetamine) Result is required'],
                trim: true,
                enum: {
                    values: ["Positive", "Negative", "N/A"],
                    message: "Invalid (Methamphetamine) Result"
                }
            },
            methamphetamineRemarks: { // optional
                type: String,
                required: [true, "(Methamphetamine) Remarks is required"],
                trim: true,
                enum: {
                    values: ["Passed", "Failed", "N/A"],
                    message: "Invalid (Methamphetamine) Remarks"
                }
            },
            tetrahydrocannabinolResult: { // optional
                type: String,
                required: [true, '(Tetrahydrocannabinol) Result is required'],
                trim: true,
                enum: {
                    values: ["Positive", "Negative", "N/A"],
                    message: "Invalid (Tetrahydrocannabinol) Result"
                }
            },
            tetrahydrocannabinolRemarks: { // optional
                type: String,
                required: [true, "(Tetrahydrocannabinol) Remarks is required"],
                trim: true,
                enum: {
                    values: ["Passed", "Failed", "N/A"],
                    message: "Invalid (Tetrahydrocannabinol) Remarks"
                }
            },
        },
        urinalysis: { // single -- optional
            color: generateUrinFecFields('(Urinalysis) Color'), // optional
            transparency: generateUrinFecFields('(Urinalysis) Transparency'),  // optional
            blood: generateUrinFecFields('(Urinalysis) Blood'), // optional
            bilirubin: generateUrinFecFields('(Urinalysis) Bilirubin'), // optional
            urobilinogen: generateUrinFecFields('(Urinalysis) Urobilinogen'), // optional
            ketones: generateUrinFecFields('(Urinalysis) Ketones'), // optional
            glutones: generateUrinFecFields('(Urinalysis) Glutones'), // optional
            protein: generateUrinFecFields('(Urinalysis) Protein'), // optional
            nitrite: generateUrinFecFields('(Urinalysis) Nitrite'), // optional
            leukocyte: generateUrinFecFields('(Urinalysis) Leukocyte'), // optional
            phLevel: { // optional
                type: Number,
                required: [true, '(Urinalysis) phLevel is required']
            },
            spGravity: { // optional
                type: Number,
                required: [true, '(Urinalysis) Sp. Gravity is required']
            },
            wbc: { // optional
                type: String,
                required: [true, '(Urinalysis) WBC is required'],
                trim: true,
                // minlength: [1, 'Entered text for (Urinalysis) WBC is too short (1)'],
                maxlength: [255, 'Maximum text entered for (Urinalysis) WBC reached (255)']
            },
            rbc: {
                type: String,
                required: [true, '(Urinalysis) RBC is required'],
                trim: true,
                // minlength: [1, 'Entered text for (Urinalysis) RBC is too short (1)'],
                maxlength: [255, 'Maximum text entered for (Urinalysis) RBC reached (255)']
            },
            bacteria: generateUrinFecFields('(Urinalysis) Bacteria'), // optional
            epithelialCells: generateUrinFecFields('(Urinalysis) Epithelial Cells'), // optional
            amorphousUrates: generateUrinFecFields('(Urinalysis) Amorphous Urates'), // optional
            mucusThreads: generateUrinFecFields('(Urinalysis) Mucus Threads'), // optional
            others: {
                type: String,
                required: [true, '(Urinalysis) Others is required'],
                trim: true,
                // minlength: [1, 'Entered text for (Urinalysis) Others is too short (1)'],
                maxlength: [255, 'Maximum text entered for (Urinalysis) Others reached (255)']
            }
        },
        fecalysis: { // single
            color: generateUrinFecFields('(Fecalysis) Color'),  // optional
            consistency: generateUrinFecFields('(Fecalysis) Consistency'), // optional
            wbc: { // optional
                type: String,
                required: [true, '(Fecalysis) WBC is required'],
                trim: true,
                // minlength: [1, 'Entered text for (Fecalysis) WBC is too short (1)'],
                maxlength: [255, 'Maximum text entered for (Fecalysis) WBC reached (255)']
            },
            rbc: { // optional
                type: String,
                required: [true, '(Fecalysis) RBC is required'],
                trim: true,
                // minlength: [1, 'Entered text for (Fecalysis) RBC is too short (1)'],
                maxlength: [255, 'Maximum text entered for (Fecalysis) RBC reached (255)']
            },
            fatGlobules: generateUrinFecFields('(Fecalysis) Fat Globules'), // optional
            muscleFibers: generateUrinFecFields('(Fecalysis) Muscle Fibers'), // optional
            results: generateUrinFecFields('(Fecalysis) Results') // optional
        },
        others: {
            pregnancyTest: { // optional
                type: String,
                required: [true, 'Pregnancy Test result is required'],
                trim: true,
                enum: {
                    values: ["Positive", "Negative", "N/A"],
                    message: "Invalid Pregnancy Test result"
                }
            }
        },
        attachments: generateAttachments('Laboratory')
    },
    vaccination: { // multiple - requires at least 1 record 
        covidVaccination: generateVaccFields('Covid'),
        fluVaccination: generateVaccFields('Flu'),
        hepatitisBVaccination: generateVaccFields('Hepatitis-B'),
        pneumoniaVaccination: generateVaccFields('Pneumonia'),
        attachments: generateAttachments('Vaccination')
    },
    medicalHistory: {
        tattoo: { // single
            type: Boolean,
            required: [true, '(Medical History) Tattoo is required']
        },
        bloodPressure: { // single
            systolic: {
                type: Number,
                required: [true, '(Medical History) Systolic value is required'],
                min: [1, "(Medical History) Systolic value must be at least 1 or above"],
                max: [500, "(Medical History) Systolic value exceeds limit of 500"],
                match: [/^[1-9]\d*$/, "Invalid (Medical History) Systolic value"]
            },
            diastolic: {
                type: Number,
                required: [true, '(Medical History) Diastolic value is required'],
                min: [1, "(Medical History) Diastolic value must be at least 1 or above"],
                max: [500, "(Medical History) Diastolic value exceeds limit of 500"],
                match: [/^[1-9]\d*$/, "Invalid (Medical History) Diastolic value"]
            }
        },
        conditions: { // single
            anemia: generateConditionFields('Anemia'),
            asthma: generateConditionFields('Asthma'),
            blackJointProblem: generateConditionFields('Black Joint Problem'),
            heartDiseases: generateConditionFields('Heart Disease/s'),
            hepatitis: generateConditionFields('Hepatitis'),
            highBloodPressure: generateConditionFields('High Blood Pressure'),
            kidneyProblem: generateConditionFields('Kidney Problem'),
            chronicDiseases: generateConditionFields('Chronic Disease/s'),
            thyroidProblems: generateConditionFields('Thyroid Problem/s'),
            bloodDyscrasia: generateConditionFields('Blood Dyscrasia'),
            others: {
                type: String,
                required: [true, "(Medical History) Others value is required"],
                trim: true,
                maxlength: [255, 'Maximum text entered for (Medical History) Others reached (255)']
            }
        },
        q1DoctorDetails: { // has YesOrNo -- multiple -- optional
            required: [true, "(Medical History) Doctor Details field is required"],
            default: undefined,
            type: [
                {
                    doctorName: {
                        type: String,
                        required: [true, "(Medical History) Doctor Name is required"],
                        trim: true,
                        // minlength: [2, "(Medical History) Doctor Name must contain at least 2 characters"],
                        maxlength: [255, "(Medical History) Doctor Name must only contain 255 characters or fewer"],
                        match: [utils.textRegex, '(Medical History) Doctor Name can only contain letters and a few common symbols']
                    },
                    phone: {
                        type: String,
                        required: [true, "(Medical History) Phone/fax number is required"],
                        trim: true,
                        minlength: [5, "(Medical History) Phone/fax number must be at least 5 digits or more"],
                        maxlength: [20, "(Medical History) Phone/fax number exceeds 20 digit limit"],
                        match: [/^(?!.*--)(?!-)[0-9]+(?:-[0-9]+)*$/, "(Medical History) Phone/fax number is invalid"]
                    },
                    homeAddress: {
                        type: String,
                        required: [true, "(Medical History) Home address is required"],
                        trim: true,
                        // minlength: [20, "(Medical History) Home address must contain at least 20 characters"],
                        maxlength: [255, "(Medical History) Home address must only contain 255 characters or fewer"],
                        match: [utils.aNSRegex, "(Medical History) Home address must contain letter/s"]
                    },
                    forWhatCondition: {
                        type: String,
                        required: [true, "(Medical History) Condition/s is required"],
                        trim: true,
                        // minlength: [1, "(Medical History) Condition/s must contain at least 1 character"],
                        maxlength: [255, "(Medical History) Condition/s must only contain 255 characters or fewer"],
                        match: [utils.aNSRegex, "(Medical History) Condition/s must contain letter/s"]
                    }
                }
            ],
        },
        q2PastIllnessSurgery: { // has YesOrNo -- multiple -- optional
            type: [String],
            required: [true, "(Medical History) Past Illness Surgery/ies is required"],
            default: undefined,
            validate: [ // validator for array of strings [min max length]
                {
                    validator: function (arr) {
                        return (Array.isArray(arr))
                    },
                    message: '(Medical History) Past Illness Surgery invalid value'
                },
                {
                    validator: function (arr) {
                        return arr.every(str => str.length >= 1)
                    },
                    message: '(Medical History) Past Illness Surgery must contain at least 1 character or more'
                },
                {
                    validator: function (arr) {
                        return arr.every(str => str.length <= 255)
                    },
                    message: "Maximum text entered for (Medical History) Past Illness Surgery reached (255)"
                }
            ]
        },
        q3DrugFoodAllergy: { // has YesOrNo -- multiple -- optional
            type: [String],
            required: [true, "(Medical History) Drug Food Allergy/ies is required"],
            default: undefined,
            validate: [ // validator for array of strings [min max length]
                {
                    validator: function (arr) {
                        return arr.every(str => str.length >= 1)
                    },
                    message: '(Medical History) Drug Food Allergy/ies must contain at least 1 character or more'
                },
                {
                    validator: function (arr) {
                        return arr.every(str => str.length <= 255)
                    },
                    message: "Maximum text entered for (Medical History) Drug Food Allergy/ies reached (255)"
                }
            ]
        },
        q4MedicationDetails: { // has YesOrNo -- multiple -- optional
            required: [true, "(Medical History) Medication details field is required"],
            default: undefined,
            type: [ // multiple
                {
                    nameOfMedication: {
                        type: String,
                        required: [true, "(Medical History) Name of Medication is required"],
                        trim: true,
                        // minlength: [2, "(Medical History) Name of Medication must contain at least 2 characters or more"],
                        maxlength: [255, "Maximum text entered for (Medical History) Name of Medication reached (255)"]
                    },
                    type: {
                        type: String,
                        required: [true, "(Medical History) Medication Type is required"],
                        trim: true,
                        // minlength: [5, "(Medical History) Medication Type must contain at least 5 characters or more"],
                        maxlength: [255, "Maximum text entered for (Medical History) Medication Type reached (255)"],
                    },
                    brand: {
                        type: String,
                        required: [true, "(Medical History) Medication Brand is required"],
                        trim: true,
                        // minlength: [5, "(Medical History) Medication Brand must contain at least 5 characters or more"],
                        maxlength: [255, "Maximum text entered for (Medical History) Medication Brand reached (255)"],
                    }
                }
            ]
        },
        q5PhysicalLearningDisability: { // has YesOrNo -- multiple -- optional
            type: [String],
            required: [true, "(Medical History) Physical Learning Disability value is required"],
            default: undefined,
            validate: [
                {
                    validator: function (arr) {
                        return arr.every(str => str.length >= 1)
                    },
                    message: '(Medical History) Physical Learning Disability value must contain at least 1 character or more'
                },
                { // validator for array of strings [min max length]     
                    validator: function (arr) {
                        return arr.every(str => str.length <= 255)
                    },
                    message: "Maximum text entered for (Medical History) Physical Learning Disability value reached (255)"
                }
            ]
        },
        attachments: generateAttachments('Medical History')
    },
    dentalRecord: { // -- all are optional/null upon addMedical, required upon addDental
        isFilledOut: {
            type: Boolean,
            required: [true, "(Dental Record) isFilledOut value is required"]
        },
        q1: { // Reason for dental visit
            type: [String],
            required: [true, "(Dental Record) Q1 is required"],
            default: undefined,
            validate: [
                {
                    validator: function (arr) {
                        return arr.every(str => str.length >= 1)
                    },
                    message: '(Dental Record) Q1 must contain at least 1 character or more'
                },
                { // validator for array of strings [min max length]     
                    validator: function (arr) {
                        return arr.every(str => str.length <= 255)
                    },
                    message: "Maximum text entered for (Dental Record) Q1 reached (255)"
                }
            ]
        },
        q2: { // Last dental visit
            type: Date,
            required: [true, "(Dental Record) Q2 is required"],
            min: [new Date('1969-12-31T00:00:00Z'), "(Dental Record) Q2 must be later than approximately (January 1, 1970)"],
            max: [new Date(), "(Dental Record) Q2 exceeds the current date"]
        },
        q3: { //Dentures or dental prosthesis
            type: [String],
            required: [true, "(Dental Record) Q3 is required"],
            default: undefined,
            validate: [
                {
                    validator: function (arr) {
                        return arr.every(str => str.length >= 1)
                    },
                    message: '(Dental Record) Q3 must contain at least 1 character or more'
                },
                { // validator for array of strings [min max length]     
                    validator: function (arr) {
                        return arr.every(str => str.length <= 255)
                    },
                    message: "Maximum text entered for (Dental Record) Q3 reached (255)"
                }
            ]
        },
        q4: { //Frequency of toothbrushing
            type: String,
            required: [true, "(Dental Record) Q4 is required"],
            trim: true,
            enum: {
                values: ["2x a day", "3x a day", "Every after meal", "Before going to bed", "N/A"],
                message: "Invalid (Dental Record) Q4 value"
            }
        },
        q5: { //Past dental surgery -- has yesOrNo -- multiple -- optional
            required: [true, "(Dental Record) Q5 is required"],
            default: undefined,
            type: [
                {
                    description: {
                        type: String,
                        required: [true, "(Dental Record) Q5 Description is required"],
                        maxlength: [255, "(Dental Record) Q5 Description exceeded 255 character limit (255)"],
                    },
                    date: {
                        type: Date,
                        required: [true, "(Dental Record) Q5 Date is required"],
                        min: [new Date('1969-12-31T00:00:00Z'), "(Dental Record) Q5 Date must be later than approximately (January 1, 1970)"],
                        max: [new Date(), "(Dental Record) Q5 Date exceeds the current date"]
                    }
                }
            ]
        },
        q6: q6SchemaDefinition, //Odontogram graph
        q7: { //Oral health condition
            presenceOfDebris: generateQ7Field('Debris'),
            presenceOfToothStain: generateQ7Field('ToothStain'),
            presenceOfGingivitis: generateQ7Field('Gingivitis'),
            presenceOfPeriodontalPocket: generateQ7Field('PeriodontalPocket'),
            presenceOfOralBiofilm: generateQ7Field('OralBiofilm'),
            underOrthodonticTreatment: { // has yesOrNo -- single -- optional
                yearStarted: { // null = 1970 -- optional
                    type: Number,
                    required: [true, "(Dental Record) OrthoTreatment Year Started is required"],
                    validate: {
                        validator: function (year) {
                            return (year === 0) || (year >= 1970 && year <= (+(new Date().getFullYear())))
                        },
                        message: `(Dental Record) OrthoTreatment Year Started must be within the range of 1970-${(+(new Date().getFullYear()))}`
                    }
                },
                lastAdjustment: {
                    type: Date,
                    required: [true, "(Dental Record) OrthoTreatment Last Adjustment is required"],
                    min: [new Date('1969-12-31T00:00:00Z'), "(Dental Record) OrthoTreatment Last Adjustment must be later than approximately (January 1, 1970)"],
                    max: [new Date(), "(Dental Record) OrthoTreatment Last Adjustment exceeds the current date"]
                }
            }
        },
        q8: { // Tooth count
            numTeethPresent: generateQ8Field('Teeth Present'),
            numCariesFreeTeeth: generateQ8Field('CariesFreeTeeth'),
            numTeethforFilling: generateQ8Field('TeethforFilling'),
            numTeethforExtraction: generateQ8Field('TeethforExtraction'),
            totalNumDecayedTeeth: generateQ8Field('NumDecayedTeeth'),
            numFilledTeeth: generateQ8Field('FilledTeeth'),
            numMissingTeeth: generateQ8Field('MissingTeeth'),
            numUneruptedTeeth: generateQ8Field('UneruptedTeeth')
        },
        q9: { // Dentofacial abnormalities -- has yesOrNo -- multiple -- optional
            type: [String],
            required: [true, "(Dental Record) Q9 is required"],
            default: undefined,
            validate: [
                {
                    validator: function (arr) {
                        return arr.every(str => str.length >= 1)
                    },
                    message: '(Dental Record) Q3 must contain at least 1 character or more'
                },
                { // validator for array of strings [min max length]     
                    validator: function (arr) {
                        return arr.every(str => str.length <= 255)
                    },
                    message: "Maximum text entered for (Dental Record) Q3 reached (255)"
                },
                {
                    validator: function (arr) {
                        return arr.every(str => utils.aNSRegex.test(str))
                    },
                    message: "(Dental Record) Q9 must contain letter/s"
                }
            ]
        },
        q10: { //Need for denture
            needUpperDenture: {
                type: Number,
                required: [true, "(Dental Record) Q10 NeedUpperDenture value is required"],
                min: [0, "(Dental Record) Q10 NeedUpperDenture value must be >= 0"],
                max: [3, "(Dental Record) Q10 NeedUpperDenture value must be <= 3"]
            },
            needLowerDenture: {
                type: Number,
                required: [true, "(Dental Record) Q10 NeedLowerDenture value is required"],
                min: [0, "(Dental Record) Q10 NeedLowerDenture value must be >= 0"],
                max: [3, "(Dental Record) Q10 NeedLowerDenture value must be <= 3"]
            }
        },
        notes: { // optional -- N/A
            type: String,
            required: [true, "(Dental Record) Notes is required"],
            maxlength: [1000, "(Dental Record) Notes exceeded 1000 character limit"]
        },
        attachments: generateAttachments('Dental Record')
    },
    archived: {
        type: Boolean,
        default: false
    },
    archivedDate: {
        type: Date,
        default: null,
        min: [new Date('1969-12-31T00:00:00Z'), `Archived Date must be later than approximately (January 1, 1970)`]
    }
})

// Student Schema
const studentSchema = new mongoose.Schema({
    studentNo: {
        type: String,
        required: [true, "Student Number is required"],
        trim: true,
        unique: [true, "Student Number already exists"],
        match: [/^20\d{2}-\d{5}$/, "Invalid Student Number"]
    },
    course: {
        type: String,
        required: [true, "Student Course is required"],
        trim: true,
        enum: {
            values: [
                "bachelor of science in legal management",
                "bachelor of science in medical technology",
                "bachelor of science in nursing",
                "bachelor of science in pharmacy",
                "bachelor of science in clinical pharmacy",
                "bachelor of science in psychology",
                "doctor of dental medicine",
                "doctor of pharmacy (2-year)",
                "doctor of pharmacy (6-year)",
                "juris doctor",
                "bachelor of science in business administration major in international management",
                "bachelor of science in international tourism and travel management",
                "bachelor of science in international hospitality management",
                "bachelor of science in international hospitality management",
                "bachelor of science in accountancy",
                "bachelor of science in computer science",
                "bachelor of science in information technology",
                "master of business administration (thesis)",
                "master of business administration (non-thesis)",
                "master of business administration (financial analysis)"
            ],
            message: "Invalid Student Section"
        }
    },
    year: {
        type: Number,
        required: [true, "Student Year is required"],
        enum: {
            values: [1, 2, 3, 4, 5, 6],
            message: "Invalid Student Year"
        }
    },
    section: {
        type: String,
        required: [true, "Student Section is required"],
        trim: true
    },
    details: {
        type: mongoose.ObjectId,
        ref: "BasePatients"
    }
})
//Employee Schema
const employeeSchema = new mongoose.Schema({
    employeeNo: {
        type: String,
        required: [true, "Employee Number is required"],
        trim: true,
        unique: [true, "Employee Number already exists"],
        match: [/^\d{4}-\d$/, "Invalid Employee Number"]
    },
    department: {
        type: String,
        required: [true, "Employee Department is required"],
        trim: true,
        enum: {
            values: [
                "legal management department",
                "medical technology department",
                "nursing department",
                "pharmacy department",
                "clinical pharmacy department",
                "psychology department",
                "dental medicine department",
                "pharmacy department",
                "juris doctor department",
                "business administration major in international management department",
                "international tourism and travel management department",
                "international hospitality management department",
                "international hospitality management department",
                "accountancy department",
                "computer science and information technology department",
                "business administration department"
            ],
            message: "Invalid Employee Department"
        }
    },
    details: {
        type: mongoose.ObjectId,
        ref: "BasePatients"
    }
})

const BaseModel = mongoose.model('BasePatients', baseSchema)

const Student = mongoose.model('Students', studentSchema)

const Employee = mongoose.model('Employees', employeeSchema)

module.exports = { Student, Employee, BaseModel }
