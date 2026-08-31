import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './server/routes.js';
import { db } from './server/db.js';
import { CBTEngine } from './server/cbtEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser with large limit for backup/restore
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Seed sample completed attempts for sample participants if none exist yet
  const attempts = db.get('attempts');
  if (attempts.length === 0) {
    const participants = db.get('participants');
    const exam = db.get('exams')[0];
    if (participants.length > 0 && exam) {
      participants.forEach(p => {
        const { attempt, questions } = CBTEngine.startOrResumeAttempt(p.id, exam.id);
        // Simulate high quality answers
        questions.forEach(q => {
          // pick option with highest or 2nd highest weight
          const bestOpt = q.options.reduce((prev, curr) => (curr.weight || 0) > (prev.weight || 0) ? curr : prev, q.options[0]);
          CBTEngine.saveAnswer(attempt.id, p.id, q.question_id, bestOpt.display_key, false);
        });
        CBTEngine.submitAttempt(attempt.id, false);
      });
      console.log('Seeded sample participant test attempts for initial demonstration.');
    }
  }

  // Mount API Routes FIRST
  app.use('/api', apiRouter);

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Vite Middleware in Development, Static in Production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CBT SENDRATASIK server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
