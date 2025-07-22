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


// charger la couche de la limite du crs avec le style
var crsLayer = new ol.layer.Vector({
  source: crsSource,
  //background: 'black',
  style: new ol.style.Style({
      fill: new ol.style.Fill({ color: 'rgba(255, 255, 255, 0.34)' }),
      stroke: new ol.style.Stroke({ color: 'purple', width: 2 }),
  }),
});

const paysSource = new ol.source.Vector({
    url: paysUrl,
    format: new ol.format.GeoJSON(),
  });


var paysLayer = new ol.layer.Vector({
  source: paysSource,
  //background: 'black',
  style: new ol.style.Style({
      fill: new ol.style.Fill({ color: 'rgba(255, 255, 255, 0)' }),
      stroke: new ol.style.Stroke({ color: 'rgba(60, 51, 51, 0.47)', width: 2 }),
  }),
});

const map = new ol.Map({
  target: 'webmap',
  layers: [basemap, crsLayer, paysLayer],
  view: new ol.View({
    center: [7.772542083975405, 48.234177921525884],
    zoom: 8.3,
    minZoom: 7,
    maxZoom: 11,
  }),
});


// variables globales du jeu 
let regionsLayer = null
let listeRegions = [];
let foundRegions = new Set();
let currentTarget = "";
let currentType = "";
let timerInterval = null;
let elapsedTime = 0;
let gameActive = false
let selected = null;
let essais = 5;
let finalTries = 0;
let points = 0;
const mapRect = map.getTargetElement().getBoundingClientRect();
const nomToNUTS = {};
let blinkInterval = null;
let isBlinking = false;
let wrongClicksForCurrentTarget = 0;

//styles couches 

const hoverStyle = new ol.style.Style({
      fill: new ol.style.Fill({ color: 'rgba(192, 235, 215, 0.64)' }),
      stroke: new ol.style.Stroke({ color: 'rgba(15, 172, 99, 0.99)', width: 2 }),
      });

const correctStyle = new ol.style.Style({
        fill: new ol.style.Fill({ color: 'rgba(211, 232, 222, 0.64)' }),
      stroke: new ol.style.Stroke({ color: 'rgba(154, 147, 147, 0.99)', width: 2 }),
      });

// Style rouge pour les régions non trouvées
const missedStyle = new ol.style.Style({
        fill: new ol.style.Fill({ color: 'rgba(190, 26, 26, 0.64)' }),
        stroke: new ol.style.Stroke({ color: 'rgba(172, 15, 15, 0.99)', width: 2 }),      
    });


