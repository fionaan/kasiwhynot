const api_client = async(endpoint, options)=>{

    let response = await fetch(endpoint, options)

    if (response.ok){
        return response.json()
    }
    return {
        "error": response.error,
        "status": response.status
    }


}