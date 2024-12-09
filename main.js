initSqlJs({ wasmBinary }).then((SQL) => {
    let db;
  
    document.getElementById("upload").addEventListener("change", function (event) {
      const file = event.target.files[0];
      const reader = new FileReader();
  
      reader.onload = function (e) {
        try {
          const data = new Uint8Array(e.target.result);
          db = new SQL.Database(data);
  
          // Initial query to fetch all data
          const result = db.exec("SELECT * FROM playerdata");
          if (result.length === 0 || !result[0].values.length) {
            alert("No data found in the table.");
            return;
          }
  
          renderTable(result[0]); // Render the initial table
        } catch (err) {
          console.error("Error reading the database file:", err);
          alert("An error occurred while processing the file. Please ensure it's a valid file.");
        }
      };
  
      reader.readAsArrayBuffer(file);
    });


    // FILTERS:

    // Apply filters on button 
    document.getElementById("apply-filters").addEventListener("click", function () {
      const gameFilter = document.getElementById("filter-game").value.trim();
      const playerFilter = parseInt(document.getElementById("filter-players").value.trim(), 10);
      const filterType = document.getElementById("filter-type").value; // Get the selected filter type
    
      let query = "SELECT * FROM playerdata";
      const conditions = [];
    
      if (gameFilter) {
        conditions.push(`game_name LIKE '%${gameFilter}%'`);
      }
    
      if (!isNaN(playerFilter)) {
        if (filterType === "min") {
          conditions.push(`Avg_players >= ${playerFilter}`);
        } else if (filterType === "max") {
          conditions.push(`Avg_players <= ${playerFilter}`);
        }
      }
    
      if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
      }
    
      try {
        const result = db.exec(query);
    
        if (result.length === 0 || !result[0].values.length) {
          alert("No data found matching the filters.");
          return;
        }
    
        renderTable(result[0]); // Re-render the table with filtered data
      } catch (err) {
        console.error("Error applying filters:", err);
        alert("An error occurred while applying filters.");
      }
    });
    
  
    // RENDER TABLE:

  
    function renderTable(result) {
      const existingTable = document.querySelector("table");
      if (existingTable) {
        existingTable.remove(); // Remove existing table
      }
  
      const table = document.createElement("table");
      table.classList.add("table", "table-hover", "table-striped");
  
      // Create table header
      const thead = document.createElement("thead");
      const headerRow = document.createElement("tr");
      result.columns.forEach((colName) => {
        const th = document.createElement("th");
        th.textContent = colName;
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      table.appendChild(thead);
  
      // Create table body
      const tbody = document.createElement("tbody");
      result.values.forEach((row) => {
        const tr = document.createElement("tr");
        row.forEach((value) => {
          const td = document.createElement("td");
          td.textContent = value;
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
  
      const wrapper = document.createElement("div");
      wrapper.classList.add("table-responsive");
      wrapper.appendChild(table);
      document.body.appendChild(wrapper);
    }
  });
  