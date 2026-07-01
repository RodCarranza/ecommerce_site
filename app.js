// app.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

// Fix for ESM: Node doesn't give us __dirname by default anymore, so we calculate it
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Setup View Engine (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

// 2. Middleware Pipeline
app.use(express.static(path.join(__dirname, 'public'))); // Serves CSS/Images
app.use(express.urlencoded({ extended: true }));       // Parses form submissions
app.use(express.json());                               // Parses JSON data

// 3. Temporary Test Route (We will move this to standard routing later!)
app.get('/', (req, res) => {
    res.render('pages/index', { title: 'Welcome to Our Professional Shop' });
});

export default app;