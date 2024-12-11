document.addEventListener("DOMContentLoaded", () => {
  initSqlJs({ wasmBinary }).then((SQL) => {
    let db; // Global database variable
    let selectedTable; // Currently selected table

    // Handle database upload
    handleDatabaseUpload(SQL, (uploadedDb) => {
      db = uploadedDb;

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
        updateFilterDisplay(); // Update the active filter display
      });
    });

    // Apply filters
    document.getElementById("apply-filters").addEventListener("click", () => {
      if (!db) {
        alert("Database is not loaded. Please upload a valid database file.");
        return;
      }
      executeFilters(db, selectedTable, renderTable);
    });

    // Reset filters
    document.getElementById("reset-filters").addEventListener("click", () => {
      if (!db || !selectedTable) {
        alert("No table selected to reset.");
        return;
      }

      filterConditions = []; // Clear all filter conditions
      updateFilterDisplay(); // Clear the displayed filters

      // Reload the original table data
      const result = db.exec(`SELECT * FROM ${selectedTable}`);
      if (result.length === 0 || !result[0].values.length) {
        alert(`No data found in the table: ${selectedTable}`);
        return;
      }

      renderTable(result[0]); // Re-render the table with original data
    });
  });
});
