// Render the table selector dropdown
function renderTableSelector(tables, callback) {
  const container = document.getElementById("table-selector");
  container.innerHTML = ""; // Clear existing content

  const label = document.createElement("label");
  label.textContent = "Select a Table:";
  label.classList.add("form-label");

  const select = document.createElement("select");
  select.classList.add("form-select");
  tables.forEach((table) => {
    const option = document.createElement("option");
    option.value = table;
    option.textContent = table;
    select.appendChild(option);
  });

  const button = document.createElement("button");
  button.classList.add("btn", "btn-primary", "mt-2");
  button.textContent = "Load Table";
  button.addEventListener("click", () => callback(select.value));

  container.appendChild(label);
  container.appendChild(select);
  container.appendChild(button);
}


// Render the table with results
function renderTable(result) {
  const existingTable = document.querySelector("table");
  if (existingTable) existingTable.remove(); // Remove existing table

  const table = document.createElement("table");
  table.classList.add("table", "table-hover", "table-striped");

  // Create table header
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  result.columns.forEach((colName) => {
    const th = document.createElement("th");
    th.textContent = formatColumnName(colName); // Format the column names
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Create table body
  const tbody = document.createElement("tbody");
  result.values.forEach((row) => {
    const tr = document.createElement("tr");
    row.forEach((value, index) => {
      const td = document.createElement("td");

      // Check if the column is "url" (case-insensitive)
      if (result.columns[index].toLowerCase() === "url" && isValidUrl(value)) {
        const link = document.createElement("a");
        link.href = value; // Set the href attribute
        link.textContent = value; // Display the link text
        link.target = "_blank"; // Open the link in a new tab
        td.appendChild(link); // Add the link to the cell
      } else {
        td.textContent = value; // Render as plain text for other columns
      }

      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  const wrapper = document.createElement("div");
  wrapper.classList.add("table-responsive");
  wrapper.appendChild(table);
  document.body.appendChild(wrapper); // Append table to the document
}


// Generate column filter buttons
function generateColumnFilters(columns) {
  const filterButtonsContainer = document.getElementById("filter-buttons");
  if (!filterButtonsContainer) {
    console.error("#filter-buttons element not found.");
    return;
  }

  filterButtonsContainer.innerHTML = ""; // Clear existing buttons

  columns.forEach((colName) => {
    const columnButtonGroup = document.createElement("div");
    columnButtonGroup.classList.add("d-flex", "flex-column", "align-items-start", "mb-3");

    // Add a label for the column
    const label = document.createElement("label");
    label.textContent = formatColumnName(colName); // Use helper to format column name
    label.classList.add("fw-bold", "mb-2");
    columnButtonGroup.appendChild(label);

    // Check if the column is numerical
    if (isNumericalColumn(colName)) {
      // Add Min button for numerical columns
      const minButton = document.createElement("button");
      minButton.classList.add("btn", "btn-primary", "me-2", "mb-2");
      minButton.textContent = `Min ${formatColumnName(colName)}`;
      minButton.addEventListener("click", () => applyMinMaxFilter(colName, "min"));
      columnButtonGroup.appendChild(minButton);

      // Add Max button for numerical columns
      const maxButton = document.createElement("button");
      maxButton.classList.add("btn", "btn-secondary", "mb-2");
      maxButton.textContent = `Max ${formatColumnName(colName)}`;
      maxButton.addEventListener("click", () => applyMinMaxFilter(colName, "max"));
      columnButtonGroup.appendChild(maxButton);
    } else if (isStringColumn(colName)) {
      // Add Search button for string columns
      const searchButton = document.createElement("button");
      searchButton.classList.add("btn", "btn-success", "mb-2");
      searchButton.textContent = `Search ${formatColumnName(colName)}`;
      searchButton.addEventListener("click", () => applyStringFilter(colName));
      columnButtonGroup.appendChild(searchButton);
    } else {
      // For other column types, add a note
      const infoText = document.createElement("span");
      infoText.classList.add("text-muted");
      infoText.textContent = "(No filter available)";
      columnButtonGroup.appendChild(infoText);
    }

    // Add the column filter button group to the container
    filterButtonsContainer.appendChild(columnButtonGroup);
  });
}

// Update the filter display
function updateFilterDisplay() {
  const filterDisplay = document.getElementById("active-filters");
  if (!filterDisplay) return;

  filterDisplay.innerHTML = ""; // Clear existing filters

  if (filterConditions.length === 0) {
    const noFilters = document.createElement("span");
    noFilters.classList.add("text-muted");
    noFilters.textContent = "No active filters.";
    filterDisplay.appendChild(noFilters);
  } else {
    filterConditions.forEach((condition, index) => {
      const filterElement = document.createElement("div");
      filterElement.classList.add("badge", "bg-info", "text-dark", "me-2");
      filterElement.textContent = condition;

      const removeButton = document.createElement("button");
      removeButton.classList.add("btn-close", "btn-close-white", "ms-2");
      removeButton.addEventListener("click", () => {
        filterConditions.splice(index, 1);
        updateFilterDisplay();
      });

      filterElement.appendChild(removeButton);
      filterDisplay.appendChild(filterElement);
    });
  }
}


// Apply min/max filter to a column
function applyMinMaxFilter(column, type) {
  const value = prompt(`Enter a value for ${formatColumnName(column)} (${type === "min" ? "Minimum" : "Maximum"}):`);
  if (!value || isNaN(value)) {
    alert("Please enter a valid number.");
    return;
  }

  const condition = `${column} ${type === "min" ? ">=" : "<="} ${value}`;
  filterConditions.push(condition); // Add to the filterConditions array
  updateFilterDisplay(); // Update the filter display
}

function applyStringFilter(column) {
  const value = prompt(`Enter a search term for ${formatColumnName(column)}:`);
  if (!value) {
    alert("Please enter a valid search term.");
    return;
  }

  const condition = `${column} LIKE '%${value}%'`; // SQL LIKE clause for partial matching
  filterConditions.push(condition); // Add to the filterConditions array
  updateFilterDisplay(); // Update the filter display
}
