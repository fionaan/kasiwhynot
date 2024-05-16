const renderPatientPage = async () => {

    localStorage.setItem("category", "students")
    let category = localStorage.getItem("category")
    let sort = 1
    let filters = {}

    let payload = {
        category: category,
        sort: sort,
        filters: filters
    }

    let data = await getAllPatients(payload)

    console.log(`${JSON.stringify(data)}`)

    document.getElementById("patientTable").innerHTML = renderTable(data, ["Student No.", "Name", "Course", "Year Level", "Campus", "Status"], "Students")
}