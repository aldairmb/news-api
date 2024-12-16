// Select the theme dropdown element
const themeSelect = document.getElementById('theme');

// Function to apply the selected theme class to the body
function applyTheme(theme) {
  // Remove all theme classes from the body
  document.body.classList.remove(...document.body.classList);

  // Add the new theme class (e.g., "theme-1", "theme-2", etc.)
  document.body.classList.add(theme);

  // Save the selected theme to local storage
  localStorage.setItem('selectedTheme', theme);
}

// Event listener to detect when the user selects a theme
themeSelect.addEventListener('change', function() {
  applyTheme(themeSelect.value);
});

// Load the theme from local storage on page load
document.addEventListener('DOMContentLoaded', () => {
  // Get the saved theme from local storage (default to "theme-1" if not set)
  const savedTheme = localStorage.getItem('selectedTheme') || 'theme-1';

  // Apply the saved theme
  applyTheme(savedTheme);

  // Set the dropdown to reflect the saved theme
  themeSelect.value = savedTheme;
});
