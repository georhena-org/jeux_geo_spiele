ol.proj.useGeographic();
// initialiser le fond de carte

const basemap = new ol.layer.Tile({
  source: new ol.source.XYZ({
    url: 'https://{a-c}.basemaps.cartocdn.com/rastertiles/light_nolabels/{z}/{x}/{y}{r}.png',
    attributions: '© OpenStreetMap contributors © CARTO'
  })
});

const crsSource = new ol.source.Vector({
    url: 'https://geoportal.georhena.eu/geoserver/boundaries/wfs?SERVICE=WFS&REQUEST=GetFeature&VERSION=2.0.0&TYPENAMES=boundaries%3Alimite_crs&OUTPUTFORMAT=json',
    format: new ol.format.GeoJSON(),
  });

const rhinSource = new ol.source.Vector({
    url: 'https://geoportal.georhena.eu/geoserver/water/wfs?SERVICE=WFS&REQUEST=GetFeature&VERSION=2.0.0&TYPENAMES=water%3Arhin&OUTPUTFORMAT=json',
    format: new ol.format.GeoJSON(),
  });

const paysSource = new ol.source.Vector({
    url: paysUrl,
    format: new ol.format.GeoJSON(),
  });



// charger la couche de la limite du crs avec le style
var crsLayer = new ol.layer.Vector({
  source: crsSource,
  //background: 'black',
  style: new ol.style.Style({
      fill: new ol.style.Fill({ color: 'rgba(161, 109, 13, 0.1)' }),
      stroke: new ol.style.Stroke({ color: 'rgba(161, 109, 13, 0.51)', width: 2 }),
  }),
});

var rhinLayer = new ol.layer.Vector({
  source: rhinSource,
  //background: 'black',
  style: new ol.style.Style({
      fill: new ol.style.Fill({ color: 'rgb(26, 200, 206)' }),
      stroke: new ol.style.Stroke({ color: 'rgb(26, 200, 206)', width: 2 }),
  }),
});

var paysLayer = new ol.layer.Vector({
  source: paysSource,
  //background: 'black',
  style: new ol.style.Style({
      fill: new ol.style.Fill({ color: 'rgba(255, 255, 255, 0)' }),
      stroke: new ol.style.Stroke({ color: 'rgba(206, 65, 34, 0.84)', width: 2 }),
  }),
});


const map = new ol.Map({
  target: 'webmap',
  layers: [basemap, crsLayer, paysLayer], //ombrageLayer
  view: new ol.View({
    center: [
    7.772542083975405,
    48.234177921525884
    ],
    zoom: 8,
  }),
});


//Les styles des couches
const originalPointStyle = new ol.style.Style({
  image: new ol.style.Circle({
      radius: 5,
      fill: new ol.style.Fill({ color: 'rgba(42, 136, 13, 0.55)'}),
      //stroke: new ol.style.Stroke({ color: 'rgba(42, 136, 13, 0.58)', width: 2 }),
}),
});

const normalLineStyle = new ol.style.Style({
    stroke: new ol.style.Stroke({ color: 'rgb(34, 130, 168)', width: 2 }),
});

const hoverPointStyle = new ol.style.Style({
  image: new ol.style.Circle({
      radius: 6,
      fill: new ol.style.Fill({ color: 'rgba(42, 136, 13, 0.99)' }),
      stroke: new ol.style.Stroke({ color: 'rgba(42, 136, 13, 0.99)', width: 2 }),
}),
});

const hoverLineStyle = new ol.style.Style({
    stroke: new ol.style.Stroke({ color: 'rgba(34, 130, 168, 0.99)', width: 3 }),
});



var villesSource = new ol.source.Vector({
    url: 'https://geoportal.georhena.eu/geoserver/boundaries/wfs?SERVICE=WFS&REQUEST=GetFeature&VERSION=2.0.0&TYPENAMES=boundaries%3Avilles_principales&OUTPUTFORMAT=json',
    format: new ol.format.GeoJSON(),
  });

// charger la couche de points des villes avec le style
villesLayer = new ol.layer.Vector({
  source: villesSource,
  style: new ol.style.Style({
    image: new ol.style.Circle({
      radius: 5,
      fill: new ol.style.Fill({ color: 'black' }),
      stroke: new ol.style.Stroke({ color: 'black', width: 2 }),
  }),
  })
});

  const sommetsSource = new ol.source.Vector({
    url: sommetsUrl,
    format: new ol.format.GeoJSON(),
  })

  sommetsLayer = new ol.layer.Vector({
  source: sommetsSource,
  style: originalPointStyle,
  });

  const hydroSource = new ol.source.Vector({
    url: hydroUrl,
    format: new ol.format.GeoJSON(),
  })

  hydroLayer = new ol.layer.Vector({
    source: hydroSource,
    style: normalLineStyle,
  });

