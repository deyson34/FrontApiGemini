import React, { useState, useEffect } from 'react';
import './PromptForm.css';
import { Container, Row, Col, Form, Button, Dropdown, Image, ListGroup, InputGroup, FormControl } from 'react-bootstrap';
import profileImage from './assets/profile-image.png';

const themes = {
  light: {
    background: '#f9f9f9',
    text: '#333',
    userMsg: '#4a4a4a',
    geminiMsg: '#e0e0e0',
    leftPanel: '#4a4a4a',
    sendPrompt: '#fff',
    btnPrimary: '#4a4a4a',
  },
  dark: {
    background: '#333',
    text: '#fff',
    userMsg: '#6200ea',
    geminiMsg: '#4a4a4a',
    leftPanel: '#222',
    sendPrompt: '#444',
    btnPrimary: '#6200ea',
  },
};

const PromptForm = () => {
  const [prompt, setPrompt] = useState('');
  const [conversation, setConversation] = useState([]);
  const [theme, setTheme] = useState('light');
  const [savedConversations, setSavedConversations] = useState([]);
  const [editingName, setEditingName] = useState({ index: null, newName: '' });

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('savedConversations')) || [];
    setSavedConversations(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem('currentConversation', JSON.stringify(conversation));
  }, [conversation]);

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

      const data = await res.json();
      const responseText = data.candidates[0].content.parts[0].text;

      setConversation((prevConversation) => [
        ...prevConversation,
        { prompt, response: responseText },
      ]);
      setPrompt('');
    } catch (error) {
      console.error('Error:', error.message);
      setConversation((prevConversation) => [
        ...prevConversation,
        { prompt, response: `Error: ${error.message}` },
      ]);
      setPrompt('');
    }
  };

  const handleThemeChange = (selectedTheme) => {
    setTheme(selectedTheme);
  };

  const handleSaveConversation = () => {
    const newSavedConversations = [
      ...savedConversations,
      { name: `Conversación ${savedConversations.length + 1}`, messages: conversation },
    ];
    setSavedConversations(newSavedConversations);
    localStorage.setItem('savedConversations', JSON.stringify(newSavedConversations));
    alert('Conversación guardada exitosamente.');
  };

  const handleLoadConversation = (index) => {
    const selectedConversation = savedConversations[index].messages;
    setConversation(selectedConversation);
  };

  const handleDeleteConversation = (index) => {
    const newSavedConversations = savedConversations.filter((_, i) => i !== index);
    setSavedConversations(newSavedConversations);
    localStorage.setItem('savedConversations', JSON.stringify(newSavedConversations));
  };

  const handleRenameConversation = (index) => {
    const newSavedConversations = [...savedConversations];
    newSavedConversations[index].name = editingName.newName;
    setSavedConversations(newSavedConversations);
    localStorage.setItem('savedConversations', JSON.stringify(newSavedConversations));
    setEditingName({ index: null, newName: '' });
  };

  const currentTheme = themes[theme];

  return (
    <Container fluid className="app" style={{ backgroundColor: currentTheme.background, color: currentTheme.text }}>
      <Row style={{ height: '100%' }}>
        <Col md={3} className="left-panel" style={{ backgroundColor: currentTheme.leftPanel, color: 'white' }}>
          <div className="profile">
            <Image src={profileImage} roundedCircle width={100} height={100} />
            <div className="name">Nara</div>
          </div>
          <Dropdown>
            <Dropdown.Toggle variant="secondary" id="dropdown-basic">
              Cambiar Tema
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {Object.keys(themes).map((themeKey) => (
                <Dropdown.Item key={themeKey} onClick={() => handleThemeChange(themeKey)}>
                  {themeKey.charAt(0).toUpperCase() + themeKey.slice(1)}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
          <ListGroup className="options-menu">
            <ListGroup.Item action onClick={() => alert('Configuración')}>
              Configuración
            </ListGroup.Item>
            <ListGroup.Item action onClick={() => alert('Ajustes')}>
              Ajustes
            </ListGroup.Item>
            <ListGroup.Item action onClick={() => setConversation([])}>
              Limpiar Chat
            </ListGroup.Item>
            <ListGroup.Item action onClick={handleSaveConversation}>
              Guardar Conversación
            </ListGroup.Item>
          </ListGroup>
          <h5>Conversaciones Guardadas</h5>
          <ListGroup>
            {savedConversations.map((conv, index) => (
              <ListGroup.Item key={index}>
                {editingName.index === index ? (
                  <InputGroup>
                    <FormControl
                      value={editingName.newName}
                      onChange={(e) => setEditingName({ ...editingName, newName: e.target.value })}
                    />
                    <Button onClick={() => handleRenameConversation(index)}>Guardar</Button>
                    <Button variant="secondary" onClick={() => setEditingName({ index: null, newName: '' })}>
                      Cancelar
                    </Button>
                  </InputGroup>
                ) : (
                  <>
                    <span onClick={() => handleLoadConversation(index)}>{conv.name}</span>
                    <Button variant="outline-primary" size="sm" className="rename-button"  onClick={() => setEditingName({ index, newName: conv.name })}>
                      Renombrar
                    </Button>
                    <Button variant="outline-primary" size="sm" className="rename-button" onClick={() => handleDeleteConversation(index)}>
                      Eliminar
                    </Button>
                  </>
                )}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>
        <Col md={9} className="chat-panel" style={{ backgroundColor: currentTheme.background, borderLeft: '2px solid #ddd' }}>
          <div className="conversation">
            {conversation.map((msg, index) => (
              <div key={index} className="message-container">
                <div className="user-msg" style={{ backgroundColor: currentTheme.userMsg, color: 'white' }}>
                  {msg.prompt}
                </div>
                <div className="gemini-msg" style={{ backgroundColor: currentTheme.geminiMsg, color: currentTheme.text }}>
                  {msg.response}
                </div>
              </div>
            ))}
          </div>
          <Form
            className="send-prompt"
            onSubmit={handleSubmit}
            style={{ backgroundColor: currentTheme.sendPrompt, borderTop: '1px solid #ddd' }}
          >
            <Form.Control
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Escribe tu prompt"
              required
              style={{
                borderColor: '#ddd',
                borderRadius: '10px',
                fontSize: '1.1em',
                width: '80%',
                boxSizing: 'border-box',
                transition: 'border-color 0.3s ease',
              }}
            />
            <Button
              type="submit"
              variant="primary"
              style={{
                backgroundColor: currentTheme.btnPrimary,
                color: 'white',
                fontSize: '1.1em',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.3s ease-in-out',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
              }}
            >
              ENVIAR
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default PromptForm;
