import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [symptoms, setSymptoms] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [diseaseInfo, setDiseaseInfo] = useState(null);
  const [symptomList, setSymptomList] = useState([]);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSymptomSelection, setShowSymptomSelection] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setPrediction(null);
      setDiseaseInfo(null);
      setError(null);
      setShowSymptomSelection(false); // Réinitialiser l'affichage des symptômes
    }
  };

  const handleSymptomChange = (event) => {
    const { value, checked } = event.target;
    setSymptoms((prevSymptoms) =>
      checked ? [...prevSymptoms, value] : prevSymptoms.filter((symptom) => symptom !== value)
    );
  };

  const handleImageUpload = async () => {
    if (!selectedFile) {
      setError("Veuillez sélectionner une image.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('http://localhost:5000/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setPrediction(response.data.image_prediction);
      setDiseaseInfo(response.data.disease_info);
    } catch (err) {
      setError("Erreur lors de l'upload de l'image. Veuillez réessayer.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePredictDisease = async () => {
    try {
      const response = await axios.post('http://localhost:5000/predict-disease', { symptoms });
      setPrediction(response.data.predicted_disease);
      setDiseaseInfo(null); // Réinitialiser les informations de la maladie
    } catch (error) {
      console.error('Erreur lors de la prédiction de la maladie:', error);
    }
  };

  const fetchSymptoms = async () => {
    try {
      const response = await axios.get('http://localhost:5000/symptoms');
      setSymptomList(response.data.symptoms);
    } catch (error) {
      console.error('Erreur lors de la récupération des symptômes:', error);
    }
  };

  useEffect(() => {
    fetchSymptoms();
  }, []);

  return (
    <div className="App">
      <div className="background-image"></div>
      <h1>TropiCare : Diagnostic Assisté par IA pour les Maladies Infectieuses Tropicales</h1>

      <div className="introduction">
        <h2>Un diagnostic rapide et accessible</h2>
        <p>
          Notre plateforme utilise l’intelligence artificielle pour analyser des images médicales et aider les professionnels de santé à
          diagnostiquer des maladies tropicales comme le <strong>paludisme, la dengue, la fièvre hémorragique, la fièvre jaune, le chikungunya,
          la brucellose, la filariose, la leishmaniose, l'onchocercose, la peste, la rougeole, la schistosomiase, la trypanosomiase,
          ainsi que plusieurs virus tropicaux comme le Zika</strong>.
        </p>
      </div>

      <div className="section">
        <h2>Téléchargez une image</h2>
        <input type="file" accept="image/*" onChange={handleFileChange} className="form-control" />
        {preview && <img src={preview} alt="Aperçu" className="image-preview" />}
        <button onClick={handleImageUpload} className="btn-predict" disabled={loading}>
          {loading ? 'Analyse en cours...' : 'Prédire la maladie'}
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}
      {prediction && (
        <div className="result">
          <h3>Prédiction par image :</h3>
          <p>{prediction}</p>
          {diseaseInfo && (
            <div className="disease-info">
              <h4>Description :</h4>
              <p>{diseaseInfo.description}</p>
              <h4>Symptômes :</h4>
              <p>{diseaseInfo.symptoms}</p>
              <h4>Pays concernés :</h4>
              <ul>
                {diseaseInfo.countries.split(',').map((country, index) => (
                  <li key={index}>{country.trim()}</li>
                ))}
              </ul>
              <h4>Environnement favorable :</h4>
              <p>{diseaseInfo.favorableEnvironment}</p>
            </div>
          )}
          <button onClick={() => setShowSymptomSelection(true)} className="btn-more-details">
            Plus précis
          </button>
        </div>
      )}

      {showSymptomSelection && (
        <div className="section">
          <h2>Entrer les Symptômes</h2>
          {symptomList.map((symptom) => (
            <label key={symptom}>
              <input
                type="checkbox"
                value={symptom}
                onChange={handleSymptomChange}
              />
              {symptom}
            </label>
          ))}
          <button onClick={handlePredictDisease} className="btn-predict">Prédire la maladie</button>
        </div>
      )}
    </div>
  );
};

export default App;
