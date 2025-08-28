// permet d'afficher les fichiers dans la projection 4258
ol.proj.useGeographic();

// initialiser le fond de carte

const basemap = new ol.layer.Tile({
  source: new ol.source.XYZ({
    url: 'https://{a-c}.basemaps.cartocdn.com/rastertiles/light_nolabels/{z}/{x}/{y}{r}.png',
    attributions: '© OpenStreetMap contributors © CARTO'
  })
});

const crsSource = new ol.source.Vector({
    url: crsUrl, // temporaire : cause : maintenance du datahub
    //'https://geoportal.georhena.eu/geoserver/boundaries/wfs?SERVICE=WFS&REQUEST=GetFeature&VERSION=2.0.0&TYPENAMES=boundaries%3Alimite_crs&OUTPUTFORMAT=json',
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
  style: new ol.style.Style({
      fill: new ol.style.Fill({ color: 'rgba(159, 79, 196, 0.4)' }),
      stroke: new ol.style.Stroke({ color: 'purple', width: 2 }),
  }),
});


var paysLayer = new ol.layer.Vector({
  source: paysSource,
  //background: 'black',
  style: new ol.style.Style({
      fill: new ol.style.Fill({ color: 'rgba(255, 255, 255, 0)' }),
      stroke: new ol.style.Stroke({ color: 'rgba(247, 217, 46, 0.91)', width: 3 }),
  }),
});


const map = new ol.Map({
  target: 'webmap',
  layers: [basemap, crsLayer, paysLayer],
  view: new ol.View({
    center: [
    7.772542083975405,
    48.234177921525884
    ],
    zoom: 8,
    minZoom: 7,
    maxZoom: 11,
  }),
});



// variables globales du jeu
let villesLayer = null
let listeVilles = [];
let currentTarget = "";
let timerInterval = null;
let elapsedTime = 0;
let gameActive = false
let selected = null;
let points = 0;
let essais = 5;
let finalTries = 0;
let mapRect = map.getTargetElement().getBoundingClientRect();
let wrongClicksForCurrentTarget = 0;
let blinkInterval = null;
let foundVilles = new Set();
let isBlinking = false;


// styles 


const originalPointStyle = new ol.style.Style({
    image: new ol.style.Circle({
      radius: 5,
      fill: new ol.style.Fill({ color: 'black' }),
      stroke: new ol.style.Stroke({ color: 'black', width: 2 }),
  }),
  })


// fonctions utilitaires

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

// arrêter le timer
function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

// afficher messages d'encouragements
function showEncouragementMessage(text) {
  const encouragementDiv = document.getElementById('encouragments');
  encouragementDiv.innerText = text;
  // Afficher puis
  encouragementDiv.style.opacity = '1';
  // Masquer après 1 seconde
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
  let targetLayer = listeVilles.includes(currentTarget) ? villesLayer : villesLayer;
  let source = targetLayer.getSource();
  let featureToBlink = source.getFeatures().find(f => f.get('name') === currentTarget);
  if (!featureToBlink) return;

  let visible = true;

  blinkInterval = setInterval(() => {
    if (!foundVilles.has(featureToBlink)) {
      if (visible) {
        // style qui clignote
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
        if (listeVilles.includes(currentTarget)) {
          featureToBlink.setStyle(originalPointStyle);
        }
      }
      visible = !visible;
    }
  }, 500);
}


// fonction à lancer une fois que la couche des villes est chargée
function afterLoad() {
  document.getElementById('number').innerText = points;
  startTimer();
  gameActive = true
}

// fonction nécessaire pour stocker les scores
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


// montrer la phrase avec l'entité à deviner
function showRandomText() {
    const randomIndex = Math.floor(Math.random() * listeVilles.length);
    currentTarget = listeVilles[randomIndex];
    wrongClicksForCurrentTarget = 0;
    if (blinkInterval) {
      clearInterval(blinkInterval);
      blinkInterval = null;
    }
    document.getElementById('randomText').innerText = translate[currentLang].guessText(currentTarget);
};
// mettre à jour la jauge des essais
function updateGauge() {
  const boxes = document.querySelectorAll('#gauge .gauge-box');
  for (let i = 0; i < boxes.length; i++) {
    if (i < essais) {
      boxes[i].style.opacity = '1';  // pleine si essais restants
    } else {
      boxes[i].style.opacity = '0.2'; // transparente sinon
    }
  }
}


