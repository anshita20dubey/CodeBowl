import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate

function Home() {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const [particles, setParticles] = useState([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  // Mock uuid function for demo
  const uuid = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // Mock toast function for demo
  const toast = {
    success: (message) => {
      console.log('Success:', message);
    },
    error: (message) => {
      console.log('Error:', message);
    }
  };

  // Initialize particles
  useEffect(() => {
    const newParticles = [];
    for (let i = 0; i < 50; i++) {
      newParticles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.1,
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

  const generateRoomId = (e) => {
    e.preventDefault();
    const Id = uuid();
    setRoomId(Id);
    toast.success("Room Id is generated");
  };

  const joinRoom = () => {
    if (!roomId || !username) {
      toast.error("Both the field is required");
      return;
    }

    navigate(`/editor/${roomId}`, {
      state: {
        username,
      },
    });
    toast.success("room is created");
  };

  const handleInputEnter = (e) => {
    if (e.code === "Enter") {
      joinRoom();
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 20% 80%, #0f0f23 0%, transparent 50%), radial-gradient(circle at 80% 20%, #1a1a2e 0%, transparent 50%), radial-gradient(circle at 40% 40%, #16213e 0%, transparent 50%), linear-gradient(135deg, #0a0a1f 0%, #0f0f23 25%, #1a1a2e 50%, #16213e 75%, #0a0a1f 100%)',
      backgroundSize: '100% 100%, 100% 100%, 100% 100%, 400% 400%',
      animation: 'gradientShift 20s ease infinite',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Particles */}
      <div style={{
        position: 'absolute',
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
          position: 'absolute',
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
          0%, 100% { transform: translateY(0px) rotateX(0deg); }
          50% { transform: translateY(-15px) rotateX(5deg); }
        }
        
        @keyframes glow {
          0%, 100% { 
            box-shadow: 
              0 0 20px rgba(79, 172, 254, 0.3),
              0 0 40px rgba(79, 172, 254, 0.1),
              inset 0 0 20px rgba(255, 255, 255, 0.05);
          }
          50% { 
            box-shadow: 
              0 0 30px rgba(79, 172, 254, 0.5),
              0 0 60px rgba(79, 172, 254, 0.2),
              inset 0 0 30px rgba(255, 255, 255, 0.1);
          }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        .glass-card {
          background: rgba(10, 10, 30, 0.2);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          transition: all 0.3s ease;
          position: relative;
          z-index: 10;
        }
        
        .glass-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4);
          border-color: rgba(79, 172, 254, 0.3);
        }
        
        .input-field {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 12px;
          padding: 16px 20px;
          color: white;
          font-size: 16px;
          font-weight: 500;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          width: 100%;
          outline: none;
          box-sizing: border-box;
        }
        
        .input-field::placeholder {
          color: rgba(255, 255, 255, 0.6);
          font-weight: 400;
        }
        
        .input-field:focus {
          border-color: rgba(79, 172, 254, 0.6);
          background: rgba(0, 0, 0, 0.4);
          box-shadow: 0 0 20px rgba(79, 172, 254, 0.2);
        }
        
        .join-btn {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          border: none;
          border-radius: 12px;
          padding: 16px 32px;
          color: white;
          font-size: 18px;
          font-weight: 700;
          letter-spacing: 1px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 10px 25px rgba(79, 172, 254, 0.3);
          width: 100%;
          text-transform: uppercase;
        }
        
        .join-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 35px rgba(79, 172, 254, 0.4);
        }
        
        .join-btn:active {
          transform: translateY(-1px);
        }
        
        .new-room-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 8px 16px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-block;
          font-weight: 600;
          border: none;
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
        }
        
        .new-room-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }
        
        .logo-container {
          animation: float 8s ease-in-out infinite;
          margin-bottom: 32px;
        }
        
        .title {
          background: linear-gradient(135deg, #ffffff 0%, #4facfe 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-size: 28px;
          font-weight: 800;
          margin-bottom: 32px;
          letter-spacing: 1px;
        }
        
        .subtitle {
          color: rgba(255, 255, 255, 0.9);
          font-size: 16px;
          font-weight: 400;
          margin-top: 32px;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
        }
      `}</style>

      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '450px',
        padding: '40px',
        textAlign: 'center'
      }}>
        <div className="logo-container">
          <div style={{
            width: '170px',
            height: '120px',
            margin: '0 auto',
            // background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            backgroundColor: '#212529',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '40px',
            color: 'white',
            fontWeight: 'bold',
            boxShadow: '0 10px 25px rgba(79, 172, 254, 0.3)'
          }}>
            {/* &lt;/&gt; */}
            <img className="rounded" src="/images/codecast.png" />
          </div>
        </div>

        <h1 className="title">Enter the ROOM ID</h1>

        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="input-field"
            placeholder="ROOM ID"
            onKeyUp={handleInputEnter}
          />
        </div>

        <div style={{ marginBottom: '32px' }}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input-field"
            placeholder="USERNAME"
            onKeyUp={handleInputEnter}
          />
        </div>

        <button
          onClick={joinRoom}
          className="join-btn"
        >
          Join Room
        </button>

        <p className="subtitle">
          Don't have a room ID? Create{" "}
          <span
            onClick={generateRoomId}
            className="new-room-btn"
          >
            New Room
          </span>
        </p>
      </div>
    </div>
  );
}

export default Home;