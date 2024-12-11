let filterConditions = []; // Global array to store filter conditions

// Handle database upload
function handleDatabaseUpload(SQL, callback) {
  const uploadInput = document.getElementById("upload");
  if (!uploadInput) {
    console.error("#upload element not found.");
    return;
  }

  uploadInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) {
      alert("No file selected.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const db = new SQL.Database(data); // Load the database
        callback(db); // Pass the database to the callback
      } catch (err) {
        console.error("Error reading the database file:", err);
        alert("An error occurred while processing the file.");
      }
    };

    reader.readAsArrayBuffer(file);
  });
}

// Get all table names from the database
function getTableNames(db) {
  const query = "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';";
  const result = db.exec(query);

  if (result.length === 0 || !result[0].values.length) {
    return [];
  }
  return result[0].values.map((row) => row[0]);
}


// Apply filters to the database
function executeFilters(db, selectedTable, renderCallback) {
  if (filterConditions.length === 0) {
    alert("No filters applied. Please add at least one filter.");
    return;
  }

  let query = `SELECT * FROM ${selectedTable} WHERE ${filterConditions.join(" AND ")}`;
  try {
    const result = db.exec(query);
    if (result.length === 0 || !result[0].values.length) {
      alert("No data found matching the filters.");
      return;
    }
    renderCallback(result[0]); // Pass the result to the render callback
  } catch (err) {
    console.error("Error applying filters:", err);
    alert("An error occurred while applying filters.");
  }
}


