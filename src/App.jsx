import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
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
  const [measures, setMeasures] = useState(null);
  const [showMeasuresButton, setShowMeasuresButton] = useState(false);

  // Infos patient
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [dateNaissance, setDateNaissance] = useState('');
  const [sexe, setSexe] = useState('');
  const [telephone, setTelephone] = useState('');
  const [profession, setProfession] = useState('');
  const [urgenceNom, setUrgenceNom] = useState('');
  const [urgenceTelephone, setUrgenceTelephone] = useState('');
  const [medecinNom, setMedecinNom] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setPrediction(null);
      setDiseaseInfo(null);
      setError(null);
      setShowSymptomSelection(false);
      setMeasures(null);
      setShowMeasuresButton(false);
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

    if (!nom || !prenom || !dateNaissance || !sexe || !telephone || !profession || !urgenceNom || !urgenceTelephone || !medecinNom) {
      setError("Veuillez remplir toutes les informations du patient avant de continuer.");
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
      setDiseaseInfo(null);
      setMeasures(null);
      setShowMeasuresButton(true);
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

  const fetchMeasures = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/get_measurements?disease=${prediction}`);
      setMeasures(response.data.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des mesures:', error);
    }
  };

  const handleDownload = () => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    let y = 20;

    doc.setFontSize(14);
    doc.text("🩺 Fiche de renseignement patient", 20, y);
    y += 10;

    doc.setFontSize(10);
    doc.text("Informations générales :", 20, y);
    y += 7;
    doc.text(`Nom : ${nom}`, 20, y);
    y += 7;
    doc.text(`Prénom : ${prenom}`, 20, y);
    y += 7;
    doc.text(`Date de naissance : ${dateNaissance}`, 20, y);
    y += 7;
    doc.text(`Sexe : ${sexe}`, 20, y);
    y += 7;
    doc.text(`Téléphone : ${telephone}`, 20, y);
    y += 7;
    doc.text(`Profession : ${profession}`, 20, y);
    y += 10;

    doc.text("Personne à contacter en cas d'urgence :", 20, y);
    y += 7;
    doc.text(`Nom : ${urgenceNom}`, 30, y);
    y += 7;
    doc.text(`Téléphone : ${urgenceTelephone}`, 30, y);
    y += 10;

    doc.text("Médecin traitant :", 20, y);
    y += 7;
    doc.text(`Nom : ${medecinNom}`, 30, y);
    y += 10;

    doc.text("Résultats de diagnostic :", 20, y);
    y += 7;
    doc.text(`Diagnostic par image : ${prediction || 'Non disponible'}`, 20, y);
    y += 7;
    if (preview) {
      doc.addImage(preview, 'JPEG', 130, y - 15, 40, 40); 
    }
    doc.text(`Diagnostic par symptômes : ${prediction || 'Non disponible'}`, 20, y + 50);
    y += 60;

    doc.text("Examen clinique :", 20, y);
    y += 7;
    doc.text("Poids : .......... kg   Taille : .......... cm   IMC : ..........", 30, y);
    y += 7;
    doc.text("Tension : .......... mmHg   Fréquence cardiaque : .......... bpm", 30, y);
    y += 7;
    doc.text("Autres observations : ..........................................", 30, y);
    y += 10;

    doc.text("Habitudes de vie :", 20, y);
    y += 7;
    doc.text("Tabac : ☐ Oui ☐ Non — Si oui, combien/jour : .............", 30, y);
    y += 7;
    doc.text("Alcool : ☐ Oui ☐ Non — Si oui, fréquence : ...............", 30, y);
    y += 7;
    doc.text("Activité physique : ☐ Oui ☐ Non — Type et fréquence : ......", 30, y);
    y += 10;

    doc.text("Antécédents médicaux :", 20, y);
    y += 7;
    doc.text("Personnels : ☐ Diabète ☐ Hypertension ☐ Allergies ☐ Cardiopathies", 30, y);
    y += 7;
    doc.text("Autres personnels : ............................................", 30, y);
    y += 7;
    doc.text("Familiaux : ☐ Diabète ☐ Hypertension ☐ Héréditaires", 30, y);
    y += 7;
    doc.text("Autres familiaux : .............................................", 30, y);
    y += 10;

    doc.text(`Date : .......... / .......... / ..........`, 30, y);
    y += 7;
    doc.text(`Signature : .................................................`, 30, y);

    doc.save(`Fiche_Patient_${prediction || 'Maladie'}.pdf`);
  };

  useEffect(() => {
    fetchSymptoms();
  }, []);

  return (
    <div className="App">
      <div className="background-image"></div>
      <h1>TropiCare : Diagnostic Assisté par IA pour les Maladies Infectieuses Tropicales</h1>

      <div className="section">
        <h2>Informations du Patient</h2>
        <input type="text" placeholder="Nom" value={nom} onChange={(e) => setNom(e.target.value)} />
        <input type="text" placeholder="Prénom" value={prenom} onChange={(e) => setPrenom(e.target.value)} />
        <input type="date" placeholder="Date de naissance" value={dateNaissance} onChange={(e) => setDateNaissance(e.target.value)} />
        <select value={sexe} onChange={(e) => setSexe(e.target.value)}>
          <option value="">Sélectionnez le sexe</option>
          <option value="Masculin">Masculin</option>
          <option value="Féminin">Féminin</option>
        </select>
        <input type="text" placeholder="Téléphone" value={telephone} onChange={(e) => setTelephone(e.target.value)} />
        <input type="text" placeholder="Profession" value={profession} onChange={(e) => setProfession(e.target.value)} />
        <input type="text" placeholder="Nom urgence" value={urgenceNom} onChange={(e) => setUrgenceNom(e.target.value)} />
        <input type="text" placeholder="Téléphone urgence" value={urgenceTelephone} onChange={(e) => setUrgenceTelephone(e.target.value)} />
        <input type="text" placeholder="Nom médecin traitant" value={medecinNom} onChange={(e) => setMedecinNom(e.target.value)} />
      </div>

      <div className="section">
        <h2>Téléchargez une image</h2>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {preview && <img src={preview} alt="Aperçu" className="image-preview" />}
        <button onClick={handleImageUpload} disabled={loading}>
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
          <button onClick={() => setShowSymptomSelection(true)}>
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
          <button onClick={handlePredictDisease}>Prédire la maladie</button>
        </div>
      )}

      {prediction && showMeasuresButton && (
        <div className="measures-section">
          <button onClick={fetchMeasures}>
            Mesures à prendre
          </button>

          {measures && (
            <div className="measures">
              <h3>Mesures à prendre :</h3>
              <ul>
                {measures.map((measure, index) => (
                  <li key={index}>{measure}</li>
                ))}
              </ul>

              {/* Bouton pour télécharger */}
              <button onClick={handleDownload}>
                Télécharger la fiche de renseignement
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
