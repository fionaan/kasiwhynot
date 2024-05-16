const getAllLogs = async(payload)=>{

    let data = await api_client("http://localhost:8000/logs/all", {})
   
    return data.data
}
