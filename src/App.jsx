import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [imagePrediction, setImagePrediction] = useState(null);
  const [diseaseInfo, setDiseaseInfo] = useState(null);
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
      setDiseaseInfo(null);
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
      setDiseaseInfo(response.data.disease_info);
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
              <p>{diseaseInfo.symptoms}</p> {/* Afficher les symptômes ici */}
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
