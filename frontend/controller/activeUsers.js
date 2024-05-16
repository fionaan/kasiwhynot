const renderUsersPage = async () => {
    let data = await getAllActiveUsers();

    console.log(`${JSON.stringify(data)}`);

    document.getElementById("userTable").innerHTML = renderTable(data, ["Name", "Email Address", "User Type", "Status", "Date Created", "Date Updated", "Action"], "ActiveUsers");
}

renderUsersPage();
