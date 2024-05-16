const renderTable = (data, columns, page) => {

  let header = "";
  
  columns.forEach(element => {
      header += `<th class="px-4 py-2 whitespace-nowrap">${element}</th>`;
  });
  
  let trow = "";
  
  data.forEach((element, index) => {
      const rowClass = index % 2 === 0 ? "bg-gray-200" : "bg-white";

      if (page == "ActiveUsers") {
          trow += `
          <tr class="${rowClass}">
              <td class="px-4 py-2 whitespace-nowrap">${element.fullName}</td>
              <td class="px-4 py-2 whitespace-nowrap">${element.emailAddress}</td>
              <td class="px-4 py-2 whitespace-nowrap">${element.userType}</td>
              <td class="px-4 py-2 whitespace-nowrap">${element.status}</td>
              <td class="px-4 py-2 whitespace-nowrap">${element.createdAt}</td>
              <td class="px-4 py-2 whitespace-nowrap">${element.updatedAt}</td>
              <td class="px-4 py-2 whitespace-nowrap">
                  <button class="text-blue-800">Archive</button>
              </td>
          </tr>
          `;

      } else if (page == "InactiveUsers") {
          trow += `
          <tr class="${rowClass}">
              <td class="px-4 py-2 whitespace-nowrap">${element.fullName}</td>
              <td class="px-4 py-2 whitespace-nowrap">${element.emailAddress}</td>
              <td class="px-4 py-2 whitespace-nowrap">${element.userType}</td>
              <td class="px-4 py-2 whitespace-nowrap">${element.status}</td>
              <td class="px-4 py-2 whitespace-nowrap">${element.createdAt}</td>
              <td class="px-4 py-2 whitespace-nowrap">${element.updatedAt}</td>
              <td class="px-4 py-2 whitespace-nowrap">
                  <button class="text-blue-800">Unarchive</button>
              </td>
          </tr>
          `;

      } else if (page == "Students") {
          trow += `<tr class="${rowClass}">
              <td class="px-4 py-2 whitespace-nowrap">${element.studentNo}</td>
              <td class="px-4 py-2 whitespace-nowrap">${element.fullName}</td>
              <td class="px-4 py-2 whitespace-nowrap">${element.course}</td>
              <td class="px-4 py-2 whitespace-nowrap">${element.year}</td>
              <td class="px-4 py-2 whitespace-nowrap">${element.campus}</td>
              <td class="px-4 py-2 whitespace-nowrap">${element.status ? "Inactive" : "Active"}</td>
          </tr>`;

      } else if (page == "Employees") {
        trow += `<tr class="${rowClass}">
            <td class="px-4 py-2 whitespace-nowrap">${element.employeeNo}</td>
            <td class="px-4 py-2 whitespace-nowrap">${element.fullName}</td>
            <td class="px-4 py-2 whitespace-nowrap">${element.department}</td>
            <td class="px-4 py-2 whitespace-nowrap">${element.role}</td>
            <td class="px-4 py-2 whitespace-nowrap">${element.campus}</td>
            <td class="px-4 py-2 whitespace-nowrap">${element.status}</td>
        </tr>`;
    }
  });

  let table = `
  <table class="min-w-full table-fixed">
      <thead class="sticky top-0 bg-white">
          <tr>
              ${header}
          </tr>
      </thead>
      <tbody class="text-center">
          ${trow}
      </tbody>
  </table>
  `;

  return table;
};
