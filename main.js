document.addEventListener("DOMContentLoaded", () => {
    const mapElement = document.getElementById("map");
    if (mapElement) {
        const map = L.map('map').setView([20, 0], 5);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);
    } else {
        console.error("Elemento con ID 'map' no encontrado");
    }
});

const API_KEY = '93CF9D486732457BB97677D768A7AE07';
const API_URL = 'https://api.content.tripadvisor.com/api/v1/location/search';

async function buscarLugares() {
    const query = document.getElementById("search").value.trim();
    if (!query) {
        alert("Por favor, ingresa una ciudad o país.");
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}?searchQuery=${encodeURIComponent(query)}&category=attractions&language=es`, {
            headers: { 'accept': 'application/json', 'X-TripAdvisor-API-Key': API_KEY }
        });
        
        if (!response.ok) throw new Error("Error en la solicitud a la API");
        const data = await response.json();
        mostrarResultados(data);
    } catch (error) {
        console.error("Error al obtener los datos de TripAdvisor:", error);
    }
}

async function buscarCategoria() {
    const categoria = document.getElementById("category").value;
    const query = document.getElementById("search").value.trim();
    if (!query) {
        alert("Por favor, ingresa una ciudad o país.");
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}?searchQuery=${encodeURIComponent(query)}&category=${categoria}&language=es`, {
            headers: { 'accept': 'application/json', 'X-TripAdvisor-API-Key': API_KEY }
        });
        
        if (!response.ok) throw new Error("Error en la solicitud a la API");
        const data = await response.json();
        mostrarResultados(data);
    } catch (error) {
        console.error("Error al obtener los datos de TripAdvisor:", error);
    }
}

function mostrarResultados(data) {
    const resultsContainer = document.getElementById("explore-results");
    resultsContainer.innerHTML = "";
    
    if (data.data && Array.isArray(data.data) && data.data.length > 0) {
        data.data.forEach(lugar => {
            const placeElement = document.createElement("div");
            placeElement.innerHTML = `<h3>${lugar.name}</h3><p>${lugar.address_obj ? lugar.address_obj.address_string : 'Sin dirección disponible'}</p>`;
            resultsContainer.appendChild(placeElement);
        });
    } else {
        resultsContainer.innerHTML = "<p>No se encontraron resultados.</p>";
    }
}
