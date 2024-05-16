const getAllActiveUsers = async()=>{

    let data = await api_client("http://localhost:8000/users/get", {})

    // Filter users to include only those with "Active" status
    let activeUsers = data.data.filter(user => user.status === "Active")

    return activeUsers
}

const getAllInactiveUsers = async()=>{

    let data = await api_client("http://localhost:8000/users/get", {})

    // Filter users to include only those with "Active" status
    let inactiveUsers = data.data.filter(user => user.status === "Inactive")

    return inactiveUsers
}