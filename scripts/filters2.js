function fetchArticlesForSection(sectionId, filters) {
  const { category, source, keyword } = filters || {};
  const sectionElement = document.getElementById(sectionId);

  // Create an articles list
  const ul = document.createElement('ul');
  ul.id = 'articles-list';
  ul.textContent = 'Loading articles...';
  sectionElement.appendChild(ul);

  const apiKey = 'b9b25782075944c282a534210d4027eb';
  let url = `https://newsapi.org/v2/top-headlines?apiKey=${apiKey}`;
  if (category) url += `&category=${category}`;
  if (source) url += `&sources=${source}`;
  if (keyword) url += `&q=${encodeURIComponent(keyword)}`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      ul.innerHTML = ''; // Clear loading text
      const photoRotation = document.getElementById('photo-rotation');
      photoRotation.innerHTML = ''; // Clear previous images

      if (data.status === 'ok' && data.articles.length > 0) {
        let imageArray = [];
        
        data.articles.forEach(article => {
          const li = document.createElement('li');

          let author = article.author || 'Unknown';
          let sourceName = article.source.name;

          // If the source is "Google News", remove "Google News" from the source and set the author to the original source
          if (sourceName === 'Google News') {
            author = 'Unknown';  // Set author to "Unknown"
            sourceName = article.author || 'Unknown'; // Set the original author as the source
          }

          li.innerHTML = `
            <h3>${article.title}</h3>
            <p><strong>Author:</strong> ${author}</p>
            <p><strong>Published At:</strong> ${new Date(article.publishedAt).toLocaleDateString()} ${new Date(article.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            <p><strong>Source:</strong> ${sourceName}</p>
            <a href="${article.url}" target="_blank">Read more</a>
          `;
          ul.appendChild(li);

          // Add image URL to the photo-rotation div
          if (article.urlToImage) {
            imageArray.push(article.urlToImage);  // Store images in the array
          }
        });

        // Display images one at a time every 2 seconds
        if (imageArray.length > 0) {
          let currentIndex = 0;
          
          // Create a function to display the next image
          function showNextImage() {
            photoRotation.innerHTML = ''; // Clear previous image
            const imgDiv = document.createElement('div');
            imgDiv.classList.add('photo-item');
            imgDiv.innerHTML = `<img src="${imageArray[currentIndex]}" alt="Image" style="max-width: 100%; height: auto;">`;
            photoRotation.appendChild(imgDiv);

            // Move to the next image
            currentIndex = (currentIndex + 1) % imageArray.length;
          }

          // Display the first image
          showNextImage();

          // Set an interval to change images every 2 seconds
          setInterval(showNextImage, 2000);
        }
      } else {
        ul.innerHTML = '<li>No articles found for the selected filters.</li>';
      }
    })
    .catch(error => {
      console.error('Error fetching articles:', error);
      ul.innerHTML = '<li>There was an error fetching the articles. Please try again later.</li>';
    });
}
