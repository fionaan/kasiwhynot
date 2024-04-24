const mongoose = require('mongoose')
const validator = require('validator')
const utils = require('../../utils')

const Schema = mongoose.Schema

//Base Schema
const baseSchema = new Schema({
    basicInfo: {
        fullName: {
            firstName: {
                type: String,
                required: [true, "Firstname is required"],
                trim: true,
                minlength: [2, "Firstname must contain at least 2 characters"],
                maxlength: [255, "Firstname must only contain 255 characters or fewer"],
                match: [utils.nameRegex, "Firstname can only contain letters and a few common symbols"]
            },
            middleName: {
                type: String,
                required: false,
                trim: true,
                minlength: [2, "Middlename must contain at least 2 characters"], // -- TEST if works when null & if need match
                maxlength: [255, "Middlename must only contain 255 characters or fewer"], // -- TEST if works when null
                match: [utils.nameRegex, "Middlename can only contain letters and a few common symbols"]
            },
            lastName: {
                type: String,
                required: [true, "Lastname is required"],
                trim: true,
                minlength: [2, "Lastname must contain at least 2 characters"],
                maxlength: [255, "Lastname must only contain 255 characters or fewer"],
                match: [utils.nameRegex, "Lastname can only contain letters and a few common symbols"]
            },
        },
        emailAddress: {
            type: String,
            required: [true, 'Email address is required'],
            trim: true,
            match: [utils.emailRegex, "Invalid email format"]
        },
        dateOfBirth: {
            type: Date,
            required: [true, "Birthdate is required"],
            min: [new Date('1969-12-31T00:00:00Z'), "Birthdate must be later than approximately (January 1, 1970)"],
            max: [new Date().setFullYear(new Date().getFullYear() - 15), "Date of birth precedes expected range (Minimum of 15 year difference from current date)"] // Checks if bdate is > current date - 15 years
        },
        age: {
            type: Number,
            required: [true, 'Age is required'],
            min: [10, "Age must be at least 10 years or older"],
            max: [99, "Age must be 99 yrs. or below only"]
        }, //should be automatic based on date of birth and current date next time
        gender: {
            type: String, 
            required: [true, 'Gender is required'],
            trim: true,
            enum: {
                values: ['Male', 'Female'],
                message: 'Invalid gender'
            }
        },
        campus: {
            type: String, 
            required: [true, 'Campus is required'],
            trim: true,
            enum: {
                values: ['LV', 'GP', 'LV/GP'],
                message: 'Invalid campus'
            }
        },
        homeAddress: { 
            type: String, 
            required: [true, 'Home address is required'],
            trim: true,
            minlength: [20, "Home address must contain at least 20 characters"],
            maxlength: [255, "Home address must only contain 255 characters or fewer"]
        },
        contactNo: {
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
        nationality: {
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
        religion: {
            type: String,
            required: [true, 'Religion is required'],
            trim: true,
            match: [utils.nameRegex, 'Religion can only contain letters and a few common symbols']
        },
        bloodType: {
            type: String,
            required: [true, 'Bloodtype is required'],
            trim: true,
            enum: {
                values: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
                message: "Invalid bloodtype"
            }
        },
        civilStatus: {
            type: String,
            required: [true, 'Civil Status is required'],
            trim: true,
            enum: {
                values: ["Single", "Married", "Divorced", "Separated", "Widowed"],
                message: "Invalid civil status"
            }
        },
        height: { // in centimeter (cm)
            type: Number,
            required: [true, 'Height is required'],
            min: [0, "Invalid height value"],
            max: [200, "Invalid height value"]
        },
        weight: { // in kilogram (kg)
            type: Number,
            required: [true, 'Weight is required'],
            min: [0, "Invalid weight value"],
            max: [499, "Invalid weight value"]
        },
        bmi: {
            type: Number,
            required: [true, 'BMI is required'],
            min: [0, "Invalid BMI value"],
            max: [50, "Invalid BMI value"]
        },
        guardianName: {
            type: String,
            required: [true, 'Guardian name is required'],
            trim: true,
            minlength: [2, "Guardian name must contain at least 2 characters"],
            maxlength: [255, "Guardian name must only contain 255 characters or fewer"],
            match: [utils.nameRegex, "Guardian name can only contain letters and a few common symbols"]
        },
        guardianContactNo: {
            type: String,
            required: [true, 'Guardian contact no. is required'],
            trim: true,
            validate: {
                validator: function (value) {
                    return /^09\d{9}$/.test(value) || /^639\d{9}$/.test(value)
                },
                message: "{VALUE} is an invalid contact number"
            }
        },
        guardianRelationship: {
            type: String, 
            required: [true, 'Guardian relationship is required'],
            trim: true,
            match: [/^(?![\s'-])[a-zA-Z0-9\s'-]+$/, 'Guardian relationship can only contain alphanumeric and a few common symbols']
        },
        attachment: { // -- gawing array
            type: String, 
            required: false,
            trim: true
        } //temporarily a string
    },

    laboratory: {
        chestXray: {
            findings: {
                type: String,
                required: [true, 'This field value is required'],
                // minlength: [1, 'Entered text in field is too short'],
                // maxlength: [255, 'Maximum text entered reached']
            },
            date: {
                type: Date,
                required: true,
                // validate: {
                //     validator: function (value) {
                //         return !isNaN(new Date(value))
                //     },
                //     message: 'Data input is not a valid date!'
                // }
            }
        },
        cbc: {
            findings: {
                type: String,
                required: [true, 'This field value is required'],
                // minlength: [1, 'Entered text in field is too short'],
                // maxlength: [255, 'Maximum text entered reached']
            },
            date: {
                type: Date,
                required: true,
                // validate: {
                //     validator: function (value) {
                //         return !isNaN(new Date(value))
                //     },
                //     message: 'Data input is not a valid date!'
                // }
            }
        },
        hepatitisProfile: {
            hbsag: {
                type: String,
                required: [true, 'This field value is required'],
                // enum: {
                //     values: ["Normal", "High", "Low", "N?"],
                //     Message: "Invalid hbsag result"
                // }
            },
            antiHbs: {
                type: String,
                required: [true, 'This field value is required'],
                // enum: {
                //     values: ["Normal", "High", "Low", "N?"],
                //     Message: "Invalid anti Hbs result"
                // }
            },
            antiHbcIgg: {
                type: String,
                required: [true, 'This field value is required'],
                // enum: {
                //     values: ["Normal", "High", "Low", "N?"],
                //     Message: "Invalid anti Hbc Igg result"
                // }
            },
            antiHbcIgm: {
                type: String,
                required: [true, 'This field value is required'],
                // enum: {
                //     values: ["Normal", "High", "Low", "N?"],
                //     Message: "Invalid anti Hbc Igm result"
                // }
            }
        },
        drugTest: {
            methamphethamineResults: {
                type: String,
                required: [true, 'This field value is required'],
                default: 'N/A',
                // enum: {
                //     values: ["Positive", "Negative"],
                //     message: "Invalid result!"
                // }
            },
            methamphethamineRemarks: {
                type: String,
                required: false,
                // enum: {
                //     values: ["Passed", "Failed"],
                //     message: "Invalid remarks!"
                // }
            },
            tetrahydrocannabinolResults: {
                type: String,
                required: [true, 'This field value is required'],
                default: 'N/A',
                // enum: {
                //     values: ["Positive", "Negative"],
                //     message: "Invalid result!"
                // }
            },
            tetrahydrocannabinolRemarks: {
                type: String,
                required: false,
                // enum: {
                //     values: ["Passed", "Failed"],
                //     message: "Invalid remarks!"
                // }
            },
        },
        urinalysis: {
            color: {
                type: String,
                required: [true, 'This field value is required'],
                // match: [/^[A-Za-z]+$/, 'This field can only contain letters']
            },
            transparency: {
                type: String,
                required: [true, 'This field value is required'],
                // match: [/^[A-Za-z]+$/, 'This field can only contain letters']
            },
            blood: {
                type: String,
                required: [true, 'This field value is required'],
                // match: [/^[A-Za-z]+$/, 'This field can only contain letters']
            },
            bilirubin: {
                type: String,
                required: [true, 'This field value is required']
            },
            urobilinogen: {
                type: String,
                required: [true, 'This field value is required']
            },
            ketones: {
                type: String,
                required: [true, 'This field value is required']
            },
            glutones: {
                type: String,
                required: [true, 'This field value is required']
            },
            protein: {
                type: String,
                required: [true, 'This field value is required']
            },
            nitrite: {
                type: String,
                required: [true, 'This field value is required']
            },
            leukocyte: {
                type: String,
                required: [true, 'This field value is required']
            },
            phLevel: {
                type: Number,
                required: [true, 'This field value is required']
            },
            spGravity: {
                type: String, required: [true, 'This field value is required']
            },
            wbc: {
                type: String,
                required: [true, 'This field value is required']
            },
            rbc: {
                type: String,
                required: [true, 'This field value is required']
            },
            bacteria: {
                type: String,
                required: [true, 'This field value is required']
            },
            epithelialCells: {
                type: String,
                required: [true, 'This field value is required']
            },
            amorphousUrates: {
                type: String,
                required: [true, 'This field value is required']
            },
            mucusThreads: {
                type: String,
                required: [true, 'This field value is required']
            }
        },
        fecalysis: {
            color: {
                type: String,
                required: [true, 'This field value is required']
            },
            consistency: {
                type: String,
                required: [true, 'This field value is required']
            },
            wbc: {
                type: String,
                required: [true, 'This field value is required']
            },
            rbc: {
                type: String,
                required: [true, 'This field value is required']
            },
            fatGlobules: {
                type: String,
                required: [true, 'This field value is required']
            },
            muscleFibers: {
                type: String,
                required: [true, 'This field value is required']
            },
            results: {
                type: String,
                required: [true, 'This field value is required']
            }
        },
        others: {
            pregnancyTest: {
                type: String,
                required: [true, 'This field value is required'],
                // enum: {
                //     values: ["Positive", "Negative"],
                //     Message: "Invalid Pregnancy Results"
                // }
            }
        },
        attachments: { 
            type: String, 
            required: true 
        }
    },
    vaccination: {
        covidVaccination: {
            firstDose: {
                dose: {
                    type: String,
                    required: [true, 'This field value is required'],
                    // minlength: [5, 'Entered text in field is too short'],
                    // maxlength: [50, 'Maximum text entered reached']
                },
                dateGiven: {
                    type: Date,
                    required: [true, 'This field value is required'],
                    // validate: {
                    //     validator: function (value) {
                    //         return !isNaN(new Date(value))
                    //     },
                    //     message: 'Data input is not a valid date!'
                    // }
                }
            },
            secondDose: {
                dose: {
                    type: String,
                    required: [true, 'This field value is require'],
                    // minlength: [5, 'Entered text in field is too short'],
                    // maxlength: [50, 'Maximum text entered reached']
                },
                dateGiven: {
                    type: Date,
                    required: [true, 'This field value is required'],
                    // validate: {
                    //     validator: function (value) {
                    //         return !isNaN(new Date(value))
                    //     },
                    //     message: 'Data input is not a valid date!'
                    // }
                }
            },
            thirdDose: {
                dose: {
                    type: String,
                    required: [true, 'This field value is required'],
                    // minlength: [5, 'Entered text in field is too short'],
                    // maxlength: [50, 'Maximum text entered reached']
                },
                dateGiven: {
                    type: Date,
                    required: [true, 'This field value is required'],
                    // validate: {
                    //     validator: function (value) {
                    //         return !isNaN(new Date(value))
                    //     },
                    //     message: 'Data input is not a valid date!'
                    // }
                }
            }
        },
        fluVaccination: {
            firstDose: {
                type: String,
                required: [true, 'This field value is required'],
                // minlength: [5, 'Entered text in field is too short'],
                // maxlength: [50, 'Maximum text entered reached']

            },
            dateGiven: {
                type: Date,
                required: [true, 'This field value is required'],
                // validate: {
                //     validator: function (value) {
                //         return !isNaN(new Date(value))
                //     },
                //     message: 'Data input is not a valid date!'
                // }
            }
        },
        hepatitisBVaccination: {
            firstDose: {
                dose: {
                    type: String,
                    required: [true, 'This field value is required'],
                    // minlength: [5, 'Entered text in field is too short'],
                    // maxlength: [50, 'Maximum text entered reached']

                },
                dateGiven: {
                    type: Date,
                    required: [true, 'This field value is required'],
                    // validate: {
                    //     validator: function (value) {
                    //         return !isNaN(new Date(value))
                    //     },
                    //     message: 'Data input is not a valid date!'
                    // }
                }
            },
            secondDose: {
                dose: {
                    type: String,
                    required: [true, 'This field value is require'],
                    // minlength: [5, 'Entered text in field is too short'],
                    // maxlength: [50, 'Maximum text entered reached']
                },
                dateGiven: {
                    type: Date,
                    required: [true, 'This field value is required'],
                    // validate: {
                    //     validator: function (value) {
                    //         return !isNaN(new Date(value))
                    //     },
                    //     message: 'Data input is not a valid date!'
                    // }
                }
            },
            thirdDose: {
                dose: {
                    type: String,
                    required: [true, 'This field value is required'],
                    // minlength: [5, 'Entered text in field is too short'],
                    // maxlength: [50, 'Maximum text entered reached']
                },
                dateGiven: {
                    type: Date,
                    required: [true, 'This field value is required'],
                    // validate: {
                    //     validator: function (value) {
                    //         return !isNaN(new Date(value))
                    //     },
                    //     message: 'Data input is not a valid date!'
                    // }
                }
            }
        },
        pneumoniaVaccination: {
            firstDose: {
                type: String,
                required: [true, 'This field value is required'],
                // minlength: [5, 'Entered text in field is too short'],
                // maxlength: [50, 'Maximum text entered reached']
            },
            dateGiven: {
                type: Date,
                required: [true, 'This field value is required'],
                // validate: {
                //     validator: function (value) {
                //         return !isNaN(new Date(value))
                //     },
                //     message: 'Data input is not a valid date!'
                // }
            }
        },
        attachments: { 
            type: String, 
            required: true 
        }
    },
    medicalHistory: {
        tattoo: {
            type: String,
            required: [true, 'This field value is required'],
            default: false,
            // enum: {
            //     values: ["Yes", "No"],
            //     messages: ["Invalid input!"]
            // }

        },
        bloodPressure: {
            systolic: {
                type: Number,
                required: [true, 'This field value is required'],
                // validate: {
                //     validator: function (value) {
                //         return /^-?\d+(\.\d+)?$/.test(value.toString())
                //     },
                //     message: props => `${props.value} is not a valid float for height!`
                // }
            },
            diastolic: {
                type: Number,
                required: [true, 'This field value is required'],
                // validate: {
                //     validator: function (value) {
                //         return /^-?\d+(\.\d+)?$/.test(value.toString())
                //     },
                //     message: props => `${props.value} is not a valid float for height!`
                // }
            }
        },
        conditions: {
            anemia: {
                type: Boolean,
                required: [true, 'This field value is required'],
                default: false
            },
            asthma: {
                type: Boolean,
                required: [true, 'This field value is required'],
                default: false

            },
            blackJointProblem: {
                type: Boolean,
                required: [true, 'This field value is required'],
                default: false
            },
            heartDiseases: {
                type: Boolean,
                required: [true, 'This field value is required'],
                default: false
            },
            hepatitis: {
                type: Boolean,
                required: [true, 'This field value is required'],
                default: false
            },
            highBloodPressure: {
                type: Boolean,
                required: [true, 'This field value is required'],
                default: false
            },
            kidneyProblem: {
                type: Boolean,
                required: [true, 'This field value is required'],
                default: false
            },
            chronicDiseases: {
                type: Boolean,
                required: [true, 'This field value is required'],
                default: false
            },
            thyroidProblems: {
                type: Boolean,
                required: [true, 'This field value is required'],
                default: false
            },
            bloodDyscrasia: {
                type: Boolean,
                required: [true, 'This field value is required'],
                default: false
            },
            others: { 
                type: Boolean, 
                required: true, 
                default: false 
            }
        },
        q1: {
            yesOrNo: {
                type: Boolean,
                required: [true, 'This field value is required'],
                default: false,
            },
            doctorName: {
                type: String,
                required: [true, 'This field value is required'],
                // maxlength: [255, "Name must be less than 255 characters"],
                // minlength: [1, "Name must be greater than 1 character"],
                // match: [/^[A-Za-z\s]+$/, 'Name can only contain letters']

            },
            phone: {
                type: String,
                required: [true, 'This field value is required'],
                // validate: {
                //     validator: function (value) {
                //         return /^\d{11}$/.test(value.toString());
                //     },
                //     message: props => `${props.value} is not a valid contact number!`
                // }
            },
            homeAddress: { 
                type: String, 
                required: true },
            forWhatCondition: { 
                type: String, 
                required: true }
        },
        q2: {
            yesOrNo: {
                type: Boolean,
                required: [true, 'This field value is required'],
                default: false

            },
            pastIllnessSurgery: { 
                type: String, 
                required: true 
            }
        },
        q3: {
            yesOrNo: {
                type: Boolean,
                required: [true, 'This field value is required'],
                default: false
            },

            drugFoodAllergies: {
                type: String,
                required: true
            }
        },
        q4: {
            yesOrNo: {
                type: Boolean,
                required: [true, 'This field value is required'],
                default: false
            },
            nameOfMedication: {
                type: String,
                required: [true, 'This field value is required'],
                // maxlength: [50, "Name must be less than 255 characters"],
                // minlength: [5, "Name must be greater than 1 character"],
                // match: [/^[A-Za-z\s]+$/, 'Name can only contain letters']
            },
            type: {
                type: String,
                required: [true, 'This field value is required'],
                // maxlength: [50, "type must be less than 255 characters"],
                // minlength: [5, "type must be greater than 1 character"],
                // match: [/^[A-Za-z\s]+$/, 'Name can only contain letters']
            },
            brand: { 
                type: String, 
                required: true 
            },
            others: { 
                type: String, 
                required: true 
            },
        },
        q5: {
            yesOrNo: {
                type: Boolean,
                required: [true, 'This field value is required'],
                default: false
            },
            physicalLearningDisability: {
                type: String,
                required: [true, 'This field value is required'],
                // maxlength: [50, "Name must be less than 255 characters"],
                // minlength: [1, "Name must be greater than 1 character"],
                // match: [/^[A-Za-z\s]+$/, 'Name can only contain letters']
            },
        },
        attachments: { 
            type: String, 
            required: true 
        }
    },
    dentalRecord: {
        isFilledOut: { type: Boolean, required: true, default: false },
        q1: { type: [String], required: true, default: [""] },
        q2: { type: Date, required: true, default: Date.now },
        q3: {
            hasDentures: { type: Boolean, required: true, default: false },
            dentureType: { type: String, required: function () { return this.hasDentures }, default: "" },
        },
        q4: { type: String, required: false, default: "" },
        q5: {
            hasDentalProcedure: { type: Boolean, required: true, default: false },
            pastDentalSurgery: [{
                name: { type: String, required: function () { return this.hasDentalProcedure }, default: "" },
                date: { type: Date, required: function () { return this.hasDentalProcedure }, default: Date.now }
            }]
        },
        q6: {
            55: { type: [String], required: false, default: [""] },
            54: { type: [String], required: false, default: [""] },
            53: { type: [String], required: false, default: [""] },
            52: { type: [String], required: false, default: [""] },
            51: { type: [String], required: false, default: [""] },
            61: { type: [String], required: false, default: [""] },
            62: { type: [String], required: false, default: [""] },
            63: { type: [String], required: false, default: [""] },
            64: { type: [String], required: false, default: [""] },
            65: { type: [String], required: false, default: [""] },
            18: { type: [String], required: false, default: [""] },
            17: { type: [String], required: false, default: [""] },
            16: { type: [String], required: false, default: [""] },
            15: { type: [String], required: false, default: [""] },
            14: { type: [String], required: false, default: [""] },
            13: { type: [String], required: false, default: [""] },
            12: { type: [String], required: false, default: [""] },
            11: { type: [String], required: false, default: [""] },
            21: { type: [String], required: false, default: [""] },
            22: { type: [String], required: false, default: [""] },
            23: { type: [String], required: false, default: [""] },
            24: { type: [String], required: false, default: [""] },
            25: { type: [String], required: false, default: [""] },
            26: { type: [String], required: false, default: [""] },
            27: { type: [String], required: false, default: [""] },
            28: { type: [String], required: false, default: [""] },
            48: { type: [String], required: false, default: [""] },
            47: { type: [String], required: false, default: [""] },
            46: { type: [String], required: false, default: [""] },
            45: { type: [String], required: false, default: [""] },
            44: { type: [String], required: false, default: [""] },
            43: { type: [String], required: false, default: [""] },
            42: { type: [String], required: false, default: [""] },
            41: { type: [String], required: false, default: [""] },
            31: { type: [String], required: false, default: [""] },
            32: { type: [String], required: false, default: [""] },
            33: { type: [String], required: false, default: [""] },
            34: { type: [String], required: false, default: [""] },
            35: { type: [String], required: false, default: [""] },
            36: { type: [String], required: false, default: [""] },
            37: { type: [String], required: false, default: [""] },
            38: { type: [String], required: false, default: [""] },
            85: { type: [String], required: false, default: [""] },
            84: { type: [String], required: false, default: [""] },
            83: { type: [String], required: false, default: [""] },
            82: { type: [String], required: false, default: [""] },
            81: { type: [String], required: false, default: [""] },
            71: { type: [String], required: false, default: [""] },
            72: { type: [String], required: false, default: [""] },
            73: { type: [String], required: false, default: [""] },
            74: { type: [String], required: false, default: [""] },
            75: { type: [String], required: false, default: [""] }

        },
        q7: {
            presenceOfDebris: { type: Boolean, required: true, default: false },
            presenceOfToothStain: { type: Boolean, required: true, default: false },
            presenceOfGingivitis: { type: Boolean, required: true, default: false },
            presenceOfPeriodontalPocket: { type: Boolean, required: true, default: false },
            presenceOfOralBiofilm: { type: Boolean, required: true, default: false },
            underOrthodonticTreatment: {
                hasTreatment: { type: Boolean, required: true, default: false },
                yearStarted: { type: Number, required: function () { return this.hasTreatment }, default: Date.now },
                lastAdjustment: { type: Date, required: function () { return this.hasTreatment }, default: Date.now }
            }
        },
        q8: {
            numTeethPresent: {
                temporary: { type: Number, required: true, default: 0 },
                permanent: { type: Number, required: true, default: 0 }
            },
            numCariesFreeTeeth: {
                temporary: { type: Number, required: true, default: 0 },
                permanent: { type: Number, required: true, default: 0 }
            },
            numTeethforFilling: {
                temporary: { type: Number, required: true, default: 0 },
                permanent: { type: Number, required: true, default: 0 }
            },
            numTeethforExtraction: {
                temporary: { type: Number, required: true, default: 0 },
                permanent: { type: Number, required: true, default: 0 }
            },
            totalNumDecayedTeeth: {
                temporary: { type: Number, required: true, default: 0 },
                permanent: { type: Number, required: true, default: 0 }
            },
            numFilledTeeth: {
                temporary: { type: Number, required: true, default: 0 },
                permanent: { type: Number, required: true, default: 0 }
            },
            numMissingTeeth: {
                temporary: { type: Number, required: true, default: 0 },
                permanent: { type: Number, required: true, default: 0 }
            },
            numUneruptedTeeth: {
                temporary: { type: Number, required: true, default: 0 },
                permanent: { type: Number, required: true, default: 0 }
            }
        },
        q9: {
            hasDentofacialAb: { type: Boolean, required: true, default: false },
            name: { type: [String], required: function () { return this.hasDentofacialAb }, default: [""] }
        },
        q10: {
            needUpperDenture: { type: Number, required: true, default: 0 },
            needLowerDenture: { type: Number, required: true, default: 0 }
        },
        notes: { type: String, required: false, default: "" },
        attachments: [
            {
                filename: { type: String, required: false, default: "" },
                urlLink: { type: String, required: false, default: "" }
            }
        ]
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
