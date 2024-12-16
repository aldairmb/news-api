const apiKey = 'b9b25782075944c282a534210d4027eb';

// Function to disable other filters
function disableOtherFilters(selectedFilter) {
  const categorySelect = document.getElementById('category');
  const sourceSelect = document.getElementById('source');
  const keywordInput = document.getElementById('keyword-filter');

  // Disable other filters based on the selected one
  if (selectedFilter === 'category') {
    sourceSelect.disabled = true;
    keywordInput.disabled = true;
  } else if (selectedFilter === 'source') {
    categorySelect.disabled = true;
    keywordInput.disabled = true;
  } else if (selectedFilter === 'keyword') {
    categorySelect.disabled = true;
    sourceSelect.disabled = true;
  }
}

// Function to enable all filters
function enableAllFilters() {
  const categorySelect = document.getElementById('category');
  const sourceSelect = document.getElementById('source');
  const keywordInput = document.getElementById('keyword-filter');

  categorySelect.disabled = false;
  sourceSelect.disabled = false;
  keywordInput.disabled = false;
}

document.getElementById('news-filters').addEventListener('submit', async function(event) {
  event.preventDefault();

  // Collect the selected filter values
  const category = document.getElementById('category').value;
  const source = document.getElementById('source').value;
  const keyword = document.getElementById('keyword-filter').value.trim();
  const section = document.getElementById('section').value;

  // Prepare the API URL
  let url = `https://newsapi.org/v2/top-headlines?apiKey=${apiKey}`;

  if (category && !keyword) {
    url += `&category=${category}`;
  } else if (source && !keyword) {
    url += `&sources=${source}`;
  }

  if (keyword) {
    url += `&q=${encodeURIComponent(keyword)}`;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();

    const articlesList = document.getElementById('articles-list');
    articlesList.innerHTML = ''; // Clear previous results

    if (data.status === 'ok' && data.articles.length > 0) {
      data.articles.slice(0, 10).forEach(article => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
          <strong>Title:</strong> ${article.title} <br>
          <strong>Author:</strong> ${article.author || 'Unknown'} <br>
          <strong>Description:</strong> ${article.description || 'No description available.'} <br>
          <strong>Source:</strong> ${article.source.name} <br>
          <strong>URL:</strong> <a href="${article.url}" target="_blank">Read more</a><br>
          <img src="${article.urlToImage}" alt="Image" style="width:100px;">
          <hr>
        `;
        articlesList.appendChild(listItem);
      });
    } else {
      articlesList.innerHTML = '<li>No articles found for the selected filters.</li>';
    }
  } catch (error) {
    console.error('Error fetching articles:', error);
  }
});

// Handle changes to the category, source, and keyword filters
document.getElementById('category').addEventListener('change', function() {
  if (this.value !== "") {
    disableOtherFilters('category');
  } else {
    enableAllFilters();
  }
});

document.getElementById('source').addEventListener('change', function() {
  if (this.value !== "") {
    disableOtherFilters('source');
  } else {
    enableAllFilters();
  }
});

document.getElementById('keyword-filter').addEventListener('input', function() {
  if (this.value.trim() !== "") {
    disableOtherFilters('keyword');
  } else {
    enableAllFilters();
  }
});