// initialiser le jeu
function initGame() {
  // reinitialiser les variables (surout utile au moment de relancer le jeu)
  foundVilles.clear(); 
  points = 0;
  essais = 5;
  finalTries = 0;
  updateGauge()
  wrongClicksForCurrentTarget = 0;
  blinkInterval = null;
  isBlinking = false

  //réinitialiser certains éléments de texte
  document.getElementById('number').innerText = points;
  document.getElementById('randomText').innerText = "";
  document.getElementById('restartBtn').style.display = "none";
  document.getElementById('encouragments').innerText = "";

  // Arrêter et réinitialiser le timer
  stopTimer();
  document.getElementById('chrono').innerText = '00:00';

  // réinitialiser la couche ville si elle est présente (surout utile au moment de relancer le jeu)
  if (villesLayer) {
    villesLayer.getSource().getFeatures().forEach(f => f.setStyle(null));
    map.removeLayer(villesLayer);
    villesLayer = null;
  }
// source de la couche ville
var villesSource = new ol.source.Vector({
    url: villesUrl, // temporaire, cause : maintenance datahub
    // lien WFS : 'https://geoportal.georhena.eu/geoserver/boundaries/wfs?SERVICE=WFS&REQUEST=GetFeature&VERSION=2.0.0&TYPENAMES=boundaries%3Avilles_principales&OUTPUTFORMAT=json',
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

map.addLayer(villesLayer); // ajouter à la map

villesSource.once('featuresloadend', function () {
  const features = villesSource.getFeatures();
  listeVilles = []; // liste qui va contenir les entités à deviner
  features.forEach(f => {
    f.setStyle(null);
    listeVilles.push(f.get('name')) // ajouter les entités à la liste au fur et à mesure
  });
  afterLoad()
  showRandomText()
});
}

// fonction qui permet de mettre en place l'affichage de fin de jeu
function endGame(){
  isBlinking = false; // arrêter le clignotement s'il y en a
  tooltip.style.display = "none"; // empecher le tooltip de rester affiché une fois que le jeu est fini
  finalTries = 5 - essais;
  if (blinkInterval) { // réinitisaliser l'intervalle de clignotement
    clearInterval(blinkInterval);
    blinkInterval = null;
  }
  // afficher le bon message de fin de jeu
  let message = listeVilles.length === 0
    ? translate[currentLang].winMessageVilles
    : translate[currentLang].looseMessage;

  document.getElementById('finalMessage').innerText = message;
  document.getElementById('finalScore').innerText = `${translate[currentLang].finalScore} ${points}`;
  document.getElementById('finalTries').innerText = `${translate[currentLang].finalTries} ${5 - essais}`;
  document.getElementById('finalTime').innerText = `${translate[currentLang].finalTime} ${formatTime(elapsedTime)}`;
  
  // Montrer l'encart de fin de jeu
  document.getElementById('endGameMessage').style.display = "block";
  document.getElementById('restartBtn').style.display = "block";
  document.getElementById('exploreBtn').style.display = "block";

  // Enlever les éléments de jeu (devinette, jauge etc..) pour pouvoir montrer l'affichage de fin
  document.getElementById('guess').style.display = "none";
  document.getElementById('test').style.display = "none";
  document.getElementById('points').style.display = "none";
  document.getElementById('chrono').parentElement.style.display = "none";
  document.getElementById('encouragments').style.display = "none";
  document.getElementById('chrono').innerText = "";

  // Style rouge pour les villes non trouvées
  const missedStyle = function (nomVille) {
    return new ol.style.Style({
      text: new ol.style.Text({
        font: '14px Quicksand, sans-serif',
        text: nomVille,
        fill: new ol.style.Fill({ color: 'red' }),
        stroke: new ol.style.Stroke({ color: 'white', width: 2 }),
        offsetY: -15,
      }),
      image: new ol.style.Circle({
        radius: 5,
        fill: new ol.style.Fill({ color: 'red' }),
        stroke: new ol.style.Stroke({ color: 'red', width: 2 }),
      }),
    });
  };

  // Appliquer ce style aux villes restantes
  villesLayer.getSource().getFeatures().forEach((feature) => {
    const nom = feature.get('name');
    if (listeVilles.includes(nom)) {
      feature.setStyle(missedStyle(nom));
    }
  });
 
const baseUrl = window.location.origin; // permet de créer le bon lien pour enregistrer les scores
console.log(baseUrl)

// fonction fetch pour enregistrer les scores et autre dans la base de données 
  fetch(`${baseUrl}/api/save_score/`,  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken'), 
    },
    body: JSON.stringify({
      game: 'villes',
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
const tooltip = document.getElementById('tooltipFalse'); // pour les villes le tooltip affiche seulement les erreurs, quand la réponse est juste le nom s'affiche en tant qu'étiquette au dessus du point

// gestion des affichages au survol
map.on('pointermove', function (e){
  if (!gameActive) return;
  if (selected !== null) {
    const nomVille = selected.get('name');
    if (listeVilles.includes(nomVille)) {
      selected.setStyle(undefined);
      }
    selected = null;
    }
map.forEachFeatureAtPixel(e.pixel, function (f) {
      const nomVille = f.get('name');
      const selectStyle = new ol.style.Style({
  image: new ol.style.Circle({
      radius: 5,
      fill: new ol.style.Fill({ color: 'purple' }),
      stroke: new ol.style.Stroke({ color: 'purple', width: 2 }),
      }),
  });
      if (listeVilles.includes(nomVille)) {
        selected = f;
        f.setStyle(selectStyle);
      }
      return true;
    });
});

// gestion des clics pour le fonctionnement du jeu
map.on('click', function (e) {
  if (!gameActive) return;
    map.forEachFeatureAtPixel(e.pixel, function (f) {
      const nomVille = f.get('name') //stocker le nom de la ville cliquée
      // style si la réponse est correcte
      const correctStyle = new ol.style.Style({
        text: new ol.style.Text({
          font: '14px Quicksand, sans-serif',
          text: nomVille, 
          fill: new ol.style.Fill({
          color: '#000',
        }),
        stroke: new ol.style.Stroke({
          color: '#fff', 
          width: 2,
        }),
        offsetY: -15,
        }),
        image: new ol.style.Circle({
          radius: 5,
          fill: new ol.style.Fill({ color: 'white' }),
          stroke: new ol.style.Stroke({ color: 'white', width: 2 }),
        }),
      });
      if (!listeVilles.includes(nomVille)) {
        return true;
      }
      // si la réponse est juste 
      if (nomVille === currentTarget){
        isBlinking = false;
        f.setStyle(correctStyle); // appliquer le bon style
        listeVilles = listeVilles.filter(v => v !== nomVille); // retirer la ville de la liste des villes qui restent à trouver
        foundVilles.add(nomVille); // ajouter le nom de la ville à la liste des villes trouvées
        if (wrongClicksForCurrentTarget >= 3) {
        document.getElementById('number').innerText = points; // pas de points ajoutés si 3 tentatives écoulées
          } else {
        points += 100 // ajout de 100 points si bonne réponse
        document.getElementById('number').innerText = points; 
          }
        showRandomText();
        // Ajoute temporairement une couleur de surbrillance à la phrase de devinette
        document.getElementById('guess').classList.add('flash-correct');
        // La retire après 800ms
        setTimeout(() => {
          document.getElementById('guess').classList.remove('flash-correct');
        }, 800);
        randomCongrats();
      // fin de la partie si toutes les villes ont été trouvées  
      if (listeVilles.length === 0) {
        stopTimer();
        gameActive = false;
        endGame(currentLang);
        return;
    }
      }else{
        randomEncourage();    
        wrongClicksForCurrentTarget++; // si mauvais clic, une tentative en moins
        if (wrongClicksForCurrentTarget >= 3 && !blinkInterval) {
            startBlinkingCurrentTarget(); // faire clignoter l'entité
            essais = Math.max(0, essais - 1); // enlever 1 essai
            points = Math.max(0, points - 50); // enlever 50 points
          } if (wrongClicksForCurrentTarget > 3 ) {
            isBlinking = true; // permet d'empecher le tooltip d'afficher les noms des autres villes au clic une fois qu'une entité clignote 
          }
        // affichage du popup rouge avec le nom de la ville cliquée   
        if (!isBlinking) {
            const tooltip = $('#tooltipFalse');
            tooltip.text(nomVille);
            tooltip.css({
              left: e.originalEvent.clientX - mapRect.left + 10 + 'px',
              top: e.originalEvent.clientY - mapRect.top + 10 + 'px',
              display: 'block'
            });
            tooltip.stop(true, true).fadeIn(200).delay(500).fadeOut(300);
        }
        document.getElementById('number').innerText = points;
        updateGauge()
        // fin du jeu si tous les essais sont utilisés
        if (essais === 0){
          stopTimer();
          gameActive = false;
          endGame();
        }
      }
      return true;
    });
  });

document.getElementById('restartBtn').addEventListener('click', function () {
  // Masquer le message final et les boutons
  document.getElementById('endGameMessage').style.display = "none";
  document.getElementById('restartBtn').style.display = "none";
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
  initGame();   // la fonction principale de lancement du jeu
});


initGame() // première initialisation du jeu 
