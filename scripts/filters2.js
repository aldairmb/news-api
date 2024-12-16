document.addEventListener('DOMContentLoaded', function () {
  // Restore saved sections
  const savedSections = JSON.parse(localStorage.getItem('savedSections')) || {};
  Object.keys(savedSections).forEach(sectionId => {
      const sectionElement = document.getElementById(sectionId);
      if (sectionElement) {
          const h2 = document.createElement('h2');
          h2.textContent = savedSections[sectionId];
          sectionElement.innerHTML = ''; // Clear any existing content
          sectionElement.appendChild(h2);
      }
  });

  // Form handling
  const form = document.getElementById('news-filters');
  const categoryInput = document.getElementById('category');
  const sourceInput = document.getElementById('source');
  const keywordInput = document.getElementById('keyword-filter');

  const toggleInputs = (disabledInput1, disabledInput2, condition) => {
      disabledInput1.disabled = condition;
      disabledInput2.disabled = condition;
  };

  // Add event listeners to toggle disabling
  categoryInput.addEventListener('change', () => {
      toggleInputs(sourceInput, keywordInput, categoryInput.value !== '');
  });

  sourceInput.addEventListener('change', () => {
      toggleInputs(categoryInput, keywordInput, sourceInput.value !== '');
  });

  keywordInput.addEventListener('input', () => {
      const hasValue = keywordInput.value.trim() !== '';
      toggleInputs(categoryInput, sourceInput, hasValue);
  });

  form.addEventListener('submit', function (event) {
      event.preventDefault();

      // Collect selected filter values
      const category = categoryInput.value;
      const source = sourceInput.value;
      const keyword = keywordInput.value.trim();
      const section = document.getElementById('section').value;

      // Determine the display text
      let displayText = '';
      if (category) {
          displayText = category.charAt(0).toUpperCase() + category.slice(1);
      } else if (source) {
          displayText = source.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      } else if (keyword) {
          displayText = keyword.charAt(0).toUpperCase() + keyword.slice(1);
      }

      // Update section content
      if (section) {
          const sectionElement = document.getElementById(section);
          if (sectionElement) {
              const h2 = document.createElement('h2');
              h2.textContent = displayText;
              sectionElement.innerHTML = ''; // Clear content
              sectionElement.appendChild(h2);

              // Save the value in localStorage
              savedSections[section] = displayText;
              localStorage.setItem('savedSections', JSON.stringify(savedSections));

              // Add articles list
              const ul = document.createElement('ul');
              ul.id = 'articles-list';
              sectionElement.appendChild(ul);

              // Fetch articles
              const apiKey = 'b9b25782075944c282a534210d4027eb';
              let url = `https://newsapi.org/v2/top-headlines?apiKey=${apiKey}`;
              if (category) url += `&category=${category}`;
              if (source) url += `&sources=${source}`;
              if (keyword) url += `&q=${encodeURIComponent(keyword)}`;

              fetch(url)
                  .then(response => response.json())
                  .then(data => {
                      ul.innerHTML = ''; // Clear existing articles
                      if (data.status === 'ok' && data.articles.length > 0) {
                          data.articles.forEach(article => {
                              const li = document.createElement('li');
                              li.innerHTML = `
                                  <h3>${article.title}</h3>
                                  <p><strong>Author:</strong> ${article.author || 'Unknown'}</p>
                                  <p><strong>Description:</strong> ${article.description || 'No description available.'}</p>
                                  <p><strong>Source:</strong> ${article.source.name}</p>
                                  <a href="${article.url}" target="_blank">Read more</a>
                                  <img src="${article.urlToImage}" alt="Image" style="max-width: 100%; height: auto;">
                              `;
                              ul.appendChild(li);
                          });
                      } else {
                          ul.innerHTML = '<li>No articles found for the selected filters.</li>';
                      }
                  })
                  .catch(error => {
                      console.error('Error fetching articles:', error);
                      ul.innerHTML = '<li>There was an error fetching the articles. Please try again later.</li>';
                  });
          }
      }
  });
});
