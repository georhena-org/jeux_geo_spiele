    
let currentLang = localStorage.getItem('lang') || 'FR'; // valeur par défaut

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang); // mémorise la langue
  applyTranslations();
}


    const translations = {
  FR: {
    mainTitle: "Les jeux géo du Rhin Supérieur",
    testVersion : "Version test",
    textBestScore: "Meilleur score et temps pour chaque jeu",
    welcome: "Bienvenue",
    logout: "Se déconnecter",
    login: "Se connecter",
    score: "Score",
    time: "Temps",
    leaderboard: "Classement",
    btnCities: "📍 <br>Villes principales du Rhin Supérieur",
    btnPhysGeo: "🏞️ <br>Géographie physique du Rhin Supérieur",
    btnRegions: "🏘️ <br>Les collectivités du Rhin Supérieur",
    btnRhenaGuessr: "📍 RhenaGuessr",
    btnInfo: "Qu’est-ce que le Rhin Supérieur ?",
    pres1 : "Bienvenue sur la plateforme des jeux géographiques du Rhin Supérieur ! Cliquez sur un des 3 jeux ci-dessous pour commencer à jouer :",
    pres2 : "Vous n'avez encore jamais entendu parler du Rhin Supérieur? Découvrez le territoire trinational puis testez vos connaissances !",
    aproposRS : "À propos du Rhin Supérieur",
    apropostext : "Le Rhin Supérieur est une région transfrontalière située entre la France, l’Allemagne et la Suisse. Pour en apprendre plus, cochez/décochez les cases et cliquez sur les flèches.",
    toggleVilles : "Explorer les villes principales",
    toggleGP : "Explorer les sommets et les cours d'eau",
    toggleRegions : "Explorer les collectivités",
    title: "Les villes principales du Rhin Supérieur",
    titleGP: "Géographie physique du Rhin Supérieur",
    titleReg: "Les collectivités du Rhin Supérieur",
    villesInfo: "GeoRhena vous propose de découvrir 18 villes du Rhin Supérieur, leur nom, le nombre d'habitants (2020) et leur superficie.",
    GPInfo: "Ici s'affichent des sommets emblématiques ainsi que les cours d'eau principaux du territoire.",
    regionsInfo: "Le Rhin Supérieur est composé de la Collectivité européenne d'Alsace, 10 Landkreise allemands et 5 cantons suisses.",
    play: "JOUER",
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
      return `Où se situe la ${feat} ?`;
    },
    winMessage: "🎉 Bravo ! Toutes les villes ont été trouvées !",
    looseMessage: "😔 Dommage... Essaie encore, tu y es presque !",
    winMessageGP: "🎉 Bravo ! Tu as su identifier 20 rivières et sommets !",
    winMessageREG: "🎉 Bravo ! Tu as trouvé toutes les collectivités membres du Rhin Supérieur !",
    finalScore: "Score final :",
    finalTries: "Nombre d'essais utilisés :",
    finalTime: "Temps écoulé :",
    footer: "© 2025 – Projet original développé par GeoRhena",
    backToTop: "↑ Haut de page"
  },
  DE: {
    mainTitle: "Geographie-Spiele des Oberrheins",
    testVersion : "Testversion",
    textBestScore: "Beste Punktanzahl und Zeit für jedes Spiel",
    welcome: "Willkommen",
    logout: "Sich abmelden",
    login: "Sich anmelden",
    score: "Punktanzahl",
    time: "Zeit",
    leaderboard: "Ranking",
    btnCities: "📍 <br>Städte des Oberrheins",
    btnPhysGeo: "🏞️ <br>Physische Geographie des Oberrheins",
    btnRegions: "🏘️ <br>Gebietskörperschaften des Oberrheins",
    btnInfo: "Was ist der Oberrhein ?",
    pres1 : "Willkommen auf der Plattform der Geographie-Spiele des Oberrheins! Klicken Sie auf eines der 3 Spiele, um mit dem Spielen zu beginnen:",
    pres2 : "Sie haben noch nie vom Oberrhein gehört? Entdecken Sie das trinationale Gebiet und testen Sie dann spielerisch Ihr Wissen!",
    aproposRS : "Zum Oberrheingebiet",
    apropostext : "Der Oberrhein ist eine grenzüberschreitende Region zwischen Frankreich, Deutschland und der Schweiz. Um mehr zu erfahren, Klicken Sie auf die Kästchen und die Pfeile.",
    toggleVilles : "Die Städte des Oberrheins entdecken",
    toggleGP : "Berge und Wasserläufe entdecken",
    toggleRegions : "Gebietskörperschaften entdecken",
    villesInfo: "Mit GeoRhena können Sie 18 Städte des Oberrheins entdecken. Finden Sie hier ihre Namen, die Einwohnerzahl (2020) und die Fläche.",
    GPInfo: "Entdecken Sie bekannte Berge sowie die wichtigsten Wasserläufe des Gebiets.",
    regionsInfo: "Der Oberrhein besteht aus die französische Gebietskörperschaft Collectivité européenne d'Alsace, 10 deutschen Landkreisen sowie 5 Schweizer Kantonen.",
    play: "SPIELEN",
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
    footer: "© 2025 – Originales Projekt entwickelt von GeoRhena",
    backToTop: "↑ Zurück nach oben"
  }
};

function applyTranslations() {

  if (!translations[currentLang]) return;

  $("#main-title").text(translations[currentLang].mainTitle);
  $("#test-version").text(translations[currentLang].testVersion);

  $("#welcome").text(translations[currentLang].welcome);
  $("#text-best-score").text(translations[currentLang].textBestScore);
  $(".best-score").each(function () {
    $(this).text(translations[currentLang].score + " :");
  });
  $(".best-time").each(function () {
    $(this).text(translations[currentLang].time );
  });
  $(".logout-button").text(translations[currentLang].logout);
  $(".login-link").text(translations[currentLang].login);
  $("#leaderboard").text(translations[currentLang].leaderboard);


  $("#jeu-villes").html(translations[currentLang].btnCities);
  $("#jeu-geophysique").html(translations[currentLang].btnPhysGeo);
  $("#jeu-regions").html(translations[currentLang].btnRegions);
  $("#jeu-RhenaGuessr").text(translations[currentLang].btnRhenaGuessr);
  $("#btn-info").text(translations[currentLang].btnInfo);

  $("#pres-1").text(translations[currentLang].pres1);
  $("#pres-2").text(translations[currentLang].pres2);
  $("#a-propos-RS").text(translations[currentLang].aproposRS);
  $("#a-propos-text").text(translations[currentLang].apropostext);
  
  document.querySelector('#t-Villes').lastChild.textContent = translations[currentLang].toggleVilles;
  document.querySelector('#t-GP').lastChild.textContent = translations[currentLang].toggleGP;
  document.querySelector('#t-Regions').lastChild.textContent = translations[currentLang].toggleRegions;

  $("#villesInfo").text(translations[currentLang].villesInfo);
  $("#geophysiqueInfo").text(translations[currentLang].GPInfo);
  $("#regionsInfo").text(translations[currentLang].regionsInfo);
  $("#play-button").text(translations[currentLang].play);
  $("#title-play-button").text(translations[currentLang].play);


  

  $("#footer").text(translations[currentLang].footer)
  $("#back-to-top").text(translations[currentLang].backToTop)
}

document.addEventListener("DOMContentLoaded", function () {
  setLanguage(currentLang);
});
