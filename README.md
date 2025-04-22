<h1 align="center">
    <img src="./src/assets/lumina.svg" alt="Lumina Logo" width="120" > 
    <br />
    Lumina (Ollama Web Client) 
</h1>
<p align="center">
  <a href="https://github.com/cushydigit/lumina/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License MIT">
  </a>
  <img src="https://img.shields.io/badge/React-18+-blue.svg" alt="React 18+">
  <img src="https://img.shields.io/badge/Status-Active-brightgreen.svg" alt="Project Status">
  <a href="https://github.com/ollama/ollama">
    <img src="https://img.shields.io/badge/Built%20for-Ollama-blueviolet.svg" alt="Built for Ollama">
  </a>
</p>
<p align="center">
A lightweight, minimalistic frontend built with React.js for interacting with the Ollama API.
Designed with minimal dependencies for simplicity, speed, and easy customization.
</p>

## 🚀 Features

- Minimal dependencies - build with React only
- Streamed conversations with Ollama models
- Persistent Converstaion history
- Markdown rendering with syntax highlighting
- Support Two modes: **Chat** and **Completion**
- Allow users to define or tweak the system prompt for better control.
- Copy code blocks or entire messsage easily
- Automatic title genreation for conversations
- Exlusive Reasoning Component
- Clean, Reponsive UI

## 📸 Screenshot

![App Screenshot](./src/assets/lumina-screenshot-1.png)
![App Screenshot](./src/assets/lumina-screenshot-4.png)

## 🛠️ Tech Stack

- React.js
- Tailwindcss
- shadcn/ui

## 📦 Getting Started

Clone the repository and install dependecies:
```bash
git clone https://github.com/cushydigit/lumina.git
cd lumina
npm install
npm run dev
```
or easily use lamina with Docker way: 
build then docker image
```bash
docker build -t lumina .
```
run the docker container
```bashe
docker run =p 4173:4173 lumina
```

Make sure your Ollama server is running locally at (localhost:11434) or update the API URL if needed.

## ⚙️ Configuration

if your Ollama instance is runnig elsewhere, you could easily edit the API_BASE_URL in api.ts file if needed. 

```ts
const API_BASE_URL = "http://localhost:11434";

```

## 📄 License

This porject is licensed under the MIT License.

## 🙌 Contributing

pull requiest, suggestions, and feedback are welcome!


## 🛣️ Roadmap / Upcoming Features

- [ ] **Delete and Retry Messages**  
  Allow users to delete messages or retry sending failed messages.

- [ ] **Model Pulling Support**  
  UI for pulling, updating, and managing Ollama models directly.

- [ ] **Conversation Pinning**  
  Pin important conversations to the top for quick access.

- [ ] **Search Conversations**  
  Quickly search across conversations by keywords.

- [ ] **Export / Import Conversations**  
  Allow users to back up and restore chats in JSON or Markdown format.

## 🔗 Related Links

- [Ollama Official Website](https://ollama.com/)
- [Ollama Official Repository](https://github.com/ollama/ollama)
- [Ollama Developement Documention](https://github.com/ollama/ollama/blob/main/docs/development.md)


