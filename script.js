// Déclaration des variables
let countriesGeoJSON;
let restCountriesData;
let map;
let currentCountry = null;
let score = 0;
let filteredCountries = [];
let currentMode = "world";

/**
 * Fonction de début de partie
 */
async function startGame() {
  // On cache le menu et on affiche la carte
  document.getElementById("menu").style.display = "none";
  document.getElementById("game").style.display = "block";

  // On selectionne le mode jeu
  currentMode = document.getElementById("game-mode").value;
  console.log(currentMode)

  // Charger les données GeoJSON (frontières) et pays (drapeaux, noms)
  const geoRes = await fetch("data/curiexplore-pays.json");
  const restRes = await fetch("data/restcountries.json");
  countriesGeoJSON = await geoRes.json();
  const restCountriesList = await restRes.json();

  // Indexation rapide par code ISO3 (cca3)
  restCountriesData = {};
  filteredCountries = [];
  
  restCountriesList.forEach(country => {
    if (country.cca3 && country.name?.common && country.flags?.png) {
      restCountriesData[country.cca3] = {
        name: country.name.common,
        lat: country.latlng?.[0],
        lng: country.latlng?.[1],
        flag: country.flags.png,
        region: country.region
      };
  
      // Filtrage selon le mode choisi
      if (currentMode === "world" || country.region === currentMode) {
        filteredCountries.push(country.cca3);
      }
    }
  });

  // Initialiser la carte
  map = L.map("map").setView([20, 0], 2);
  L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributeurs | Tuile française',
    maxZoom: 19
  }).addTo(map);

  L.geoJSON(countriesGeoJSON, {
    onEachFeature: function (feature, layer) {
      layer.on("click", function () {
        checkAnswer(feature.id);
      });
    }
  }).addTo(map);

  nextFlag();
}

/**
 * Fonction pour changer de drapeau de manière aléatoire
 */
function nextFlag() {
    if (filteredCountries.length === 0) {
      showPopup("Aucun pays trouvé pour ce mode de jeu.");
      return;
    }
  
    const randomISO = filteredCountries[Math.floor(Math.random() * filteredCountries.length)];
    currentCountry = {
      code: randomISO,
      ...restCountriesData[randomISO]
    };
    document.getElementById("flag").src = currentCountry.flag;
  }

/**
 * Fonction pour vérifier la réponse du joueur
 * Si oui on ajoute + 1 au score et on change de drapeau
 * Si non on change de drapeau
 * @param {*} clickedISO 
 * @returns 
 */
function checkAnswer(clickedISO) {
  if (!currentCountry) return;

  if (clickedISO === currentCountry.code) {
    alert("Bravo ! C'était le bon pays !");
    score++;
  } else {
    const clickedCountry = restCountriesData[clickedISO]?.name || "Inconnu";
    alert(`Raté ! C'était ${currentCountry.name}, pas ${clickedCountry}.`);
  }

  document.getElementById("score").innerText = `Score : ${score}`;
  nextFlag();
}
