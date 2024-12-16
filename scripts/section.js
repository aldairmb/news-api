// section.js
document.addEventListener('DOMContentLoaded', async function () {
    const sectionArticles = document.getElementById('section-articles');

    // Retrieve the filter data from localStorage
    const filters = JSON.parse(localStorage.getItem('newsFilters')) || {};

    // Check if there's a valid section to update
    if (!filters.section) {
        sectionArticles.innerHTML = '<p>No section selected. Please choose a section and filter first.</p>';
        return;
    }

    // Build the API URL based on the filters
    const apiKey = 'b9b25782075944c282a534210d4027eb';
    let url = `https://newsapi.org/v2/top-headlines?apiKey=${apiKey}`;

    if (filters.category) {
        url += `&category=${filters.category}`;
    }

    if (filters.source) {
        url += `&sources=${filters.source}`;
    }

    if (filters.keyword) {
        url += `&q=${encodeURIComponent(filters.keyword)}`;
    }

    try {
        // Fetch articles from the News API
        const response = await fetch(url);
        const data = await response.json();

        sectionArticles.innerHTML = ''; // Clear previous content

        if (data.status === 'ok' && data.articles.length > 0) {
            data.articles.forEach(article => {
                const articleDiv = document.createElement('div');
                articleDiv.classList.add('article');
                articleDiv.innerHTML = `
                    <h3>${article.title}</h3>
                    <p><strong>Author:</strong> ${article.author || 'Unknown'}</p>
                    <p><strong>Description:</strong> ${article.description || 'No description available.'}</p>
                    <p><strong>Source:</strong> ${article.source.name}</p>
                    <a href="${article.url}" target="_blank">Read more</a>
                    <img src="${article.urlToImage}" alt="Image" style="max-width: 100%; height: auto;">
                `;
                sectionArticles.appendChild(articleDiv);
            });
        } else {
            sectionArticles.innerHTML = '<p>No articles found for the selected filters.</p>';
        }
    } catch (error) {
        console.error('Error fetching articles:', error);
        sectionArticles.innerHTML = '<p>There was an error fetching the articles. Please try again later.</p>';
    }
});