function styleByType(feature) {
  const nuts3 = feature.get("nuts3");
  const type = detectTypeFromNUTS(nuts3);

  let fillColor, strokeColor;

  switch (type) {
    case "Landkreis":
      fillColor = "rgba( 255, 226, 139, 0.70 )";
      strokeColor = "rgba(228, 192, 82, 1)";
      break;
    case "canton":
      fillColor = "rgba( 220, 146, 215, 0.70 )";
      strokeColor = "rgba(220, 146, 215, 1)";
      break;
    case "collectivité":
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

function hoverByType(feature) {
  const nuts3 = feature.get("nuts3");
  const type = detectTypeFromNUTS(nuts3);

  let fillColor, strokeColor;

  switch (type) {
    case "Landkreis":
      fillColor = "rgba(161, 143, 82, 0.7)";
      strokeColor = "rgba(228, 192, 82, 1)";
      break;
    case "canton":
      fillColor = "rgba(123, 50, 119, 0.67)";
      strokeColor = "rgba(220, 146, 215, 1)";
      break;
    case "collectivité":
    default:
      fillColor = "rgba(85, 196, 126, 0.68)";
      strokeColor = "rgba(137, 202, 161, 1)";
      break;
  }

  return new ol.style.Style({
    fill: new ol.style.Fill({ color: fillColor }),
    stroke: new ol.style.Stroke({ color: strokeColor, width: 2 }),
  });
}

// fonctions utilitaires


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


function detectTypeFromNUTS(nuts3) {
  if (!nuts3) return null;
  if (nuts3.startsWith("CH")) return "canton";
  if (nuts3.startsWith("DE")) return "Landkreis";
  return "collectivité";
}


function showRandomText() {
    const randomIndex = Math.floor(Math.random() * listeRegions.length);
    currentTarget = listeRegions[randomIndex];
    const nuts3 = nomToNUTS[currentTarget]
    currentType = detectTypeFromNUTS(nuts3)
    wrongClicksForCurrentTarget = 0;
    if (blinkInterval) {
      clearInterval(blinkInterval);
      blinkInterval = null;
    }
    document.getElementById('randomTextREG').innerText = translate[currentLang].guessTextREG(currentType, currentTarget);
};


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
  const randomId = Math.floor(Math.random() * translate[currentLang].encouragements.length);
  showEncouragementMessage(translate[currentLang].encouragements[randomId]);
}

function randomEncourage() {
  //const messages = ["Essaie encore !", "Presque", "Pas loin !"];
  const randomId = Math.floor(Math.random() * translate[currentLang].retryMessages.length);
  showEncouragementMessage(translate[currentLang].retryMessages[randomId]);
}


function startBlinkingCurrentTarget() {
  let targetLayer = listeRegions.includes(currentTarget) ? regionsLayer : regionsLayer;
  let source = targetLayer.getSource();
  let featureToBlink = source.getFeatures().find(f => f.get('nom') === currentTarget);
  if (!featureToBlink) return;

  let visible = true;

  blinkInterval = setInterval(() => {
    if (!foundRegions.has(featureToBlink)) {
      if (visible) {
        // style "flash"
        featureToBlink.setStyle(new ol.style.Style({
            fill: new ol.style.Fill({ color: 'yellow' }),
            stroke: new ol.style.Stroke({ color: 'orange', width: 2 }),
        }));
      } else {
        // remettre le style normal
        if (listeRegions.includes(currentTarget)) {
          featureToBlink.setStyle(styleByType);
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
  const boxes = document.querySelectorAll('#gaugeREG .gauge-boxREG');
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


// initialiser le jeu
function initGame() {
  
  foundRegions.clear();
  points = 0;
  essais = 5;
  finalTries = 0;
  updateGauge()
  //gameEnded = false;
  blinkInterval = null;
  isBlinking = false
  wrongClicksForCurrentTarget = 0;

  //document.getElementById('error').innerText = essais;
  document.getElementById('number').innerText = points;
  document.getElementById('randomTextREG').innerText = "";
  document.getElementById('restartBtnREG').style.display = "none";
  document.getElementById('encouragments').innerText = "";


  stopTimer();
  document.getElementById('chrono').innerText = '00:00';

  // réinitialiser la couche régions si elle est présente (surout utile au moment de relancer le jeu)
  if (regionsLayer) {
    regionsLayer.getSource().getFeatures().forEach(f => f.setStyle(null));
    map.removeLayer(regionsLayer);
    regionsLayer = null;
  }

var regionsSource = new ol.source.Vector({
    url: regionsUrl,
    format: new ol.format.GeoJSON(),
  });

// charger la couche de points des régions avec le style
regionsLayer = new ol.layer.Vector({
  source: regionsSource,
  style: styleByType,
});

map.addLayer(regionsLayer);

regionsSource.once('featuresloadend', function () {
  const features = regionsSource.getFeatures();
  listeRegions = []; // empty the list when reloading the game
  features.forEach(f => {
    f.setStyle(null);
    listeRegions.push(f.get('nom'))
    const nom = f.get('nom')
    const nuts3 = f.get('nuts3')
    nomToNUTS[nom] = nuts3;
  });
  //initGame()
  afterLoad()
  showRandomText()
});

}


function endGame(){
  isBlinking = false
  finalTries = 5 - essais
  if (blinkInterval) {
    clearInterval(blinkInterval);
    blinkInterval = null;
  }
  tooltip.style.display = "none"; // empecher le tooltip de rester affiché une fois que le jeu est fini
  //tooltipFalse.style.display = "none"; // empecher le tooltip de rester affiché une fois que le jeu est fini

  let message = listeRegions.length === 0
    ? translate[currentLang].winMessageREG
    : translate[currentLang].looseMessage;

  document.getElementById('finalMessage').innerText = message;
  document.getElementById('finalScore').innerText = `${translate[currentLang].finalScore} ${points}`;
  document.getElementById('finalTries').innerText = `${translate[currentLang].finalTries} ${5 - essais}`;
  document.getElementById('finalTime').innerText = `${translate[currentLang].finalTime} ${formatTime(elapsedTime)}`;

  // Montrer l'encart
  document.getElementById('endGameMessage').style.display = "block";
  document.getElementById('restartBtnREG').style.display = "block";
  document.getElementById('exploreBtn').style.display = "block";

  // Réinitialiser l'interface utilisateur
  document.getElementById('guess').style.display = "none";
  document.getElementById('test').style.display = "none";
  document.getElementById('points').style.display = "none";
  document.getElementById('chrono').parentElement.style.display = "none";
  document.getElementById('encouragments').style.display = "none";
  document.getElementById('chrono').innerText = "";
  
  // Appliquer ce style aux régions restantes
  regionsLayer.getSource().getFeatures().forEach((feature) => {
    const nom = feature.get('nom');
    if (listeRegions.includes(nom)) {
      feature.setStyle(missedStyle);
    }
  });
const baseUrl = window.location.origin; 
console.log(baseUrl)

  fetch(`${baseUrl}/api/save_score/`,  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken'), 
    },
    body: JSON.stringify({
      game: 'collectivites',
      score: points,
      tries: finalTries,
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




//let gameEnded = false;
// Gestion de l'événement de survol
const tooltip = document.getElementById('tooltip');
//const tooltipFalse = document.getElementById('tooltipFalse');

map.on('pointermove', function (e) {
  let newSelected = null;

  map.forEachFeatureAtPixel(e.pixel, function (f) {
    const nom = f.get('nom');
    if (!nom) return false;

    newSelected = f;
    return true;
  });

  const gameEnded = (listeRegions.length === 0 || essais === 0);

  if (selected !== newSelected) {
    if (selected) {
      const nom = selected.get('nom');
      if (foundRegions.has(nom)) {
        selected.setStyle(correctStyle);
      } else if (gameEnded && listeRegions.includes(nom)) {
        selected.setStyle(missedStyle);
      } else {
        selected.setStyle(undefined);
      }
    }

    selected = newSelected;

    if (selected) {
      const nom = selected.get('nom');
      if (!listeRegions.includes(nom)) {
        selected.setStyle(hoverStyle);
      } else if (gameEnded && listeRegions.includes(nom)) {
        selected.setStyle(new ol.style.Style({
          fill: new ol.style.Fill({ color: 'rgba(226, 170, 170, 0.84)' }),
          stroke: new ol.style.Stroke({ color: 'rgba(141, 29, 29, 0.99)', width: 2 }),
      }));
      } else {
      selected.setStyle(hoverByType);
      }
      } else {
      tooltip.style.display = 'none';
    };
  }
  if (gameEnded && selected) {
   const tooltip = $('#tooltip');
  const nom = selected.get('nom');
  tooltip.text(nom);
  tooltip.css({
    left: e.originalEvent.clientX - mapRect.left + 10 + 'px',
    top: e.originalEvent.clientY - mapRect.top + 10 + 'px',
    display: 'block'
  });
  }
});


map.on('click', function (e) {
  if (!gameActive) return;
    map.forEachFeatureAtPixel(e.pixel, function (f) {
      const nom = f.get('nom')
      if (!listeRegions.includes(nom)) {
        return true;
      }
      if (nom === currentTarget){
        isBlinking = false;
        f.setStyle(correctStyle);
        listeRegions = listeRegions.filter(v => v !== nom);
        foundRegions.add(nom); 
      if (wrongClicksForCurrentTarget >= 3) {
        document.getElementById('number').innerText = points;
          } else {
        points += 100
        document.getElementById('number').innerText = points;
          }
        showRandomText();
        document.getElementById('guess').classList.add('flash-correctREG');
        // La retire après 800ms
        setTimeout(() => {
          document.getElementById('guess').classList.remove('flash-correctREG');
        }, 800);
        randomCongrats();
        const tooltip = $('#tooltipCorrect');
        tooltip.text(nom);
        tooltip.css({
          left: e.originalEvent.clientX - mapRect.left + 10 + 'px',
          top: e.originalEvent.clientY - mapRect.top + 10 + 'px',
          display: 'block'
        });
        tooltip.stop(true, true).fadeIn(200).delay(500).fadeOut(300);
      if (listeRegions.length === 0) {
        stopTimer();
        gameActive = false;
        endGame();
        return;
    }
      }else {
        randomEncourage();
        wrongClicksForCurrentTarget++;
        if (wrongClicksForCurrentTarget >= 3 && !blinkInterval) {
            startBlinkingCurrentTarget();
            essais = Math.max(0, essais - 1);
            points = Math.max(0, points - 50);
          } if (wrongClicksForCurrentTarget > 3 ) {
            isBlinking = true; 
          }
        if (!isBlinking) {
            const tooltip = $('#tooltipFalse');
            tooltip.text(nom);
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
      return true;
    });
  });

document.getElementById('restartBtnREG').addEventListener('click', function () {
  // Masquer le message final et les boutons
  document.getElementById('endGameMessage').style.display = "none";
  document.getElementById('restartBtnREG').style.display = "none";
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
