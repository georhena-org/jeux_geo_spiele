// permet d'afficher les fichiers dans la projection 4258
ol.proj.useGeographic();

// initialiser le fond de carte
const basemap = new ol.layer.Tile({
  source: new ol.source.XYZ({
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}',
    attributions: 'Tiles © Esri'
  })
});

// charger la source de la limite du RS
const crsSource = new ol.source.Vector({
    url: crsUrl, // temporaire : cause : maintenance du datahub
    //'https://geoportal.georhena.eu/geoserver/boundaries/wfs?SERVICE=WFS&REQUEST=GetFeature&VERSION=2.0.0&TYPENAMES=boundaries%3Alimite_crs&OUTPUTFORMAT=json',
    format: new ol.format.GeoJSON(),
  });


// charger la couche de la limite du RS avec le style
var crsLayer = new ol.layer.Vector({
  source: crsSource,
  style: new ol.style.Style({
      fill: new ol.style.Fill({ color: 'rgba(79, 40, 40, 0.35)' }),
      stroke: new ol.style.Stroke({ color: 'rgba(79, 40, 40, 0.9)', width: 2 }),
  }),
});

// charger la source de la couche des villes
const villesSource = new ol.source.Vector({
    url: villesUrl, // temporaire, cause : maintenance datahub
    // lien WFS : 'https://geoportal.georhena.eu/geoserver/boundaries/wfs?SERVICE=WFS&REQUEST=GetFeature&VERSION=2.0.0&TYPENAMES=boundaries%3Avilles_principales&OUTPUTFORMAT=json',
    format: new ol.format.GeoJSON(),
  });



// charger la couche de points des villes (pour le guide)
villesLayer = new ol.layer.Vector({
  source: villesSource,
});


// styles des couches
// styles sommets
const originalPointStyle = new ol.style.Style({
  image: new ol.style.Circle({
      radius: 5,
      fill: new ol.style.Fill({ color: 'rgba(42, 136, 13, 0.78)'}),
}),
});

const hoverPointStyle = new ol.style.Style({
  image: new ol.style.Circle({
      radius: 6,
      fill: new ol.style.Fill({ color: 'rgba(42, 136, 13, 0.99)' }),
      stroke: new ol.style.Stroke({ color: 'rgba(42, 136, 13, 0.99)', width: 2 }),
}),
});
//styles hydro
const normalLineStyle = new ol.style.Style({
    stroke: new ol.style.Stroke({ color: 'rgba(34, 130, 168, 0.55)', width: 2 }),
});

const hoverLineStyle = new ol.style.Style({
    stroke: new ol.style.Stroke({ color: 'rgba(34, 130, 168, 0.99)', width: 3 }),
});

const correctStyleHydro= new ol.style.Style({
        stroke: new ol.style.Stroke({ color: 'rgba(199, 229, 240, 0.99)', width: 3 }),
      });

