import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from './db.js';
import {
  AuthRequest,
  generateToken,
  authenticateToken,
  requireAdmin,
  requireParticipant,
  hashPassword,
  verifyPassword
} from './auth.js';
import { CBTEngine } from './cbtEngine.js';
import { generateSJTQuestionsWithAI } from './gemini.js';
import { Participant, Question, ExamSettings, ExamBlueprint, QuestionStatus, Difficulty } from '../src/types.js';

export const apiRouter = Router();

// ==========================================
// 1. AUTHENTICATION & PROFILE
// ==========================================

apiRouter.post('/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username/NISN dan password wajib diisi.' });
  }

  const users = db.get('users');
  const user = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());

  if (!user) {
    return res.status(401).json({ error: 'Akun tidak ditemukan. Periksa kembali NISN/Username Anda.' });
  }

  const passwords = db.get('user_passwords');
  const hash = passwords[user.id];

  if (!hash || !verifyPassword(password, hash)) {
    return res.status(401).json({ error: 'Password yang Anda masukkan salah.' });
  }

  const token = generateToken(user);
  let participant: Participant | undefined;

  if (user.role === 'participant') {
    participant = db.get('participants').find(p => p.user_id === user.id);
  }

  db.logActivity({
    user_id: user.id,
    participant_id: participant?.id,
    user_name: user.full_name,
    action_type: 'LOGIN',
    description: `User ${user.full_name} (${user.username}) berhasil login.`
  });

  return res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      full_name: user.full_name
    },
    participant
  });
});

