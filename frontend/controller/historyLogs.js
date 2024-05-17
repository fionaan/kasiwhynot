const renderUsersPage = async () => {
    let data = await getAllLogs();

    console.log(`${JSON.stringify(data)}`);

    document.getElementById("logsTable").innerHTML = renderTable(data, ["Date and Time", "Edited By", "History Type", "Record Class", "Patient Name"], "Logs");
}

renderUsersPage();
