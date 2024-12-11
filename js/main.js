document.addEventListener("DOMContentLoaded", () => {
  initSqlJs({ wasmBinary }).then((SQL) => {
    let db; // Global database variable
    let selectedTable; // Track the selected table

    // Handle database upload
    handleDatabaseUpload(SQL, (uploadedDb) => {
      db = uploadedDb;

      // Get all available tables and let the user choose
      const tables = getTableNames(db);
      if (tables.length === 0) {
        alert("No tables found in the database.");
        return;
      }

      renderTableSelector(tables, (table) => {
        selectedTable = table; // Set the selected table
        const result = db.exec(`SELECT * FROM ${selectedTable}`);
        if (result.length === 0 || !result[0].values.length) {
          alert(`No data found in the table: ${selectedTable}`);
          return;
        }

        renderTable(result[0]); // Render the table
        generateColumnFilters(result[0].columns); // Generate column filters
        console.log("Columns:", result[0].columns);
        
        updateFilterDisplay(); // Update the active filter display
      });
    });

    // Apply filters when the user clicks the "Apply Filters" button
    document.getElementById("apply-filters").addEventListener("click", () => {
      if (!db) {
        alert("Database is not loaded. Please upload a valid database file.");
        return;
      }
      // Now pass selectedTable when applying filters
      executeFilters(db, selectedTable, renderTable);
    });
  });
});
