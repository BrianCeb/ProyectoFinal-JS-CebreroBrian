let map;

document.addEventListener("DOMContentLoaded", () => {
    const mapElement = document.getElementById("map");
    if (mapElement) {
        map = L.map('map').setView([20, 0], 2);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    } else {
        console.error("Elemento 'map' no encontrado");
    }
});

const CORS_PROXY = 'https://api.allorigins.win/get?url=';
const API_KEY = '93CF9D486732457BB97677D768A7AE07';
const API_URL = 'https://api.content.tripadvisor.com/api/v1/location/search';
let markers = [];

async function buscarLugares() {
    const query = document.getElementById("search").value.trim();
    if (!query) {
        Swal.fire({
            icon: "warning",
            title: "Por favor",
            text: "Ingresar una ciudad o país",
        });
        return;
    }
    
    try {
        const geocodeResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
        const geocodeData = await geocodeResponse.json();
        
        if (geocodeData && geocodeData.length > 0) {
            const lat = parseFloat(geocodeData[0].lat);
            const lon = parseFloat(geocodeData[0].lon);
            
            map.setView([lat, lon], 13);
            limpiarMarcadores();
            
            L.marker([lat, lon])
                .addTo(map)
                .bindPopup(`<b>${query}</b>`);
            
            const targetUrl = `${API_URL}?key=${API_KEY}&searchQuery=${encodeURIComponent(query)}&category=attractions&language=es`;
            
            const proxyUrl = `${CORS_PROXY}${encodeURIComponent(targetUrl)}`;
            const response = await fetch(proxyUrl);
            
            if (!response.ok) throw new Error("Error en la solicitud a la API");
            
            const result = await response.json();
            const data = JSON.parse(result.contents);
            console.log('Resultados de la búsqueda:', data);

            localStorage.setItem('resultadosBusqueda', JSON.stringify(data));
            
            mostrarResultados(data, lat, lon);
        } else {
            throw new Error("No se encontró la ubicación");
        }
    } catch (error) {
        console.error("Error:", error);
        document.getElementById("explore-results").innerHTML = 
            `<p>Error: ${error.message}. Por favor, intenta más tarde.</p>`;
    }
}

async function buscarCategoria() {
    const categoria = document.getElementById("category").value;
    const query = document.getElementById("search").value.trim();
    if (!query) {
        Swal.fire({
            icon: "warning",
            title: "Por favor",
            text: "Ingresar una ciudad o país",
        });
        return;
    }
    
    try {
        const geocodeResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
        const geocodeData = await geocodeResponse.json();
        
        if (geocodeData && geocodeData.length > 0) {
            const lat = parseFloat(geocodeData[0].lat);
            const lon = parseFloat(geocodeData[0].lon);
            
            const targetUrl = `${API_URL}?key=${API_KEY}&searchQuery=${encodeURIComponent(query)}&category=${categoria}&language=es`;
            const proxyUrl = `${CORS_PROXY}${encodeURIComponent(targetUrl)}`;
            const response = await fetch(proxyUrl);
            
            if (!response.ok) throw new Error("Error en la solicitud a la API");
            
            const result = await response.json();
            const data = JSON.parse(result.contents);
            console.log('Resultados por categoría:', data);
            
            localStorage.setItem('resultadosBusqueda', JSON.stringify(data));
            
            mostrarResultados(data, lat, lon);
        }
    } catch (error) {
        console.error("Error:", error);
        document.getElementById("explore-results").innerHTML = 
            `<p>Error: ${error.message}. Por favor, intenta más tarde.</p>`;
    }
}

function limpiarMarcadores() {
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
}

function mostrarResultados(data) {
    const resultsContainer = document.getElementById("explore-results");
    resultsContainer.innerHTML = "";
    
    limpiarMarcadores();
    
    if (data.data && Array.isArray(data.data) && data.data.length > 0) {
        data.data.forEach(lugar => {
            const placeElement = document.createElement("div");
            placeElement.className = 'place-item';
            placeElement.innerHTML = `
                <h3>${lugar.name}</h3>
                <p>${lugar.address_obj ? lugar.address_obj.address_string : 'Sin dirección disponible'}</p>
                <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lugar.address_obj ? lugar.address_obj.address_string : '')}" target="_blank">Ver en Google Maps</a>
            `;
            resultsContainer.appendChild(placeElement);
        });
    } else {
        resultsContainer.innerHTML = "<p>No se encontraron resultados.</p>";
    }
}