const regionsSource = new ol.source.Vector({
    url: regionsUrl,
    format: new ol.format.GeoJSON(),
  });

// charger la couche de points des régions avec le style
regionsLayer = new ol.layer.Vector({
  source: regionsSource,
  style: new ol.style.Style({
      fill: new ol.style.Fill({ color: 'rgba(233, 183, 139, 0.53)' }),
      stroke: new ol.style.Stroke({ color: 'rgba(199, 112, 37, 0.99)', width: 2 }),
  }),
});

map.addLayer(regionsLayer);  
map.addLayer(hydroLayer);
map.addLayer(sommetsLayer);
map.addLayer(villesLayer);
villesLayer.setVisible(false)
hydroLayer.setVisible(false)
sommetsLayer.setVisible(false)
regionsLayer.setVisible(false)

const popupContainer = document.getElementById('popup');
const popupContent = document.getElementById('popup-content');

const overlay = new ol.Overlay({
  element: popupContainer,
  positioning: 'bottom-center',
  stopEvent: false,
});
map.addOverlay(overlay);


document.addEventListener('DOMContentLoaded', () => {
  // Scroll doux sur le bouton "Qu’est-ce que le Rhin Supérieur ?"
  const btnInfo = document.getElementById('btn-info');
  btnInfo.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('webmap').scrollIntoView({ behavior: 'smooth' });
  });

    // Fonction pour gérer affichage de la couche (checkbox)
  function toggleLayer(checkboxId, layerOrLayers) {
    const checkbox = document.getElementById(checkboxId);
    checkbox.addEventListener('change', () => {
      const visible = checkbox.checked;
      if (Array.isArray(layerOrLayers)) {
        layerOrLayers.forEach(layer => layer.setVisible(visible));
      } else {
        layerOrLayers.setVisible(visible);
      }
    });
  }

  toggleLayer('toggleVilles', villesLayer);
  toggleLayer('toggleGeophysique', [hydroLayer, sommetsLayer]);
  toggleLayer('toggleRegions', regionsLayer);

  // Fonction pour gérer le menu déroulant et la flèche
  function toggleInfo(headerId, arrowId, infoId) {
    const header = document.getElementById(headerId);
    const arrow = document.getElementById(arrowId);
    const infoDiv = document.getElementById(infoId);

    arrow.addEventListener('click', () => {
      const isOpen = infoDiv.style.display === 'block';
      infoDiv.style.display = isOpen ? 'none' : 'block';
      arrow.classList.toggle('open', !isOpen);
    });
    infoDiv.addEventListener('click', () => {
      const isOpen = infoDiv.style.display === 'block';
      infoDiv.style.display = isOpen ? 'none' : 'block';
      arrow.classList.toggle('open', !isOpen);
    });
  }

  toggleInfo('villesHeader', 'arrowVilles', 'villesInfo');
  toggleInfo('geophysiqueHeader', 'arrowGeophysique', 'geophysiqueInfo');
  toggleInfo('regionsHeader', 'arrowRegions', 'regionsInfo');
});

map.on('singleclick', function(evt) {
  let featureFound = false;

  map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
    let name = feature.get('name'); // essayer d'abord "name"
    
    // Si "name" est undefined ou vide, essayer "nom"
    if (!name) {
      name = feature.get('nom');
    }

    if (name) {
      const coordinate = evt.coordinate;
      popupContent.innerHTML = `<b>${name}</b>`;
      overlay.setPosition(coordinate);
      featureFound = true;
    }
  });

  // Si aucune entité trouvée, cacher le popup
  if (!featureFound) {
    overlay.setPosition(undefined);
  }
});

map.on('pointermove', function(evt) {
  const hit = map.hasFeatureAtPixel(evt.pixel);
  map.getTargetElement().style.cursor = hit ? 'pointer' : '';
  let featureFound = false;

  map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
    let name = feature.get('name'); // essayer d'abord "name"
    
    // Si "name" est undefined ou vide, essayer "nom"
    if (!name) {
      name = feature.get('nom');
    }

    if (name) {
      const coordinate = evt.coordinate;
      popupContent.innerHTML = `<b>${name}</b>`;
      overlay.setPosition(coordinate);
      featureFound = true;
    }
  });

  // Si aucune entité trouvée, cacher le popup
  if (!featureFound) {
    overlay.setPosition(undefined);
  }
});
