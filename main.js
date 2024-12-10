document.addEventListener("DOMContentLoaded", () => {
  // Initialize SQL.js
  initSqlJs({ wasmBinary }).then((SQL) => {
    let db; // Define `db` globally for scope access

    // Handle database upload
    const uploadInput = document.getElementById("upload");
    if (!uploadInput) {
      console.error("#upload element not found. Check your HTML structure.");
      return;
    }

    uploadInput.addEventListener("change", function (event) {
      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onload = function (e) {
        try {
          const data = new Uint8Array(e.target.result);
          db = new SQL.Database(data);

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

    // Apply filters on button click
    const applyFiltersButton = document.getElementById("apply-filters");
    if (!applyFiltersButton) {
      console.error("#apply-filters element not found. Check your HTML structure.");
      return;
    }

    applyFiltersButton.addEventListener("click", function () {
      if (!db) {
        alert("Database is not loaded. Please upload a valid database file.");
        return;
      }

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

    function formatColumnName(name) {
      return name
        .split("_") // Split the name by underscores
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalise each word
        .join(" "); // Join words with a space
    }
    
    // Render table function
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
        th.textContent = formatColumnName(colName); // Format column name
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
    
      generateColumnFilters(result.columns); // Generate filter buttons
    }
    

    // Generate column filter buttons
    function generateColumnFilters(columns) {
      const filterButtonsContainer = document.getElementById("filter-buttons");
      if (!filterButtonsContainer) {
        console.error("#filter-buttons element not found. Check your HTML structure.");
        return;
      }
    
      filterButtonsContainer.innerHTML = ""; // Clear existing buttons
    
      columns.forEach((colName) => {
        const button = document.createElement("button");
        button.classList.add("btn", "btn-primary", "me-2", "mb-2");
        button.textContent = `Filter ${formatColumnName(colName)}`; // Format column name
        button.style.minWidth = "120px"; // Optional: Ensure uniform button size
        button.addEventListener("click", () => applyColumnFilter(colName));
        filterButtonsContainer.appendChild(button);
      });
    }
    
    
    // Apply column filter
    function applyColumnFilter(column) {
      if (!db) {
        alert("Database is not loaded. Please upload a valid database file.");
        return;
      }

      const filterValue = prompt(`Enter a filter value for ${column}:`);
      if (!filterValue) return;

      let query = `SELECT * FROM playerdata WHERE ${column} LIKE '%${filterValue}%'`;

      try {
        const result = db.exec(query);

        if (result.length === 0 || !result[0].values.length) {
          alert(`No data found matching "${filterValue}" in column "${column}".`);
          return;
        }

        renderTable(result[0]); // Re-render the table with filtered data
      } catch (err) {
        console.error(`Error applying filter for ${column}:`, err);
        alert("An error occurred while applying the filter.");
      }
    }
  });
});
