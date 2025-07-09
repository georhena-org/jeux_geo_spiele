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


// charger la couche de la limite du crs avec le style
var crsLayer = new ol.layer.Vector({
  source: crsSource,
  //background: 'black',
  style: new ol.style.Style({
      fill: new ol.style.Fill({ color: 'rgba(113, 15, 158, 0.1)' }),
      stroke: new ol.style.Stroke({ color: 'purple', width: 2 }),
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


//const ombrageLayer = new ol.layer.Tile({
  //source: new ol.source.TileWMS({
    //url: 'https://geoportal.georhena.eu/geoserver/basemaps/ows',
    //params: {
      //'LAYERS': 'basemaps:relief_ombrage',
      //'TILED': true,
      //'VERSION': '1.3.0',
      //'FORMAT': 'image/png',
      //'TRANSPARENT': true
    //},
    //serverType: 'geoserver',
    //crossOrigin: 'anonymous'
  //})
//});

const map = new ol.Map({
  target: 'webmap',
  layers: [basemap, crsLayer, rhinLayer], //ombrageLayer
  view: new ol.View({
    center: [
    7.772542083975405,
    48.234177921525884
    ],
    zoom: 8,
  }),
});


// afficher les coordonnées au clic dans la console
//map.on('click', function(e){
//  console.log(e.coordinate)
//});

// variables globales du jeu 
let villesLayer = null
let listeVilles = [];
let currentTarget = "";
let timerInterval = null;
let elapsedTime = 0;
let gameActive = false
let selected = null;

// styles réponses


const falseStyle = new ol.style.Style({
  image: new ol.style.Circle({
      radius: 5,
      fill: new ol.style.Fill({ color: 'red' }),
      stroke: new ol.style.Stroke({ color: 'red', width: 2 }),
}),
});

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

function showRandomText() {
    selected = null;
    const randomIndex = Math.floor(Math.random() * listeVilles.length);
    currentTarget = listeVilles[randomIndex];
    document.getElementById('randomText').innerText = "Où se situe " + currentTarget + " ?";
};

function randomCongrats() {
  const congrats = ["Bien joué !", "Incroyable", "Bravo" ]
  const randomIdCongrats = Math.floor(Math.random() * congrats.length);
  congratsWord = congrats[randomIdCongrats];
  document.getElementById('encouragments').innerText = congratsWord;
};

function randomEncourage() {
  const encourage = ["Essaie encore !", "Presque", "Pas loin !"]
  const randomIdEncourage = Math.floor(Math.random() * encourage.length);
  encourageWord = encourage[randomIdEncourage];
  document.getElementById('encouragments').innerText = encourageWord;
}

function afterLoad() {
  essais = 5;
  points = 0;
  document.getElementById('error').innerText = essais;
  document.getElementById('number').innerText = points;
  startTimer();
  gameActive = true
}

// initialiser le jeu
function initGame() {
  points = 0;
  essais = 5;

  document.getElementById('error').innerText = essais;
  document.getElementById('number').innerText = points;
  document.getElementById('randomText').innerText = "";
  document.getElementById('restartBtn').style.display = "none";
  document.getElementById('encouragments').innerText = "";


  stopTimer();
  document.getElementById('chrono').innerText = '00:00';

  // réinitialiser la couche ville si elle est présente (surout utile au moment de relancer le jeu)
  if (villesLayer) {
    villesLayer.getSource().getFeatures().forEach(f => f.setStyle(null));
    //map.removeLayer(villesLayer);
    //villesLayer = null;
  }

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

map.addLayer(villesLayer);

villesSource.once('featuresloadend', function () {
  const features = villesSource.getFeatures();
  listeVilles = []; // empty the list when reloading the game
  features.forEach(f => {
    //console.log('Ville :', f.get('name'));
    f.setStyle(null);
    listeVilles.push(f.get('name'))
  });
  //initGame()
  afterLoad()
  showRandomText()
});

}


function endGame(){

  let message = listeVilles.length === 0
    ? "🎉 Bravo ! Toutes les villes ont été trouvées !"
    : "😔 Dommage... Essaie encore, tu y es presque !";

  // Afficher le texte et les infos dans le bloc
  document.getElementById('finalMessage').innerText = message;
  document.getElementById('finalScore').innerText = "Score final : " + points + " points";
  document.getElementById('finalTime').innerText = "Temps écoulé : " + formatTime(elapsedTime);

  // Montrer l'encart
  document.getElementById('endGameMessage').style.display = "block";
  document.getElementById('restartBtn').style.display = "block";
  document.getElementById('exploreBtn').style.display = "block";

  // Réinitialiser l'interface utilisateur
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
        font: '14px Arial, sans-serif',
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
}

// Gestion de l'événement de survol
const tooltip = document.getElementById('tooltip');
const tooltipToggle = document.getElementById('toggleTooltip');

map.on('pointermove', function (e){
  if (!gameActive) {
    tooltip.style.display = "none";
    return;
  } 
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
      if (tooltipToggle.checked) {
      const mapRect = map.getTargetElement().getBoundingClientRect();
      tooltip.innerText = nomVille;
      tooltip.style.display = 'block';
      tooltip.style.left = (e.originalEvent.clientX - mapRect.left + 10) + 'px';
      tooltip.style.top = (e.originalEvent.clientY - mapRect.top + 10) + 'px';
    }
      return true;
    });
    // Si aucun feature trouvé, cacher le tooltip
  if (!selected) {
    tooltip.style.display = "none";
  }
});

map.on('click', function (e) {
    map.forEachFeatureAtPixel(e.pixel, function (f) {
      //selected = f;
      const nomVille = f.get('name')
      const correctStyle = new ol.style.Style({
        text: new ol.style.Text({
          font: '14px Arial, sans-serif',
          text: nomVille, // Use the 'name' property as the label
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
      if (!listeVilles.includes(nomVille)) {
        return true;
      }
      if (nomVille === currentTarget){
        f.setStyle(correctStyle);
        listeVilles = listeVilles.filter(v => v !== nomVille);
        console.log(listeVilles)
        points += 100
        document.getElementById('number').innerText = points;
        showRandomText();
        randomCongrats();
      if (listeVilles.length === 0) {
        stopTimer();
        gameActive = false;
        endGame();
        return;
    }
      }else {
        essais = Math.max(0, essais - 1);
        points = Math.max(0, points - 50);
        randomEncourage();
        document.getElementById('error').innerText = essais;
        document.getElementById('number').innerText = points;
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
  initGame();   // ta fonction principale de lancement du jeu
});


initGame()