import React, { useState, useRef, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import Header from '../components/Header'
import { MentorModel } from './MentorModel'
import './aimentor.css'

function AIMentor() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hello! I am your JEE/NEET mentor. How can I help you today?' }
  ]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollRef = useRef();

  // Auto-scroll to latest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    // 1. Add User Message
    const newMessages = [...messages, { role: 'user', text: input }];
    setMessages(newMessages);
    setInput("");

    // 2. Simulate AI "Thinking"
    setTimeout(() => {
      const aiResponse = "That's a great question about your prep! To master this topic, you should focus on the fundamental concepts first.";
      
      setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
      
      // 3. Trigger Animation & Voice
      triggerMentorResponse(aiResponse);
    }, 1000);
  };

  const triggerMentorResponse = (text) => {
    // Start Animation
    setIsSpeaking(true);

    // Optional: Built-in Browser Voice (Free)
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsSpeaking(false); // Stop animation when done talking
    window.speechSynthesis.speak(utterance);

    // Fallback if voice is disabled: stop animation after 4 seconds
    // setTimeout(() => setIsSpeaking(false), 4000); 
  };

  return (
    <div className="mentor-page">
      <Header />
      
      <main className="mentor-layout">
        {/* Left Side: 3D Scene */}
        <div className="canvas-container">
          <Canvas camera={{ position: [0, 1.2, 2.5], fov: 40 }}>
            <ambientLight intensity={0.7} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
            <React.Suspense fallback={null}>
              <MentorModel isSpeaking={isSpeaking} position={[0, -1, 0]} />
              <ContactShadows opacity={0.4} scale={5} blur={2} far={4.5} />
              <Environment preset="city" />
            </React.Suspense>
            <OrbitControls enableZoom={false} minPolarAngle={Math.PI / 3} maxPolarAngle={Math.PI / 2} />
          </Canvas>
        </div>

        {/* Right Side: Chat UI */}
        <div className="chat-container">
          <div className="chat-header">
            <h2>AI Study Mentor</h2>
            <span className={isSpeaking ? "status speaking" : "status"}>
              {isSpeaking ? "● Speaking..." : "● Online"}
            </span>
          </div>

          <div className="chat-messages" ref={scrollRef}>
            {messages.map((msg, index) => (
              <div key={index} className={`message-bubble ${msg.role}`}>
                {msg.text}
              </div>
            ))}
          </div>

          <div className="chat-input-area">
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask a question..." 
            />
            <button onClick={handleSend}>Send</button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AIMentor