// permet d'afficher les fichiers dans la projection 4258
ol.proj.useGeographic();

// initialiser le fond de carte
const basemap = new ol.layer.Tile({
  source: new ol.source.XYZ({
    url: 'https://{a-c}.basemaps.cartocdn.com/rastertiles/light_nolabels/{z}/{x}/{y}{r}.png',
    attributions: '© OpenStreetMap contributors © CARTO'
  })
});

//Source CRS
const crsSource = new ol.source.Vector({
    url: 'https://geoportal.georhena.eu/geoserver/boundaries/wfs?SERVICE=WFS&REQUEST=GetFeature&VERSION=2.0.0&TYPENAMES=boundaries%3Alimite_crs&OUTPUTFORMAT=json',
    format: new ol.format.GeoJSON(),
  });


// charger la couche de la limite du crs avec le style
var crsLayer = new ol.layer.Vector({
  source: crsSource,
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
    zoom: 8,
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
let mapRect = map.getTargetElement().getBoundingClientRect();
const nomToNUTS = {};
let blinkInterval = null;
let isBlinking = false;
let wrongClicksForCurrentTarget = 0;

//styles des couches 
// style au survol
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

// style en fonction du type de collectivité
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

// style au survol en fonction du type de collectivité (s'affiche si l'entité n'a pas été trouvée)
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

// fonctions utilitaires (cf main_ol_trad.js)

//formater le temps au format 00:00
function formatTime(seconds) {
  const min = String(Math.floor(seconds / 60)).padStart(2, '0');
  const sec = String(seconds % 60).padStart(2, '0');
  return `${min}:${sec}`;
}

// commencer le timer
function startTimer() {
  elapsedTime = 0;
  document.getElementById('chrono').innerText = formatTime(elapsedTime);

  timerInterval = setInterval(() => {
    elapsedTime++;
    document.getElementById('chrono').innerText = formatTime(elapsedTime);
  }, 1000);
}
// Arrêter le timer
function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

// détecter le type de collectivité pour bien afficher la phrase de devinette
function detectTypeFromNUTS(nuts3) {
  if (!nuts3) return null;
  if (nuts3.startsWith("CH")) return "canton";
  if (nuts3.startsWith("DE")) return "Landkreis";
  if (nuts3.startsWith("ST")) return "Stadt"
  return "collectivité";
}

//afficher la phrase de devinette avec la mention canton ou Landkreis
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

// afficher messages d'encouragements
function showEncouragementMessage(text) {
  const encouragementDiv = document.getElementById('encouragments');
  encouragementDiv.innerText = text;
  // Afficher puis
  encouragementDiv.style.opacity = '1';
  // Masquer au bout d'une seconde
  setTimeout(() => {
    encouragementDiv.style.opacity = '0';
  }, 1000);
}

//messages de felicitations
function randomCongrats() {
  const randomId = Math.floor(Math.random() * translate[currentLang].encouragements.length);
  showEncouragementMessage(translate[currentLang].encouragements[randomId]);
}
//messages d'encouragements
function randomEncourage() {
  const randomId = Math.floor(Math.random() * translate[currentLang].retryMessages.length);
  showEncouragementMessage(translate[currentLang].retryMessages[randomId]);
}

// fonction pour faire clignoter l'entité à trouver
function startBlinkingCurrentTarget() {
  let targetLayer = listeRegions.includes(currentTarget) ? regionsLayer : regionsLayer;
  let source = targetLayer.getSource();
  let featureToBlink = source.getFeatures().find(f => f.get('nom') === currentTarget);
  if (!featureToBlink) return;

  let visible = true;

  blinkInterval = setInterval(() => {
    if (!foundRegions.has(featureToBlink)) {
      if (visible) {
        // style qui clignote
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

// fonction à lancer une fois que la couche des collectivités est chargée
function afterLoad() {
  document.getElementById('number').innerText = points;
  startTimer();
  gameActive = true
}

// Mettre à jour la jauge
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
// fonction nécessaire pour stocker les scores et autres
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
  // reinitialiser les variables (surout utile au moment de relancer le jeu)
  foundRegions.clear();
  points = 0;
  essais = 5;
  finalTries = 0;
  updateGauge()
  blinkInterval = null;
  isBlinking = false
  wrongClicksForCurrentTarget = 0;
  
  //réinitialiser certains éléments de texte
  document.getElementById('number').innerText = points;
  document.getElementById('randomTextREG').innerText = "";
  document.getElementById('restartBtnREG').style.display = "none";
  document.getElementById('encouragments').innerText = "";

  // Arrêter et réinitialiser le timer
  stopTimer();
  document.getElementById('chrono').innerText = '00:00';

  // réinitialiser la couche des collectivités si elle est présente (surout utile au moment de relancer le jeu)
  if (regionsLayer) {
    regionsLayer.getSource().getFeatures().forEach(f => f.setStyle(null));
    map.removeLayer(regionsLayer);
    regionsLayer = null;
  }

var regionsSource = new ol.source.Vector({
    url: regionsUrl,
    format: new ol.format.GeoJSON(),
  });

// charger la couche des collectivités avec le style
regionsLayer = new ol.layer.Vector({
  source: regionsSource,
  style: styleByType,
});

map.addLayer(regionsLayer); // Ajouter à la carte

// créer la liste des entités à deviner
regionsSource.once('featuresloadend', function () {
  const features = regionsSource.getFeatures();
  listeRegions = []; 
  features.forEach(f => {
    f.setStyle(null);
    listeRegions.push(f.get('nom'))
    const nom = f.get('nom')
    const nuts3 = f.get('type')
    nomToNUTS[nom] = nuts3; // Dictionnaire des types pour bien afficher la phrase de devinette
  });
  afterLoad()
  showRandomText()
});

}

// Fin du jeu
function endGame(){
  isBlinking = false // Arrêter le clignotement des entités s'il est présent
  finalTries = 5 - essais
  // Arrêter le clignotement des entités s'il est présent
  if (blinkInterval) {
    clearInterval(blinkInterval);
    blinkInterval = null;
  }
  tooltip.style.display = "none"; // empecher le tooltip de rester affiché une fois que le jeu est fini
  
  // afficher le bon message de fin de jeu
  let message = listeRegions.length === 0
    ? translate[currentLang].winMessageREG
    : translate[currentLang].looseMessage;

  // Afficher les différents éléments de fin de jeu
  document.getElementById('finalMessage').innerText = message;
  document.getElementById('finalScore').innerText = `${translate[currentLang].finalScore} ${points}`;
  document.getElementById('finalTries').innerText = `${translate[currentLang].finalTries} ${5 - essais}`;
  document.getElementById('finalTime').innerText = `${translate[currentLang].finalTime} ${formatTime(elapsedTime)}`;

  // Montrer l'encart de fin de jeu
  document.getElementById('endGameMessage').style.display = "block";
  document.getElementById('restartBtnREG').style.display = "block";
  document.getElementById('exploreBtn').style.display = "block";

  // Enlever les éléments de jeu pour pouvoir montrer l'affichage de fin
  document.getElementById('guess').style.display = "none";
  document.getElementById('test').style.display = "none";
  document.getElementById('points').style.display = "none";
  document.getElementById('chrono').parentElement.style.display = "none";
  document.getElementById('encouragments').style.display = "none";
  document.getElementById('chrono').innerText = "";
  
  // Appliquer ce style aux régions non trouvées
  regionsLayer.getSource().getFeatures().forEach((feature) => {
    const nom = feature.get('nom');
    if (listeRegions.includes(nom)) {
      feature.setStyle(missedStyle);
    }
  });

const baseUrl = window.location.origin; // permet de créer le bon lien pour enregistrer les scores
console.log(baseUrl)

// fonction pour enregistrer les scores et autre dans la base de données 
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


// Gestion du popup
const tooltip = document.getElementById('tooltip');

// gestion des affichages au survol
map.on('pointermove', function (e) {
  let newSelected = null;

  // Détecter les entités
  map.forEachFeatureAtPixel(e.pixel, function (f) {
    const nom = f.get('nom');
    if (!nom) return false;
    newSelected = f;
    return true;
  });

  const gameEnded = (listeRegions.length === 0 || essais === 0); // le jeu se termine si la liste des collectivités à deviner est vide ou si le nombre d'essais est écoulé

  // Gérer les affichages de style au survol
  if (selected !== newSelected) {
    if (selected) {
      const nom = selected.get('nom');
      if (foundRegions.has(nom)) {
        selected.setStyle(correctStyle); // garde le style correctStyle si la souris s'enlève de l'entité trouvée
      } else if (gameEnded && listeRegions.includes(nom)) {
        selected.setStyle(missedStyle); // à la fin du jeu garde le style missedStyle si la souris s'enlève de l'entité qui n'a pas été trouvée
      } else {
        selected.setStyle(undefined); // sinon applique le style par défaut
      }
    }

    selected = newSelected;

    if (selected) {
      const nom = selected.get('nom');
      if (!listeRegions.includes(nom)) {
        selected.setStyle(hoverStyle); // si la collectivité a été trouvée affiche hoverstyle au survol
      } else if (gameEnded && listeRegions.includes(nom)) {
        // à la fin du jeu applique ce style au survol lorsque les entités n'ont pas été trouvée
        selected.setStyle(new ol.style.Style({
          fill: new ol.style.Fill({ color: 'rgba(226, 170, 170, 0.84)' }),
          stroke: new ol.style.Stroke({ color: 'rgba(141, 29, 29, 0.99)', width: 2 }),
      }));
      } else {
      selected.setStyle(hoverByType); // pendant le jeu si l'entité n'a pas été trouvée applique hoverByType
      }
      } else {
      tooltip.style.display = 'none';
    };
  }
  // afficher les noms des entités au survol à la fin du jeu 
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
  if (!gameActive) return; // si le jeu n'est pas actif n'applique pas la fonction
    map.forEachFeatureAtPixel(e.pixel, function (f) {
      const nom = f.get('nom')
      if (!listeRegions.includes(nom)) { // si l'entité a été trouvée ne fait rien
        return true;
      }
      if (nom === currentTarget){ // si l'entité cliquée est la bonne réponse
        isBlinking = false;
        f.setStyle(correctStyle); 
        listeRegions = listeRegions.filter(v => v !== nom); // retirer le nom de la collectivité de la liste listeRegions
        foundRegions.add(nom); // ajouter le nom à foundRegions
      if (wrongClicksForCurrentTarget >= 3) { // si le nombre de tentative est supérieur ou égal à 3 
        document.getElementById('number').innerText = points; // n'ajoute pas de points
          } else { // si l'entité est trouvée et le nombre de tentatives est inférieur à 3
        points += 100 // ajoute 100 points
        document.getElementById('number').innerText = points; // affiche les points
          }
        showRandomText(); // montrer une nouvelle phrase de devinette
        document.getElementById('guess').classList.add('flash-correctREG'); // encart devinette en surbrillance jaune
        // retire la surbrillance après 800ms
        setTimeout(() => {
          document.getElementById('guess').classList.remove('flash-correctREG');
        }, 800);
        randomCongrats(); // message de félicitations
        const tooltip = $('#tooltipCorrect'); 
        // affichage du popup en vert avec le nom de la collectivité
        tooltip.text(nom);
        tooltip.css({
          left: e.originalEvent.clientX - mapRect.left + 10 + 'px',
          top: e.originalEvent.clientY - mapRect.top + 10 + 'px',
          display: 'block'
        });
        tooltip.stop(true, true).fadeIn(200).delay(500).fadeOut(300); // affichage temporaire
      if (listeRegions.length === 0) { // fin du jeu si toutes les collectivités ont été trouvées
        stopTimer();
        gameActive = false;
        endGame();
        return;
    }
      }else { // si erreur
        randomEncourage(); // message d'encouragements
        wrongClicksForCurrentTarget++; // ajout d'une tentative
        // si le nombre de tentatives est supérieur ou égal à 3 faire clignoter l'entité et enlever 1 essai et 50 points
        if (wrongClicksForCurrentTarget >= 3 && !blinkInterval) {
            startBlinkingCurrentTarget();
            essais = Math.max(0, essais - 1);
            points = Math.max(0, points - 50);
          } if (wrongClicksForCurrentTarget > 3 ) {
            isBlinking = true; 
          }
         // afficher le popup en rouge lorsqu'il y a erreur 
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
        document.getElementById('number').innerText = points; // afficher les points
        updateGauge() // mettre à jour la jauge
        if (essais === 0){ // fin du jeu si tous les essais épuisés
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

  // Réinitialiser l'interface utilisateur de jeu
  document.getElementById('guess').style.display = "block";
  document.getElementById('test').style.display = "block";
  document.getElementById('points').style.display = "block";
  document.getElementById('chrono').parentElement.style.display = "block";
  document.getElementById('encouragments').style.display = "block";
  document.getElementById('chrono').innerText = "00:00";

  stopTimer();  // Arrêter le timer au cas où
  initGame();   // lancer le jeu
});

window.onload = () => {
  initGame(); // première initialisation du jeu
};
