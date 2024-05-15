const mongoose = require('mongoose')

//LIST OF ALL UTILITY FUNCTIONS

// INDICATOR FOR DATES THAT HOLD DUMMY DATA
const dateNone = new Date("9999-12-31T23:59:59.999Z")

//CHECKS IF DATA CONTAINS COMPLETE DATE & TIME VALUE
const dateTimeRegex = /^(?:\d{4})-(?:0[1-9]|1[0-2])-(?:0[1-9]|[1-2][0-9]|3[0-1])T(?:[0-1][0-9]|2[0-3]):(?:[0-5][0-9]):(?:[0-5][0-9])$/

//CHECKS IF DATA CONTAINS DATE ONLY
const dateRegex = /^(?:19|20)\d{2}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12][0-9]|3[01])T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d\.\d{3}Z$/

//CHECKS IF STRING ONLY CONTAINS LETTERS, APOSTROPHE, HYPHEN, OR SPACE - MUST START AND END W LETTER
const textRegex = /^[a-zA-Z]+(?:[\s-]*[a-zA-Z]+)*$/ // /^[a-zA-Z][a-zA-Z.,'\s-]*$/

// CHECKS IF STRING ONLY CONTAINS LETTERS, APOSTROPHE, HYPHEN, OR SPACE - MUST START AND END W LETTER
// ALSO ALLOWS N/A INPUT (FOR OPTIONAL FIELDS)
const textOpRegex = /^(?:N\/A|[a-zA-Z]+(?:[\s-']*[a-zA-Z]+)*)$/ 

// CHECKS IF STRING CONTAINS AT LEAST 1 LETTER. WON'T ALLOW NUMBERS/SYMBOLS ONLY
const aNSRegex = /^(?=.*[a-zA-Z]).*$/ // /^(?=.*[a-zA-Z])[a-zA-Z0-9!@#$%^&*()-_=+`~[\]{}|;:'",.<>/?]*$/

//CHECKS IF EMAIL IS VALID
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// CHECKS IF PASSWORD SATISFIES GUIDELINES
// Contains at least 1 uppercase letter, 1 lowercase letter, 1 number, 1 special character, and includes 8-20 characters
const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*()-=_+|{}[\]:;"'<>,.?/])(?=.*[a-z])(?=.*[A-Z]).{8,20}$/

//Valid Campus
const isValidCampus = ['Manila','Makati', 'Malolos']

const gender = ['Male', 'Female']

//LIST REFERENCE FOR USER TYPES
const userTypeList = ['Dentist', 'Nurse', 'Doctor']

//LIST REFERENCE FOR HISTORY TYPES
const historyTypeList = ['ADD', 'UPDATE', 'ARCHIVE', 'UNARCHIVE']

//LIST REFERENCE FOR RECORD CLASS
const recordClassList = ['Medical', 'Dental', 'All']

//CHECKS IF THE GIVEN VALUE IS A VALID MONGOOSE OBJ ID
const isObjIdValid = (id) => {

    const objId = mongoose.Types.ObjectId
    if (objId.isValid(id)) {
        if (String(new objId(id)) === id) {
            return true
        }
        else {
            return false
        }
    }
    else {
        return false
    }
}

//CHECKS IF THE ARGUMENT IS NULL OR NOT. RETURNS TRUE IF THE ARGUMENT IS NULL, OTHERWISE RETURNS FALSE.
const checkIfNull = (data)=>{
    return (data == null || data == "null" || data === "" || (typeof data === 'string' && data.trim() == "") || (typeof data === "undefined"))
}

//CHECKS IF AN OBJ/DATA W DATATYPES OTHER THAN STRING ARGUMENT IS NULL OR NOT. RETURNS TRUE IF THE ARGUMENT IS NULL, OTHERWISE RETURNS FALSE.

const checkObjNull = (obj)=>{
    return (obj === null || obj === "null" || obj === "" || (typeof obj === "undefined") || (obj !== null && typeof obj === 'object' && Object.keys(obj).length === 0)
    || (obj !== null && typeof obj !== 'object'))
}

//CHECKS IF AN ARRAY ARGUMENT IS NULL OR NOT. RETURNS TRUE IF THE ARRAY IS NULL/EMPTY, OTHERWISE RETURNS FALSE.
const checkArrNull = (arr)=>{
    return ((typeof arr === "undefined") || arr.length === 0 || arr.includes("") && arr.length === 1)
}

const checkFullArr = (arr, message, func)=>{
    if (arr) {
        if (Array.isArray(arr)) {
            if (!checkArrNull(arr)) {
                if (typeof func === 'function') {
                    return (func(arr))
                } else {
                    return null
                }
            } else {
                return (message)
            }
        } else {
            return (message + ': Not an Array')
        }
    } else {
       return (message)
    }
}

//CHECKS IF THE VALUE OF A MANDATORY FIELD IS NULL OR NOT. RETURNS TRUE IF ALL MANDATORY FIELDS ARE NOT NULL, OTHERWISE RETURNS FALSE.
const checkMandatoryFields = (arrs) => {
    let result = true

    arrs.forEach(data => {
        if (checkIfNull(data) == true) {
            result = false
        }
    })
}

String.prototype.toProperCase = function () {
    return input.toLowerCase().replace(/^(.)|\s(.)/g, function ($1) { return $1.toUpperCase(); })
}

//GENERATES RANDOM PASSWORD
const generatePassword = () => {

    let password = ''
    length = 15
    const upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    const lowerCase = "abcdefghijklmnopqrstuvwxyz"
    const number = "1234567890"
    const symbol = "~!@#$%^&*()_-+=/|{}[]><"
    const allChars = upperCase + lowerCase + number + symbol

    password += upperCase[Math.floor(Math.random() * upperCase.length)]
    password += lowerCase[Math.floor(Math.random() * lowerCase.length)]
    password += number[Math.floor(Math.random() * number.length)]
    password += symbol[Math.floor(Math.random() * symbol.length)]

    while (password.length < length) {
        const randomIndex = Math.floor(Math.random() * allChars.length)
        password += allChars[randomIndex]
    }
    return password
}

String.prototype.toProperCase = function () {
    return this.toLowerCase().replace(/^(.)|\s(.)/g, function ($1) { return $1.toUpperCase(); })
}

// THROW SIMPLE CUSTOM ERROR
const throwError = (errMessage, errStatus) => {
    let error = new Error(errMessage)
    error.status = errStatus
    throw error
}

// DENTAL RECORD FIELDS WITH FIXED VALUES (LIST)

const q4Values = ["2x a day", "3x a day", "every after meal", "before going to bed"] 

const q6Values = ["/", "C", "X", "Rf", "M", "Tf", "Co", "Gf", "JC", "S", "Im", "Fb", "SC", "Un", "P", "CD", "Am", "Ab", "RCT"]

module.exports = {
    dateTimeRegex,
    dateRegex,
    textRegex,
    textOpRegex,
    aNSRegex,
    emailRegex,
    passwordRegex,
    userTypeList,
    historyTypeList,
    recordClassList,
    q4Values,
    q6Values,
    dateNone,
    isObjIdValid,
    checkIfNull,
    checkObjNull,
    checkArrNull,
    checkFullArr,
    checkMandatoryFields,
    generatePassword,
    throwError,
    toProperCase: String.prototype.toProperCase,
    isValidCampus,
    gender
}
