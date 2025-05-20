import React, { useState, useRef } from "react";
import axios from "axios";

type PlantInfo = {
  status: string;
  info?: string;
  message?: string;
};

type Prediction = {
  predicted_plant: string;
  accuracy: number;
  top_predictions: Array<{
    plant_name: string;
    accuracy: number;
  }>;
  message: string;
  plant_info: PlantInfo;
};

function BotaniSnap() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const resizeImage = async (file: File, maxWidth = 1280, maxHeight = 720) => {
    return new Promise<File>((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        if (!canvasRef.current) {
          reject(new Error("Canvas not initialized"));
          return;
        }

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Canvas context not available"));
          return;
        }

        const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
        const width = img.width * ratio;
        const height = img.height * ratio;

        canvas.width = width;
        canvas.height = height;

        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Blob creation failed"));
              return;
            }
            const resizedFile = new File([blob], file.name, { type: "image/jpeg" });
            resolve(resizedFile);
          },
          "image/jpeg",
          0.9
        );
      };

      img.onerror = () => reject(new Error("Image load error"));
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setPrediction(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select an image first.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const resizedFile = await resizeImage(selectedFile);
      const formData = new FormData();
      formData.append("file", resizedFile);

      console.log("✅ Sending file to API:", resizedFile);

      const response = await axios.post("http://localhost:5001/predict", formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000
      });

      console.log("✅ Prediction response:", response.data);
      
      if (response.data && response.data.predicted_plant) {
        setPrediction(response.data);
      } else {
        throw new Error("Invalid response structure");
      }
    } catch (err: any) {
      console.error("❌ Upload error:", err);
      if (err.code === 'ECONNREFUSED') {
        setError("Cannot connect to the plant identification server. Please make sure the server is running on port 5001.");
      } else if (err.response?.status === 500) {
        setError("Server error occurred. Please try again with a different image.");
      } else {
        setError(`Failed to identify plant: ${err.message || "Please try again."}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatPlantInfo = (info: string) => {
    // Simple formatting for the Gemini response
    const sections = info.split('\n\n');
    return sections.map((section, index) => {
      if (section.trim()) {
        // Check if it's a header (contains a colon or is in all caps)
        const lines = section.split('\n');
        if (lines.length > 1 && (lines[0].includes(':') || lines[0] === lines[0].toUpperCase())) {
          return (
            <div key={index} className="info-section">
              <h4>{lines[0].replace(':', '')}</h4>
              <p>{lines.slice(1).join(' ')}</p>
            </div>
          );
        } else {
          return <p key={index}>{section}</p>;
        }
      }
      return null;
    }).filter(Boolean);
  };

  const reset = () => {
    setSelectedFile(null);
    setPreview(null);
    setPrediction(null);
    setError(null);
  };

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ 
          color: '#02c55a', 
          fontSize: '3rem', 
          margin: '0 0 10px 0',
          fontWeight: 'bold'
        }}>
          🌿 BotaniSnap
        </h1>
        <p style={{ 
          color: '#666', 
          fontSize: '1.2rem',
          margin: 0
        }}>
          Upload a photo of a plant to identify it and get care information
        </p>
      </div>

      {/* Main Content */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: prediction ? '1fr 1fr' : '1fr',
        gap: '40px',
        alignItems: 'start'
      }}>
        {/* Upload Section */}
        <div style={{ 
          backgroundColor: '#02c55a',
          padding: '30px',
          borderRadius: '12px',
          border: '2px dashed #ddd'
        }}>
          <label style={{ 
            display: 'block',
            cursor: 'pointer',
            textAlign: 'center'
          }}>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              style={{ display: 'none' }}
            />
            <div style={{
              padding: '20px',
              backgroundColor: '#005326',
              color: 'white',
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              transition: 'background-color 0.3s'
            }}>
              {selectedFile ? `📷 ${selectedFile.name}` : "📁 Choose a photo"}
            </div>
          </label>

          {preview && (
            <div style={{ 
              marginTop: '20px',
              textAlign: 'center'
            }}>
              <img 
                src={preview} 
                alt="preview" 
                style={{ 
                  maxWidth: '100%',
                  maxHeight: '300px',
                  borderRadius: '8px',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                }}
              />
            </div>
          )}

          <div style={{ 
            marginTop: '20px',
            display: 'flex',
            gap: '10px',
            justifyContent: 'center'
          }}>
            {preview && (
              <>
                <button 
                  onClick={handleUpload} 
                  disabled={loading}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: loading ? '#ccc' : '#005326 ',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.3s'
                  }}
                >
                  {loading ? "🔍 Processing..." : "🔍 Identify Plant"}
                </button>
                <button 
                  onClick={reset} 
                  disabled={loading}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#005326',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  🔄 New Photo
                </button>
              </>
            )}
          </div>

          {error && (
            <div style={{ 
              marginTop: '20px',
              padding: '15px',
              backgroundColor: '#f8d7da',
              border: '1px solid #f5c2c7',
              borderRadius: '6px',
              color: '#721c24'
            }}>
              ❌ {error}
            </div>
          )}

          {loading && (
            <div style={{ 
              marginTop: '20px',
              textAlign: 'center',
              padding: '20px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #4CAF50',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 15px'
              }}></div>
              <p style={{ 
                color: '#666',
                fontSize: '1.1rem'
              }}>
                🤖 Analyzing your plant image...
              </p>
              <style>
                {`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}
              </style>
            </div>
          )}
        </div>

        {/* Results Section */}
        {prediction && !loading && (
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0'
          }}>
            {prediction.accuracy < 70 ? (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#ff6b35', marginBottom: '15px' }}>
                  🤔 Low Confidence Result
                </h3>
                <p style={{ 
                  color: '#666',
                  marginBottom: '20px',
                  lineHeight: '1.6'
                }}>
                  I'm not entirely sure about this plant. Please try another photo with better lighting and a clearer view of the plant.
                </p>
                <button 
                  onClick={reset}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#ff6b35',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  📷 Try Again
                </button>
              </div>
            ) : (
              <div>
                <h2 style={{ 
                  color: '#2d5016',
                  marginBottom: '15px',
                  fontSize: '1.8rem'
                }}>
                  🌱 {prediction.predicted_plant}
                </h2>
                
                <div style={{ 
                  marginBottom: '25px',
                  backgroundColor: '#f8f9fa',
                  padding: '15px',
                  borderRadius: '8px'
                }}>
                  <div style={{
                    width: '100%',
                    backgroundColor: '#e0e0e0',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    marginBottom: '10px'
                  }}>
                    <div style={{
                      width: `${prediction.accuracy}%`,
                      height: '8px',
                      backgroundColor: prediction.accuracy >= 90 ? '#4CAF50' : 
                                     prediction.accuracy >= 80 ? '#ff9800' : '#ff6b35',
                      transition: 'width 0.5s ease'
                    }}></div>
                  </div>
                  <span style={{ 
                    fontSize: '0.9rem',
                    color: '#666'
                  }}>
                    {prediction.accuracy.toFixed(1)}% Confidence
                  </span>
                </div>
                
                {/* Top Predictions */}
                <div style={{ marginBottom: '30px' }}>
                  <h3 style={{ 
                    color: '#333',
                    marginBottom: '15px',
                    fontSize: '1.3rem'
                  }}>
                    🎯 Top Predictions
                  </h3>
                  <ul style={{ 
                    listStyle: 'none',
                    padding: 0,
                    margin: 0
                  }}>
                    {prediction.top_predictions.map((pred, index) => (
                      <li key={index} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 15px',
                        marginBottom: '8px',
                        backgroundColor: index === 0 ? '#e8f5e9' : '#f5f5f5',
                        borderRadius: '6px',
                        border: index === 0 ? '2px solid #4CAF50' : '1px solid #ddd'
                      }}>
                        <span style={{ 
                          fontWeight: index === 0 ? 'bold' : 'normal',
                          color: '#333'
                        }}>
                          {pred.plant_name}
                        </span>
                        <span style={{ 
                          fontWeight: 'bold',
                          color: index === 0 ? '#4CAF50' : '#666'
                        }}>
                          {pred.accuracy}%
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Plant Care Information */}
                {prediction.plant_info && prediction.plant_info.status === 'success' && prediction.plant_info.info && (
                  <div style={{
                    marginTop: '30px',
                    padding: '20px',
                    backgroundColor: '#f0f8ff',
                    borderRadius: '8px',
                    border: '1px solid #b3d9ff'
                  }}>
                    <h3 style={{ 
                      color: '#2d5016',
                      marginBottom: '15px',
                      fontSize: '1.4rem'
                    }}>
                      🌿 Plant Care Information
                    </h3>
                    <div style={{ 
                      color: '#444',
                      lineHeight: '1.6'
                    }}>
                      {formatPlantInfo(prediction.plant_info.info)}
                    </div>
                  </div>
                )}

                {/* Error in plant info */}
                {prediction.plant_info && prediction.plant_info.status === 'error' && (
                  <div style={{
                    marginTop: '30px',
                    padding: '15px',
                    backgroundColor: '#fff3cd',
                    border: '1px solid #ffeaa7',
                    borderRadius: '6px',
                    color: '#856404'
                  }}>
                    ⚠️ Unable to get detailed plant information at this time.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}

export default BotaniSnap;