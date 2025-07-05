const radius = 10
function submit_date(latitude, longitude) {
    
    if (latitude !== undefined && latitude !== null && latitude !== '' &&
        longitude !== undefined && longitude !== null && longitude !== '') {
        const latitude = parseFloat(latitude);
        const longitude = parseFloat(longitude);
    var query = `
    SELECT ?event ?eventLabel ?eventDescription ?date ?coords ?eventTypeLabel ?image WHERE {

    # Configuration is the same...
    BIND("Point(${latitude} ${longitude})"^^geo:wktLiteral AS ?center_point)
    BIND(${radius} AS ?radius)
    BIND("1000-01-01T00:00:00Z"^^xsd:dateTime AS ?start_date)
    BIND("2025-12-31T23:59:59Z"^^xsd:dateTime AS ?end_date)

    # Find items with coordinates DIRECTLY within the search area
    SERVICE wikibase:around {
        ?event wdt:P625 ?coords .
        bd:serviceParam wikibase:center ?center_point .
        bd:serviceParam wikibase:radius ?radius .
    }

    # And immediately filter them by type and date
    VALUES ?eventType {
        wd:Q178561 wd:Q3839081 wd:Q16510064 wd:Q40231 wd:Q189913 
        wd:Q1323136 wd:Q387526 wd:Q19830275 wd:Q1190554
    }
    ?event wdt:P31 ?eventType .
    ?event wdt:P585|wdt:P580 ?date .
    FILTER(?date >= ?start_date && ?date <= ?end_date)

    # Get labels and optional info
    OPTIONAL { ?event wdt:P18 ?image . }
    SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],nl,en". }
    }
    ORDER BY ?date
    `; 
    const endpointUrl = 'https://query.wikidata.org/sparql';
    const headers = {
        'Accept': 'application/sparql-results+json'
    };
    const params = {
        query: query,
        format: 'json'
    };
    const url = endpointUrl + '?' + new URLSearchParams(params).toString();
    fetch(url, {headers})
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (data.results.bindings.length > 0 ) {
                var title = data.results.bindings[0]
                alert(title.eventLabel.value);
                var sidebar = document.getElementById("sidebar_container")
                child1 = document.createElement("h1")
                child1.textContent = title.eventLabel.value
                sidebar.appendChild(child1)

            }  else {
                alert('No results found')
            }
        })
        .catch(error => {
            console.log('Error:', error);
            alert('Failed to fetch data from wikidata')
        })
   
        


    } else {
        alert('Please enter valid coordinates in the format: latitude, longitude');
    }
}






document.getElementById('submit_btn').addEventListener('click', submit_date);



window.submit_date = submit_date;


var map = L.map('map').setView([51.505, -0.09], 13);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
map.on('click', function(e) {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;
    
    // Update input field with clicked coordinates
    document.getElementById('coordinates_input').value = `${lat}, ${lng}`;
    submit_date(lat, lng);
    // Add marker at clicked location
    L.marker([lat, lng]).addTo(map);
    
    // Optional: Show popup with coordinates
    L.popup()
        .setLatLng(e.latlng)
        //.setContent(`Coordinates: ${submit_date()}`)
        .openOn(map);
});
