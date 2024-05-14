const mongoose = require('mongoose')
const validator = require('validator')
const utils = require('../../utils')

const Schema = mongoose.Schema

// FOR MEDICAL HISTORY CONDITIONS
function generateConditionField(condition) {
    return {
        type: Boolean,
        required: [true, `(Medical History) ${condition} value is required`]
    }
}

// FOR HEPA-B PROFILE
function generateHepaBFields(variant){
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
                required: [true, "Middlename is still required"],
                trim: true,
                // minlength: [2, "Middlename must contain at least 2 characters"], // -- TEST if works when null & if need match
                maxlength: [255, "Middlename must only contain 255 characters or fewer"],
                match: [utils.textOpRegex, "Middlename can only contain letters and a few common symbols"],
                default: "N/A"
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
        attachments: { // optional -- multiple
            required: [true, "(Basic Info) Attachments field is required"],
            default: undefined,
            type: [ // PROB: Need index here
                {
                    filename: {  // *
                        type: String,
                        required: [true, "(Basic Info) Filename is required"],
                        trim: true,
                        unique: [true, "(Basic Info) Filename already exists"],
                        // minlength: [5, "(Basic Info) Filename must contain at least 5 characters or more"],
                        maxlength: [255, "(Basic Info) Filename exceeded 255 character limit (255)"]
                    },
                    urlLink: { // *
                        type: String,
                        required: [true, "(Basic Info) URL Link is required"],
                        trim: true,
                        // minlength: [5, "(Basic Info) URL Link must contain at least 5 characters or more"],
                    }
                }
            ]
        }
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
            color: { // optional
                type: String,
                required: [true, '(Urinalysis) Color is required'],
                trim: true,
                // minlength: [1, 'Entered text for (Urinalysis) Color is too short (1)'],
                maxlength: [255, 'Maximum text entered for (Urinalysis) Color reached (255)'],
                match: [utils.textOpRegex, '(Urinalysis) Color can only contain letters and a few common symbols']
            },
            transparency: { // optional
                type: String,
                required: [true, '(Urinalysis) Transparency is required'],
                trim: true,
                // minlength: [5, 'Entered text for (Urinalysis) Transparency is too short (5)'],
                maxlength: [255, 'Maximum text entered for (Urinalysis) Transparency reached (255)'],
                match: [utils.textOpRegex, '(Urinalysis) Transparency can only contain letters and a few common symbols']
            },
            blood: { // optional
                type: String,
                required: [true, '(Urinalysis) Blood is required'],
                trim: true,
                // minlength: [5, 'Entered text for (Urinalysis) Blood is too short (5)'],
                maxlength: [255, 'Maximum text entered for (Urinalysis) Blood reached (255)'],
                match: [utils.textOpRegex, '(Urinalysis) Blood can only contain letters and a few common symbols']
            },
            bilirubin: { // optional
                type: String,
                required: [true, '(Urinalysis) Bilirubin is required'],
                trim: true,
                // minlength: [5, 'Entered text for (Urinalysis) Bilirubin is too short (5)'],
                maxlength: [255, 'Maximum text entered for (Urinalysis) Bilirubin reached (255)'],
                match: [utils.textOpRegex, '(Urinalysis) Bilirubin can only contain letters and a few common symbols']
            },
            urobilinogen: { // optional
                type: String,
                required: [true, '(Urinalysis) Urobilinogen is required'],
                trim: true,
                // minlength: [5, 'Entered text for (Urinalysis) Urobilinogen is too short (5)'],
                maxlength: [255, 'Maximum text entered for (Urinalysis) Urobilinogen reached (255)'],
                match: [utils.textOpRegex, '(Urinalysis) Urobilinogen can only contain letters and a few common symbols']
            },
            ketones: { // optional
                type: String,
                required: [true, '(Urinalysis) Ketones is required'],
                trim: true,
                // minlength: [5, 'Entered text for (Urinalysis) Ketones is too short (5)'],
                maxlength: [255, 'Maximum text entered for (Urinalysis) Ketones reached (255)'],
                match: [utils.textOpRegex, '(Urinalysis) Ketones can only contain letters and a few common symbols']
            },
            glutones: { // optional
                type: String,
                required: [true, '(Urinalysis) Glutones is required'],
                trim: true,
                // minlength: [5, 'Entered text for (Urinalysis) Glutones is too short (5)'],
                maxlength: [255, 'Maximum text entered for (Urinalysis) Glutones reached (255)'],
                match: [utils.textOpRegex, '(Urinalysis) Glutones can only contain letters and a few common symbols']
            },
            protein: { // optional
                type: String,
                required: [true, '(Urinalysis) Protein is required'],
                trim: true,
                // minlength: [5, 'Entered text for (Urinalysis) Protein is too short (5)'],
                maxlength: [255, 'Maximum text entered for (Urinalysis) Protein reached (255)'],
                match: [utils.textOpRegex, '(Urinalysis) Protein can only contain letters and a few common symbols']
            },
            nitrite: { // optional
                type: String,
                required: [true, '(Urinalysis) Nitrite is required'],
                trim: true,
                // minlength: [5, 'Entered text for (Urinalysis) Nitrite is too short (5)'],
                maxlength: [255, 'Maximum text entered for (Urinalysis) Nitrite reached (255)'],
                match: [utils.textOpRegex, '(Urinalysis) Nitrite can only contain letters and a few common symbols']
            },
            leukocyte: { // optional
                type: String,
                required: [true, '(Urinalysis) Leukocyte is required'],
                trim: true,
                // minlength: [5, 'Entered text for (Urinalysis) Leukocyte is too short (5)'],
                maxlength: [255, 'Maximum text entered for (Urinalysis) Leukocyte reached (255)'],
                match: [utils.textOpRegex, '(Urinalysis) Leukocyte can only contain letters and a few common symbols']
            },
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
            bacteria: {
                type: String,
                required: [true, '(Urinalysis) Bacteria is required'],
                trim: true,
                // minlength: [1, 'Entered text for (Urinalysis) Bacteria is too short (1)'],
                maxlength: [255, 'Maximum text entered for (Urinalysis) Bacteria reached (255)'],
                match: [utils.textRegex, "(Urinalysis) Bacteria can only contain letters and a few common symbols"]
            },
            epithelialCells: {
                type: String,
                required: [true, '(Urinalysis) Epithelial cell/s is required'],
                trim: true,
                // minlength: [1, 'Entered text for (Urinalysis) Epithelial cell/s is too short (1)'],
                maxlength: [255, 'Maximum text entered for (Urinalysis) Epithelial cell/s reached (255)'],
                match: [utils.textRegex, "(Urinalysis) Epithelial cell/s can only contain letters and a few common symbols"]
            },
            amorphousUrates: {
                type: String,
                required: [true, '(Urinalysis) Amorphous Urates is required'],
                trim: true,
                // minlength: [1, 'Entered text for (Urinalysis) Amorphous Urates is too short (1)'],
                maxlength: [255, 'Maximum text entered for (Urinalysis) Amorphous Urates reached (255)'],
                match: [utils.textRegex, "(Urinalysis) Amorphous Urates can only contain letters and a few common symbols"]
            },
            mucusThreads: {
                type: String,
                required: [true, '(Urinalysis) Mucus threads is required'],
                trim: true,
                // minlength: [1, 'Entered text for (Urinalysis) Mucus threads is too short (1)'],
                maxlength: [255, 'Maximum text entered for (Urinalysis) Mucus threads reached (255)'],
                match: [utils.textRegex, "(Urinalysis) Mucus threads can only contain letters and a few common symbols"]
            },
            others: {
                type: String,
                required: [true, '(Urinalysis) Others is required'],
                trim: true,
                // minlength: [1, 'Entered text for (Urinalysis) Others is too short (1)'],
                maxlength: [255, 'Maximum text entered for (Urinalysis) Others reached (255)']
            }
        },
        fecalysis: { // single
            color: {
                type: String,
                required: [true, '(Fecalysis) Color is required'],
                trim: true,
                // minlength: [1, 'Entered text for (Fecalysis) Color is too short (1)'],
                maxlength: [255, 'Maximum text entered for (Fecalysis) Color reached (255)'],
                match: [utils.textRegex, '(Fecalysis) Color can only contain letters and a few common symbols']
            },
            consistency: {
                type: String,
                required: [true, '(Fecalysis) Consistency is required'],
                trim: true,
                // minlength: [1, 'Entered text for (Fecalysis) Consistency is too short (1)'],
                maxlength: [255, 'Maximum text entered for (Fecalysis) Consistency reached (255)'],
                match: [utils.textRegex, '(Fecalysis) Consistency can only contain letters and a few common symbols']
            },
            wbc: {
                type: String,
                required: [true, '(Fecalysis) WBC is required'],
                trim: true,
                // minlength: [1, 'Entered text for (Fecalysis) WBC is too short (1)'],
                maxlength: [255, 'Maximum text entered for (Fecalysis) WBC reached (255)']
            },
            rbc: {
                type: String,
                required: [true, '(Fecalysis) RBC is required'],
                trim: true,
                // minlength: [1, 'Entered text for (Fecalysis) RBC is too short (1)'],
                maxlength: [255, 'Maximum text entered for (Fecalysis) RBC reached (255)']
            },
            fatGlobules: {
                type: String,
                required: [true, '(Fecalysis) Fat Globule/s is required'],
                trim: true,
                // minlength: [1, 'Entered text for (Fecalysis) Fat Globule/s is too short (1)'],
                maxlength: [255, 'Maximum text entered for (Fecalysis) Fat Globule/s reached (255)'],
                match: [utils.textRegex, '(Fecalysis) Fat Globule/s can only contain letters and a few common symbols']
            },
            muscleFibers: {
                type: String,
                required: [true, '(Fecalysis) Muscle Fiber/s is required'],
                trim: true,
                // minlength: [1, 'Entered text for (Fecalysis) Muscle Fiber/s is too short (1)'],
                maxlength: [255, 'Maximum text entered for (Fecalysis) Muscle Fiber/s reached (255)'],
                match: [utils.textRegex, '(Fecalysis) Muscle Fiber/s can only contain letters and a few common symbols']
            },
            results: {
                type: String,
                required: [true, '(Fecalysis) Result/s is required'],
                trim: true,
                // minlength: [1, 'Entered text for (Fecalysis) Result/s is too short (1)'],
                maxlength: [255, 'Maximum text entered for (Fecalysis) Result/s reached (255)'],
                match: [utils.textRegex, '(Fecalysis) Results can only contain letters and a few common symbols']
            }
        },
        others: {
            pregnancyTest: {
                type: String,
                required: [true, 'Pregnancy Test result is required'],
                trim: true,
                enum: {
                    values: ["Positive", "Negative", "N/A"],
                    message: "Invalid Pregnancy Test result"
                }
            }
        },
        attachments: { // optional -- multiple
            required: [true, "(Laboratory) Attachments field is required"],
            default: undefined,
            type: [ // PROB: Need index here
                {
                    filename: {  // *
                        type: String,
                        required: [true, "(Laboratory) Filename is required"],
                        trim: true,
                        unique: [true, "(Laboratory) Filename already exists"],
                        // minlength: [5, "(Laboratory) Filename must contain at least 5 characters or more"],
                        maxlength: [255, "(Laboratory) Filename exceeded 255 character limit (255)"]
                    },
                    urlLink: { // *
                        type: String,
                        required: [true, "(Laboratory) URL Link is required"],
                        trim: true,
                        // minlength: [5, "(Laboratory) URL Link must contain at least 5 characters or more"],
                    }
                }
            ]
        }
    },
    vaccination: {
        covidVaccination: { // multiple
            required: [true, "Covid Vaccination field is required"],
            default: undefined,
            type: [
                { // requires at least 1 record
                    dose: {
                        type: String,
                        required: [true, "(Covid Vaccination) Dose is required"],
                        trim: true,
                        // minlength: [2, "(Covid Vaccination) Dose must contain at least 2 characters or more"],
                        maxlength: [255, "Maximum text entered for (Covid Vaccination) Dose reached (255)"]
                    },
                    dateGiven: {
                        type: Date,
                        required: [true, '(Covid Vaccination) Date is required'],
                        min: [new Date('1969-12-31T00:00:00Z'), "(Covid Vaccination) Date must be later than approximately (January 1, 1970)"],
                        max: [new Date(), "(Covid Vaccination) Date exceeds the current date"]
                    }
                }
            ],
            validate: {
                validator: function (arr) {
                    return (arr.length !== 0)
                },
                message: "At least 1 Covid Vaccine record is required"
            }
        },
        fluVaccination: { // multiple
            required: [true, "Flu Vaccination field is required"],
            default: undefined,
            type: [
                { // requires at least 1 record
                    dose: {
                        type: String,
                        required: [true, "(Flu Vaccination) Dose is required"],
                        trim: true,
                        // minlength: [2, "(Flu Vaccination) Dose must contain at least 2 characters or more"],
                        maxlength: [255, "Maximum text entered for (Flu Vaccination) Dose reached (255)"]
                    },
                    dateGiven: {
                        type: Date,
                        required: [true, '(Flu Vaccination) Date is required'],
                        min: [new Date('1969-12-31T00:00:00Z'), "(Flu Vaccination) Date must be later than approximately (January 1, 1970)"],
                        max: [new Date(), "(Flu Vaccination) Date exceeds the current date"]
                    }
                }
            ],
            validate: {
                validator: function (arr) {
                    return (arr.length !== 0)
                },
                message: "At least 1 Flu Vaccine record is required"
            }
        },
        hepatitisBVaccination: { // multiple
            required: [true, "Hepatitis-B Vaccination field is required"],
            default: undefined,
            type: [
                { // requires at least 1 record
                    dose: {
                        type: String,
                        required: [true, "(Hepa-B Vaccination) Dose is required"],
                        trim: true,
                        // minlength: [2, "(Hepa-B Vaccination) Dose must contain at least 2 characters or more"],
                        maxlength: [255, "Maximum text entered for (Hepa-B Vaccination) Dose reached (255)"]
                    },
                    dateGiven: {
                        type: Date,
                        required: [true, '(Hepa-B Vaccination) Date is required'],
                        min: [new Date('1969-12-31T00:00:00Z'), "(Hepa-B Vaccination) Date must be later than approximately (January 1, 1970)"],
                        max: [new Date(), "(Hepa-B Vaccination) Date exceeds the current date"]
                    }
                }
            ],
            validate: {
                validator: function (arr) {
                    return (arr.length !== 0)
                },
                message: "At least 1 Hepa-B Vaccine record is required"
            }
        },
        pneumoniaVaccination: { // multiple
            required: [true, "Pneumonia Vaccination field is required"],
            default: undefined,
            type: [
                { // requires at least the latest record
                    dose: {
                        type: String,
                        required: [true, "(Pneumonia Vaccination) Dose is required"],
                        trim: true,
                        // minlength: [2, "(Pneumonia Vaccination) Dose must contain at least 2 characters or more"],
                        maxlength: [255, "Maximum text entered for (Pneumonia Vaccination) Dose reached (255)"]
                    },
                    dateGiven: {
                        type: Date,
                        required: [true, '(Pneumonia Vaccination) Date is required'],
                        min: [new Date('1969-12-31T00:00:00Z'), "(Pneumonia Vaccination) Date must be later than approximately (January 1, 1970)"],
                        max: [new Date(), "(Pneumonia Vaccination) Date exceeds the current date"]
                    }
                }
            ],
            validate: {
                validator: function (arr) {
                    return (arr.length !== 0)
                },
                message: "At least 1 Pneumonia Vaccine record is required"
            }
        },
        attachments: { // optional -- multiple
            required: [true, "(Vaccination) Attachments field is required"],
            default: undefined,
            type: [ // PROB: Need index here
                {
                    filename: {  // *
                        type: String,
                        required: [true, "(Vaccination) Filename is required"],
                        trim: true,
                        unique: [true, "(Vaccination) Filename already exists"],
                        // minlength: [5, "(Vaccination) Filename must contain at least 5 characters or more"],
                        maxlength: [255, "(Vaccination) Filename exceeded 255 character limit (255)"]
                    },
                    urlLink: { // *
                        type: String,
                        required: [true, "(Vaccination) URL Link is required"],
                        trim: true,
                        // minlength: [5, "(Vaccination) URL Link must contain at least 5 characters or more"],
                    }
                }
            ]
        }
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
            anemia:  generateConditionField('Anemia'),
            asthma: generateConditionField('Asthma'),
            blackJointProblem: generateConditionField('Black Joint Problem'),
            heartDiseases: generateConditionField('Heart Disease/s'),
            hepatitis: generateConditionField('Hepatitis'),
            highBloodPressure: generateConditionField('High Blood Pressure'),
            kidneyProblem: generateConditionField('Kidney Problem'),
            chronicDiseases: generateConditionField('Chronic Disease/s'),
            thyroidProblems: generateConditionField('Thyroid Problem/s'),
            bloodDyscrasia: generateConditionField('Blood Dyscrasia'),
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
        attachments: { // optional -- multiple
            required: [true, "(Medical History) Attachments field is required"],
            default: undefined,
            type: [ // PROB: Need index here
                {
                    filename: {  // *
                        type: String,
                        required: [true, "(Medical History) Filename is required"],
                        trim: true,
                        unique: [true, "(Medical History) Filename already exists"],
                        // minlength: [5, "(Medical History) Filename must contain at least 5 characters or more"],
                        maxlength: [255, "(Medical History) Filename exceeded 255 character limit (255)"]
                    },
                    urlLink: { // *
                        type: String,
                        required: [true, "(Medical History) URL Link is required"],
                        trim: true,
                        // minlength: [5, "(Medical History) URL Link must contain at least 5 characters or more"],
                    }
                }
            ]
        }
    },
    dentalRecord: {
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
                        return (arr.length !== 0)
                    },
                    message: '(Dental Record) Q1 must contain at least 1 value'
                },
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
                values: ["2x a day", "3x a day", "Every after meal", "Before going to bed"],
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
                        trim: true,
                        maxlength: [255, "(Dental Record) Q5 Description exceeded 255 character limit (255)"],
                        match: [utils.aNSRegex, '(Dental Record) Q5 Description must contain letter/s']
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
                yearStarted: { // null = 0
                    type: Number,
                    required: [true, "(Dental Record) OrthoTreatment Year Started is required"],
                    min: [1970, "(Dental Record) OrthoTreatment Year Started must be later than 1970"],
                    max: [+(new Date().getFullYear()), "(Dental Record) OrthoTreatment Year Started exceeded the current year"]
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
        notes: { 
            type: String, 
            required: [true, "(Dental Record) Notes is required"], 
            trim: true,
            maxlength: [1000, "(Dental Record) Notes exceeded 1000 character limit"]
        },
        attachments: { // optional -- multiple
            required: [true, "(Dental Record) Attachments field is required"],
            default: undefined,
            type: [ // PROB: Need index here
                {
                    filename: {  // *
                        type: String,
                        required: [true, "(Dental Record) Filename is required"],
                        trim: true,
                        unique: [true, "(Dental Record) Filename already exists"],
                        // minlength: [5, "(Dental Record) Filename must contain at least 5 characters or more"],
                        maxlength: [255, "(Dental Record) Filename exceeded 255 character limit"]
                    },
                    urlLink: { // *
                        type: String,
                        required: [true, "(Dental Record) URL Link is required"],
                        trim: true,
                        // minlength: [5, "(Dental Record) URL Link must contain at least 5 characters or more"],
                    }
                }
            ]
        }
    },
    archived: { type: Boolean, default: false },
    archivedDate: { type: Date, default: null }
})

// Student Schema
const studentSchema = new mongoose.Schema({
    studentNo: { type: String, required: true },
    course: { type: String, required: true },
    year: { type: String, required: true },
    section: { type: String, required: true },
    details: {
        type: mongoose.ObjectId,
        ref: "BasePatients"
    }
})
//Employee Schema
const employeeSchema = new mongoose.Schema({
    employeeNo: { type: String, required: true },
    department: { type: String, required: true },
    details: {
        type: mongoose.ObjectId,
        ref: "BasePatients"
    }
})

const BaseModel = mongoose.model('BasePatients', baseSchema)

const Student = mongoose.model('Students', studentSchema)

const Employee = mongoose.model('Employees', employeeSchema)

module.exports = { Student, Employee, BaseModel }
