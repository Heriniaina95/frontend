import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
  const [symptoms, setSymptoms] = useState([]);
  const [countries, setCountries] = useState([]);
  const [continents, setContinents] = useState([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedContinent, setSelectedContinent] = useState('');
  const [environmentSurvey, setEnvironmentSurvey] = useState({});
  const [predictedDisease, setPredictedDisease] = useState('');
  const [imagePrediction, setImagePrediction] = useState(null);

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
    // Prédire l'environnement à partir du questionnaire
    axios.post('http://localhost:5000/predict-environment-survey', environmentSurvey)
      .then(response => {
        const predictedEnvironment = response.data.predicted_environment;

        // Prédire la maladie avec les symptômes, le pays et l'environnement prédit
        const data = {
          symptoms: Object.values(selectedSymptoms),
          country: selectedCountry,
          environment: predictedEnvironment
        };

        axios.post('http://localhost:5000/predict-disease', data)
          .then(response => setPredictedDisease(response.data.predicted_disease))
          .catch(error => console.error('Erreur lors de la prédiction de la maladie:', error));
      })
      .catch(error => console.error('Erreur lors de la prédiction de l\'environnement:', error));
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
      <h1>Évaluation Intelligente des Maladies Tropicales</h1>
      <div>
        <h2>Sélectionnez vos symptômes</h2>
        {Object.keys(symptoms).map(symptom => (
          <div key={symptom}>
            <label>{symptom}</label>
            <select onChange={(e) => handleSymptomChange(symptom, e.target.value)}>
              <option value="">Sélectionnez un symptôme</option>
              {symptoms[symptom].map(value => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
      <div>
        <h2>Sélectionnez le continent</h2>
        <select onChange={handleContinentChange}>
          <option value="">Sélectionnez un continent</option>
          {Object.keys(continents).map(continent => (
            <option key={continent} value={continent}>
              {continent}
            </option>
          ))}
        </select>
      </div>
      <div>
        <h2>Sélectionnez le pays</h2>
        <select onChange={handleCountryChange}>
          <option value="">Sélectionnez un pays</option>
          {countries.map(country => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
      </div>
      <div>
        <h2>Questionnaire Environnemental</h2>
        {/* Exemple de questions, remplacez par vos questions réelles */}
        <div>
          <label>Type de Logement</label>
          <select name="Question 1" onChange={handleEnvironmentSurveyChange}>
            <option value="">Sélectionnez une réponse</option>
            <option value="Réponse 1">Habitation précaire ou insalubre</option>
            <option value="Réponse 2">Logement rural</option>
            <option value="Réponse 3">Logement urbain</option>
            {/* Ajoutez d'autres réponses possibles */}
          </select>
        </div>
        <div>
          <label>Proximité de l'Eau</label>
          <select name="Question 2" onChange={handleEnvironmentSurveyChange}>
            <option value="">Sélectionnez une réponse</option>
            <option value="Réponse 1">oui</option>
            <option value="Réponse 2">non</option>
            {/* Ajoutez d'autres réponses possibles */}
          </select>
        </div>
        <div>
          <label>Environnement Naturel</label>
          <select name="Question 3" onChange={handleEnvironmentSurveyChange}>
            <option value="">Sélectionnez une réponse</option>
            <option value="Réponse 1">oui</option>
            <option value="Réponse 2">non</option>
            {/* Ajoutez d'autres réponses possibles */}
          </select>
        </div>
        <div>
          <label>Conditions Sanitaires</label>
          <select name="Question 4" onChange={handleEnvironmentSurveyChange}>
            <option value="">Sélectionnez une réponse</option>
            <option value="Réponse 1">Mauvaises</option>
            <option value="Réponse 2">Moyennes</option>
            <option value="Réponse 3">Bonnes</option>
            {/* Ajoutez d'autres réponses possibles */}
          </select>
        </div>
        <div>
          <label>Présence d'Animaux</label>
          <select name="Question 5" onChange={handleEnvironmentSurveyChange}>
            <option value="">Sélectionnez une réponse</option>
            <option value="Réponse 1">oui</option>
            <option value="Réponse 2">non</option>
            {/* Ajoutez d'autres réponses possibles */}
          </select>
        </div>
        {/* Ajoutez d'autres questions ici */}
      </div>
      <div>
        <h2>Téléchargez une image : Image d'inféction sur votre peau</h2>
        <input type="file" onChange={handleImageUpload} />
      </div>
      <button onClick={handlePredictDisease}>Prédire la maladie</button>
      {predictedDisease && (
        <div>
          <h3>Maladie prédite :</h3>
          <p>{predictedDisease}</p>
        </div>
      )}
      {imagePrediction !== null && (
        <div>
          <h3>Prédiction par image :</h3>
          <p>{imagePrediction}</p>
        </div>
      )}
    </div>
  );
};

export default App;
