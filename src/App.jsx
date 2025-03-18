import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [imagePrediction, setImagePrediction] = useState(null);
  const [diseaseInfo, setDiseaseInfo] = useState(null);  // Nouveau state pour les informations de la maladie
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setImagePrediction(null);
      setDiseaseInfo(null);  // Réinitialiser les infos de la maladie
      setError(null);
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
      setDiseaseInfo(response.data.disease_info);  // Mettre à jour avec les infos de la maladie
    } catch (err) {
      setError("Erreur lors de l'upload de l'image. Veuillez réessayer.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <div className="background-image"></div>
      <h1>Évaluation Intelligente des Maladies Tropicales</h1>
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
        </div>
      )}
    </div>
  );
};

export default App;
