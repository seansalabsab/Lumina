import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { MessageCircle, X, Send, Camera, RefreshCw } from "lucide-react";

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

type Message = {
  id: string;
  text: string;
  sender: "assistant" | "user";
  timestamp: Date;
};

function BotaniSnap() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Assistant related states
  const [showAssistant, setShowAssistant] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [assistantTyping, setAssistantTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initial welcome message from assistant
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          text: "👋 Hi there! I'm your BotaniSnap assistant. Need help identifying or caring for plants? Just upload a photo or ask me a question!",
          sender: "assistant",
          timestamp: new Date()
        }
      ]);
    }
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Update assistant messages when file is selected or prediction changes
  useEffect(() => {
    if (selectedFile && !preview) {
      // Do nothing until preview is ready
    } else if (selectedFile && preview && !prediction && !loading) {
      sendAssistantMessage("Great photo! Click 'Identify Plant' to analyze it. For best results, make sure the plant is clearly visible and well-lit.");
    } else if (loading) {
      sendAssistantMessage("I'm analyzing your plant image now. This should only take a moment...");
    } else if (prediction) {
      const confidence = prediction.accuracy;
      if (confidence < 70) {
        sendAssistantMessage("I'm not entirely confident about this identification. Could you try taking another photo with better lighting and a clearer view of the plant?");
      } else {
        sendAssistantMessage(`I've identified this as ${prediction.predicted_plant} with ${confidence.toFixed(1)}% confidence. You can see care information on the right. Any questions about this plant?`);
      }
    }
  }, [selectedFile, preview, prediction, loading]);

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
      
      sendUserMessage(`I've uploaded a photo: ${file.name}`);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select an image first.");
      sendAssistantMessage("You'll need to select an image first. Click the 'Choose a photo' button to upload a plant image.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const resizedFile = await resizeImage(selectedFile);
      const formData = new FormData();
      formData.append("file", resizedFile);

      const response = await axios.post("http://localhost:5001/predict", formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000
      });
      
      if (response.data && response.data.predicted_plant) {
        setPrediction(response.data);
      } else {
        throw new Error("Invalid response structure");
      }
    } catch (err: any) {
      console.error("❌ Upload error:", err);
      if (err.code === 'ECONNREFUSED') {
        setError("Cannot connect to the plant identification server. Please make sure the server is running on port 5001.");
        sendAssistantMessage("I'm having trouble connecting to the plant identification server. Please make sure the server is running on port 5001.");
      } else if (err.response?.status === 500) {
        setError("Server error occurred. Please try again with a different image.");
        sendAssistantMessage("There was a server error processing your image. Could you try again with a different photo?");
      } else {
        setError(`Failed to identify plant: ${err.message || "Please try again."}`);
        sendAssistantMessage("I wasn't able to identify your plant. This might be because the image isn't clear enough. Try taking another photo with good lighting and a clear view of the leaves and any flowers.");
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
    
    sendUserMessage("I want to upload a new photo");
    sendAssistantMessage("Great! Click 'Choose a photo' to upload a new plant image.");
  };
  
  // Assistant functions
  const sendUserMessage = (text: string) => {
    const newMessage = {
      id: `user-${Date.now()}`,
      text,
      sender: "user" as const,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };
  
  const sendAssistantMessage = (text: string) => {
    setAssistantTyping(true);
    
    // Simulate typing delay for more natural feel
    setTimeout(() => {
      const newMessage = {
        id: `assistant-${Date.now()}`,
        text,
        sender: "assistant" as const,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newMessage]);
      setAssistantTyping(false);
    }, 1000);
  };
  
  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;
    
    const userMessage = currentMessage;
    setCurrentMessage("");
    sendUserMessage(userMessage);
    setAssistantTyping(true);
    
    try {
      // Use plant-assistant endpoint to get response from Gemini API
      const response = await axios.post("http://localhost:5001/plant-assistant", {
        prompt: `User question about plants: ${userMessage}`,
      });
      
      if (response.data && response.data.response) {
        sendAssistantMessage(response.data.response);
      } else {
        throw new Error("Invalid response from assistant API");
      }
    } catch (err: any) {
      console.error("❌ Assistant error:", err);
      sendAssistantMessage("I'm sorry, I'm having trouble connecting to the plant assistant service. You can still upload and identify plants though!");
    } finally {
      setAssistantTyping(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      position: 'relative'
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
          backgroundColor: '#f5f5f5',
          padding: '30px',
          borderRadius: '12px',
          border: '2px solid #02c55a'
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
              backgroundColor: '#02c55a',
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
              display: 'flex', 
              justifyContent: 'center',  // centers horizontally
              alignItems: 'center',  
            }}>
              <img 
                src={preview} 
                alt="preview" 
                style={{ 
                  alignItems: 'center',
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
                    backgroundColor: loading ? '#ccc' : '#02c55a',
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
                borderTop: '4px solid #02c55a',
                borderRadius: '50%',
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
          
          {/* Tips section */}
          <div style={{
            marginTop: '30px',
            padding: '15px',
            backgroundColor: '#e8f5e9',
            borderRadius: '8px',
            border: '1px solid #c8e6c9'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#2d5016' }}>📸 Photo Tips:</h4>
            <ul style={{ 
              margin: '0', 
              paddingLeft: '20px',
              color: '#2d5016',
              fontSize: '0.95rem'
            }}>
              <li>Take close-up shots of leaves and flowers</li>
              <li>Use natural lighting when possible</li>
              <li>Capture multiple parts of the plant for better identification</li>
              <li>Make sure the plant is in focus</li>
            </ul>
          </div>
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

      {/* Assistant Chat Button */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000
      }}>
        <button 
          onClick={() => setShowAssistant(!showAssistant)}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#02c55a',
            color: 'white',
            border: 'none',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px'
          }}
        >
          {showAssistant ? <X size={24} /> : <MessageCircle size={24} />}
        </button>
      </div>
      
      {/* Assistant Chat Panel */}
      {showAssistant && (
        <div style={{
          position: 'fixed',
          bottom: '90px',
          right: '20px',
          width: '350px',
          height: '500px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 999,
          border: '1px solid #ddd'
        }}>
          {/* Chat Header */}
          <div style={{
            backgroundColor: '#02c55a',
            color: 'white',
            padding: '15px',
            fontWeight: 'bold',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>🌿 BotaniSnap Assistant</span>
            <button 
              onClick={() => setShowAssistant(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                padding: '0'
              }}
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Messages Container */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '15px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            backgroundColor: '#f9f9f9'
          }}>
            {messages.map(message => (
              <div 
              key={message.id}
              style={{
                alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
                backgroundColor: message.sender === 'user' ? '#e2f7e8' : 'white',
                color: message.sender === 'user' ? 'black' : '#007700', // example: dark green for bot text
                padding: '10px 15px',
                borderRadius: message.sender === 'user' ? '18px 18px 0 18px' : '18px 18px 18px 0',
                maxWidth: '80%'
              }}
            >
              {message.text}
            </div>
            
            ))}
            {assistantTyping && (
              <div style={{
                alignSelf: 'flex-start',
                backgroundColor: 'white',
                padding: '15px',
                borderRadius: '18px 18px 18px 0',
                maxWidth: '80%',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                border: '1px solid #e0e0e0'
              }}>
                <div style={{
                  display: 'flex',
                  gap: '4px',
                  alignItems: 'center'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#02c55a',
                    animation: 'pulse 1s infinite',
                    animationDelay: '0s'
                  }}></div>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#02c55a',
                    animation: 'pulse 1s infinite',
                    animationDelay: '0.3s'
                  }}></div>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#02c55a',
                    animation: 'pulse 1s infinite',
                    animationDelay: '0.6s'
                  }}></div>
                </div>
                <style>
                  {`
                    @keyframes pulse {
                      0% { opacity: 0.4; }
                      50% { opacity: 1; }
                      100% { opacity: 0.4; }
                    }
                  `}
                </style>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input Area */}
          <div style={{
            borderTop: '1px solid #eee',
            padding: '15px',
            display: 'flex',
            gap: '10px',
            backgroundColor: 'white'
          }}>
            <input
              type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask about plants or upload help..."
              style={{
                flex: 1,
                padding: '10px 15px',
                borderRadius: '20px',
                border: '1px solid #ddd',
                outline: 'none',
                color: '#007700' ,
                fontSize: '0.95rem'
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!currentMessage.trim()}
              style={{
                backgroundColor: currentMessage.trim() ? '#02c55a' : '#ccc',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: currentMessage.trim() ? 'pointer' : 'not-allowed'
              }}
            >
              <Send size={18} color="white" />
            </button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}

export default BotaniSnap;