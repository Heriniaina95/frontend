import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [imagePrediction, setImagePrediction] = useState(null);
  const [diseaseInfo, setDiseaseInfo] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSymptomForm, setShowSymptomForm] = useState(false);
  const [symptomsList, setSymptomsList] = useState({});
  const [selectedSymptoms, setSelectedSymptoms] = useState({});
  const [symptomPrediction, setSymptomPrediction] = useState(null);

  useEffect(() => {
    // Récupérer les symptômes depuis le backend
    const fetchSymptoms = async () => {
      try {
        const response = await axios.get('http://localhost:5000/symptoms');
        setSymptomsList(response.data.symptoms);
      } catch (err) {
        console.error("Erreur lors de la récupération des symptômes:", err);
      }
    };

    fetchSymptoms();
  }, []);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setImagePrediction(null);
      setDiseaseInfo(null);
      setError(null);
      setShowSymptomForm(false);
      setSymptomPrediction(null);
    }
  };

  const handlePredictImage = async () => {
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
          'Content-Type': 'multipart/form-data'
        }
      });
      setImagePrediction(response.data.image_prediction);
      setDiseaseInfo(response.data.disease_info);
    } catch (err) {
      setError("Erreur lors de l'upload de l'image. Veuillez réessayer.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSymptomChange = (key, event) => {
    const { value } = event.target;
    setSelectedSymptoms((prevSymptoms) => ({
      ...prevSymptoms,
      [key]: value
    }));
  };

  const handlePredictSymptoms = async () => {
    setLoading(true);
    setError(null);

    const symptomsArray = Object.values(selectedSymptoms);
  
    console.log("Symptoms Array:", symptomsArray); // Add this line to check symptomsArray
  
    try {
      const response = await axios.post('http://localhost:5173/node_modules/.vite/deps/axios.js?v=2683a313:380:18', {
        symptoms: symptomsArray
      });
      setSymptomPrediction(response.data.predicted_disease);
    } catch (err) {
      setError("Error during symptom prediction. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };  

  return (
    <div className="App">
      <div className="background-image"></div>
      <h1>TropiCare : Diagnostic Assisté par IA pour les Maladies Infectieuses Tropicales</h1>

      <div className="introduction">
        <h2>Un diagnostic rapide et accessible </h2>
        <p>
          Notre plateforme utilise l’intelligence artificielle pour analyser des images médicales et aider les professionnels de santé à
          diagnostiquer des maladies tropicales comme le <strong>paludisme, la dengue, la fièvre hémorragique, la fièvre jaune, le chikungunya,
          la brucellose, la filariose, la leishmaniose, l'onchocercose, la peste, la rougeole, la schistosomiase, la trypanosomiase,
          ainsi que plusieurs virus tropicaux comme le Zika</strong>.
        </p>
      </div>

      <div className="section">
        <h2>Téléchargez une image</h2>
        <input type="file" accept="image/*" onChange={handleImageUpload} className="form-control" />
        {preview && <img src={preview} alt="Aperçu" className="image-preview" />}
        <button onClick={handlePredictImage} className="btn-predict" disabled={loading}>
          {loading ? 'Analyse en cours...' : 'Prédire la maladie'}
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}
      {imagePrediction && (
        <div className="result">
          <h3>Prédiction par image :</h3>
          <p>{imagePrediction}</p>
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
          <button onClick={() => setShowSymptomForm(true)} className="btn-more-details">
            Plus précis
          </button>
        </div>
      )}

      {showSymptomForm && (
        <div className="symptom-form">
          <h3>Prédiction par symptômes</h3>
          {Object.keys(symptomsList).map((key, index) => (
            <div key={index}>
              <label>{`Symptôme ${index + 1} :`}</label>
              <select onChange={(event) => handleSymptomChange(key, event)} value={selectedSymptoms[key] || ''}>
                <option value="">Sélectionnez un symptôme</option>
                {symptomsList[key].map((symptomOption, idx) => (
                  <option key={idx} value={symptomOption}>
                    {symptomOption}
                  </option>
                ))}
              </select>
            </div>
          ))}
          <button onClick={handlePredictSymptoms} className="btn-predict" disabled={loading}>
            {loading ? 'Analyse en cours...' : 'Prédire la maladie'}
          </button>
        </div>
      )}

      {symptomPrediction && (
        <div className="result">
          <h3>Prédiction par symptômes :</h3>
          <p>{symptomPrediction}</p>
        </div>
      )}
    </div>
  );
};

export default App;
