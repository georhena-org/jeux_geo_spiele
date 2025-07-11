    let currentLang = 'FR'; // valeur par défaut

    const translations = {
  FR: {
    mainTitle: "Les jeux géographiques du Rhin Supérieur",
    btnCities: "🗺️ Villes principales du Rhin Supérieur",
    btnPhysGeo: "🏞️ Géographie physique du Rhin Supérieur",
    btnRegions: "🏘️ Les collectivités du Rhin Supérieur",
    btnRhenaGuessr: "📍 RhenaGuessr",
    title: "Les villes principales du Rhin Supérieur",
    titleGP: "Géographie physique du Rhin Supérieur",
    titleReg: "Les collectivités du Rhin Supérieur",
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
    winMessage: "🎉 Bravo! Alle Städte wurden gefunden!",
    looseMessage: "😔 Schade... Versuch es nochmal, du bist fast da!",
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