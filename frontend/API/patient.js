const getAllPatients = async(payload)=>{

    let options = {
        method: "POST",
        body: JSON.stringify({
            category: payload.category,
            sort: payload.sort,
            filters: payload.filters
        }),
        headers: {
            "Content-Type": "application/json"
        }
    }

    let data = await api_client("http://localhost:8000/patients/getFilter", options)

    return data.data
}
