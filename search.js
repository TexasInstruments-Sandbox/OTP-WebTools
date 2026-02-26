// Tool search functionality for TI Tools landing page

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('toolSearch');
    const clearButton = document.getElementById('clearSearch');
    const searchResults = document.getElementById('searchResults');
    const sections = document.querySelectorAll('.landing-section');
    const toolCards = document.querySelectorAll('.tool-card:not(.coming-soon)');

    // Build search index from tool cards
    const searchIndex = [];
    toolCards.forEach(card => {
        const title = card.querySelector('h3')?.textContent || '';
        const description = card.querySelector('p')?.textContent || '';
        const section = card.closest('.landing-section')?.querySelector('h2')?.textContent || '';
        const link = card.getAttribute('href') || '#';
        const isExternal = card.hasAttribute('target');

        searchIndex.push({
            title,
            description,
            section,
            link,
            isExternal,
            element: card,
            searchText: `${title} ${description} ${section}`.toLowerCase()
        });
    });

    // Debounce function to limit search frequency
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Perform search
    function performSearch(query) {
        query = query.toLowerCase().trim();

        // Show/hide clear button
        clearButton.style.display = query ? 'flex' : 'none';

        if (!query) {
            // Show all sections and hide search results
            sections.forEach(section => section.style.display = 'block');
            searchResults.innerHTML = '';
            searchResults.style.display = 'none';
            return;
        }

        // Hide sections when searching
        sections.forEach(section => section.style.display = 'none');

        // Filter tools matching the query
        const results = searchIndex.filter(item => {
            return item.searchText.includes(query);
        });

        // Display results
        displayResults(results, query);
    }

    // Display search results
    function displayResults(results, query) {
        searchResults.style.display = 'block';

        if (results.length === 0) {
            searchResults.innerHTML = `
                <div class="no-results">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <h3>No tools found</h3>
                    <p>No tools match your search for "<strong>${escapeHtml(query)}</strong>"</p>
                    <p class="hint">Try searching for: Device Tree, Security, Keys, Error Codes, Validator</p>
                </div>
            `;
            return;
        }

        const resultsHTML = `
            <div class="search-results-header">
                <h3>Found ${results.length} tool${results.length !== 1 ? 's' : ''}</h3>
                <button id="showAllTools" class="show-all-btn">Show All Tools</button>
            </div>
            <div class="search-results-grid">
                ${results.map(result => createResultCard(result, query)).join('')}
            </div>
        `;

        searchResults.innerHTML = resultsHTML;

        // Add event listener to "Show All Tools" button
        document.getElementById('showAllTools')?.addEventListener('click', clearSearch);
    }

    // Create a result card HTML
    function createResultCard(result, query) {
        const highlightedTitle = highlightText(result.title, query);
        const highlightedDescription = highlightText(result.description, query);

        return `
            <a href="${result.link}"
               class="search-result-card ${result.isExternal ? 'partner-card' : ''}"
               ${result.isExternal ? 'target="_blank" rel="noopener noreferrer"' : ''}
               title="${escapeHtml(result.title)}">
                <div class="search-result-category">${escapeHtml(result.section)}</div>
                <h4>${highlightedTitle}</h4>
                <p>${highlightedDescription}</p>
                <span class="tool-link-arrow">${result.isExternal ? 'Visit Site' : 'View Tool'} →</span>
            </a>
        `;
    }

    // Highlight matching text
    function highlightText(text, query) {
        if (!query) return escapeHtml(text);
        const escapedText = escapeHtml(text);
        const escapedQuery = escapeHtml(query);
        const regex = new RegExp(`(${escapedQuery})`, 'gi');
        return escapedText.replace(regex, '<mark>$1</mark>');
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Clear search
    function clearSearch() {
        searchInput.value = '';
        performSearch('');
        searchInput.focus();
    }

    // Event listeners
    searchInput.addEventListener('input', debounce(function(e) {
        performSearch(e.target.value);
    }, 300));

    clearButton.addEventListener('click', clearSearch);

    // Allow ESC key to clear search
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            clearSearch();
        }
    });

    // Category filter functionality
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');

            // Update active button state
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // Filter sections
            filterByCategory(category);
        });
    });

    function filterByCategory(category) {
        // Clear any active search
        if (searchInput.value) {
            clearSearch();
        }

        const sections = document.querySelectorAll('.landing-section');

        sections.forEach(section => {
            const sectionCategory = section.getAttribute('data-category');

            if (category === 'all') {
                section.style.display = 'block';
            } else if (sectionCategory === category) {
                section.style.display = 'block';
            } else {
                section.style.display = 'none';
            }
        });
    }
});
