document.addEventListener('DOMContentLoaded', function () {
  const savedSections = JSON.parse(localStorage.getItem('savedSections')) || {};
  const savedFilters = JSON.parse(localStorage.getItem('savedFilters')) || {};
  const sectionArticles = document.getElementById('section-articles');
  const photoRotation = document.getElementById('photo-rotation');

  // Restore saved sections and filters
  Object.keys(savedSections).forEach(sectionId => {
    const sectionElement = document.getElementById(sectionId);
    if (sectionElement) {
      const h2 = document.createElement('h2');
      h2.textContent = capitalizeFirstLetter(savedSections[sectionId]);
      sectionElement.innerHTML = ''; // Clear existing content
      sectionElement.appendChild(h2);

      // Add "Fetch Articles" button
      const fetchButton = createFetchButton(sectionId, savedFilters[sectionId]);
      sectionElement.appendChild(fetchButton);
      
      // Add "Close" button
      const closeButton = createCloseButton(sectionId);
      sectionElement.appendChild(closeButton);
    }
  });

  // Form handling
  const form = document.getElementById('news-filters');
  const categoryInput = document.getElementById('category');
  const sourceInput = document.getElementById('source');
  const keywordInput = document.getElementById('keyword-filter');
  const sectionInput = document.getElementById('section');

  const toggleInputs = (disabledInputs, condition) => {
    disabledInputs.forEach(input => {
      input.disabled = condition;
    });
  };

  const inputs = [categoryInput, sourceInput, keywordInput];

  // Add event listeners to enforce mutual exclusivity
  categoryInput.addEventListener('change', () => {
    toggleInputs([sourceInput, keywordInput], categoryInput.value !== '');
  });

  sourceInput.addEventListener('change', () => {
    toggleInputs([categoryInput, keywordInput], sourceInput.value !== '');
  });

  keywordInput.addEventListener('input', () => {
    const hasValue = keywordInput.value.trim() !== '';
    toggleInputs([categoryInput, sourceInput], hasValue);
  });

  // Clear other inputs when one is selected
  const clearOtherInputs = (currentInput) => {
    inputs.forEach(input => {
      if (input !== currentInput) {
        input.value = '';
        input.disabled = false;
      }
    });
  };

  inputs.forEach(input => {
    input.addEventListener('focus', () => clearOtherInputs(input));
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const section = sectionInput.value;
    const category = categoryInput.value;
    const source = sourceInput.value;
    const keyword = keywordInput.value.trim();

    if (!section || (!category && !source && !keyword)) {
      alert('Please select a section and one filter type (category, source, or keyword).');
      return;
    }

    const sectionElement = document.getElementById(section);
    const displayText = capitalizeFirstLetter(category || source || keyword || "Custom Section");

    const h2 = document.createElement('h2');
    h2.textContent = displayText;
    sectionElement.innerHTML = ''; // Clear content
    sectionElement.appendChild(h2);

    // Save filter text in localStorage
    savedSections[section] = displayText;
    savedFilters[section] = { category, source, keyword }; // Save filters
    localStorage.setItem('savedSections', JSON.stringify(savedSections));
    localStorage.setItem('savedFilters', JSON.stringify(savedFilters));

    // Add "Fetch Articles" button
    const fetchButton = createFetchButton(section, { category, source, keyword });
    sectionElement.appendChild(fetchButton);

    // Add "Close" button
    const closeButton = createCloseButton(section);
    sectionElement.appendChild(closeButton);
  });

  // Function to create the "Fetch Articles" button
  function createFetchButton(sectionId, filters) {
    const button = document.createElement('button');
    button.textContent = 'Fetch Articles';
    button.addEventListener('click', () => fetchArticlesForSection(sectionId, filters));
    return button;
  }

  // Function to create the "Close" button
  function createCloseButton(sectionId) {
    const button = document.createElement('button');
    button.textContent = 'Close';
    button.addEventListener('click', () => closeSection(sectionId));
    return button;
  }

  // Function to fetch articles for a section
  function fetchArticlesForSection(sectionId, filters) {
    const { category, source, keyword } = filters || {};

    // Scroll to the top of the page
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Clear previous articles and images
    sectionArticles.innerHTML = '';
    photoRotation.innerHTML = '';

    const apiKey = 'b9b25782075944c282a534210d4027eb';
    let url = `https://newsapi.org/v2/top-headlines?apiKey=${apiKey}`;
    if (category) url += `&category=${category}`;
    if (source) url += `&sources=${source}`;
    if (keyword) url += `&q=${encodeURIComponent(keyword)}`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data.status === 'ok' && data.articles.length > 0) {
          const filteredArticles = data.articles.filter(article => !article.title.includes('[Removed]'));
          filteredArticles.forEach(article => {
            const li = document.createElement('li');
            li.innerHTML = `
              <h3>${article.title}</h3>
              <p><strong>Author:</strong> ${article.author || 'Unknown'}</p>
              <p><strong>Published At:</strong> ${new Date(article.publishedAt).toLocaleDateString()} ${new Date(article.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              <p><strong>Source:</strong> ${article.source.name}</p>
              <a href="${article.url}" target="_blank">Read more</a>
            `;
            sectionArticles.appendChild(li);

            // Add image URL and headline to the photo-rotation div
            if (article.urlToImage) {
              const imgDiv = document.createElement('div');
              imgDiv.classList.add('photo-item');
              imgDiv.innerHTML = `
                <img src="${article.urlToImage}" alt="Image" style="max-width: 100%; height: auto;">
                <p>${article.title}</p>
              `;
              photoRotation.appendChild(imgDiv);
            }
          });
          rotateImages();
        } else {
          sectionArticles.innerHTML = '<li>No articles found for the selected filters.</li>';
        }
      })
      .catch(error => {
        console.error('Error fetching articles:', error);
        sectionArticles.innerHTML = '<li>There was an error fetching the articles. Please try again later.</li>';
      });
  }

  // Function to rotate images (show each image for 4 seconds)
  function rotateImages() {
    const images = photoRotation.querySelectorAll('.photo-item');
    let currentIndex = 0;
    
    const showImage = (index) => {
      images.forEach((image, i) => {
        image.style.display = i === index ? 'block' : 'none';
      });
    };

    showImage(currentIndex);

    setInterval(() => {
      currentIndex = (currentIndex + 1) % images.length;
      showImage(currentIndex);
    }, 4000); // Change image every 4 seconds
  }

  // Function to close a section
  function closeSection(sectionId) {
    const sectionElement = document.getElementById(sectionId);
    
    // Clear the articles (ul)
    const ul = sectionElement.querySelector('ul');
    if (ul) {
      ul.innerHTML = ''; // Clear the articles
    }

    // Clear the images (photo-rotation)
    const photoRotation = document.getElementById('photo-rotation');
    if (photoRotation) {
      photoRotation.innerHTML = ''; // Clear images
    }
  }

  // Helper function to capitalize the first letter
  function capitalizeFirstLetter(text) {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }
});
