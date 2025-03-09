import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; // Assurez-vous d'avoir un fichier CSS pour les styles

const App = () => {
  const [symptoms, setSymptoms] = useState([]);
  const [countries, setCountries] = useState([]);
  const [continents, setContinents] = useState([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState({});
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedContinent, setSelectedContinent] = useState('');
  const [environmentSurvey, setEnvironmentSurvey] = useState({
    "Type de Logement": '',
    "Proximité de l'Eau": '',
    "Environnement Naturel": '',
    "Conditions Sanitaires": '',
    "Présence d'Animaux": ''
  });
  const [predictedDisease, setPredictedDisease] = useState('');
  const [imagePrediction, setImagePrediction] = useState(null);
  const [showImageUpload, setShowImageUpload] = useState(false);

  useEffect(() => {
    // Récupérer les symptômes
    axios.get('http://localhost:5000/symptoms')
      .then(response => setSymptoms(response.data.symptoms))
      .catch(error => console.error('Erreur lors du chargement des symptômes:', error));

    // Récupérer les continents
    axios.get('http://localhost:5000/continents')
      .then(response => setContinents(response.data.continents))
      .catch(error => console.error('Erreur lors du chargement des continents:', error));
  }, []);

  const handleSymptomChange = (symptom, value) => {
    setSelectedSymptoms(prev => ({ ...prev, [symptom]: value }));
  };

  const handleContinentChange = (event) => {
    const selectedContinent = event.target.value;
    setSelectedContinent(selectedContinent);
    // Récupérer les pays du continent sélectionné
    axios.post('http://localhost:5000/countries-by-continent', { continent: selectedContinent })
      .then(response => setCountries(response.data.countries))
      .catch(error => console.error('Erreur lors du chargement des pays:', error));
  };

  const handleCountryChange = (event) => {
    setSelectedCountry(event.target.value);
  };

  const handleEnvironmentSurveyChange = (event) => {
    const { name, value } = event.target;
    setEnvironmentSurvey(prev => ({ ...prev, [name]: value }));
  };

  const handlePredictDisease = () => {
    // Vérifiez que toutes les données nécessaires sont présentes
    if (Object.values(selectedSymptoms).length === 0 || !selectedCountry ||
        !environmentSurvey["Type de Logement"] || !environmentSurvey["Proximité de l'Eau"] ||
        !environmentSurvey["Environnement Naturel"] || !environmentSurvey["Conditions Sanitaires"] ||
        !environmentSurvey["Présence d'Animaux"]) {
      console.error("Veuillez remplir tous les champs nécessaires.");
      return;
    }

    // Prédire la maladie avec les symptômes, le pays et les réponses du questionnaire environnemental
    const data = {
      symptoms: Object.values(selectedSymptoms),
      country: selectedCountry,
      environment_survey: environmentSurvey
    };

    axios.post('http://localhost:5000/predict-disease', data)
      .then(response => {
        setPredictedDisease(response.data.predicted_disease);
        setShowImageUpload(true); // Afficher l'option de téléchargement d'image
        console.log("Image upload should be visible:", showImageUpload); // Ajout d'un log pour vérifier l'état
      })
      .catch(error => console.error('Erreur lors de la prédiction de la maladie:', error));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    axios.post('http://localhost:5000/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    .then(response => setImagePrediction(response.data.image_prediction))
    .catch(error => console.error('Erreur lors de l\'upload de l\'image:', error));
  };

  return (
    <div className="App">
      <div className="background-image"></div>
      <h1>Évaluation Intelligente des Maladies Tropicales</h1>
      <div className="section">
        <h2>Sélectionnez vos symptômes</h2>
        {Object.keys(symptoms).map((symptom, index) => (
          <div key={`${symptom}-${index}`} className="form-group">
            <label>{symptom}</label>
            <select onChange={(e) => handleSymptomChange(symptom, e.target.value)} className="form-control">
              <option value="">Sélectionnez un symptôme</option>
              {symptoms[symptom].map((value, idx) => (
                <option key={`${value}-${idx}`} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
      <div className="section">
        <h2>Sélectionnez le continent</h2>
        <select onChange={handleContinentChange} className="form-control">
          <option value="">Sélectionnez un continent</option>
          {Object.keys(continents).map((continent, index) => (
            <option key={`${continent}-${index}`} value={continent}>
              {continent}
            </option>
          ))}
        </select>
      </div>
      <div className="section">
        <h2>Sélectionnez le pays</h2>
        <select onChange={handleCountryChange} className="form-control">
          <option value="">Sélectionnez un pays</option>
          {countries.map((country, index) => (
            <option key={`${country}-${index}`} value={country}>
              {country}
            </option>
          ))}
        </select>
      </div>
      <div className="section">
        <h2>Questionnaire Environnemental</h2>
        <div className="form-group">
          <label>Type de Logement</label>
          <select name="Type de Logement" onChange={handleEnvironmentSurveyChange} className="form-control">
            <option value="">Sélectionnez une réponse</option>
            <option value="Habitation précaire ou insalubre">Habitation précaire ou insalubre</option>
            <option value="Logement rural">Logement rural</option>
            <option value="Logement urbain">Logement urbain</option>
          </select>
        </div>
        <div className="form-group">
          <label>Proximité de l'Eau</label>
          <select name="Proximité de l'Eau" onChange={handleEnvironmentSurveyChange} className="form-control">
            <option value="">Sélectionnez une réponse</option>
            <option value="oui">Oui</option>
            <option value="non">Non</option>
          </select>
        </div>
        <div className="form-group">
          <label>Environnement Naturel</label>
          <select name="Environnement Naturel" onChange={handleEnvironmentSurveyChange} className="form-control">
            <option value="">Sélectionnez une réponse</option>
            <option value="oui">Oui</option>
            <option value="non">Non</option>
          </select>
        </div>
        <div className="form-group">
          <label>Conditions Sanitaires</label>
          <select name="Conditions Sanitaires" onChange={handleEnvironmentSurveyChange} className="form-control">
            <option value="">Sélectionnez une réponse</option>
            <option value="Mauvaises">Mauvaises</option>
            <option value="Moyennes">Moyennes</option>
            <option value="Bonnes">Bonnes</option>
          </select>
        </div>
        <div className="form-group">
          <label>Présence d'Animaux</label>
          <select name="Présence d'Animaux" onChange={handleEnvironmentSurveyChange} className="form-control">
            <option value="">Sélectionnez une réponse</option>
            <option value="oui">Oui</option>
            <option value="non">Non</option>
          </select>
        </div>
      </div>
      {showImageUpload && (
        <div className="section">
          <h2>Téléchargez une image (optionnel)</h2>
          <input type="file" onChange={handleImageUpload} className="form-control" />
        </div>
      )}
      <button onClick={handlePredictDisease} className="btn-predict">Prédire la maladie</button>
      {predictedDisease && (
        <div className="result">
          <h3>Maladie prédite :</h3>
          <p>{predictedDisease}</p>
        </div>
      )}
      {imagePrediction !== null && (
        <div className="result">
          <h3>Prédiction par image :</h3>
          <p>{imagePrediction}</p>
        </div>
      )}
    </div>
  );
};

export default App;
