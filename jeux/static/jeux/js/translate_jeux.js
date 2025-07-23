
function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang); // mémorise la langue
  applyTranslations();
}

    const translate = {
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
      if (type === "Stadt") return `Où se situe ${feat} Stadt?`;
      return `Où se situe la ${feat} ?`;
    },
    guessTextGP: (type, feat) => {
      if (type === "sommet") return `⛰️ Où se situe le sommet ${feat} ?`;
      if (type === "fleuve") return `💧 Où se situe le cours d'eau ${feat} ?`;
      return `Où se situe ${feat} ?`;
    },
    winMessage: "🎉 Bravo ! Toutes les villes ont été trouvées !",
    looseMessage: "😔 Dommage... Essaie encore, tu y es presque !",
    winMessageGP: "🎉 Bravo ! Tu as su identifier 20 rivières et sommets !",
    winMessageREG: "🎉 Bravo ! Tu as trouvé toutes les collectivités membres du Rhin Supérieur !",
    finalScore: "Score final :",
    finalTries: "Nombre d'essais utilisés :",
    finalTime: "Temps écoulé :",
    encouragements: ["Bien joué !", "Incroyable !", "Bravo !", "C’est tout à fait ça !", "Bonne réponse !", "Exactement !", "Impressionnant !", "Continue comme ça !"],
    retryMessages: ["Essaie encore !", "Presque !", "Pas loin !", "Raté…", "Dommage…"],
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
      if (type === "Stadt") return `Wo liegt ${feat} Stadt?`;
       return `Wo liegt ${feat}?`;
    },
    guessTextGP:  (type, feat) => {
      if (type === "sommet") return `⛰️ Wo liegt der Gipfel ${feat}?`;
      if (type === "fleuve") return `💧 Wo liegt der Wasserlauf ${feat}?`;
       return `Wo liegt ${feat}?`;
    },
    winMessage: "🎉 Glückwunsch! Alle Städte wurden gefunden!",
    looseMessage: "😔 Schade... Versuch es nochmal, du bist fast da!",
    winMessageGP: "🎉 Glückwunsch ! Du hast die 20 Flüsse und Berge gefunden !",
    winMessageREG: "🎉 Glückwunsch ! Alle  Gebietskörperschaften wurden gefunden! !",
    finalScore: "Endpunktzahl :",
    finalTries: "Verwendete Versuche :",
    finalTime: "Vergangene Zeit :",
    encouragements: ["Gut gemacht!", "Genau richtig!", "Richtig geraten!", "Super!", "Klasse Leistung!", "Volltreffer!", "Stimmt genau!", "Spitze!", "Perfekt getroffen!", "Weiter so!"],
    retryMessages: ["Versuch’s nochmal!", "Fast richtig!", "Leider falsch…", "Nicht ganz...", "Probier es weiter!", "Knapp daneben!", "Leider nein..."],
  }
};

function applyTranslations() {

  $("#main-title").text(translate[currentLang].mainTitle);

  $("#page-title").text(translate[currentLang].title);
  $("#page-title-GP").text(translate[currentLang].titleGP);
  $("#page-title-reg").text(translate[currentLang].titleReg);
  $("#restartBtn").text(translate[currentLang].restart);
  $("#restartBtnREG").text(translate[currentLang].restart);
  $("#restartBtnGP").text(translate[currentLang].restart);
  $("#exploreBtn").text(translate[currentLang].explore);
  $("#test h2").text(translate[currentLang].tries);
  $("#points h2").text(translate[currentLang].points);
  $("#chrono").parent().html(`${translate[currentLang].time} <span id='chrono'>00:00</span>`);
  $("#randomText").text(translate[currentLang].guessText(currentTarget));
  $("#randomTextREG").text(translate[currentLang].guessTextREG(currentType, currentTarget));
  $("#randomTextGP").text(translate[currentLang].guessTextGP(currentType, currentTarget));
  $("#encouragments").text(translate[currentLang].encouragements);

  $("#finalScore").html(`${translate[currentLang].finalScore} ${points}`);
  $("#finalTries").html(`${translate[currentLang].finalTries} ${5 - essais}`);
  $("#finalTime").html(`${translate[currentLang].finalTime} ${formatTime(elapsedTime)}`);
  if (essais === 0){
      $("#finalMessage").html(translate[currentLang].looseMessage);
  } else {
    $("#finalMessage").html(translate[currentLang].winMessage);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  setLanguage(currentLang);
});
