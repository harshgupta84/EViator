# EViator

EViator is an AI-powered technical interview platform that helps assess candidates through automated interviews.

## 🚀 Features

- Resume processing and analysis
- AI-powered voice interaction with candidates
- Technical coding challenges
- Real-time code editor with multiple language support
- Webcam integration for face-to-face interaction
- Comprehensive interview reports with feedback

## 🏗️ Project Structure

### Frontend

- React application with TypeScript
- Voice interaction using Vapi AI
- Code editor using Monaco Editor
- PDF processing for resume uploads
- Google Generative AI integration

### Backend

- NestJS framework with TypeScript
- MongoDB database integration
- Authentication system
- RESTful API with Swagger documentation
- Environment configuration

## 🛠️ Installation

### Prerequisites

- Node.js (v18 or higher)
- MongoDB
- npm or yarn

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/EViator.git
   cd EViator
   ```

2. Set up the backend:
   ```bash
   cd backend
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the backend directory with:
   ```
   PORT=3000
   DB_URI=mongodb://127.0.0.1:27017/eviator
   JWT_SECRET=your_jwt_secret
   ```

4. Set up the frontend:
   ```bash
   cd ../frontend
   npm install
   ```

## 🚀 Running the Application

### Backend

```bash
cd backend
npm run start:dev  # Development mode
# or
npm run start:prod  # Production mode
```

Access the API documentation at: http://localhost:3000/api

### Frontend

```bash
cd frontend
npm run dev
```

The application will be available at: http://localhost:5173

## 🔍 Usage Flow

1. **Resume Upload**: Upload a candidate's resume and provide basic information
2. **AI Analysis**: System generates technical questions based on the resume
3. **Technical Interview**: AI interviewer conducts a voice-based interview
4. **Coding Challenge**: Candidate completes coding tasks in the integrated IDE
5. **Interview Report**: System generates a comprehensive report with feedback

## 🔧 API Documentation

The backend provides a Swagger UI for API documentation and testing.
Access it at http://localhost:3000/api when the backend is running.

## 🧪 Testing

### Backend

```bash
cd backend
npm run test       # Run unit tests
npm run test:e2e   # Run end-to-end tests
npm run test:cov   # Generate test coverage
```

### Frontend

```bash
cd frontend
npm run test
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! 