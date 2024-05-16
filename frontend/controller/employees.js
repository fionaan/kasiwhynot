const renderPatientPage = async () => {

    localStorage.setItem("category", "employees")
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

    document.getElementById("patientTable").innerHTML = renderTable(data, ["Employee No.", "Name", "Department", "Role", "Campus", "Status"], "Employees")
}