apiRouter.post('/auth/register', (req, res) => {
  const {
    nisn,
    name,
    class_grade,
    major,
    gender,
    phone,
    email,
    primary_choice,
    alternative_choice,
    motivation
  } = req.body;

  if (!nisn || !name || !class_grade || !gender || !primary_choice) {
    return res.status(400).json({ error: 'Lengkapi data pendaftaran wajib (NISN, Nama, Kelas, Jenis Kelamin, Pilihan Divisi).' });
  }

  const cleanNisn = nisn.trim();
  const existingUser = db.get('users').find(u => u.username === cleanNisn);
  const existingPart = db.get('participants').find(p => p.nisn === cleanNisn);

  if (existingUser || existingPart) {
    return res.status(400).json({ error: `NISN ${cleanNisn} sudah terdaftar dalam sistem. Silakan login.` });
  }

  const now = new Date().toISOString();
  const userId = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
  const participantId = `part_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;

  const newUser = {
    id: userId,
    username: cleanNisn,
    role: 'participant' as const,
    full_name: name.trim(),
    created_at: now,
    updated_at: now
  };

  const newParticipant: Participant = {
    id: participantId,
    user_id: userId,
    nisn: cleanNisn,
    name: name.trim(),
    class_grade: class_grade.trim(),
    major: major ? major.trim() : '-',
    gender: gender === 'Perempuan' ? 'Perempuan' : 'Laki-laki',
    phone: phone ? phone.trim() : '-',
    email: email ? email.trim() : '-',
    primary_choice: primary_choice.trim(),
    alternative_choice: alternative_choice ? alternative_choice.trim() : '-',
    motivation: motivation ? motivation.trim() : '-',
    created_at: now,
    updated_at: now
  };

  const users = db.get('users');
  users.push(newUser);
  db.set('users', users);

  const passwords = db.get('user_passwords');
  passwords[userId] = hashPassword(cleanNisn); // Default password is NISN
  db.set('user_passwords', passwords);

  const participants = db.get('participants');
  participants.push(newParticipant);
  db.set('participants', participants);

  const token = generateToken(newUser);

  db.logActivity({
    user_id: userId,
    participant_id: participantId,
    user_name: name.trim(),
    action_type: 'REGISTER',
    description: `Pendaftaran peserta baru: ${name.trim()} (NISN: ${cleanNisn}) Kelas ${class_grade}.`
  });

  return res.status(201).json({
    token,
    user: newUser,
    participant: newParticipant
  });
});

apiRouter.get('/auth/me', authenticateToken, (req: AuthRequest, res: Response) => {
  const user = req.user!;
  let participant: Participant | undefined;

  if (user.role === 'participant') {
    participant = db.get('participants').find(p => p.user_id === user.id);
  }

  return res.json({
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      full_name: user.full_name
    },
    participant
  });
});

apiRouter.post('/auth/change-password', authenticateToken, (req: AuthRequest, res: Response) => {
  const { current_password, new_password } = req.body;
  const user = req.user!;

  if (!current_password || !new_password) {
    return res.status(400).json({ error: 'Password lama dan password baru wajib diisi.' });
  }

  if (new_password.length < 6) {
    return res.status(400).json({ error: 'Password baru minimal 6 karakter.' });
  }

  const passwords = db.get('user_passwords');
  const currentHash = passwords[user.id];

  if (!currentHash || !verifyPassword(current_password, currentHash)) {
    return res.status(400).json({ error: 'Password lama Anda tidak sesuai.' });
  }

  passwords[user.id] = hashPassword(new_password);
  db.set('user_passwords', passwords);

  db.logActivity({
    user_id: user.id,
    user_name: user.full_name,
    action_type: 'CHANGE_PASSWORD',
    description: `Pengguna ${user.full_name} mengubah kata sandi akun.`
  });

  return res.json({ success: true, message: 'Password berhasil diperbarui.' });
});

// ==========================================
// 2. CBT ENGINE & PARTICIPANT ACTIONS
// ==========================================

apiRouter.get('/cbt/active-exam', authenticateToken, (req: AuthRequest, res: Response) => {
  const exam = db.get('exams')[0] || null;
  const user = req.user!;
  let participant = db.get('participants').find(p => p.user_id === user.id);
  let activeAttempt = null;
  let hasCompleted = false;

  if (participant && exam) {
    const attempts = db.get('attempts');
    activeAttempt = attempts.find(a => a.participant_id === participant!.id && a.exam_id === exam.id && a.status === 'in_progress');
    hasCompleted = attempts.some(a => a.participant_id === participant!.id && a.exam_id === exam.id && a.status === 'completed');
  }

  return res.json({
    exam,
    activeAttempt,
    hasCompleted,
    server_time: new Date().toISOString()
  });
});

apiRouter.post('/cbt/start', authenticateToken, requireParticipant, (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const participant = db.get('participants').find(p => p.user_id === user.id);

  if (!participant) {
    return res.status(404).json({ error: 'Data profil peserta tidak ditemukan.' });
  }

  const exam = db.get('exams')[0];
  if (!exam || !exam.is_active) {
    return res.status(400).json({ error: 'Ujian CBT sedang tidak aktif atau belum dibuka.' });
  }

  const { attempt, questions, isNew } = CBTEngine.startOrResumeAttempt(participant.id, exam.id);

  // SANITIZE QUESTIONS: Strip weights before sending to client for security
  const sanitizedQuestions = questions.map(q => ({
    question_id: q.question_id,
    order_index: q.order_index,
    competency_id: q.competency_id,
    competency_name: q.competency_name,
    question_text: q.question_text,
    difficulty: q.difficulty,
    options: q.options.map(opt => ({
      display_key: opt.display_key,
      text: opt.text
    }))
  }));

  // Retrieve saved answers
  const answersMap = db.get('answers')[attempt.id] || {};
  const currentAnswers: Record<string, { selected_display_key: string | null; is_doubtful: boolean }> = {};
  Object.entries(answersMap).forEach(([qId, ans]) => {
    currentAnswers[qId] = {
      selected_display_key: ans.selected_display_key,
      is_doubtful: ans.is_doubtful
    };
  });

  return res.json({
    attempt,
    questions: sanitizedQuestions,
    answers: currentAnswers,
    isNew,
    server_time: new Date().toISOString()
  });
});

apiRouter.post('/cbt/answer', authenticateToken, requireParticipant, (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const participant = db.get('participants').find(p => p.user_id === user.id);

  if (!participant) {
    return res.status(404).json({ error: 'Profil peserta tidak ditemukan.' });
  }

  const { attempt_id, question_id, selected_display_key, is_doubtful } = req.body;

  if (!attempt_id || !question_id) {
    return res.status(400).json({ error: 'Parameter attempt_id dan question_id wajib diisi.' });
  }

  const result = CBTEngine.saveAnswer(
    attempt_id,
    participant.id,
    question_id,
    selected_display_key || null,
    Boolean(is_doubtful)
  );

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  return res.json({ success: true, server_time: new Date().toISOString() });
});

apiRouter.post('/cbt/integrity-event', authenticateToken, requireParticipant, (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const participant = db.get('participants').find(p => p.user_id === user.id);

  if (!participant) return res.status(404).json({ error: 'Not found' });

  const { attempt_id, event_type } = req.body;
  if (attempt_id && event_type) {
    CBTEngine.recordIntegrityEvent(attempt_id, participant.id, event_type);
  }

  return res.json({ received: true });
});

apiRouter.post('/cbt/heartbeat', authenticateToken, requireParticipant, (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const participant = db.get('participants').find(p => p.user_id === user.id);

  if (!participant) {
    return res.status(404).json({ error: 'Peserta tidak ditemukan' });
  }

  const { attempt_id } = req.body;
  if (!attempt_id) {
    return res.status(400).json({ error: 'Parameter attempt_id diperlukan' });
  }

  const attempts = db.get('attempts');
  const attempt = attempts.find(a => a.id === attempt_id);

  if (!attempt || attempt.participant_id !== participant.id) {
    return res.status(404).json({ error: 'Sesi ujian tidak valid' });
  }

  const now = new Date();
  const exam = db.get('exams').find(e => e.id === attempt.exam_id) || db.get('exams')[0];

  // Auto-expire check
  if (attempt.status === 'in_progress') {
    const expireTime = new Date(attempt.expires_at).getTime();
    if (now.getTime() > expireTime) {
      CBTEngine.submitAttempt(attempt.id, true);
      const updated = db.get('attempts').find(a => a.id === attempt.id)!;
      return res.json({
        status: updated.status,
        expires_at: updated.expires_at,
        server_time: now.toISOString(),
        is_expired: true,
        exam_active: exam.is_active !== false
      });
    }
  }

  return res.json({
    status: attempt.status,
    expires_at: attempt.expires_at,
    server_time: now.toISOString(),
    is_expired: false,
    exam_active: exam.is_active !== false
  });
});

apiRouter.post('/cbt/submit', authenticateToken, requireParticipant, (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const participant = db.get('participants').find(p => p.user_id === user.id);

  if (!participant) {
    return res.status(404).json({ error: 'Profil peserta tidak ditemukan.' });
  }

  const { attempt_id } = req.body;
  if (!attempt_id) {
    return res.status(400).json({ error: 'Parameter attempt_id wajib disertakan.' });
  }

  const result = CBTEngine.submitAttempt(attempt_id, false);

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  return res.json(result);
});

apiRouter.get('/cbt/result', authenticateToken, requireParticipant, (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const participant = db.get('participants').find(p => p.user_id === user.id);

  if (!participant) {
    return res.status(404).json({ error: 'Profil peserta tidak ditemukan.' });
  }

  const exam = db.get('exams')[0];
  const attempts = db.get('attempts').filter(a => a.participant_id === participant.id && a.status === 'completed');
  const latestAttempt = attempts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

  if (!latestAttempt) {
    return res.status(404).json({ error: 'Belum ada hasil ujian yang telah diselesaikan.' });
  }

  const fullResult = CBTEngine.getAttemptResult(latestAttempt.id);
  if (!fullResult) {
    return res.status(404).json({ error: 'Hasil ujian tidak ditemukan.' });
  }

  // Filter output according to exam privacy settings for participant
  const responseData: any = {
    participant: fullResult.participant,
    attempt: {
      id: fullResult.attempt.id,
      started_at: fullResult.attempt.started_at,
      finished_at: fullResult.attempt.finished_at,
      status: fullResult.attempt.status
    },
    settings: {
      show_participant_score: exam.show_participant_score,
      show_participant_rank: exam.show_participant_rank,
      show_competency_profile: exam.show_competency_profile,
      show_position_recommendation: exam.show_position_recommendation
    }
  };

  if (exam.show_participant_score) {
    responseData.final_score = fullResult.final_score;
    responseData.total_questions = fullResult.total_questions;
    responseData.answered_questions = fullResult.answered_questions;
  }

  if (exam.show_participant_rank) {
    responseData.rank = fullResult.rank;
    responseData.total_participants = fullResult.total_participants;
  }

  if (exam.show_competency_profile) {
    responseData.competency_scores = fullResult.competency_scores;
    responseData.strengths = fullResult.strengths;
    responseData.areas_for_development = fullResult.areas_for_development;
  }

  if (exam.show_position_recommendation) {
    responseData.position_scores = fullResult.position_scores;
    responseData.top_recommended_position = fullResult.top_recommended_position;
    responseData.recommended_positions = fullResult.recommended_positions;
  }

  return res.json(responseData);
});

// ==========================================
// 3. ADMIN DASHBOARD & ANALYTICS
// ==========================================

const getAdminDashboardStats = () => {
  const participants = db.get('participants');
  const attempts = db.get('attempts');
  const completedAttempts = attempts.filter(a => a.status === 'completed');
  const inProgressAttempts = attempts.filter(a => a.status === 'in_progress');
  const competencies = db.get('competencies');
  const positions = db.get('position_profiles');

  const scores = completedAttempts.map(a => a.final_score || 0);
  const avgScore = scores.length > 0 ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)) : 0;
  const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
  const minScore = scores.length > 0 ? Math.min(...scores) : 0;

  // Average per competency across all completed attempts
  const compScoresMap = db.get('competency_scores');
  const compAverages = competencies.map(c => {
    let total = 0;
    let count = 0;
    completedAttempts.forEach(att => {
      const attScores = compScoresMap[att.id] || [];
      const scoreObj = attScores.find(s => s.competency_id === c.id);
      if (scoreObj) {
        total += scoreObj.normalized_score;
        count++;
      }
    });
    const avg = count > 0 ? Number((total / count).toFixed(1)) : 0;
    return {
      competency_id: c.id,
      competency_code: c.code,
      competency_name: c.name,
      code: c.code,
      name: c.name,
      avg_score: avg,
      average: avg
    };
  });

  // Top candidate per position
  const posScoresMap = db.get('position_scores');
  const topFitPerPosition = positions.map(pos => {
    let bestCandidate: any = null;

    completedAttempts.forEach(att => {
      const part = participants.find(p => p.id === att.participant_id);
      const posScores = posScoresMap[att.id] || [];
      const posMatch = posScores.find(p => p.position_id === pos.id);
      if (part && posMatch && (!bestCandidate || posMatch.match_percentage > bestCandidate.match_percentage)) {
        bestCandidate = {
          position_name: pos.position_name,
          candidate_name: part.name,
          name: part.name,
          nisn: part.nisn,
          class_grade: part.class_grade,
          match_percentage: posMatch.match_percentage,
          fit_category: posMatch.fit_category,
          final_score: att.final_score || 0
        };
      }
    });

    return {
      position_id: pos.id,
      position_name: pos.position_name,
      top_candidate: bestCandidate
    };
  });

  const overview = {
    total_participants: participants.length,
    completed_attempts: completedAttempts.length,
    in_progress_attempts: inProgressAttempts.length,
    not_started: Math.max(0, participants.length - completedAttempts.length - inProgressAttempts.length),
    average_score: avgScore,
    highest_score: maxScore,
    lowest_score: minScore
  };

  return {
    overview,
    total_participants: participants.length,
    completed_exams: completedAttempts.length,
    completed_attempts: completedAttempts.length,
    in_progress_exams: inProgressAttempts.length,
    in_progress_attempts: inProgressAttempts.length,
    not_started: overview.not_started,
    average_score: avgScore,
    highest_score: maxScore,
    lowest_score: minScore,
    competency_averages: compAverages,
    top_fit_per_position: topFitPerPosition,
    top_candidates_per_position: topFitPerPosition
  };
};

apiRouter.get('/admin/dashboard', authenticateToken, requireAdmin, (_req: AuthRequest, res: Response) => {
  return res.json(getAdminDashboardStats());
});

apiRouter.get('/admin/stats', authenticateToken, requireAdmin, (_req: AuthRequest, res: Response) => {
  return res.json(getAdminDashboardStats());
});

// ==========================================
// 4. PARTICIPANTS MANAGEMENT (ADMIN)
// ==========================================

apiRouter.get('/admin/participants', authenticateToken, requireAdmin, (_req: AuthRequest, res: Response) => {
  const participants = db.get('participants');
  const attempts = db.get('attempts');
  const posScoresMap = db.get('position_scores');

  const list = participants.map(part => {
    const userAttempts = attempts.filter(a => a.participant_id === part.id);
    const completed = userAttempts.find(a => a.status === 'completed');
    const inProgress = userAttempts.find(a => a.status === 'in_progress');

    let topRecommendation = '-';
    if (completed) {
      const posScores = posScoresMap[completed.id] || [];
      if (posScores.length > 0) {
        topRecommendation = posScores[0].position_name;
      }
    }

    return {
      ...part,
      status: completed ? 'completed' : inProgress ? 'in_progress' : 'not_started',
      attempt_id: completed?.id || inProgress?.id || null,
      final_score: completed?.final_score || null,
      top_recommendation: topRecommendation
    };
  });

  return res.json(list);
});

apiRouter.post('/admin/participants', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { nisn, name, class_grade, major, gender, phone, email, primary_choice, alternative_choice, motivation } = req.body;

  if (!nisn || !name || !class_grade || !primary_choice) {
    return res.status(400).json({ error: 'NISN, Nama, Kelas, dan Pilihan Divisi wajib diisi.' });
  }

  const cleanNisn = nisn.trim();
  const existing = db.get('participants').find(p => p.nisn === cleanNisn);
  if (existing) {
    return res.status(400).json({ error: `Peserta dengan NISN ${cleanNisn} sudah ada.` });
  }

  const now = new Date().toISOString();
  const userId = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
  const participantId = `part_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;

  const newUser = {
    id: userId,
    username: cleanNisn,
    role: 'participant' as const,
    full_name: name.trim(),
    created_at: now,
    updated_at: now
  };

  const newPart: Participant = {
    id: participantId,
    user_id: userId,
    nisn: cleanNisn,
    name: name.trim(),
    class_grade: class_grade.trim(),
    major: major || '-',
    gender: gender === 'Perempuan' ? 'Perempuan' : 'Laki-laki',
    phone: phone || '-',
    email: email || '-',
    primary_choice: primary_choice.trim(),
    alternative_choice: alternative_choice || '-',
    motivation: motivation || '-',
    created_at: now,
    updated_at: now
  };

  const users = db.get('users');
  users.push(newUser);
  db.set('users', users);

  const passwords = db.get('user_passwords');
  passwords[userId] = hashPassword(cleanNisn);
  db.set('user_passwords', passwords);

  const parts = db.get('participants');
  parts.push(newPart);
  db.set('participants', parts);

  db.logActivity({
    user_id: req.user!.id,
    participant_id: participantId,
    user_name: req.user!.full_name,
    action_type: 'CREATE_PARTICIPANT',
    description: `Admin menambahkan peserta: ${name.trim()} (NISN: ${cleanNisn}).`
  });

  return res.status(201).json(newPart);
});

