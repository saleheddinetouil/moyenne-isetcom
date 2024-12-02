let resources = [];
let currentPage = 1;
const itemsPerPage = 8; // Changed from 9 to 4

async function loadResources() {
    try {
        const response = await fetch('https://saleheddinetouil.github.io/moyenne-isetcom/assets/js/resources.json');
        const data = await response.json();
        resources = data.resources;
        displayResources(resources);
        initializeSearch();
    } catch (error) {
        console.error('Error loading resources:', error);
    }
}

function displayResources(filteredResources) {
    const container = document.getElementById('resourcesList');
    const totalPages = Math.ceil(filteredResources.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedItems = filteredResources.slice(start, end);
    
    // Ensure currentPage doesn't exceed total pages
    if (currentPage > totalPages) {
        currentPage = totalPages || 1;
    }
    
    // Clear previous content including pagination and count
    container.innerHTML = '';
    const existingCount = document.querySelector('.resource-count');
    const existingPagination = document.querySelector('.pagination-controls');
    if (existingCount) existingCount.remove();
    if (existingPagination) existingPagination.remove();
    
    // Add resource count with corrected display numbers
    const countDiv = document.createElement('div');
    countDiv.className = 'resource-count mb-4';
    countDiv.innerHTML = `Affichage de ${filteredResources.length > 0 ? start + 1 : 0}-${Math.min(end, filteredResources.length)} sur ${filteredResources.length} ressources`;
    container.parentElement.insertBefore(countDiv, container);

    if (paginatedItems.length === 0) {
        container.innerHTML = '<div class="no-results glass-card p-4 text-center">Aucune ressource trouvée</div>';
        return;
    }

    // Display resources with loading skeleton
    paginatedItems.forEach((resource, index) => {
        const card = document.createElement('div');
        card.className = 'resource-card skeleton';
        card.setAttribute('data-aos', 'fade-up');
        card.setAttribute('data-aos-delay', (index * 100).toString());
        let icon = '';
        let button = '';
        switch (resource.type) {
            case 'livre':
                button = 'Télécharger';
                icon = '<i class="fas fa-book pr-2"></i>';
                break;
            case 'article':
                button = 'Lire';
                icon = '<i class="fas fa-newspaper pr-2"></i>';
                break;
            case 'drive':
                button = 'Accéder';
                icon = '<i class="fas fa-arrow-right pr-2"></i>';
                break;
            case 'presentation':
                button = 'Voir';
                icon = '<i class="fas fa-presentation pr-2"></i>';
                break;
            case 'pdf':
                button = 'Télécharger';
                icon = '<i class="fas fa-file-pdf pr-2"></i>';
                break;
            case 'audio':
                button = 'Écouter';
                icon = '<i class="fas fa-headphones pr-2"></i>';
                break;
            case 'cours':
                button = 'Voir';
                icon = '<i class="fas fa-chalkboard-teacher pr-2"></i>';
                break;
            case 'exercice':
                button = 'Voir';
                icon = '<i class="fas fa-tasks pr-2"></i>';
                break;
            case 'video':
                button = 'Voir';
                icon = '<i class="fas fa-video pr-2"></i>';
                break;
            case 'autre':
                button = 'Voir';
                icon = '<i class="fas fa-file-alt pr-2"></i>';
                break;
            default:
                button = 'Télécharger';
                icon = '<i class="fas fa-download pr-2"></i>';
        }

        card.innerHTML = `
            <img class="resource-thumbnail" src="${resource.thumbnail}" alt="${resource.title}">
            <div class="resource-content">
                <span class="resource-type type-${resource.type}">${resource.type.toUpperCase()}</span>
                <h3 class="resource-title">${resource.title}</h3>
                <p class="resource-description">${resource.description}</p>
                <div class="resource-meta">
                    <div class="resource-rating">
                        ${getStarRating(resource.rating)}
                    </div>
                    <!--
                    <div class="download-count">
                     ${resource.downloads}
                    </div>
                    -->
                    <a href="${resource.url}" class="download-btn mt-4 block" target="_blank">
                    ${icon} ${button}
                </a>
                </div>
                
            </div>
        `;
        container.appendChild(card);
    });

    // Add pagination controls if there's more than one page
    if (totalPages > 1) {
        const pagination = createPagination(totalPages);
        container.parentElement.appendChild(pagination);
    }
}

function createPagination(totalPages) {
    const pagination = document.createElement('div');
    pagination.className = 'pagination-controls';
    
    let paginationHTML = `
        <button ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
            <button class="${currentPage === i ? 'active' : ''}" 
                    onclick="changePage(${i})">${i}</button>
        `;
    }
    
    paginationHTML += `
        <button ${currentPage === totalPages ? 'disabled' : ''} 
                onclick="changePage(${currentPage + 1})">
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    pagination.innerHTML = paginationHTML;
    return pagination;
}

function changePage(page) {
    const totalPages = Math.ceil(resources.length / itemsPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        filterResources();
        window.scrollTo({top: 0, behavior: 'smooth'});
    }
}

function getStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';
    
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i === fullStars && hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}

function filterResources() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const department = document.getElementById('departmentFilter').value;
    const semester = document.getElementById('semesterFilter').value;
    const speciality = document.getElementById('specialityFilter').value;
    const type = document.getElementById('typeFilter').value;

    let filtered = resources.filter(resource => {
        const matchesSearch = resource.title.toLowerCase().includes(searchTerm) ||
                            resource.description.toLowerCase().includes(searchTerm) ||
                            resource.tags.some(tag => tag.toLowerCase().includes(searchTerm));
        
        return matchesSearch &&
               (!department || resource.department === department) &&
               (!semester || resource.semester === parseInt(semester)) &&
               (!speciality || resource.speciality === speciality) &&
               (!type || resource.type === type);
    });

    displayResources(filtered);
}

function initializeSearch() {
    const searchInput = document.createElement('div');
    searchInput.className = 'search-bar';
    searchInput.innerHTML = `
        <i class="fas fa-search"></i>
        <input type="text" id="searchInput" placeholder="Rechercher des ressources...">
    `;
    
    document.querySelector('.filters-container').insertBefore(
        searchInput, 
        document.querySelector('.filters')
    );

    document.getElementById('searchInput').addEventListener('input', debounce(filterResources, 300));
}

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

// Add event listeners
document.querySelectorAll('.filters select').forEach(select => {
    select.addEventListener('change', filterResources);
});

document.addEventListener('DOMContentLoaded', () => {
    loadResources();
    AOS.init({
        duration: 1000,
        once: true,
        offset: 100,
        delay: 100
    });
});