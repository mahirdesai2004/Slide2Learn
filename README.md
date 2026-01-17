# 🚀 Slide2Learn – AI-Powered Interactive Learning from Slides

Slide2Learn is an AI-driven platform that transforms traditional PowerPoint presentations into **interactive learning experiences** using **LLMs, visualizations, quizzes, games, and adaptive revision**.

Built for **students, educators, and technical learners**, Slide2Learn ensures slides are not just read — they are *understood*.

---

## 🧠 Problem We Are Solving

- Learning from slides is passive and non-interactive  
- Technical slides are content-heavy but retention-poor  
- No adaptive revision or recall-based learning  
- Learners struggle to retain complex concepts  

**Result:**  
Students read slides but do not truly *learn* from them.

---

## 💡 Our Solution

Slide2Learn converts slides into **multiple AI-powered learning modes**:

- 🧩 **Memorize** – Simplified explanations, mnemonics, examples  
- 🧠 **Quiz** – AI-generated MCQs and concept checks  
- 🎮 **Game Mode** – Fill-in-the-blanks, True/False, rapid-fire  
- 📊 **Visualize** – Mind maps & flow diagrams  
- 🔁 **Adaptive Revision** – Tracks weak topics using session memory  
- 📘 **Full PPT Processing** – Apply all modes to the entire presentation  

---

## ✨ Key Features

- Upload any `.pptx` file
- Automatic slide parsing & classification
- Multiple AI learning modes per slide
- Session-based memory tracking
- Performance analytics (accuracy, weak topics)
- Clean, modern UI with smooth animations

---

## 🏗️ Architecture Overview

```
Frontend (Next.js)
↓
FastAPI Backend
↓
MCP (Mode Control Protocol)
├── Memorize
├── Quiz
├── Game
├── Visualize
↓
Gemini LLM
↓
Session Memory & Evaluation
```

---

## 🧩 What is MCP (Mode Control Protocol)?

MCP is a backend orchestration layer that:
- Routes slide content to different AI modes
- Uses structured prompts per mode
- Tracks user performance across sessions

Supported modes:
- `memorize`
- `quiz`
- `game`
- `visualize`

---

## 🔌 API Endpoints (Backend)

### Upload PPT
```
POST /upload-ppt
```

### MCP Modes
```
POST /mcp/memorize/{slide_no}
POST /mcp/quiz/{slide_no}
POST /mcp/game/{slide_no}
POST /mcp/visualize/{slide_no}
```

### Session Summary
```
GET /session/{session_id}/summary
```

---

## 🛠️ Google Technologies Used

- **Google Gemini API** – LLM reasoning & content generation  
- **FastAPI** – High-performance backend  
- **Google Cloud compatible architecture**  
- **Vertex AI ready design** (future extension)

---

## 🚧 Future Enhancements

- Voice-based learning
- Difficulty-adaptive quizzes
- Learning streaks & gamification
- Export visualizations as notes
- Classroom analytics dashboard

---

## 🏆 Why Slide2Learn is Hackathon-Worthy

- Solves a **real learning problem**
- Strong use of **Google AI**
- Clear technical depth (MCP + session memory)
- Highly demoable & scalable
- Education + AI = real-world impact

---

## 👥 Team

Built with ❤️ for **GDG TechSprint Hackathon**

---

## 🚀 Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+
- Google Gemini API key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/mahirdesai2004/slide2learn.git
cd slide2learn
```

2. **Backend Setup**
```bash
cd backend
pip install -r requirements.txt
# Set your Gemini API key
export GEMINI_API_KEY="your_api_key_here"
python main.py
```

3. **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

4. **Access the application**
- Frontend: `https://slide2-learn.vercel.app/`
- Backend: `https://slide2learn.onrender.com`

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- GDG Community for organizing TechSprint Hackathon
- Google AI for Gemini API
- All open-source libraries used in this project

---

**Happy Learning! 🎓**
