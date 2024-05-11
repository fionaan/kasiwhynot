const renderPatientPage = async()=>{

    localStorage.setItem("category", "student")
    let category = localStorage.getItem("category")
    let sort = 1

    let payload = {
        category: category,
        sort: sort,
        filter: {}
    }

    let data = await getAllPatient(payload)

    console.log(`${JSON.stringify(data)}`)

    document.getElementById("userTable").innerHTML = renderTable(data, ["Student No.", "Name", "Course", "Year Level", "Campus", "Status"])
}