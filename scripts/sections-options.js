document.addEventListener('DOMContentLoaded', function() {
    // Get the saved section values from localStorage
    const savedSections = JSON.parse(localStorage.getItem('savedSections')) || {};

    // Update sections with saved data
    Object.keys(savedSections).forEach(sectionId => {
        const sectionElement = document.getElementById(sectionId);
        if (sectionElement) {
            const h2 = document.createElement('h2');
            h2.textContent = savedSections[sectionId];
            sectionElement.innerHTML = ''; // Clear any existing content
            sectionElement.appendChild(h2); // Append the new h2 element
        }
    });
});

document.getElementById('news-filters').addEventListener('submit', function(event) {
    event.preventDefault();
  
    // Collect the selected filter values
    const category = document.getElementById('category').value;
    const source = document.getElementById('source').value;
    const keyword = document.getElementById('keyword-filter').value.trim();
    const section = document.getElementById('section').value;
  
    // Determine the value to display based on the selected filters
    let displayText = '';
  
    if (category) {
        displayText = category.charAt(0).toUpperCase() + category.slice(1); // Capitalize category
    } else if (source) {
        displayText = source.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '); // Capitalize source
    } else if (keyword) {
        displayText = keyword.charAt(0).toUpperCase() + keyword.slice(1); // Capitalize keyword
    }
  
    // Insert the value as an h2 in the selected section
    if (section) {
        const sectionElement = document.getElementById(section);
        if (sectionElement) {
            const h2 = document.createElement('h2');
            h2.textContent = displayText;
            sectionElement.innerHTML = ''; // Clear any existing content
            sectionElement.appendChild(h2); // Append the new h2 element

            // Save the value to localStorage for persistence
            const savedSections = JSON.parse(localStorage.getItem('savedSections')) || {};
            savedSections[section] = displayText; // Store the h2 text for this section
            localStorage.setItem('savedSections', JSON.stringify(savedSections)); // Update localStorage
        }
    }
});
