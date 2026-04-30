mapboxgl.accessToken = 'pk.eyJ1Ijoic2hhcm9uOTdsaSIsImEiOiJjbW5pM2I4YXgwOTBjMnFwcHl1MDQ2bm82In0.cnc2hjzuK1oBWdo6VIBKNQ';

const map = new mapboxgl.Map({
  container: 'mapcontainer',
  style: 'mapbox://styles/mapbox/standard', // Use the standard style for the map
  config: {
    basemap: {
      showPedestrianRoads: false,
      showPointOfInterestLabels: false,
      showRoadLabels: false,
      showTransitLabels: false,
      showAdminBoundaries: false,
      show3dObjects: false,
      show3dBuildings: false,
      show3dTrees: false,
      show3dLandmarks: false,
      showLandmarkIconLabels: false,
      showIndoorLabels: false,
      theme: "monochrome",
    }
  },
  projection: 'globe', // display the map as a globe
  zoom: 11.5, // initial zoom level, 0 is the world view, higher values zoom in
  center: [-73.94693, 40.71312] // center the map on this longitude and latitude
});


const neighborhoodData = {
  chinatownman,
  chinatownflush,
  chinatownbrook
};

// Function to extract coordinates from a GeoJSON geometry
const extractCoordinates = (geometry) => {
  if (geometry.type === 'Polygon') {
    return geometry.coordinates[0];
  }
  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.flat(2);
  }
  return [];
};

// Function to build bounds for a GeoJSON collection
const buildBoundsForCollection = (collection) => {
  const firstFeature = collection.features[0];
  const firstCoords = extractCoordinates(firstFeature.geometry);
  const bounds = firstCoords.reduce(
    (b, coord) => b.extend(coord),
    new mapboxgl.LngLatBounds(firstCoords[0], firstCoords[0])
  );

  collection.features.forEach((feature) => {
    extractCoordinates(feature.geometry).forEach((coord) => {
      bounds.extend(coord);
    });
  });

  return bounds;
};

// Function to fly to a neighborhood's bounds
const flyToCollection = (collection, id) => {
  const bounds = buildBoundsForCollection(collection);
  map.fitBounds(bounds, {
    padding: 100,
    duration: 1200,
    maxZoom: 15
  });
  // Show popup after flying
  setTimeout(() => showPopupForCollection(collection, id), 1200);
};

// Function to get the center of bounds
const getBoundsCenter = (bounds) => {
  return bounds.getCenter();
};

// Function to show popup for a collection
const showPopupForCollection = (collection, id) => {
  const bounds = buildBoundsForCollection(collection);
  const center = getBoundsCenter(bounds);
  const popupContent = getPopupContent(id);

  new mapboxgl.Popup({ closeOnClick: false })
    .setLngLat(center)
    .setHTML(popupContent)
    .addTo(map);
};

// Function to get popup content based on id
const getPopupContent = (id) => {
  if (id === 'chinatownman') {
    return '<h3>Manhattan Chinatown</h3><p>The oldest and first Chinatown in New York City.<br></br><b>Estimated population of NTA in 2020:</b> 42,556<br></br><b>Estimated proportion of population in NTA identifying as Chinese:</b> 61.1%<br></br><b>Major Chinese languages spoken:</b> Standard Mandarin, Cantonese, Hakka, Northern Min, Shanghainese, Teochew</p>';
  } else if (id === 'chinatownflush') {
    return '<h3>Queens Chinatown</h3><p> Centred around Flushing, this is the largest Chinatown in New York City by area.<br></br><b>Estimated population of NTA in 2020:</b> 69,879<br></br><b>Estimated proportion of population identifying as Chinese:</b> 60.2%<br></br><b>Major Chinese languages spoken:</b> Standard Mandarin, Cantonese, Eastern Min, Hakka, Gan, Hunanese, Northeastern Mandarin Chinese, Shanghainese, Taishanese, Wenzhounese, Yunnanese</p>';
  } else if (id === 'chinatownbrook') {
    return '<h3>Brooklyn Chinatown</h3><p>While 8th Avenue is the commercial centre of Chinatown, there is a flourishing Chinese community in the surrounding Sunset Park and Bensonhurst areas.<br></br><b>Estimated population of NTA in 2020:</b> 35,632<br></br><b>Estimated proportion of population identifying as Chinese:</b> 48.4%<br></br><b>Major Chinese languages spoken:</b> Standard Mandarin, Cantonese, Eastern Min, Southern Min, Wenzhounese</p>';
  }
  return '<h3>Chinatown</h3><p>Add description here.</p>';
};

//What's on the map
map.on('load', () => {
  const addChinatownLayer = (id, data, opacity) => {
    map.addSource(id, {
      type: 'geojson',
      data: data
    });

    map.addLayer({
      id: id,
      type: 'fill',
      source: id,
      paint: {
        'fill-color': '#e4414f',
        'fill-opacity': opacity
      }
    });

    map.on('click', id, (e) => {
      if (!e.features || !e.features.length) return;
      const feature = e.features[0];
      const collection = neighborhoodData[id];
      flyToCollection(collection, id);
    });

    map.on('mouseenter', id, () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', id, () => {
      map.getCanvas().style.cursor = '';
    });
  };

  addChinatownLayer('chinatownman', chinatownman, 0.5);
  addChinatownLayer('chinatownflush', chinatownflush, 0.5);
  addChinatownLayer('chinatownbrook', chinatownbrook, 0.8);

  const inputs = document.querySelectorAll('input[name="neighborhood"]');
  inputs.forEach((input) => {
    input.addEventListener('change', (event) => {
      const selected = event.target.value;
      if (!selected || !neighborhoodData[selected]) return;
      flyToCollection(neighborhoodData[selected], selected);
    });
  });
});
