const renderTable = (data, columns, page)=>{

    let header = ""
    
    columns.forEach(element => {
       header += `<th class="px-4 py-2 whitespace-nowrap">${element}</th>`
       })
    
    
    let trow =""
    
    data.forEach(element =>{
        if (page == "Users"){
            trow += `
            <tr>
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
            `
        }

        else if (page == "Patients"){
            trow += `<tr class=" w-full bg-gray-200">
            <td class="px-4 py-2 whitespace-nowrap"></td>
            <td class="px-4 py-2 whitespace-nowrap">Malcolm Lockyer</td>
            <td class="px-4 py-2 whitespace-nowrap">Bachelor of Science</td>
            <td class="px-4 py-2 whitespace-nowrap">3rd Year</td>
            <td class="px-4 py-2 whitespace-nowrap">LV</td>
            <td class="px-4 py-2 whitespace-nowrap">Active</td>
          </tr>`
        }
       
   })

    let table = `
    <table class=" min-w-full table-fixed">
        <thead class="sticky top-0 bg-white">
                  <tr>
                  ${header}
                    
                  </tr>
        </thead>
        <tbody class="text-center">
                    ${trow}
                  
        </tbody>
    </table>
    `

    return table
}