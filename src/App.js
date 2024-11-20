import React, { useState } from 'react';
import PromptForm from './PromptForm'; // Asegúrate de que la ruta sea correcta
import './PromptForm.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [messages, setMessages] = useState([]);

  const handleResponse = (newMessage) => {
    setMessages([...messages, newMessage]);
  };

  return (
    <div className="App">
      <div className="chat-container">
        {/* Mostramos el historial de chat */}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={msg.sender === 'user' ? 'user-msg' : 'gemini-msg'}
          >
            <p>{msg.text}</p>
          </div>
        ))}
      </div>
      {/* Componente que maneja el envío de mensajes */}
      <PromptForm onNewMessage={handleResponse} />
    </div>
  );
}

export default App;
