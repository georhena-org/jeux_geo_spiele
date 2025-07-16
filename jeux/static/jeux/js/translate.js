    let currentLang = 'FR'; // valeur par défaut

    const translations = {
  FR: {
    mainTitle: "Les jeux géographiques du Rhin Supérieur",
    btnCities: "🗺️ Villes principales du Rhin Supérieur",
    btnPhysGeo: "🏞️ Géographie physique du Rhin Supérieur",
    btnRegions: "🏘️ Les collectivités du Rhin Supérieur",
    btnRhenaGuessr: "📍 RhenaGuessr",
    btnInfo: "❓ Qu’est-ce que le Rhin Supérieur ?",
    pres1 : "Bienvenue sur la plateforme des jeux géographiques du Rhin Supérieur ! Cliquez sur un jeu pour commencer à jouer.",
    pres2 : "Vous n'avez encore jamais entendu parler du Rhin Supérieur? Découvrez le territoire puis testez vos connaissances !",
    aproposRS : "À propos du Rhin Supérieur",
    apropostext : "Le Rhin Supérieur est une région transfrontalière située entre la France, l’Allemagne et la Suisse.",
    toggleVilles : "Explorer les villes principales",
    toggleGP : "Explorer les sommets et les cours d'eau",
    toggleRegions : "Explorer les collectivités",
    title: "Les villes principales du Rhin Supérieur",
    titleGP: "Géographie physique du Rhin Supérieur",
    titleReg: "Les collectivités du Rhin Supérieur",
    villesInfo: "18 villes sont considérées comme prinicipales. Découvrez leur nom, le nombre d'habitants (2020) et la superficie de la commune à laquelle elles appartiennent.",
    GPInfo: "Ici s'affichent des sommets et points de vue emblématiques ainsi que les cours d'eau principaux du territoire.",
    regionsInfo: "Le Rhin Supérieur est composé de 2 départements français (qui forment la collectivité eauropéenne d'Alsace), 14 Landkreise allemands et 5 cantons suisses.",
    restart: "Rejouer",
    explore: "Explorer la donnée",
    tries: "Essais restants:",
    points: "Points:",
    time: "Temps :",
    tooltip: "Afficher le nom des entités au survol",
    guessText: (feat) => `Où se situe ${feat} ?`,
    guessTextREG: (type, feat) => {
      if (type === "Landkreis") return `Où se situe le Landkreis ${feat} ?`;
      if (type === "canton") return `Où se situe le canton de ${feat} ?`;
      return `Où se situe ${feat} ?`;
    },
    winMessage: "🎉 Bravo ! Toutes les villes ont été trouvées !",
    looseMessage: "😔 Dommage... Essaie encore, tu y es presque !",
    winMessageGP: "🎉 Bravo ! Tu as su identifier 20 rivières et sommets !",
    winMessageREG: "🎉 Bravo ! Tu as trouvé toutes les collectivités membres du Rhin Supérieur !",
    finalScore: "Score final :",
    finalTries: "Nombre d'essais utilisés :",
    finalTime: "Temps écoulé :",
    encouragements: ["Bien joué !", "Incroyable", "Bravo"],
    retryMessages: ["Essaie encore !", "Presque", "Pas loin !"],
  },
  DE: {
    mainTitle: "Die geographische Spiele des Oberrheins",
    btnCities: "🗺️ Städte des Oberrheins",
    btnPhysGeo: "🏞️ Physische Geographie des Oberrheins",
    btnRegions: "🏘️ Die Gebietskörperschaften des Oberrheins",
    btnRhenaGuessr: "📍 RhenaGuessr",
    btnInfo: "❓ Was ist denn der Oberrheingebiet ?",
    pres1 : "Willkommen auf der Plattform für Geospiele am Oberrhein! Klicken Sie auf ein Spiel, um mit dem Spielen zu beginnen.",
    pres2 : "Sie haben noch nie vom Oberrheingebiet gehört? Entdecken Sie das Gebiet und testen Sie dann Ihr Wissen!",
    aproposRS : "Zum Oberrheingebiet",
    apropostext : "Der Oberrhein ist eine grenzüberschreitende Region zwischen Frankreich, Deutschland und der Schweiz.",
    toggleVilles : "Die Städte des Oberrheins entdecken",
    toggleGP : "Gipfel und Wasserläufe entdecken",
    toggleRegions : "Gebietskörperschaften entdecken",
    villesInfo: "18 Städte werden als zentral angesehen. Hier finden Sie ihre Namen, die Einwohnerzahl (2020) und die Fläche der Gemeinde, zu der sie gehören.",
    GPInfo: "Hier werden markante Gipfel und Aussichtspunkte sowie die wichtigsten Wasserläufe des Gebiets angezeigt.",
    regionsInfo: "Der Oberrhein besteht aus 2 französischen Departements (die die collectivité européenne d'Alsace bilden), 14 deutschen Landkreisen und 5 Schweizer Kantonen.",
    title: "Städte des Oberrheins",
    titleGP: "Physische Geographie des Oberrheins",
    titleReg: "Die Gebietskörperschaften des Oberrheins",
    restart: "Neu starten",
    explore: "Daten entdecken",
    tries: "Verbleibende Versuche:",
    points: "Punkte:",
    time: "Zeit :",
    tooltip: "Namen beim Überfahren anzeigen",
    guessText: (feat) => `Wo liegt ${feat}?`,
    guessTextREG:  (type, feat) => {
      if (type === "Landkreis") return `Wo liegt der Landkreis ${feat}?`;
      if (type === "canton") return `Wo liegt der Kanton ${feat}?`;
       return `Wo liegt ${feat}?`;
    },
    winMessage: "🎉 Glückwunsch! Alle Städte wurden gefunden!",
    looseMessage: "😔 Schade... Versuch es nochmal, du bist fast da!",
    winMessageGP: "🎉 Glückwunsch ! Du hast die 20 Flüsse und Berge gefunden !",
    winMessageREG: "🎉 Glückwunsch ! Alle  Gebietskörperschaften wurden gefunden! !",
    finalScore: "Endpunktzahl :",
    finalTries: "Verwendete Versuche :",
    finalTime: "Vergangene Zeit :",
    encouragements: ["Gut gemacht!", "Unglaublich!", "Glückwunsch!"],
    retryMessages: ["Versuch es nochmal!", "Fast geschafft", "Knapp daneben!"],
  }
};
function setLanguage(lang) {
  currentLang = lang;
  console.log(lang)
  $("#main-title").text(translations[lang].mainTitle);

  $("#jeu-villes").text(translations[lang].btnCities);
  $("#jeu-geophysique").text(translations[lang].btnPhysGeo);
  $("#jeu-regions").text(translations[lang].btnRegions);
  $("#jeu-RhenaGuessr").text(translations[lang].btnRhenaGuessr);
  $("#btn-info").text(translations[lang].btnInfo);

  $("#pres-1").text(translations[lang].pres1);
  $("#pres-2").text(translations[lang].pres2);
  $("#a-propos-RS").text(translations[lang].aproposRS);
  $("#a-propos-text").text(translations[lang].apropostext);
  
  document.querySelector('#t-Villes').lastChild.textContent = translations[lang].toggleVilles;
  document.querySelector('#t-GP').lastChild.textContent = translations[lang].toggleGP;
  document.querySelector('#t-Regions').lastChild.textContent = translations[lang].toggleRegions;

  $("#villesInfo").text(translations[lang].villesInfo);
  $("#geophysiqueInfo").text(translations[lang].GPInfo);
  $("#regionsInfo").text(translations[lang].regionsInfo);

  $("#page-title").text(translations[lang].title);
  $("#page-title-GP").text(translations[lang].titleGP);
  $("#page-title-reg").text(translations[lang].titleReg);
  $("#restartBtn").text(translations[lang].restart);
  $("#restartBtnREG").text(translations[lang].restart);
  $("#restartBtnGP").text(translations[lang].restart);
  $("#exploreBtn").text(translations[lang].explore);
  $("#test h2").text(translations[lang].tries);
  $("#points h2").text(translations[lang].points);
  $("#chrono").parent().html(`${translations[lang].time} <span id='chrono'>00:00</span>`);
  $("#randomText").text(translations[lang].guessText(currentTarget));
  $("#randomTextREG").text(translations[lang].guessTextREG(currentType, currentTarget));
  $("#encouragments").text(translations[lang].encouragements);

  $("#finalScore").html(`${translations[currentLang].finalScore} ${points}`);
  $("#finalTries").html(`${translations[currentLang].finalTries} ${5 - essais}`);
  $("#finalTime").html(`${translations[currentLang].finalTime} ${formatTime(elapsedTime)}`);
  if (essais === 0){
      $("#finalMessage").html(translations[currentLang].looseMessage);
  } else {
    $("#finalMessage").html(translations[currentLang].winMessage);
  }
}