apiRouter.put('/admin/participants/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const parts = db.get('participants');
  const partIndex = parts.findIndex(p => p.id === id);

  if (partIndex === -1) {
    return res.status(404).json({ error: 'Data peserta tidak ditemukan.' });
  }

  const existing = parts[partIndex];
  const { name, class_grade, major, gender, phone, email, primary_choice, alternative_choice, motivation } = req.body;

  const updated: Participant = {
    ...existing,
    name: name !== undefined ? name.trim() : existing.name,
    class_grade: class_grade !== undefined ? class_grade.trim() : existing.class_grade,
    major: major !== undefined ? major.trim() : existing.major,
    gender: gender !== undefined ? gender : existing.gender,
    phone: phone !== undefined ? phone.trim() : existing.phone,
    email: email !== undefined ? email.trim() : existing.email,
    primary_choice: primary_choice !== undefined ? primary_choice.trim() : existing.primary_choice,
    alternative_choice: alternative_choice !== undefined ? alternative_choice.trim() : existing.alternative_choice,
    motivation: motivation !== undefined ? motivation.trim() : existing.motivation,
    updated_at: new Date().toISOString()
  };

  parts[partIndex] = updated;
  db.set('participants', parts);

  return res.json(updated);
});

apiRouter.delete('/admin/participants/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const parts = db.get('participants');
  const part = parts.find(p => p.id === id);

  if (!part) {
    return res.status(404).json({ error: 'Peserta tidak ditemukan.' });
  }

  db.set('participants', parts.filter(p => p.id !== id));
  db.set('users', db.get('users').filter(u => u.id !== part.user_id));

  // Delete attempts
  const attempts = db.get('attempts');
  const partAttempts = attempts.filter(a => a.participant_id === id);
  db.set('attempts', attempts.filter(a => a.participant_id !== id));

  const attemptQuestions = db.get('attempt_questions');
  const answers = db.get('answers');
  const compScores = db.get('competency_scores');
  const posScores = db.get('position_scores');

  partAttempts.forEach(att => {
    delete attemptQuestions[att.id];
    delete answers[att.id];
    delete compScores[att.id];
    delete posScores[att.id];
  });

  db.set('attempt_questions', attemptQuestions);
  db.set('answers', answers);
  db.set('competency_scores', compScores);
  db.set('position_scores', posScores);

  db.logActivity({
    user_id: req.user!.id,
    user_name: req.user!.full_name,
    action_type: 'DELETE_PARTICIPANT',
    description: `Admin menghapus peserta ${part.name} (${part.nisn}).`
  });

  return res.json({ success: true, message: 'Peserta berhasil dihapus.' });
});

