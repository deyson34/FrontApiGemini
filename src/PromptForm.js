import React, { useState } from 'react';

const PromptForm = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!prompt.trim()) {
      alert('El campo prompt no puede estar vacío.');
      return;
    }

    const url = `http://localhost:8080/api/gemini?prompt=${encodeURIComponent(prompt)}`;
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const errorMessage = await res.text();
        throw new Error(errorMessage);
      }

      const data = await res.text();
      setResponse(data);
    } catch (error) {
      console.error('Error:', error.message);
      setResponse(`Error: ${error.message}`);
    }
  };

  return (
    <div>
      <h1>Enviar Prompt</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Escribe tu prompt"
          required
        />
        <button type="submit">Enviar</button>
      </form>
      {response && <p>Respuesta: {response}</p>}
    </div>
  );
};

export default PromptForm;
