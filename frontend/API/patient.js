const getAllPatient = async(payload)=>{

    let options = {
        method: "POST",
        body: JSON.stringify({
            category: payload.category,
            sort: payload.sort
        }),
        headers: {
            "Content-Type": "application/json"
        }
    }

    let data = await api_client("http://localhost:8000/patients/get", options)

    return data.data


}