apiRouter.post('/admin/participants/batch', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { items, update_existing = true } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Data peserta batch tidak valid atau kosong.' });
  }

  const users = db.get('users');
  const passwords = db.get('user_passwords');
  const parts = db.get('participants');
  const now = new Date().toISOString();

  let addedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  for (const item of items) {
    const rawNisn = String(item.nisn || '').trim();
    const rawName = String(item.name || '').trim();
    const rawClass = String(item.class_grade || '').trim();
    const rawChoice = String(item.primary_choice || '').trim();

    if (!rawNisn || !rawName) continue;

    const existingIndex = parts.findIndex(p => p.nisn === rawNisn);

    if (existingIndex !== -1) {
      if (update_existing) {
        const existing = parts[existingIndex];
        parts[existingIndex] = {
          ...existing,
          name: rawName || existing.name,
          class_grade: rawClass || existing.class_grade,
          major: item.major ? String(item.major).trim() : existing.major,
          gender: item.gender === 'Perempuan' ? 'Perempuan' : 'Laki-laki',
          phone: item.phone ? String(item.phone).trim() : existing.phone,
          email: item.email ? String(item.email).trim() : existing.email,
          primary_choice: rawChoice || existing.primary_choice,
          alternative_choice: item.alternative_choice ? String(item.alternative_choice).trim() : existing.alternative_choice,
          motivation: item.motivation ? String(item.motivation).trim() : existing.motivation,
          updated_at: now
        };

        const uIndex = users.findIndex(u => u.id === existing.user_id);
        if (uIndex !== -1) {
          users[uIndex].full_name = rawName;
          users[uIndex].updated_at = now;
        }
        updatedCount++;
      } else {
        skippedCount++;
      }
    } else {
      const userId = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
      const participantId = `part_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;

      users.push({
        id: userId,
        username: rawNisn,
        role: 'participant',
        full_name: rawName,
        created_at: now,
        updated_at: now
      });

      passwords[userId] = hashPassword(rawNisn);

      parts.push({
        id: participantId,
        user_id: userId,
        nisn: rawNisn,
        name: rawName,
        class_grade: rawClass || 'X',
        major: item.major ? String(item.major).trim() : '-',
        gender: item.gender === 'Perempuan' ? 'Perempuan' : 'Laki-laki',
        phone: item.phone ? String(item.phone).trim() : '-',
        email: item.email ? String(item.email).trim() : '-',
        primary_choice: rawChoice || 'Ketua Umum Eksekutif SENDRATASIK',
        alternative_choice: item.alternative_choice ? String(item.alternative_choice).trim() : '-',
        motivation: item.motivation ? String(item.motivation).trim() : '-',
        created_at: now,
        updated_at: now
      });

      addedCount++;
    }
  }

  db.set('users', users);
  db.set('user_passwords', passwords);
  db.set('participants', parts);

  db.logActivity({
    user_id: req.user!.id,
    user_name: req.user!.full_name,
    action_type: 'CREATE_PARTICIPANT',
    description: `Admin mengimpor peserta via Excel: ${addedCount} baru ditambahkan, ${updatedCount} data diperbarui, ${skippedCount} dilewati.`
  });

  return res.json({
    success: true,
    count: addedCount,
    updated_count: updatedCount,
    skipped_count: skippedCount,
    total: items.length
  });
});

// ==========================================
// 5. QUESTION BANK MANAGEMENT (ADMIN)
// ==========================================

apiRouter.get('/admin/questions', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { competency_id, difficulty, status, search } = req.query;
  let questions = db.get('questions');

  if (competency_id) {
    questions = questions.filter(q => q.competency_id === String(competency_id));
  }
  if (difficulty) {
    questions = questions.filter(q => q.difficulty === String(difficulty));
  }
  if (status) {
    questions = questions.filter(q => q.status === String(status));
  }
  if (search) {
    const qStr = String(search).toLowerCase();
    questions = questions.filter(q =>
      q.question_text.toLowerCase().includes(qStr) ||
      q.indicator.toLowerCase().includes(qStr) ||
      (q.competency_name && q.competency_name.toLowerCase().includes(qStr))
    );
  }

  return res.json(questions);
});

apiRouter.post('/admin/questions', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const {
    competency_id,
    question_text,
    options,
    status = 'Approved',
    difficulty = 'Sedang',
    indicator = '',
    explanation = ''
  } = req.body;

  if (!competency_id || !question_text || !options || !options.A || !options.B || !options.C || !options.D || !options.E) {
    return res.status(400).json({ error: 'Lengkapi pertanyaan dan 5 opsi jawaban (A, B, C, D, E) beserta bobot masing-masing.' });
  }

  const competencies = db.get('competencies');
  const comp = competencies.find(c => c.id === competency_id);

  const newQuestion: Question = {
    id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    competency_id,
    competency_code: comp?.code,
    competency_name: comp?.name || 'Kompetensi',
    question_text: question_text.trim(),
    options: {
      A: { text: options.A.text.trim(), weight: Number(options.A.weight) || 1 },
      B: { text: options.B.text.trim(), weight: Number(options.B.weight) || 1 },
      C: { text: options.C.text.trim(), weight: Number(options.C.weight) || 1 },
      D: { text: options.D.text.trim(), weight: Number(options.D.weight) || 1 },
      E: { text: options.E.text.trim(), weight: Number(options.E.weight) || 1 }
    },
    status: status as QuestionStatus,
    difficulty: difficulty as Difficulty,
    indicator: indicator ? indicator.trim() : '-',
    explanation: explanation ? explanation.trim() : '-',
    is_sample: false,
    created_by: req.user!.full_name,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const questions = db.get('questions');
  questions.unshift(newQuestion);
  db.set('questions', questions);

  db.logActivity({
    user_id: req.user!.id,
    user_name: req.user!.full_name,
    action_type: 'CREATE_QUESTION',
    description: `Admin membuat soal baru untuk kompetensi ${comp?.name || competency_id}.`
  });

  return res.status(201).json(newQuestion);
});

apiRouter.post('/admin/questions/batch', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { items, source = 'import' } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Data soal batch tidak valid.' });
  }

  const competencies = db.get('competencies');
  const questions = db.get('questions');
  const addedQuestions: Question[] = [];

  for (const item of items) {
    const { competency_id, competency_code, question_text, options, status = 'Approved', difficulty = 'Sedang', indicator = '', explanation = '' } = item;
    if (!question_text || !options) continue;

    let comp = competencies.find(c => c.id === competency_id);
    if (!comp && competency_code) {
      comp = competencies.find(c => c.code.toLowerCase() === competency_code.toLowerCase());
    }
    if (!comp && competencies.length > 0) {
      comp = competencies[0];
    }

    const newQuestion: Question = {
      id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      competency_id: comp?.id || competency_id || 'comp_1',
      competency_code: comp?.code || 'COMP_01',
      competency_name: comp?.name || 'Kompetensi',
      question_text: question_text.trim(),
      options: {
        A: { text: options.A?.text?.trim() || '', weight: Number(options.A?.weight) || 1 },
        B: { text: options.B?.text?.trim() || '', weight: Number(options.B?.weight) || 1 },
        C: { text: options.C?.text?.trim() || '', weight: Number(options.C?.weight) || 1 },
        D: { text: options.D?.text?.trim() || '', weight: Number(options.D?.weight) || 1 },
        E: { text: options.E?.text?.trim() || '', weight: Number(options.E?.weight) || 1 }
      },
      status: (status === 'Draft' ? 'Draft' : 'Approved') as QuestionStatus,
      difficulty: (['Mudah', 'Sedang', 'Sulit'].includes(difficulty) ? difficulty : 'Sedang') as Difficulty,
      indicator: indicator ? indicator.trim() : '-',
      explanation: explanation ? explanation.trim() : '-',
      is_sample: false,
      created_by: req.user!.full_name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    addedQuestions.push(newQuestion);
    questions.unshift(newQuestion);
  }

  db.set('questions', questions);

  const actionDesc = source === 'excel'
    ? `Admin mengunggah & mengimpor ${addedQuestions.length} butir soal dari berkas Excel (.xlsx).`
    : `Admin menambahkan ${addedQuestions.length} butir soal secara batch.`;

  db.logActivity({
    user_id: req.user!.id,
    user_name: req.user!.full_name,
    action_type: 'CREATE_QUESTION',
    description: actionDesc
  });

  return res.status(201).json({ success: true, count: addedQuestions.length, questions: addedQuestions });
});

apiRouter.put('/admin/questions/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const questions = db.get('questions');
  const qIndex = questions.findIndex(q => q.id === id);

  if (qIndex === -1) {
    return res.status(404).json({ error: 'Soal tidak ditemukan.' });
  }

  const existing = questions[qIndex];
  const { competency_id, question_text, options, status, difficulty, indicator, explanation } = req.body;

  let compName = existing.competency_name;
  let compCode = existing.competency_code;

  if (competency_id && competency_id !== existing.competency_id) {
    const comp = db.get('competencies').find(c => c.id === competency_id);
    if (comp) {
      compName = comp.name;
      compCode = comp.code;
    }
  }

  const updated: Question = {
    ...existing,
    competency_id: competency_id || existing.competency_id,
    competency_name: compName,
    competency_code: compCode,
    question_text: question_text !== undefined ? question_text.trim() : existing.question_text,
    options: options || existing.options,
    status: status || existing.status,
    difficulty: difficulty || existing.difficulty,
    indicator: indicator !== undefined ? indicator.trim() : existing.indicator,
    explanation: explanation !== undefined ? explanation.trim() : existing.explanation,
    updated_at: new Date().toISOString()
  };

  questions[qIndex] = updated;
  db.set('questions', questions);

  return res.json(updated);
});

apiRouter.delete('/admin/questions/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const questions = db.get('questions');
  const question = questions.find(q => q.id === id);

  if (!question) {
    return res.status(404).json({ error: 'Soal tidak ditemukan.' });
  }

  db.set('questions', questions.filter(q => q.id !== id));

  db.logActivity({
    user_id: req.user!.id,
    user_name: req.user!.full_name,
    action_type: 'DELETE_QUESTION',
    description: `Admin menghapus soal ID: ${id}.`
  });

  return res.json({ success: true, message: 'Soal berhasil dihapus dari bank soal.' });
});

apiRouter.post('/admin/questions/delete-samples', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const questions = db.get('questions');
  const nonSamples = questions.filter(q => !q.is_sample);
  const deletedCount = questions.length - nonSamples.length;

  db.set('questions', nonSamples);

  db.logActivity({
    user_id: req.user!.id,
    user_name: req.user!.full_name,
    action_type: 'DELETE_SAMPLE_QUESTIONS',
    description: `Admin menghapus ${deletedCount} soal contoh/sampel bawaan.`
  });

  return res.json({ success: true, deleted_count: deletedCount });
});

apiRouter.post('/admin/questions/ai-generate', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  const { competency_id, difficulty = 'Sedang', count = 3, context = '' } = req.body;

  if (!competency_id) {
    return res.status(400).json({ error: 'Pilih kompetensi target untuk pembuatan draf soal.' });
  }

  const comp = db.get('competencies').find(c => c.id === competency_id);
  if (!comp) {
    return res.status(404).json({ error: 'Kompetensi tidak ditemukan.' });
  }

  try {
    const drafts = await generateSJTQuestionsWithAI({
      competency_name: comp.name,
      competency_code: comp.code,
      difficulty,
      context,
      count: Math.min(Math.max(1, count), 10)
    });

    return res.json({ drafts });
  } catch (err: any) {
    console.error('AI question generation error:', err);
    return res.status(500).json({ error: err.message || 'Gagal menghasilkan draf soal dengan AI.' });
  }
});

// ==========================================
// 6. COMPETENCIES, POSITIONS, & BLUEPRINTS
// ==========================================

apiRouter.get('/admin/competencies', authenticateToken, requireAdmin, (_req: AuthRequest, res: Response) => {
  return res.json(db.get('competencies'));
});

apiRouter.put('/admin/competencies/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, weight, description, indicators } = req.body;
  const comps = db.get('competencies');
  const compIndex = comps.findIndex(c => c.id === id);

  if (compIndex === -1) {
    return res.status(404).json({ error: 'Kompetensi tidak ditemukan.' });
  }

  comps[compIndex] = {
    ...comps[compIndex],
    name: name !== undefined ? name.trim() : comps[compIndex].name,
    weight: weight !== undefined ? Number(weight) : comps[compIndex].weight,
    description: description !== undefined ? description.trim() : comps[compIndex].description,
    indicators: indicators !== undefined ? indicators : comps[compIndex].indicators
  };

  db.set('competencies', comps);
  return res.json(comps[compIndex]);
});

apiRouter.get('/admin/positions', authenticateToken, requireAdmin, (_req: AuthRequest, res: Response) => {
  return res.json(db.get('position_profiles'));
});

apiRouter.put('/admin/positions/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { position_name, description, priority_weights } = req.body;
  const positions = db.get('position_profiles');
  const pIndex = positions.findIndex(p => p.id === id);

  if (pIndex === -1) {
    return res.status(404).json({ error: 'Profil posisi tidak ditemukan.' });
  }

  positions[pIndex] = {
    ...positions[pIndex],
    position_name: position_name !== undefined ? position_name.trim() : positions[pIndex].position_name,
    description: description !== undefined ? description.trim() : positions[pIndex].description,
    priority_weights: priority_weights !== undefined ? priority_weights : positions[pIndex].priority_weights
  };

  db.set('position_profiles', positions);
  return res.json(positions[pIndex]);
});

apiRouter.get('/admin/exam-settings', authenticateToken, requireAdmin, (_req: AuthRequest, res: Response) => {
  const exam = db.get('exams')[0];
  const blueprints = db.get('exam_blueprints').filter(b => b.exam_id === exam.id);
  const competencies = db.get('competencies');

  const detailedBlueprints = blueprints.map(bp => {
    const comp = competencies.find(c => c.id === bp.competency_id);
    return {
      ...bp,
      competency_code: comp?.code,
      competency_name: comp?.name,
      competency_weight: comp?.weight
    };
  });

  return res.json({
    exam,
    blueprints: detailedBlueprints
  });
});

apiRouter.put('/admin/exam-settings', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const exam = db.get('exams')[0];
  const {
    title,
    duration_minutes,
    total_questions,
    randomize_questions,
    randomize_options,
    autosave_enabled,
    show_participant_score,
    show_participant_rank,
    show_competency_profile,
    show_position_recommendation,
    allow_view_answers,
    one_active_attempt,
    activity_monitoring_enabled,
    difficulty_distribution,
    thresholds,
    blueprints
  } = req.body;

  const updatedExam: ExamSettings = {
    ...exam,
    title: title !== undefined ? title.trim() : exam.title,
    duration_minutes: duration_minutes !== undefined ? Number(duration_minutes) : exam.duration_minutes,
    total_questions: total_questions !== undefined ? Number(total_questions) : exam.total_questions,
    randomize_questions: randomize_questions !== undefined ? Boolean(randomize_questions) : exam.randomize_questions,
    randomize_options: randomize_options !== undefined ? Boolean(randomize_options) : exam.randomize_options,
    autosave_enabled: autosave_enabled !== undefined ? Boolean(autosave_enabled) : exam.autosave_enabled,
    show_participant_score: show_participant_score !== undefined ? Boolean(show_participant_score) : exam.show_participant_score,
    show_participant_rank: show_participant_rank !== undefined ? Boolean(show_participant_rank) : exam.show_participant_rank,
    show_competency_profile: show_competency_profile !== undefined ? Boolean(show_competency_profile) : exam.show_competency_profile,
    show_position_recommendation: show_position_recommendation !== undefined ? Boolean(show_position_recommendation) : exam.show_position_recommendation,
    allow_view_answers: allow_view_answers !== undefined ? Boolean(allow_view_answers) : exam.allow_view_answers,
    one_active_attempt: one_active_attempt !== undefined ? Boolean(one_active_attempt) : exam.one_active_attempt,
    activity_monitoring_enabled: activity_monitoring_enabled !== undefined ? Boolean(activity_monitoring_enabled) : exam.activity_monitoring_enabled,
    difficulty_distribution: difficulty_distribution || exam.difficulty_distribution,
    thresholds: thresholds || exam.thresholds,
    updated_at: new Date().toISOString()
  };

  db.set('exams', [updatedExam]);

  if (Array.isArray(blueprints)) {
    const newBlueprints: ExamBlueprint[] = blueprints.map((bp: any, idx: number) => ({
      id: bp.id || `bp_${idx + 1}`,
      exam_id: updatedExam.id,
      competency_id: bp.competency_id,
      target_count: Number(bp.target_count) || 0
    }));
    db.set('exam_blueprints', newBlueprints);
  }

  db.logActivity({
    user_id: req.user!.id,
    user_name: req.user!.full_name,
    action_type: 'UPDATE_EXAM_SETTINGS',
    description: 'Admin memperbarui konfigurasi tes CBT dan blueprint distribusi soal.'
  });

  return res.json({ success: true, exam: updatedExam });
});

// ==========================================
// 7. RESULTS, RANKING, & CANDIDATE ANALYSIS
// ==========================================

apiRouter.get('/admin/results', authenticateToken, requireAdmin, (_req: AuthRequest, res: Response) => {
  const completedAttempts = db.get('attempts')
    .filter(a => a.status === 'completed')
    .sort((a, b) => (b.final_score || 0) - (a.final_score || 0));

  const results = completedAttempts.map((att, idx) => {
    const full = CBTEngine.getAttemptResult(att.id);
    return {
      rank: idx + 1,
      attempt_id: att.id,
      participant_id: full?.participant.id,
      nisn: full?.participant.nisn,
      name: full?.participant.name,
      class_grade: full?.participant.class_grade,
      primary_choice: full?.participant.primary_choice,
      alternative_choice: full?.participant.alternative_choice,
      final_score: full?.final_score,
      competency_scores: full?.competency_scores,
      recommended_positions: full?.recommended_positions,
      top_recommended_position: full?.top_recommended_position,
      integrity_summary: {
        tab_switches: att.tab_switch_count,
        fullscreen_exits: att.fullscreen_exit_count,
        refreshes: att.refresh_count,
        reconnects: att.reconnect_count
      },
      started_at: att.started_at,
      finished_at: att.finished_at
    };
  });

  return res.json(results);
});

apiRouter.get('/admin/results/:attemptId', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { attemptId } = req.params;
  const result = CBTEngine.getAttemptResult(attemptId);

  if (!result) {
    return res.status(404).json({ error: 'Hasil pengerjaan tidak ditemukan.' });
  }

  // Also include questions and participant's chosen answers for detailed review
  const snapshots = db.get('attempt_questions')[attemptId] || [];
  const answers = db.get('answers')[attemptId] || {};

  const detailedQuestions = snapshots.map(s => {
    const ans = answers[s.question_id];
    return {
      ...s,
      selected_display_key: ans?.selected_display_key || null,
      selected_weight: ans?.selected_weight || 0,
      is_doubtful: Boolean(ans?.is_doubtful)
    };
  });

  return res.json({
    ...result,
    questions: detailedQuestions
  });
});

apiRouter.post('/admin/results/:participantId/note', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { participantId } = req.params;
  const { note_text } = req.body;
  const notes = db.get('admin_notes');
  const existingIndex = notes.findIndex(n => n.participant_id === participantId);

  const now = new Date().toISOString();

  if (existingIndex >= 0) {
    notes[existingIndex] = {
      ...notes[existingIndex],
      note_text: note_text ? note_text.trim() : '',
      author_id: req.user!.id,
      author_name: req.user!.full_name,
      updated_at: now
    };
  } else {
    notes.push({
      id: `note_${Date.now()}`,
      participant_id: participantId,
      note_text: note_text ? note_text.trim() : '',
      author_id: req.user!.id,
      author_name: req.user!.full_name,
      created_at: now,
      updated_at: now
    });
  }

  db.set('admin_notes', notes);
  return res.json({ success: true, message: 'Catatan Pembina berhasil disimpan.' });
});

apiRouter.post('/admin/attempts/:attemptId/reset', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { attemptId } = req.params;
  const { reason } = req.body;

  if (!reason || !reason.trim()) {
    return res.status(400).json({ error: 'Alasan reset attempt wajib diisi.' });
  }

  const success = CBTEngine.resetAttempt(
    attemptId,
    { id: req.user!.id, full_name: req.user!.full_name },
    reason.trim()
  );

  if (!success) {
    return res.status(404).json({ error: 'Sesi attempt tidak ditemukan.' });
  }

  return res.json({ success: true, message: 'Pengerjaan berhasil di-reset. Peserta dapat memulai kembali tes CBT.' });
});

apiRouter.post('/admin/attempts/:attemptId/force-submit', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { attemptId } = req.params;
  const submitRes = CBTEngine.forceSubmitByAdmin(
    attemptId,
    { id: req.user!.id, full_name: req.user!.full_name }
  );

  if (!submitRes.success) {
    return res.status(400).json({ error: submitRes.error });
  }

  return res.json({ success: true, message: 'Ujian peserta berhasil dihentikan dan diserahkan secara paksa.', result: submitRes.result });
});

apiRouter.post('/admin/attempts/:attemptId/extend-time', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { attemptId } = req.params;
  const { minutes = 10 } = req.body;

  const extendRes = CBTEngine.extendTime(
    attemptId,
    Number(minutes) || 10,
    { id: req.user!.id, full_name: req.user!.full_name }
  );

  if (!extendRes.success) {
    return res.status(400).json({ error: extendRes.error });
  }

  return res.json({ success: true, message: `Waktu ujian berhasil diperpanjang +${minutes} menit.`, new_expires_at: extendRes.newExpiresAt });
});

apiRouter.get('/admin/live-monitor', authenticateToken, requireAdmin, (_req: AuthRequest, res: Response) => {
  const participants = db.get('participants');
  const attempts = db.get('attempts');
  const answersMap = db.get('answers');
  const questionsMap = db.get('attempt_questions');
  const now = Date.now();

  const liveList = participants.map(part => {
    const userAttempts = attempts.filter(a => a.participant_id === part.id);
    const inProgress = userAttempts.find(a => a.status === 'in_progress');
    const completed = userAttempts.find(a => a.status === 'completed');
    const latestAttempt = inProgress || completed || userAttempts[userAttempts.length - 1];

    let answeredCount = 0;
    let totalQuestions = 0;
    let remainingSeconds = 0;

    if (latestAttempt) {
      const answers = answersMap[latestAttempt.id] || {};
      const questions = questionsMap[latestAttempt.id] || [];
      totalQuestions = questions.length;
      answeredCount = Object.values(answers).filter(a => a.selected_display_key !== null).length;

      if (latestAttempt.status === 'in_progress') {
        const expTime = new Date(latestAttempt.expires_at).getTime();
        remainingSeconds = Math.max(0, Math.floor((expTime - now) / 1000));
      }
    }

    return {
      id: part.id,
      nisn: part.nisn,
      name: part.name,
      class_grade: part.class_grade,
      primary_choice: part.primary_choice,
      status: inProgress ? 'in_progress' : completed ? 'completed' : 'not_started',
      attempt_id: latestAttempt?.id || null,
      answered_count: answeredCount,
      total_questions: totalQuestions,
      final_score: completed?.final_score ?? null,
      remaining_seconds: remainingSeconds,
      tab_switches: latestAttempt?.tab_switch_count || 0,
      fullscreen_exits: latestAttempt?.fullscreen_exit_count || 0,
      started_at: latestAttempt?.started_at || null,
      finished_at: latestAttempt?.finished_at || null
    };
  });

  return res.json({
    total_participants: participants.length,
    active_in_progress: liveList.filter(p => p.status === 'in_progress').length,
    completed: liveList.filter(p => p.status === 'completed').length,
    not_started: liveList.filter(p => p.status === 'not_started').length,
    server_time: new Date().toISOString(),
    participants: liveList
  });
});

apiRouter.post('/admin/compare', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { participant_ids } = req.body;

  if (!Array.isArray(participant_ids) || participant_ids.length === 0 || participant_ids.length > 5) {
    return res.status(400).json({ error: 'Pilih antara 1 hingga 5 peserta untuk dibandingkan.' });
  }

  const attempts = db.get('attempts');
  const comparedList = participant_ids.map(pId => {
    const userCompleted = attempts.filter(a => a.participant_id === pId && a.status === 'completed');
    const latest = userCompleted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
    if (!latest) return null;
    return CBTEngine.getAttemptResult(latest.id);
  }).filter(Boolean);

  return res.json(comparedList);
});

// ==========================================
// 8. AUDIT LOGS, BACKUP, & RESTORE
// ==========================================

apiRouter.get('/admin/activity-logs', authenticateToken, requireAdmin, (_req: AuthRequest, res: Response) => {
  return res.json(db.get('activity_logs'));
});

apiRouter.get('/admin/backup', authenticateToken, requireAdmin, (_req: AuthRequest, res: Response) => {
  const dump = db.getFullDump();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename=backup_sendratasik_${new Date().toISOString().slice(0, 10)}.json`);
  return res.send(JSON.stringify(dump, null, 2));
});

apiRouter.post('/admin/restore', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const data = req.body;

  if (!data || typeof data !== 'object' || !data.users) {
    return res.status(400).json({ error: 'File data JSON backup tidak valid.' });
  }

  const success = db.restoreBackup(data);

  db.logActivity({
    user_id: req.user!.id,
    user_name: req.user!.full_name,
    action_type: 'RESTORE_BACKUP',
    description: 'Admin memulihkan data sistem dari file backup JSON.'
  });

  return res.json({ success, message: 'Database berhasil dipulihkan secara penuh.' });
});
