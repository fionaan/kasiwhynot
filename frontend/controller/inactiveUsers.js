const renderUsersPage = async () => {
    let data = await getAllInactiveUsers();

    console.log(`${JSON.stringify(data)}`);

    document.getElementById("userTable").innerHTML = renderTable(data, ["Name", "Email Address", "User Type", "Status", "Date Created", "Date Updated", "Action"], "InactiveUsers");
}

renderUsersPage();
