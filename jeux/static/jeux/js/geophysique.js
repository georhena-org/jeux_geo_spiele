ol.proj.useGeographic();

// initialiser le fond de carte
const basemap = new ol.layer.Tile({
  source: new ol.source.XYZ({
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}',
    attributions: 'Tiles © Esri'
    //url: 'https://{a-c}.basemaps.cartocdn.com/rastertiles/voyager_no_labels_no_buildings/{z}/{x}/{y}{r}.png',
    //attributions: '© OpenStreetMap contributors © CARTO'
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
    zoom: 8,
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
let timerInterval = null;
let elapsedTime = 0;
let gameActive = false
let points = 0;
let essais = 5;
let sommetsLoaded = false;
let hydroLoaded = false;


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

function randomCongrats() {
  const congrats = ["Bien joué !", "Incroyable", "Bravo"];
  const randomId = Math.floor(Math.random() * congrats.length);
  showEncouragementMessage(congrats[randomId]);
}

function randomEncourage() {
  const messages = ["Essaie encore !", "Presque", "Pas loin !"];
  const randomId = Math.floor(Math.random() * messages.length);
  showEncouragementMessage(messages[randomId]);
}

function showRandomText() {
  selected = null
  const randomIndex = Math.floor(Math.random() * listeGuess.length);
  console.log(listeGuess)
  currentTarget = listeGuess[randomIndex];

  document.getElementById('randomText').innerText = "Où se situe " + currentTarget + " ?";
  
  if (listeSommets.includes(currentTarget)) {
  hydroLayer.setVisible(false);
  sommetsLayer.setVisible(true);
  console.log("couche sommet");
} else if (listeHydro.includes(currentTarget)) {
  hydroLayer.setVisible(true);
  sommetsLayer.setVisible(false);
  console.log("couche hydro");
} else {
  // cas par défaut, afficher les deux ? Ou aucun ?
  hydroLayer.setVisible(true);
  sommetsLayer.setVisible(true);
}
};

function afterLoad() {
  document.getElementById('error').innerText = essais;
  document.getElementById('number').innerText = points;
  startTimer();
  gameActive = true
}

function checkIfAllLoaded() {
  if (sommetsLoaded && hydroLoaded) {
    // Fusionner les listes (si ce n'est pas déjà fait)
    listeNoms = [...new Set([...listeSommets, ...listeHydro])];

    // Ici tu peux faire le tirage aléatoire pour listeGuess etc.
    listeGuess = [];
    for (let i = 0; i < 20; i++){
      const randomIndexGuess = Math.floor(Math.random() * listeNoms.length);
      listeGuess.push(listeNoms[randomIndexGuess]);
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
  featuresCorrectes = new Set();
  sommetsLoaded = false;
  hydroLoaded = false;

  document.getElementById('error').innerText = essais;
  document.getElementById('number').innerText = points;
  document.getElementById('randomText').innerText = "";
  document.getElementById('restartBtn').style.display = "none";
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
  //listeNoms = [];
  listeSommets = [];

  features.forEach(f => {
    //console.log('Sommet :', f.get('name'));
    //listeNoms.push(f.get('name'))
    listeSommets.push(f.get('name'))
  });
  sommetsLoaded = true;
  console.log(listeSommets);  
  checkIfAllLoaded();
  //console.log(listeNoms)
  });



hydroSource.once('featuresloadend', function () {
  const features = hydroSource.getFeatures();
  listeHydro = [];
  features.forEach(f => {
    //console.log('Fleuve :', f.get('name'));
    //listeNoms.push(f.get('name'))
    listeHydro.push(f.get('name'))
  });
  //console.log(listeHydro)
  //console.log(listeNoms)
  hydroLoaded = true;
  console.log(listeHydro)
  checkIfAllLoaded();
  //listeGuess = []
  //for (let i = 0; i < 20; i++){
  //    const randomIndexGuess = Math.floor(Math.random() * listeNoms.length);
  //    listeGuess.push(listeNoms[randomIndexGuess]);
  //}
  //afterLoad()
  //showRandomText()
});


}

function endGame(){
  hydroLayer.setVisible(true);
  sommetsLayer.setVisible(true);
  let message = listeGuess.length === 0
    ? "🎉 Bravo ! Tu as tout trouvé !"
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

}



// Gestion de l'événement de survol
let selected= null;
const tooltip = document.getElementById('tooltip');
const tooltipToggle = document.getElementById('toggleTooltip');


map.on('pointermove', function (e) {
  //if (!gameActive) return;

  // Réinitialiser le style du précédent élément survolé (s'il n'était pas une bonne réponse)
  if (selected !== null && !featuresCorrectes.has(selected)) {
    selected.setStyle(undefined);
    selected = null;
  }

  let featureFound = false;

  // Rechercher l'entité sous le curseur
  map.forEachFeatureAtPixel(e.pixel, function (f) {
    const nomFeat = f.get('name');
    if (!nomFeat) return true; // eventuellement ajouter || featuresCorrectes.has(f)

    featureFound = true;

    if (listeSommets.includes(nomFeat) && !featuresCorrectes.has(f)) {
      selected = f;
      f.setStyle(hoverPointStyle);
      // Pas de tooltip pour les sommets
      //tooltip.style.display = "none";
    } if (listeSommets.includes(nomFeat) && featuresCorrectes.has(f)) {
      featureFound = false;
    }

    if (listeHydro.includes(nomFeat) && !featuresCorrectes.has(f)) {
      selected = f;
      f.setStyle(hoverLineStyle);
      // Afficher le tooltip pour les entités hydro
    }
    if (tooltipToggle.checked) {
      const mapRect = map.getTargetElement().getBoundingClientRect();
      tooltip.innerText = nomFeat;
      tooltip.style.display = 'block';
      tooltip.style.left = (e.originalEvent.clientX - mapRect.left + 5) + 'px';
      tooltip.style.top = (e.originalEvent.clientY - mapRect.top + 5) + 'px';
    }
    return true; // Pour interrompre après le premier feature trouvé
  });

  // Si aucun feature trouvé, cacher le tooltip
  if (!featureFound) {
    tooltip.style.display = "none";
  }
});


map.on('click', function (e) {
    map.forEachFeatureAtPixel(e.pixel, function (f) {
      //selected = f;
      const nomFeat = f.get('name')
      const correctStyleSommet = new ol.style.Style({
        text: new ol.style.Text({
          font: '14px Arial, sans-serif',
          text: nomFeat, // Use the 'name' property as the label
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
      const correctStyleHydro= new ol.style.Style({
        text: new ol.style.Text({
          font: '14px Arial, sans-serif',
          //text: nomFeat, // Use the 'name' property as the label
          fill: new ol.style.Fill({color: '#000'}),// Text color
          stroke: new ol.style.Stroke({color: '#fff', width: 2}),
          offsetY: -10, // Offset to position the label above the point
          placement: "line",
        }),
        stroke: new ol.style.Stroke({ color: 'rgba(34, 130, 168, 0.99)', width: 3 }),
      });
      if (!listeNoms.includes(nomFeat)) {
        return true;
      }
      if (nomFeat === currentTarget){
        if (listeSommets.includes(nomFeat)) {
          f.setStyle(correctStyleSommet);
        } else if (listeHydro.includes(nomFeat)) {
          f.setStyle(correctStyleHydro);
          if (!tooltipToggle.checked) {
            const mapRect = map.getTargetElement().getBoundingClientRect();  
            tooltip.innerText = nomFeat;
            tooltip.style.display = 'block';
            tooltip.style.left = (e.originalEvent.clientX - mapRect.left + 5) + 'px';
            tooltip.style.top = (e.originalEvent.clientY - mapRect.top + 5) + 'px';

      // ⏱ Cacher après 1 seconde
      setTimeout(() => {
        tooltip.style.display = 'none';
      }, 500);
    }
        }
        featuresCorrectes.add(f); // Marquer comme correcte
        listeGuess = listeGuess.filter(v => v !== nomFeat);
        console.log(listeGuess)
        points += 100
        document.getElementById('number').innerText = points;
        randomCongrats();
        setTimeout(() => {
          showRandomText();
        }, 500); 
      if (listeGuess.length === 0) {
        stopTimer();
        gameActive = false;
        endGame();
        return;
    }
      }else{
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

window.onload = () => {
  initGame(); // démarre le jeu à l'ouverture de la page
};
