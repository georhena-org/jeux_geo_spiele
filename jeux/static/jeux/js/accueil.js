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
    minZoom: 5.5,
    maxZoom: 15,
  }),
});


//Les styles des couches

  // Style rouge pour les villes non trouvées
  const labeledStyle = function (nomVille) {
    return new ol.style.Style({
      text: new ol.style.Text({
        font: '14px Quicksand, sans-serif',
        text: nomVille,
        fill: new ol.style.Fill({ color: 'black' }),
        stroke: new ol.style.Stroke({ color: 'white', width: 2 }),
        offsetY: -15,
      }),
      image: new ol.style.Circle({
        radius: 5,
        fill: new ol.style.Fill({ color: 'black' }),
        stroke: new ol.style.Stroke({ color: 'black', width: 2 }),
      }),
    });
  };

const labeledStyleSommets = function (sommet) {
    return new ol.style.Style({
      text: new ol.style.Text({
        font: '14px Quicksand, sans-serif',
        text: sommet,
        fill: new ol.style.Fill({ color: 'rgba(28, 102, 6, 0.8)' }),
        stroke: new ol.style.Stroke({ color: 'white', width: 2 }),
        offsetY: -15,
      }),
      image: new ol.style.Circle({
        radius: 5,
        fill: new ol.style.Fill({ color: 'rgba(42, 136, 13, 0.8)' }),
        //stroke: new ol.style.Stroke({ color: 'black', width: 2 }),
      }),
    });
  };



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

function detectTypeFromNUTS(nuts3) {
  if (!nuts3) return null;
  if (nuts3.startsWith("CH")) return "Canton/Kanton";
  if (nuts3.startsWith("DE")) return "Landkreis";
  if (nuts3.startsWith("ST")) return "Stadt";
  return null;
}

function styleByType(feature) {
  const nuts3 = feature.get("nuts3");
  const type = detectTypeFromNUTS(nuts3);

  let fillColor, strokeColor;

  switch (type) {
    case "Landkreis":
      fillColor = "rgba( 255, 226, 139, 0.70 )";
      strokeColor = "rgba(228, 192, 82, 1)";
      break;
    case "Canton/Kanton":
      fillColor = "rgba( 220, 146, 215, 0.70 )";
      strokeColor = "rgba(220, 146, 215, 1)";
      break;
    
    default:
      fillColor = "rgba(175, 224, 193, 1)";
      strokeColor = "rgba(137, 202, 161, 1)";
      break;
  }

  return new ol.style.Style({
    fill: new ol.style.Fill({ color: fillColor }),
    stroke: new ol.style.Stroke({ color: strokeColor, width: 2 }),
  });
}




const villesSource = new ol.source.Vector({
    url: villesUrl,
    format: new ol.format.GeoJSON(),
  });


// charger la couche de points des villes avec le style
villesLayer = new ol.layer.Vector({
  source: villesSource,
});


  const sommetsSource = new ol.source.Vector({
    url: sommetsUrl,
    format: new ol.format.GeoJSON(),
  })

  sommetsLayer = new ol.layer.Vector({
  source: sommetsSource,
  //style: originalPointStyle,
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
  style: styleByType,
});

map.addLayer(regionsLayer);  
map.addLayer(hydroLayer);
map.addLayer(sommetsLayer);
map.addLayer(villesLayer);
villesLayer.setVisible(false)
hydroLayer.setVisible(false)
sommetsLayer.setVisible(false)
regionsLayer.setVisible(false)

villesSource.once('featuresloadend', function () {
villesLayer.getSource().getFeatures().forEach((feature) => {
    const nom = feature.get('nom');
      feature.setStyle(labeledStyle(nom));
  });
});

sommetsSource.once('featuresloadend', function () {
sommetsLayer.getSource().getFeatures().forEach((feature) => {
    const nom = feature.get('name');
      feature.setStyle(labeledStyleSommets(nom));
  });
});


const popupContainer = document.getElementById('popup');
const popupContent = document.getElementById('popup-content');

const overlay = new ol.Overlay({
  element: popupContainer,
  positioning: 'bottom-center',
  stopEvent: false,
});

map.addOverlay(overlay);


document.addEventListener('DOMContentLoaded', () => {
  // scroll sur le bouton "Qu’est-ce que le Rhin Supérieur ?"
  const btnInfo = document.getElementById('btn-info');
  btnInfo.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('btn-info').scrollIntoView({ behavior: 'smooth' });
  });

  const btnPlay = document.getElementById('play-button');
  btnPlay.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('button-group-title').scrollIntoView({ behavior: 'smooth' });
  });

    // fonction pour gérer l'affichage de la couche (checkbox)
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



map.on('pointermove', function(evt) {
  const hit = map.hasFeatureAtPixel(evt.pixel);
  map.getTargetElement().style.cursor = hit ? 'pointer' : '';
  let features = [];

  map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
    features.push({ feature, layer });
  });

  if (features.length === 0) {
    overlay.setPosition(undefined);
    return;
  }

  const coordinate = evt.coordinate;

  // Priorité manuelle
  const priorityOrder = [sommetsLayer, hydroLayer, villesLayer, regionsLayer];
  let selected = null;

  for (let layer of priorityOrder) {
    selected = features.find(f => f.layer === layer);
    if (selected) break;
  }

  if (selected) {
    const { feature, layer } = selected;
    let name = feature.get('name') || feature.get('nom');
    let photoUrl = feature.get('photo');

    if (layer === sommetsLayer) {
      let ele = feature.get('ele_num');
      popupContent.innerHTML = `<b>${name}</b><br>Altitude/Höhe: ${ele} m<br>
        ${photoUrl ? `<img src="${photoUrl}" alt="Photo de ${name}" style="max-width:200px; max-height:150px;">` : ''}`;
    } else if (layer === hydroLayer) {
      let length = feature.get('length_km');
      popupContent.innerHTML = `<b>${name}</b><br>Longueur/Länge: ${length} km`;
    } else if (layer === villesLayer) {
      let hab = feature.get('hab_round');
      let area = feature.get('area_km2');
      popupContent.innerHTML = `<b>${name}</b><br>Habitants/Einwohnerzahl: ${hab}<br>Superficie/Fläche: ${area} km²<br>
        ${photoUrl ? `<img src="${photoUrl}" alt="Photo de ${name}" style="max-width:220px; max-height:170px;">` : ''}`;
    } else if (layer === regionsLayer) {
      const nuts3 = feature.get("type");
      const type = detectTypeFromNUTS(nuts3);
      popupContent.innerHTML = type ? `<b>${type}</b><br>${name}`: `${name}`;
    }

    overlay.setPosition(coordinate);
  }
  if (!selected) {
    overlay.setPosition(undefined);
  }
});
