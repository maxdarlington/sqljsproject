// Format column names
function formatColumnName(name) {
  return name
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Validate URLs
function isValidUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:"; // Allow only HTTP/HTTPS
  } catch (e) {
    return false; // Invalid URL
  }
}


function isStringColumn(colName) {
  const stringKeywords = ["url", "name", "date", "title"]; // Add other keywords for string columns
  return stringKeywords.some((keyword) => colName.toLowerCase().includes(keyword));
}

// Check if the column is numerical based on name or type
function isNumericalColumn(colName) {
  // Here you can add more sophisticated checks (e.g., inspecting column data types)
  const numericalKeywords = ["count", "avg", "players", "gain", "id"]; // You can add more keywords based on your database
  return numericalKeywords.some((keyword) => colName.toLowerCase().includes(keyword));
}