// fonction pour les sommets correctement devinés
function correctStyleSommet(nomEntite) {
  return new ol.style.Style({
        text: new ol.style.Text({
          font: '14px Quicksand, sans-serif',
          text: nomEntite, 
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
}

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




// Ajouter la carte et les couches CRS et villes
const map = new ol.Map({
  target: 'webmap',
  layers: [basemap, crsLayer, villesLayer], 
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
// ajouter les noms des villes
villesSource.once('featuresloadend', function () {
villesLayer.getSource().getFeatures().forEach((feature) => {
    const nom = feature.get('name');
      feature.setStyle(labeledStyle(nom));
  });
});
// cacher la couche des villes
villesLayer.setVisible(false)

// variables globales
let sommetsLayer = null;
let hydroLayer = null;
let listeNoms = [];
let listeSommets = [];
let listeHydro = [];
let listeGuess = [];
let featuresCorrectes = new Set();
let currentTarget = "";
let wrongClicksForCurrentTarget = 0;
let blinkInterval = null; 
let timerInterval = null;
let elapsedTime = 0;
let gameActive = false
let points = 0;
let essais = 5;
let finalTries = 0;
let mapRect = map.getTargetElement().getBoundingClientRect();
let isBlinking = false;
const nomToType = {};

// fonctions utilitaires 

//formater le temps au format 00:00
function formatTime(seconds) {
  const min = String(Math.floor(seconds / 60)).padStart(2, '0');
  const sec = String(seconds % 60).padStart(2, '0');
  return `${min}:${sec}`;
}

// commencer le timer
function startTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
  }

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

// afficher messages d'encouragements
function showEncouragementMessage(text) {
  const encouragementDiv = document.getElementById('encouragments');
  encouragementDiv.innerText = text;
  encouragementDiv.style.opacity = '1';
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

// détecter le type d'entité (sommet ou cours d'eau) pour bien afficher la phrase de devinette
function detectTypeFromNom(typeGP) {
  if (!typeGP) return null;
  if (typeGP.includes("peak")) return "sommet";
  if (typeGP.startsWith("Rivière")) return "fleuve";
  return null;
}

//afficher la phrase de devinette avec la mention sommet ou cours d'eau
function showRandomText() {
  selected = null;  
  const randomIndex = Math.floor(Math.random() * listeGuess.length);
  currentTarget = listeGuess[randomIndex];
  const typeGP = nomToType[currentTarget]
  currentType = detectTypeFromNom(typeGP)
  wrongClicksForCurrentTarget = 0;
  if (blinkInterval) {
    clearInterval(blinkInterval);
    blinkInterval = null;
  }

  document.getElementById('randomTextGP').innerText = translate[currentLang].guessTextGP(currentType, currentTarget);

  if (listeSommets.includes(currentTarget)){ // afficher les sommets et cacher les cours d'eau
  hydroLayer.setVisible(false);
  sommetsLayer.setVisible(true);
  }
  if (listeHydro.includes(currentTarget)){ // afficher les sommets et cacher les cours d'eau
  hydroLayer.setVisible(true);
  sommetsLayer.setVisible(false);
  }
};

// fonction pour faire clignoter l'entité à trouver
function startBlinkingCurrentTarget() {
  let targetLayer = listeSommets.includes(currentTarget) ? sommetsLayer : hydroLayer;
  let source = targetLayer.getSource();
  let featureToBlink = source.getFeatures().find(f => f.get('name') === currentTarget);
  if (!featureToBlink) return;

  let visible = true;

  blinkInterval = setInterval(() => {
    if (!featuresCorrectes.has(featureToBlink)) {
      if (visible) {
        // style clignotement
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


// fonction à lancer une fois que les couches sont chargées
function afterLoad() {
  document.getElementById('number').innerText = points;
  startTimer();
  gameActive = true
}

// mettre à jour la jauge d'essais
function updateGauge() {
  const boxes = document.querySelectorAll('#gaugeGP .gauge-boxGP');
  for (let i = 0; i < boxes.length; i++) {
    if (i < essais) {
      boxes[i].style.opacity = '1';  // pleine si essais restants
    } else {
      boxes[i].style.opacity = '0.2'; // transparente si non
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

// fonction pour s'assurer que les deux couches (sommets et cours d'eau sont chargées avant de lancer le jeu)
function checkIfAllLoaded() {
  if (sommetsLoaded && hydroLoaded) {
    // fusionner les listes des entités
    listeNoms = [...new Set([...listeSommets, ...listeHydro])];

let nomsDisponibles = [...listeNoms]; //créer une copie
listeGuess = [];
// prendre 20 entités au hasard
for (let i = 0; i < 20 && nomsDisponibles.length > 0; i++) {
  const randomIndex = Math.floor(Math.random() * nomsDisponibles.length);
  const nom = nomsDisponibles.splice(randomIndex, 1)[0]; 
  listeGuess.push(nom);
}
    afterLoad();
    showRandomText(); // montrer la devinette 
  }
}

// initialiser le jeu
function initGame(){
  // vider les objets sommetslayer et hydroLayer pour éviter les doublons au redémarrage d'une partie
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
  finalTries = 0;
  updateGauge()
  featuresCorrectes = new Set();
  wrongClicksForCurrentTarget = 0;
  blinkInterval = null;
  isBlinking = false;

  //réinitialiser certains éléments de texte
  document.getElementById('number').innerText = points;
  document.getElementById('randomTextGP').innerText = "";
  document.getElementById('restartBtnGP').style.display = "none";
  document.getElementById('encouragments').innerText = "";


  stopTimer();
  document.getElementById('chrono').innerText = '00:00';

  // réinitialiser le style des couches (surout utile au moment de relancer le jeu)
  if (sommetsLayer) {
    sommetsLayer.getSource().getFeatures().forEach(f => f.setStyle(null));
  }
  if (hydroLayer) {
    hydroLayer.getSource().getFeatures().forEach(f => f.setStyle(null));
  }

  // charger les couches des sommets et des cours d'eau
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
  // les ajouter à la carte
  map.addLayer(hydroLayer);
  map.addLayer(sommetsLayer);

  // créer les liste d'entités et la liste de 20 entités à deviner
  sommetsSource.once('featuresloadend', function () {
  const features = sommetsSource.getFeatures();
  listeNoms = []; // création de la liste pour tous les noms 
  listeSommets = []; // création de la liste des sommets
  features.forEach(f => {
    listeNoms.push(f.get('name')) // ajouter les noms de sommets à la liste des noms 
    listeSommets.push(f.get('name')) // ajouter les noms de sommets à la liste des sommets 
    const nom = f.get('name')
    const type = f.get('natural')
    nomToType[nom] = type;
  });
  sommetsLoaded = true;
  checkIfAllLoaded(); // s'assurer que les deux couches sont chargées
});

hydroSource.once('featuresloadend', function () {
  const features = hydroSource.getFeatures();
  listeHydro = []; // création de la liste des cours d'eau 
  features.forEach(f => {
    listeNoms.push(f.get('name')) // ajouter les noms des cours d'eau à la liste des noms 
    listeHydro.push(f.get('name')) // ajouter les noms des cours d'eau à la liste des cours d'eau 
    const nom = f.get('name')
    const type = f.get('type')
    nomToType[nom] = type; // clarification du type d'entité (sommet ou cours d'eau) pour chaque nom
  });
  hydroLoaded = true;
  checkIfAllLoaded(); // s'assurer que les deux couches sont chargées
});
}

// fin du jeu
function endGame(){
  isBlinking = false // arrêter le cligntotement s'il est encore présent
  // montrer les deux couches
  hydroLayer.setVisible(true);
  sommetsLayer.setVisible(true);
  finalTries = 5 - essais
  // réinitisaliser l'intervalle de clignotement
  if (blinkInterval) {
    clearInterval(blinkInterval);
    blinkInterval = null;
  }
  // afficher le bon message de fin de jeu
  let message = listeGuess.length === 0
    ? translate[currentLang].winMessageGP
    : translate[currentLang].looseMessage;

  // Afficher les différents éléments de fin de jeu
  document.getElementById('finalMessage').innerText = message;
  document.getElementById('finalScore').innerText = `${translate[currentLang].finalScore} ${points}`;
  document.getElementById('finalTries').innerText = `${translate[currentLang].finalTries} ${5 - essais}`;
  document.getElementById('finalTime').innerText = `${translate[currentLang].finalTime} ${formatTime(elapsedTime)}`;

  // Montrer l'encart de fin de jeu
  document.getElementById('endGameMessage').style.display = "block";
  document.getElementById('restartBtnGP').style.display = "block";
  document.getElementById('exploreBtn').style.display = "block";

  // Enlever les éléments de jeu (devinette, jauge etc..) pour pouvoir montrer l'affichage de fin
  document.getElementById('guess').style.display = "none";
  document.getElementById('test').style.display = "none";
  document.getElementById('points').style.display = "none";
  document.getElementById('chrono').parentElement.style.display = "none";
  document.getElementById('encouragments').style.display = "none";
  document.getElementById('chrono').innerText = "";

// permet de créer le bon lien pour enregistrer les scores
 const baseUrl = window.location.origin; 
 console.log(baseUrl)
// fonction fetch pour enregistrer les scores et autre dans la base de données 
  fetch(`${baseUrl}/api/save_score/`,  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken'), 
    },
    body: JSON.stringify({
      game: 'geophysique',
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
  // affichage de la couche ville si la checkbox est cochée
  toggleLayer('toggleLayer', villesLayer);


// Gestion de des événements au survol
let selected= null;
const tooltip = document.getElementById('tooltip');
const tooltipFalse = document.getElementById('tooltipFalse');



map.on('pointermove', function (e) {

  // Réinitialiser le style du précédent élément survolé 
  if (selected !== null && !featuresCorrectes.has(selected)) {
    selected.setStyle(undefined);
    selected = null;
  }

  let featureFound = false;

  map.forEachFeatureAtPixel(e.pixel, function (f, layer) {

    if (layer === villesLayer) return; // ignorer la couche des villes au survol
    const nomFeat = f.get('name'); // stockage du nom de l'entité
    if (!nomFeat) return true;


    selected = f; // mémoriser la feature

    if (listeSommets.includes(nomFeat)) {
      if (!featuresCorrectes.has(f)) {
        f.setStyle(hoverPointStyle); // si le sommet n'a pas encore été trouvé applique le style correspondant au survol
        if (!gameActive) { // si le jeu n'est plus actif affiche le nom du sommet
        const tooltip = $('#tooltip');
        tooltip.text(nomFeat);
        tooltip.css({
          left: e.originalEvent.clientX - mapRect.left + 5 + 'px',
          top: e.originalEvent.clientY - mapRect.top + 5 + 'px',
          display: 'block'
        });
      }
      } else {
        tooltip.style.display = "none"; // s'il n'a pas d'entités n'affiche rien 
      }
    } else if (listeHydro.includes(nomFeat)) {
      if (!featuresCorrectes.has(f)) { // si le cours d'eau n'a pas encore été trouvé applique le style correspondant au survol
      f.setStyle(hoverLineStyle);
      if (!gameActive) { // si le jeu n'est plus actif affiche le nom du cours d'eau
        const tooltip = $('#tooltip');
        tooltip.text(nomFeat);
        tooltip.css({
          left: e.originalEvent.clientX - mapRect.left + 5 + 'px',
          top: e.originalEvent.clientY - mapRect.top + 5 + 'px',
          display: 'block'
        });
      }
    } else {
        f.setStyle(correctStyleHydro); // si le cours d'eau a été trouvé garde le style correcStyleHydro et affiche le nom
        const tooltip = $('#tooltip');
        tooltip.text(nomFeat);
        tooltip.css({
          left: e.originalEvent.clientX - mapRect.left + 5 + 'px',
          top: e.originalEvent.clientY - mapRect.top + 5 + 'px',
          display: 'block'
        });
      }
    } else {
      tooltip.style.display = "none";
    }

    featureFound = true;
    return true; // arrêter après la première feature trouvée
  });

  // si aucune entité est trouvée, cacher le popup
  if (!featureFound) {
    tooltip.style.display = "none";
  }
});
// au clic
map.on('click', function (e) {
  if (!gameActive) return; // si le jeu n'est plus actif arrête la fonction clic
    map.forEachFeatureAtPixel(e.pixel, function (f) {
      const nomFeat = f.get('name') // stockage du nom de l'entité
      if (!listeNoms.includes(nomFeat)) {
        return true;
      }
      if (nomFeat === currentTarget){ // la réponse est juste 
        isBlinking = false
        if (listeSommets.includes(nomFeat)) {
          f.setStyle(correctStyleSommet(nomFeat)); // changer le style de sommet (si la bonne réponse était un sommet)
        } else if (listeHydro.includes(nomFeat)) {
          f.setStyle(correctStyleHydro); // changer le style du cours d'eau (si la bonne réponse était un cours d'eau)
        const tooltip = $('#tooltipCorrect');
        tooltip.text(nomFeat); // afficher le nom en vert
        tooltip.css({
          left: e.originalEvent.clientX - mapRect.left + 10 + 'px',
          top: e.originalEvent.clientY - mapRect.top + 10 + 'px',
          display: 'block'
        });
        tooltip.stop(true, true).fadeIn(200).delay(500).fadeOut(300);
        }
        featuresCorrectes.add(f); // ajouter la bonne réponse aux entités trouvées
        listeGuess = listeGuess.filter(v => v !== nomFeat); // retirer le nom de la liste
        if (wrongClicksForCurrentTarget >= 3) { // si le nombre de tentative est supérieur ou égal à 3 
        document.getElementById('number').innerText = points; // n'ajoute pas de points
          } else { // si l'entité est trouvée et le nombre de tentatives est inférieur à 3
        points += 100 // ajoute 100 points
        document.getElementById('number').innerText = points; // affiche le nouveau score
          }
        randomCongrats(); // message de félicitations
        setTimeout(() => {
          showRandomText(); // afficher une nouvelle entité à trouver
        }, 500); 
        setTimeout (() => {
        document.getElementById('guess').classList.add('flash-correctGP'); // encart devinette en surbrillance verte
        }, 500);
        // retire la surbrillance après 800ms
        setTimeout(() => {
          document.getElementById('guess').classList.remove('flash-correctGP');
        }, 1200);
      if (listeGuess.length === 0) { // si toutes les entités ont été trouvées fin du jeu 
        stopTimer();
        gameActive = false;
        endGame();
        return;
    }
      }else{
        randomEncourage(); // message d'encouragements
        wrongClicksForCurrentTarget++; // ajouter une tentative
        if (wrongClicksForCurrentTarget >= 3 && !blinkInterval) { // si nombre de tentatives supérieur ou égal à 3
            startBlinkingCurrentTarget(); // l'entité commence à clignoter
            essais = Math.max(0, essais - 1); // 1 essai en moins
            points = Math.max(0, points - 50); // 50 points en moins
          } if (wrongClicksForCurrentTarget > 3 ) {
            isBlinking = true; // activer isBlinking
          }
        if (!isBlinking) { // si l'entité à trouver clignote 
            const tooltip = $('#tooltipFalse'); // le popu s'affiche en rouge
            tooltip.text(nomFeat);
            tooltip.css({
              left: e.originalEvent.clientX - mapRect.left + 10 + 'px',
              top: e.originalEvent.clientY - mapRect.top + 10 + 'px',
              display: 'block'
        });
        tooltip.stop(true, true).fadeIn(200).delay(500).fadeOut(300); // affichage temporaire du popup
      }
        document.getElementById('number').innerText = points; // mettre à jour les points
        updateGauge() // mettre à jour la jauge
        if (essais === 0){ // si tous les essais ont été utilisés fin de jeu 
          stopTimer();
          gameActive = false;
          endGame();
        }
      }
      return true; // s'il n'y a pas d'entité au clic, ne rien faire
    });
  });

document.getElementById('restartBtnGP').addEventListener('click', function () { // fonction déclenchée lorsqu'on clique sur rejouer
  // Masquer le message final et les boutons
  document.getElementById('endGameMessage').style.display = "none";
  document.getElementById('restartBtnGP').style.display = "none";
  document.getElementById('exploreBtn').style.display = "none";

  // Réinitialiser l'interface de jeu
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
