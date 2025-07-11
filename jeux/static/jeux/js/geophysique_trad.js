ol.proj.useGeographic();

// initialiser le fond de carte
const basemap = new ol.layer.Tile({
  source: new ol.source.XYZ({
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}',
    attributions: 'Tiles © Esri'
    //url: 'https://{a-c}.basemaps.cartocdn.com/rastertiles/voyager_no_labels_no_buildings/{z}/{x}/{y}{r}.png',
    //attributions: '© OpenStreetMap contributors © CARTO'
    //url: 'https://api.mapbox.com/styles/v1/chloecea/cmcam4vse006201s3dwo73na2/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiY2hsb2VjZWEiLCJhIjoiY204NXhxYmluMmg1aTJqczZra3pvMHl4bCJ9.tseVk6aD8VN2WpKxga35ww',
    //tileSize: 512,  // pour les tuiles @2x (retina)
    //attributions: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a>',
  })
});

const crsSource = new ol.source.Vector({
    url: 'https://geoportal.georhena.eu/geoserver/boundaries/wfs?SERVICE=WFS&REQUEST=GetFeature&VERSION=2.0.0&TYPENAMES=boundaries%3Alimite_crs&OUTPUTFORMAT=json',
    format: new ol.format.GeoJSON(),
  });


// charger la couche de la limite du crs avec le style
var crsLayer = new ol.layer.Vector({
  source: crsSource,
  //background: 'black',
  style: new ol.style.Style({
      fill: new ol.style.Fill({ color: 'rgba(79, 40, 40, 0.35)' }),
      stroke: new ol.style.Stroke({ color: 'rgba(79, 40, 40, 0.9)', width: 2 }),
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

const hoverPointStyle = new ol.style.Style({
  image: new ol.style.Circle({
      radius: 6,
      fill: new ol.style.Fill({ color: 'rgba(42, 136, 13, 0.99)' }),
      stroke: new ol.style.Stroke({ color: 'rgba(42, 136, 13, 0.99)', width: 2 }),
}),
});

const normalLineStyle = new ol.style.Style({
    stroke: new ol.style.Stroke({ color: 'rgba(34, 130, 168, 0.55)', width: 2 }),
});

const hoverLineStyle = new ol.style.Style({
    stroke: new ol.style.Stroke({ color: 'rgba(34, 130, 168, 0.99)', width: 3 }),
});

const correctStyleHydro= new ol.style.Style({
        stroke: new ol.style.Stroke({ color: 'rgba(199, 229, 240, 0.99)', width: 3 }),
      });


function correctStyleSommet(nomEntite) {
  return new ol.style.Style({
        text: new ol.style.Text({
          font: '14px Arial, sans-serif',
          text: nomEntite, // Use the 'name' property as the label
          fill: new ol.style.Fill({
          color: '#000', // Text color
        }),
        stroke: new ol.style.Stroke({
          color: '#fff', // Outline color
          width: 2,
        }),
        offsetY: -15, // Offset to position the label above the point
        }),
        image: new ol.style.Circle({
          radius: 5,
          fill: new ol.style.Fill({ color: 'white' }),
          stroke: new ol.style.Stroke({ color: 'white', width: 2 }),
        }),
      });
}


// Masquer la basemap XYZ


// Ajouter une couche WMS depuis Georhena
const georhenaWMS = new ol.layer.Tile({
  source: new ol.source.TileWMS({
    url: 'https://geoportal.georhena.eu/geoserver/basemaps/ows?',
    params: {
      'LAYERS': 'basemaps:mnt_dem',
      'TILED': true,
      'VERSION': '1.3.0',
      'FORMAT': 'image/png',
      'TRANSPARENT': true,
    },
    serverType: 'geoserver',
    crossOrigin: 'anonymous',
  })
});

// Ajouter la carte
const map = new ol.Map({
  target: 'webmap',
  layers: [basemap, crsLayer], //ombrageLayer
  view: new ol.View({
    center: [
    7.772542083975405,
    48.234177921525884
    ],
    zoom: 8.3,
    minZoom: 7,
    maxZoom: 11,
  }),
});




let sommetsLayer = null;
let hydroLayer = null;
let listeNoms = [];
let listeSommets = [];
let listeHydro = [];
let listeGuess = [];
let featuresCorrectes = new Set();
let currentTarget = "";
let wrongClicksForCurrentTarget = 0;
let blinkInterval = null; // Pour mémoriser l'intervalle de clignotement
let timerInterval = null;
let elapsedTime = 0;
let gameActive = false
let points = 0;
let essais = 5;
const mapRect = map.getTargetElement().getBoundingClientRect();
let isBlinking = false;




function formatTime(seconds) {
  const min = String(Math.floor(seconds / 60)).padStart(2, '0');
  const sec = String(seconds % 60).padStart(2, '0');
  return `${min}:${sec}`;
}

function startTimer() {
  elapsedTime = 0;
  document.getElementById('chrono').innerText = formatTime(elapsedTime);

  timerInterval = setInterval(() => {
    elapsedTime++;
    document.getElementById('chrono').innerText = formatTime(elapsedTime);
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function showEncouragementMessage(text) {
  const encouragementDiv = document.getElementById('encouragments');
  encouragementDiv.innerText = text;
  encouragementDiv.style.opacity = '1';

  // Masquer après 2 secondes
  setTimeout(() => {
    encouragementDiv.style.opacity = '0';
  }, 1000);
}
function showEncouragementMessage(text) {
  const encouragementDiv = document.getElementById('encouragments');
  encouragementDiv.innerText = text;
  encouragementDiv.style.opacity = '1';

  // Masquer après 2 secondes
  setTimeout(() => {
    encouragementDiv.style.opacity = '0';
  }, 1000);
}

function randomCongrats() {
  //const congrats = ["Bien joué !", "Incroyable", "Bravo"];
  const randomId = Math.floor(Math.random() * translations[currentLang].encouragements.length);
  showEncouragementMessage(translations[currentLang].encouragements[randomId]);
}

function randomEncourage() {
  //const messages = ["Essaie encore !", "Presque", "Pas loin !"];
  const randomId = Math.floor(Math.random() * translations[currentLang].retryMessages.length);
  showEncouragementMessage(translations[currentLang].retryMessages[randomId]);
}


function showRandomText() {
  selected = null;  
  const randomIndex = Math.floor(Math.random() * listeGuess.length);
  console.log(listeGuess)
  currentTarget = listeGuess[randomIndex];

  wrongClicksForCurrentTarget = 0;
  if (blinkInterval) {
    clearInterval(blinkInterval);
    blinkInterval = null;
  }

  document.getElementById('randomText').innerText = translations[currentLang].guessText(currentTarget);

  if (listeSommets.includes(currentTarget)){
  hydroLayer.setVisible(false);
  sommetsLayer.setVisible(true);
  console.log("couche sommet")
  }
  if (listeHydro.includes(currentTarget)){
  hydroLayer.setVisible(true);
  sommetsLayer.setVisible(false);
  console.log("couche hydro")
  }
};

function startBlinkingCurrentTarget() {
  let targetLayer = listeSommets.includes(currentTarget) ? sommetsLayer : hydroLayer;
  let source = targetLayer.getSource();
  let featureToBlink = source.getFeatures().find(f => f.get('name') === currentTarget);
  if (!featureToBlink) return;

  let visible = true;

  blinkInterval = setInterval(() => {
    if (!featuresCorrectes.has(featureToBlink)) {
      if (visible) {
        // style "flash"
        featureToBlink.setStyle(new ol.style.Style({
          stroke: new ol.style.Stroke({ color: 'yellow', width: 4 }),
          image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({ color: 'yellow' }),
            stroke: new ol.style.Stroke({ color: 'orange', width: 2 }),
          })
        }));
      } else {
        // remettre le style normal
        if (listeSommets.includes(currentTarget)) {
          featureToBlink.setStyle(originalPointStyle);
        } else {
          featureToBlink.setStyle(normalLineStyle);
        }
      }
      visible = !visible;
    }
  }, 500);
}



function afterLoad() {
  //document.getElementById('error').innerText = essais;
  document.getElementById('number').innerText = points;
  startTimer();
  gameActive = true
}


function updateGauge() {
  const boxes = document.querySelectorAll('#gaugeGP .gauge-boxGP');
  for (let i = 0; i < boxes.length; i++) {
    if (i < essais) {
      boxes[i].style.opacity = '1';  // pleine si essais restants
    } else {
      boxes[i].style.opacity = '0.2'; // transparente sinon
    }
  }
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


function checkIfAllLoaded() {
  if (sommetsLoaded && hydroLoaded) {
    // Fusionner les listes (si ce n'est pas déjà fait)
    listeNoms = [...new Set([...listeSommets, ...listeHydro])];

let nomsDisponibles = [...listeNoms]; //créer une copie
console.log(nomsDisponibles)
listeGuess = [];

for (let i = 0; i < 20 && nomsDisponibles.length > 0; i++) {
  const randomIndex = Math.floor(Math.random() * nomsDisponibles.length);
  const nom = nomsDisponibles.splice(randomIndex, 1)[0]; // Retire et récupère l'élément
  listeGuess.push(nom);
}


    afterLoad();
    showRandomText();
  }
}


function initGame(){
  if (sommetsLayer) {
    map.removeLayer(sommetsLayer);
    sommetsLayer = null;
  }
  if (hydroLayer) {
    map.removeLayer(hydroLayer);
    hydroLayer = null;
  }

  points = 0;
  essais = 5;
  updateGauge()
  featuresCorrectes = new Set();
  wrongClicksForCurrentTarget = 0;
  blinkInterval = null; // Pour mémoriser l'intervalle de clignotement

  //document.getElementById('error').innerText = essais;
  document.getElementById('number').innerText = points;
  document.getElementById('randomText').innerText = "";
  document.getElementById('restartBtnGP').style.display = "none";
  document.getElementById('encouragments').innerText = "";


  stopTimer();
  document.getElementById('chrono').innerText = '00:00';

  // réinitialiser la couche ville si elle est présente (surout utile au moment de relancer le jeu)
  if (sommetsLayer) {
    sommetsLayer.getSource().getFeatures().forEach(f => f.setStyle(null));
  }
  if (hydroLayer) {
    hydroLayer.getSource().getFeatures().forEach(f => f.setStyle(null));
  }

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

  map.addLayer(hydroLayer);
  map.addLayer(sommetsLayer);

  sommetsSource.once('featuresloadend', function () {
  const features = sommetsSource.getFeatures();
  listeNoms = [];
  listeSommets = [];
  features.forEach(f => {
    //console.log('Sommet :', f.get('name'));
    listeNoms.push(f.get('name'))
    listeSommets.push(f.get('name'))
  });
  sommetsLoaded = true;
  console.log(listeSommets);  
  checkIfAllLoaded();
  //console.log(listeSommets)  
  console.log(listeNoms)
});

hydroSource.once('featuresloadend', function () {
  const features = hydroSource.getFeatures();
  listeHydro = [];
  features.forEach(f => {
    console.log('Fleuve :', f.get('name'));
    listeNoms.push(f.get('name'))
    listeHydro.push(f.get('name'))
  });
  console.log(listeNoms)
  console.log(listeHydro)
  hydroLoaded = true;
  checkIfAllLoaded();
});
}

function endGame(){
  isBlinking = false
  hydroLayer.setVisible(true);
  sommetsLayer.setVisible(true);
  if (blinkInterval) {
    clearInterval(blinkInterval);
    blinkInterval = null;
  }
  let message = listeGuess.length === 0
    ? translations[currentLang].winMessage
    : translations[currentLang].looseMessage;

  document.getElementById('finalMessage').innerText = message;
  document.getElementById('finalScore').innerText = `${translations[currentLang].finalScore} ${points}`;
  document.getElementById('finalTries').innerText = `${translations[currentLang].finalTries} ${5 - essais}`;
  document.getElementById('finalTime').innerText = `${translations[currentLang].finalTime} ${formatTime(elapsedTime)}`;

  // Montrer l'encart
  document.getElementById('endGameMessage').style.display = "block";
  document.getElementById('restartBtnGP').style.display = "block";
  document.getElementById('exploreBtn').style.display = "block";

  // Réinitialiser l'interface utilisateur
  document.getElementById('guess').style.display = "none";
  document.getElementById('test').style.display = "none";
  document.getElementById('points').style.display = "none";
  document.getElementById('chrono').parentElement.style.display = "none";
  document.getElementById('encouragments').style.display = "none";
  document.getElementById('chrono').innerText = "";

  fetch('/api/save_score/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken'), 
    },
    body: JSON.stringify({
      game: 'geophysique',
      score: points,
      time_seconds: elapsedTime
    })
  })
  .then(response => response.json())
  .then(data => {
    if(data.status === 'success'){
      console.log('Score enregistré avec succès');
    } else {
      console.error('Erreur lors de l\'enregistrement:', data.message);
    }
  })
  .catch(error => console.error('Erreur réseau:', error));

}



// Gestion de l'événement de survol
let selected= null;
const tooltip = document.getElementById('tooltip');
const tooltipFalse = document.getElementById('tooltipFalse');




map.on('pointermove', function (e) {
  //if (!tooltipToggle.checked) return;

  // Réinitialiser le style du précédent élément survolé (s'il n'était pas une bonne réponse)
  if (selected !== null && !featuresCorrectes.has(selected)) {
    selected.setStyle(undefined);
    selected = null;
  }

  let featureFound = false;

  map.forEachFeatureAtPixel(e.pixel, function (f) {
    const nomFeat = f.get('name');
    if (!nomFeat) return true;

    selected = f; // mémoriser la feature

    if (listeSommets.includes(nomFeat)) {
      if (!featuresCorrectes.has(f)) {
        f.setStyle(hoverPointStyle);
        if (!gameActive) {
        const tooltip = $('#tooltip');
        tooltip.text(nomFeat);
        tooltip.css({
          left: e.originalEvent.clientX - mapRect.left + 10 + 'px',
          top: e.originalEvent.clientY - mapRect.top + 10 + 'px',
          display: 'block'
        });
      }
      } else {
        // sommet trouvé : il a déjà son label, on ne montre pas le tooltip flottant
        tooltip.style.display = "none";
      }
    } else if (listeHydro.includes(nomFeat)) {
      if (!featuresCorrectes.has(f)) {
      f.setStyle(hoverLineStyle);
      if (!gameActive) {
        const tooltip = $('#tooltip');
        tooltip.text(nomFeat);
        tooltip.css({
          left: e.originalEvent.clientX - mapRect.left + 10 + 'px',
          top: e.originalEvent.clientY - mapRect.top + 10 + 'px',
          display: 'block'
        });
      }
    } else {
        f.setStyle(correctStyleHydro);
        const tooltip = $('#tooltip');
        tooltip.text(nomFeat);
        tooltip.css({
          left: e.originalEvent.clientX - mapRect.left + 10 + 'px',
          top: e.originalEvent.clientY - mapRect.top + 10 + 'px',
          display: 'block'
        });
      }
    } else {
      tooltip.style.display = "none";
    }

    featureFound = true;
    return true; // arrêter après la première feature trouvée
  });

  // Si aucun feature trouvé, cacher le tooltip
  if (!featureFound) {
    tooltip.style.display = "none";
  }
});

map.on('click', function (e) {
  if (!gameActive) return;
    map.forEachFeatureAtPixel(e.pixel, function (f) {
      //selected = f;
      const nomFeat = f.get('name')
      if (!listeNoms.includes(nomFeat)) {
        return true;
      }
      if (nomFeat === currentTarget){
        isBlinking = false
        if (listeSommets.includes(nomFeat)) {
          f.setStyle(correctStyleSommet(nomFeat));
        } else if (listeHydro.includes(nomFeat)) {
          f.setStyle(correctStyleHydro);
        const tooltip = $('#tooltipCorrect');
        tooltip.text(nomFeat);
        tooltip.css({
          left: e.originalEvent.clientX - mapRect.left + 10 + 'px',
          top: e.originalEvent.clientY - mapRect.top + 10 + 'px',
          display: 'block'
        });
        tooltip.stop(true, true).fadeIn(200).delay(500).fadeOut(300);
        }
        featuresCorrectes.add(f); // Marquer comme correcte
        listeGuess = listeGuess.filter(v => v !== nomFeat);
        if (wrongClicksForCurrentTarget >= 3) {
        document.getElementById('number').innerText = points;
          } else {
        points += 100
        document.getElementById('number').innerText = points;
          }
        randomCongrats();
        setTimeout(() => {
          showRandomText();
        }, 500); 
        setTimeout (() => {
        document.getElementById('guess').classList.add('flash-correctGP');
        }, 500);
        // La retire après 800ms
        setTimeout(() => {
          document.getElementById('guess').classList.remove('flash-correctGP');
        }, 1200);
      if (listeGuess.length === 0) {
        stopTimer();
        gameActive = false;
        endGame();
        return;
    }
      }else{
        points = Math.max(0, points - 50);
        randomEncourage();
        wrongClicksForCurrentTarget++;
        if (wrongClicksForCurrentTarget >= 3 && !blinkInterval) {
            startBlinkingCurrentTarget();
            essais = Math.max(0, essais - 1);
          } if (wrongClicksForCurrentTarget > 3 ) {
            isBlinking = true; 
          }
        if (!isBlinking) {
            const tooltip = $('#tooltipFalse');
            tooltip.text(nomFeat);
            tooltip.css({
              left: e.originalEvent.clientX - mapRect.left + 10 + 'px',
              top: e.originalEvent.clientY - mapRect.top + 10 + 'px',
              display: 'block'
        });
        tooltip.stop(true, true).fadeIn(200).delay(500).fadeOut(300);
      }
        //document.getElementById('error').innerText = essais;
        document.getElementById('number').innerText = points;
        updateGauge()
        if (essais === 0){
          stopTimer();
          gameActive = false;
          endGame();
        }
      }
      //console.log(f.get('name'))
      console.log(f.get('name'))
      return true;
    });
  });

document.getElementById('restartBtnGP').addEventListener('click', function () {
  // Masquer le message final et les boutons
  document.getElementById('endGameMessage').style.display = "none";
  document.getElementById('restartBtnGP').style.display = "none";
  document.getElementById('exploreBtn').style.display = "none";

  // Réinitialiser l'interface utilisateur
  document.getElementById('guess').style.display = "block";
  document.getElementById('test').style.display = "block";
  document.getElementById('points').style.display = "block";
  document.getElementById('chrono').parentElement.style.display = "block";
  document.getElementById('encouragments').style.display = "block";
  document.getElementById('chrono').innerText = "00:00";

  // Réinitialiser les variables et relancer le jeu
  stopTimer();  // au cas où un timer est encore en cours
  initGame();   // ta fonction principale de lancement du jeu
});

window.onload = () => {
  initGame(); // démarre le jeu à l'ouverture de la page
};
