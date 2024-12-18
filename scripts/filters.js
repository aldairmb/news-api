document.addEventListener('DOMContentLoaded', function () {
  const savedSections = JSON.parse(localStorage.getItem('savedSections')) || {};
  const savedFilters = JSON.parse(localStorage.getItem('savedFilters')) || {};
  const sectionArticles = document.getElementById('section-articles');
  const photoRotation = document.getElementById('photo-rotation');
  const articleInfo = document.getElementById('article-info');

  const createCloseButton = () => {
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.classList.add('close-btn');
    closeButton.addEventListener('click', () => {
      closeContent();
    });
    return closeButton;
  };

  // Function to close content
  function closeContent() {
    sectionArticles.innerHTML = ''; // Clear section-articles content
    photoRotation.innerHTML = ''; // Clear photo-rotation content

    // Remove all close buttons
    document.querySelectorAll('.close-btn').forEach(button => button.remove());

    // Reapply the "unopened-section" class to all sections except the special ones
    const allSections = document.querySelectorAll('.box');
    allSections.forEach(section => {
      if (section.id !== 'article-info' && section.id !== 'photo-rotation' && section.id !== 'section-articles') {
        section.classList.add('unopened-section');
        section.classList.remove('opened-section');
      }
    });
  }

  // Function to create the "Fetch Articles" button
  function createFetchButton(sectionId, filters) {
    const button = document.createElement('button');
    button.textContent = 'Fetch Articles';
    button.addEventListener('click', () => fetchArticlesForSection(sectionId, filters));
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

    // Initially hide photo-rotation until we know there are valid images
    photoRotation.style.display = 'none';

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
          filteredArticles.forEach(async (article) => {
            const li = document.createElement('li');
            li.innerHTML = `
              <h3>${article.title}</h3>
              <p><strong>Author:</strong> ${article.author || 'Unknown'}</p>
              <p><strong>Published At:</strong> ${new Date(article.publishedAt).toLocaleDateString()} ${new Date(article.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              <p><strong>Source:</strong> ${article.source.name}</p>
              <a href="${article.url}" target="_blank">Read more</a>
            `;
            sectionArticles.appendChild(li);

            // Add image URL and headline to the photo-rotation div (initially hidden)
            if (article.urlToImage) {
              const imgDiv = document.createElement('div');
              imgDiv.classList.add('photo-item', 'hidden'); // Initially hidden
              imgDiv.innerHTML = `
                <img src="${article.urlToImage}" alt="Image" style="max-width: 100%; height: auto;">
                <p>${article.title}</p>
              `;
              photoRotation.appendChild(imgDiv);
            }
          });

          // Check and reveal valid images after determining dimensions
          checkAndDisplayImages();

          // Show the Close button in #article-info and the opened section
          showCloseButtons(sectionId);

          // Mark the section as opened by removing the "unopened-section" class and adding "opened-section"
          const sectionElement = document.getElementById(sectionId);
          if (sectionElement) {
            sectionElement.classList.remove('unopened-section');
            sectionElement.classList.add('opened-section');
          }

          // Close all other regular sections
          closeOtherSections(sectionId);
        } else {
          sectionArticles.innerHTML = '<li>No articles found for the selected filters.</li>';
        }
      })
      .catch(error => {
        console.error('Error fetching articles:', error);
        sectionArticles.innerHTML = '<li>There was an error fetching the articles. Please try again later.</li>';
      });
  }

  // Function to check image dimensions and display valid images
  async function checkAndDisplayImages() {
    const images = photoRotation.querySelectorAll('.photo-item');
    const validImages = [];

    // Check the dimensions of each image
    for (let imgDiv of images) {
      const img = imgDiv.querySelector('img');
      const isGeneric = await isGenericImage(img.src);
      if (!isGeneric) {
        validImages.push(imgDiv); // Valid image, add to validImages array
      } else {
        imgDiv.remove(); // Remove invalid image
      }
    }

    // Now display valid images only
    if (validImages.length > 0) {
      // Show photo-rotation only if there are valid images to display
      photoRotation.style.display = 'block';

      validImages.forEach(imgDiv => {
        imgDiv.classList.remove('hidden'); // Make valid images visible
      });

      // Start the rotation of valid images
      rotateImages(validImages);
    }
  }

  // Helper function to check if an image is the generic image (16x47 or 18x7)
  function isGenericImage(imageUrl) {
    const img = new Image();
    img.src = imageUrl;

    return new Promise((resolve) => {
      img.onload = () => {
        // Check if the image dimensions are 16x47 or 18x7
        if ((img.width === 16 && img.height === 47) || (img.width === 18 && img.height === 7)) {
          resolve(true); // This is a generic image
        } else {
          resolve(false); // This is not a generic image
        }
      };

      img.onerror = () => resolve(true); // If image fails to load, consider it as generic
    });
  }

  // Function to rotate images (show each image for 4 seconds)
  function rotateImages(validImages) {
    let currentIndex = 0;

    const showImage = (index) => {
      validImages.forEach((image, i) => {
        image.style.display = i === index ? 'block' : 'none';
      });
    };

    showImage(currentIndex);

    setInterval(() => {
      currentIndex = (currentIndex + 1) % validImages.length;
      showImage(currentIndex);
    }, 4000); // Change image every 4 seconds
  }

  // Function to show the "Close" button in both #article-info and the current section
  function showCloseButtons(sectionId) {
    // Remove the close button from all sections first
    document.querySelectorAll('.close-btn').forEach(button => button.remove());

    // Add close button to #article-info
    if (!articleInfo.querySelector('.close-btn')) {
      articleInfo.appendChild(createCloseButton());
    }

    // Add close button to the section
    const sectionElement = document.getElementById(sectionId);
    if (sectionElement && !sectionElement.querySelector('.close-btn')) {
      sectionElement.appendChild(createCloseButton());
    }
  }

  // Function to close all other sections except the currently opened one
  function closeOtherSections(currentSectionId) {
    const allSections = document.querySelectorAll('.box');
    allSections.forEach(section => {
      if (section.id !== currentSectionId && section.id !== 'article-info' && section.id !== 'photo-rotation' && section.id !== 'section-articles') {
        section.classList.add('unopened-section');
        section.classList.remove('opened-section');
      }
    });
  }

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

    // Clear previous content in the section
    sectionElement.innerHTML = '';

    // Add the <h2> to the section
    const h2 = document.createElement('h2');
    h2.textContent = displayText;
    sectionElement.appendChild(h2);

    // Save filter text in localStorage
    savedSections[section] = displayText;
    savedFilters[section] = { category, source, keyword }; // Save filters
    localStorage.setItem('savedSections', JSON.stringify(savedSections));
    localStorage.setItem('savedFilters', JSON.stringify(savedFilters));

    // Add "Fetch Articles" button
    const fetchButton = createFetchButton(section, { category, source, keyword });
    sectionElement.appendChild(fetchButton);

    // Remove the "Close" button if it exists
    document.querySelectorAll('.close-btn').forEach(button => button.remove());
  });

  // Initialize stored sections and filters on page load
  function initializeStoredSections() {
    for (const sectionId in savedSections) {
      const section = document.getElementById(sectionId);
      if (!section) continue;

      // Add unopened class for sections except the special ones
      if (section.id !== 'article-info' && section.id !== 'photo-rotation' && section.id !== 'section-articles') {
        section.classList.add('unopened-section');
      }

      // Add stored h2
      const h2 = document.createElement('h2');
      h2.textContent = savedSections[sectionId];
      section.appendChild(h2);

      // Add the "Fetch Articles" button
      const fetchButton = createFetchButton(sectionId, savedFilters[sectionId]);
      section.appendChild(fetchButton);
    }
  }

  // Call the function to initialize the stored sections
  initializeStoredSections();

  // Helper function to capitalize the first letter
  function capitalizeFirstLetter(text) {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }
});
