import React, { useEffect, useRef, useState } from "react";
import Client from "./Client";
import Editor from "./Editor";
import { initSocket } from "../Socket";
import { ACTIONS } from "../Actions";
import {
  useNavigate,
  useLocation,
  Navigate,
  useParams,
} from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";

// List of supported languages
const LANGUAGES = [
  "python3",
  "java",
  "cpp",
  "nodejs",
  "c",
  "ruby",
  "go",
  "scala",
  "bash",
  "sql",
  "pascal",
  "csharp",
  "php",
  "swift",
  "rust",
  "r",
];

function EditorPage() {
  const [clients, setClients] = useState([]);
  const [output, setOutput] = useState("");
  const [isCompileWindowOpen, setIsCompileWindowOpen] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("python3");
  const [particles, setParticles] = useState([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const codeRef = useRef(null);

  const Location = useLocation();
  const navigate = useNavigate();
  const { roomId } = useParams();

  const socketRef = useRef(null);

  // Initialize particles for background animation
  useEffect(() => {
    const newParticles = [];
    for (let i = 0; i < 30; i++) {
      newParticles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.3 + 0.1,
        hue: Math.random() * 360
      });
    }
    setParticles(newParticles);
  }, []);

  // Animate particles
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        x: (particle.x + particle.vx + window.innerWidth) % window.innerWidth,
        y: (particle.y + particle.vy + window.innerHeight) % window.innerHeight,
        hue: (particle.hue + 0.5) % 360
      })));
    }, 16);

    return () => clearInterval(interval);
  }, []);

  // Track mouse movement
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));

      const handleErrors = (err) => {
        console.log("Error", err);
        toast.error("Socket connection failed, Try again later");
        navigate("/");
      };

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: Location.state?.username,
      });

      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username, socketId }) => {
          if (username !== Location.state?.username) {
            toast.success(`${username} joined the room.`);
          }
          setClients(clients);
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            socketId,
          });
        }
      );

      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room`);
        setClients((prev) => {
          return prev.filter((client) => client.socketId !== socketId);
        });
      });
    };
    init();

    return () => {
      socketRef.current && socketRef.current.disconnect();
      socketRef.current.off(ACTIONS.JOINED);
      socketRef.current.off(ACTIONS.DISCONNECTED);
    };
  }, []);

  if (!Location.state) {
    return <Navigate to="/" />;
  }

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success(`Room ID is copied`);
    } catch (error) {
      console.log(error);
      toast.error("Unable to copy the room ID");
    }
  };

  const leaveRoom = async () => {
    navigate("/");
  };

  const runCode = async () => {
    setIsCompiling(true);
    try {
      const response = await axios.post("http://localhost:5000/compile", {
        code: codeRef.current,
        language: selectedLanguage,
      });
      console.log("Backend response:", response.data);
      setOutput(response.data.output || JSON.stringify(response.data));
    } catch (error) {
      console.error("Error compiling code:", error.response?.data || error.message);
      setOutput(error.response?.data?.error || error.response?.data?.details || "An error occurred during compilation");
    } finally {
      setIsCompiling(false);
    }
  };

  const toggleCompileWindow = () => {
    setIsCompileWindowOpen(!isCompileWindowOpen);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 20% 80%, #0f0f23 0%, transparent 50%), radial-gradient(circle at 80% 20%, #1a1a2e 0%, transparent 50%), radial-gradient(circle at 40% 40%, #16213e 0%, transparent 50%), linear-gradient(135deg, #0a0a1f 0%, #0f0f23 25%, #1a1a2e 50%, #16213e 75%, #0a0a1f 100%)',
      backgroundSize: '100% 100%, 100% 100%, 100% 100%, 400% 400%',
      animation: 'gradientShift 20s ease infinite',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Particles */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1
      }}>
        {particles.map((particle, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: particle.x,
              top: particle.y,
              width: particle.size,
              height: particle.size,
              borderRadius: '50%',
              background: `hsla(${particle.hue}, 70%, 60%, ${particle.opacity})`,
              boxShadow: `0 0 ${particle.size * 2}px hsla(${particle.hue}, 70%, 60%, ${particle.opacity})`,
              animation: `twinkle 2s ease-in-out infinite alternate`,
              animationDelay: `${i * 0.1}s`
            }}
          />
        ))}
      </div>

      {/* Mouse Light Effect */}
      <div
        style={{
          position: 'fixed',
          left: mousePos.x - 100,
          top: mousePos.y - 100,
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(79, 172, 254, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 2,
          transition: 'all 0.1s ease'
        }}
      />

      <style>{`
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%, 0% 50%, 0% 50%, 0% 50%; }
          25% { background-position: 100% 50%, 0% 50%, 0% 50%, 25% 50%; }
          50% { background-position: 100% 100%, 100% 50%, 0% 50%, 50% 50%; }
          75% { background-position: 0% 100%, 100% 100%, 100% 50%, 75% 50%; }
        }
        
        @keyframes twinkle {
          0% { opacity: 0.3; transform: scale(1); }
          100% { opacity: 1; transform: scale(1.2); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes glow {
          0%, 100% { 
            box-shadow: 
              0 0 20px rgba(79, 172, 254, 0.3),
              0 0 40px rgba(79, 172, 254, 0.1);
          }
          50% { 
            box-shadow: 
              0 0 30px rgba(79, 172, 254, 0.5),
              0 0 60px rgba(79, 172, 254, 0.2);
          }
        }
        
        .glass-panel {
          background: rgba(10, 10, 30, 0.3);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          transition: all 0.3s ease;
        }
        
        .glass-panel:hover {
          border-color: rgba(79, 172, 254, 0.3);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
        }
        
        .modern-btn {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          border: none;
          border-radius: 12px;
          padding: 12px 24px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 5px 15px rgba(79, 172, 254, 0.3);
          font-size: 14px;
          letter-spacing: 0.5px;
        }
        
        .modern-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(79, 172, 254, 0.4);
        }
        
        .modern-btn:active {
          transform: translateY(0px);
        }
        
        .danger-btn {
          background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
          box-shadow: 0 5px 15px rgba(255, 107, 107, 0.3);
        }
        
        .danger-btn:hover {
          box-shadow: 0 8px 20px rgba(255, 107, 107, 0.4);
        }
        
        .success-btn {
          background: linear-gradient(135deg, #51cf66 0%, #40c057 100%);
          box-shadow: 0 5px 15px rgba(81, 207, 102, 0.3);
        }
        
        .success-btn:hover {
          box-shadow: 0 8px 20px rgba(81, 207, 102, 0.4);
        }
        
        .modern-select {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 12px;
          padding: 12px 16px;
          color: white;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          outline: none;
        }
        
        .modern-select:focus {
          border-color: rgba(79, 172, 254, 0.6);
          box-shadow: 0 0 20px rgba(79, 172, 254, 0.2);
        }
        
        .modern-select option {
          background: #1a1a2e;
          color: white;
        }
        
        .client-avatar {
          width: 45px;
          height: 45px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 16px;
          margin-bottom: 10px;
          box-shadow: 0 5px 15px rgba(79, 172, 254, 0.3);
          transition: all 0.3s ease;
          animation: float 3s ease-in-out infinite;
        }
        
        .client-avatar:hover {
          transform: scale(1.1);
          box-shadow: 0 8px 25px rgba(79, 172, 254, 0.5);
        }
        
        .compile-window {
          background: rgba(10, 10, 30, 0.4);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px 20px 0 0;
          box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.5);
        }
        
        .output-area {
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 20px;
          color: #ffffff;
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 14px;
          line-height: 1.6;
          white-space: pre-wrap;
          max-height: 200px;
          overflow-y: auto;
        }
        
        .floating-button {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1050;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 50px;
          padding: 15px 25px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
          animation: pulse 2s ease-in-out infinite;
        }
        
        .floating-button:hover {
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 15px 35px rgba(102, 126, 234, 0.6);
        }
        
        @keyframes pulse {
          0%, 100% { box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4); }
          50% { box-shadow: 0 10px 25px rgba(102, 126, 234, 0.6); }
        }
      `}</style>

      <div style={{ display: 'flex', height: '100vh', position: 'relative', zIndex: 10 }}>
        {/* Sidebar */}
        <div style={{
          width: '280px',
          padding: '10px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div className="glass-panel" style={{
            padding: '10px',
            textAlign: 'center',
            marginBottom: '10px',
            backgroundColor: '#212529',
          }}>
            <img
              src="/images/codecast_or.png"
              alt="Logo"
              style={{
                width: '120px',            // ↓ Shrink to a neat size
                borderRadius: '10px',      // ↓ Slightly rounded corners
                // boxShadow: '0 4px 15px rgba(79, 172, 254, 0.2)',
                display: 'block',
                margin: '0 auto',
                scale: '1.2',            // ↓ Scale down slightly
              }}
            />
          </div>




          <div className="glass-panel" style={{
            padding: '25px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column'
          }}>
            <h4 style={{
              color: 'white',
              marginBottom: '20px',
              fontSize: '16px',
              fontWeight: '600'
            }}>
              Connected Members
            </h4>

            <div style={{
              flex: 1,
              overflowY: 'auto',
              marginBottom: '20px'
            }}>
              {clients.map((client) => (
                <div key={client.socketId} style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '15px',
                  padding: '10px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  transition: 'all 0.3s ease'
                }}>
                  <div className="client-avatar" style={{
                    width: '40px',
                    height: '40px',
                    fontSize: '14px',
                    marginRight: '12px',
                    marginBottom: '0'
                  }}>
                    {client.username[0].toUpperCase()}
                  </div>
                  <span style={{ color: 'white', fontWeight: '500' }}>
                    {client.username}
                  </span>
                </div>
              ))}
            </div>

            <div>
              <button
                className="modern-btn success-btn"
                onClick={copyRoomId}
                style={{
                  width: '100%',
                  marginBottom: '12px'
                }}
              >
                Copy Room ID
              </button>
              <button
                className="modern-btn danger-btn"
                onClick={leaveRoom}
                style={{ width: '100%' }}
              >
                Leave Room
              </button>
            </div>
          </div>
        </div>

        {/* Main Editor Area */}
        <div style={{
          flex: 1,
          padding: '20px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Language Selector */}
          <div className="glass-panel" style={{
            padding: '15px 25px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{
              color: 'white',
              margin: 0,
              fontSize: '18px',
              fontWeight: '600'
            }}>
              Code Editor
            </h3>
            <select
              className="modern-select"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Editor */}
          <div style={{ flex: 1 }}>
            <Editor
              socketRef={socketRef}
              roomId={roomId}
              language={selectedLanguage}
              onCodeChange={(code) => {
                codeRef.current = code;
              }}
            />
          </div>
        </div>
      </div>

      {/* Floating Compiler Button */}
      <button
        className="floating-button"
        onClick={toggleCompileWindow}
      >
        {isCompileWindowOpen ? "Close Compiler" : "Open Compiler"}
      </button>

      {/* Compiler Window */}
      <div
        className={`compile-window ${isCompileWindowOpen ? '' : 'd-none'}`}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: isCompileWindowOpen ? '35vh' : '0',
          transition: 'height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          overflowY: 'auto',
          zIndex: 1040,
          padding: isCompileWindowOpen ? '25px' : '0'
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h4 style={{
            color: 'white',
            margin: 0,
            fontSize: '18px',
            fontWeight: '600'
          }}>
            Compiler Output ({selectedLanguage.toUpperCase()})
          </h4>
          <div>
            <button
              className="modern-btn success-btn"
              onClick={runCode}
              disabled={isCompiling}
              style={{ marginRight: '12px' }}
            >
              {isCompiling ? "Compiling..." : "▶ Run Code"}
            </button>
            <button
              className="modern-btn"
              onClick={toggleCompileWindow}
            >
              Close
            </button>
          </div>
        </div>
        <div className="output-area">
          {output || "Output will appear here after compilation..."}
        </div>
      </div>
    </div>
  );
}

export default EditorPage;