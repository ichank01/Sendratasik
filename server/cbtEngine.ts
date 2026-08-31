import { db } from './db.js';
import {
  Attempt,
  AttemptQuestionSnapshot,
  Answer,
  CompetencyScore,
  PositionScore,
  FitCategory,
  AttemptResult,
  Difficulty
} from '../src/types.js';

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export class CBTEngine {
  public static startOrResumeAttempt(participantId: string, examId: string): { attempt: Attempt; questions: AttemptQuestionSnapshot[]; isNew: boolean } {
    const attempts = db.get('attempts');
    const existingAttempt = attempts.find(
      a => a.participant_id === participantId && a.exam_id === examId && a.status === 'in_progress'
    );

    const now = new Date();

    if (existingAttempt) {
      // Check if server timer expired
      const expiresAt = new Date(existingAttempt.expires_at).getTime();
      if (now.getTime() > expiresAt) {
        // Auto-submit expired attempt
        this.submitAttempt(existingAttempt.id, true);
        const updated = db.get('attempts').find(a => a.id === existingAttempt.id)!;
        const questions = db.get('attempt_questions')[existingAttempt.id] || [];
        return { attempt: updated, questions, isNew: false };
      }

      const questions = db.get('attempt_questions')[existingAttempt.id] || [];
      return { attempt: existingAttempt, questions, isNew: false };
    }

    // Check if participant already completed one attempt and one_active_attempt is true
    const completedAttempt = attempts.find(
      a => a.participant_id === participantId && a.exam_id === examId && a.status === 'completed'
    );
    const exam = db.get('exams').find(e => e.id === examId) || db.get('exams')[0];

    if (completedAttempt && exam.one_active_attempt) {
      const questions = db.get('attempt_questions')[completedAttempt.id] || [];
      return { attempt: completedAttempt, questions, isNew: false };
    }

    // Create New Attempt
    const newAttemptId = `att_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const startedAt = now.toISOString();
    const durationMs = (exam.duration_minutes || 60) * 60 * 1000;
    const expiresAt = new Date(now.getTime() + durationMs).toISOString();

    const participant = db.get('participants').find(p => p.id === participantId);

    const newAttempt: Attempt = {
      id: newAttemptId,
      exam_id: exam.id,
      participant_id: participantId,
      participant_name: participant?.name,
      participant_nisn: participant?.nisn,
      participant_class: participant?.class_grade,
      status: 'in_progress',
      started_at: startedAt,
      expires_at: expiresAt,
      tab_switch_count: 0,
      fullscreen_exit_count: 0,
      refresh_count: 0,
      reconnect_count: 0,
      created_at: startedAt,
      updated_at: startedAt
    };

    // Select questions according to blueprints
    const blueprints = db.get('exam_blueprints').filter(b => b.exam_id === exam.id);
    const allApprovedQuestions = db.get('questions').filter(q => q.status === 'Approved');
    const competencies = db.get('competencies');

    let selectedQuestions: typeof allApprovedQuestions = [];
    const usedIds = new Set<string>();

    if (blueprints.length > 0) {
      for (const bp of blueprints) {
        const available = allApprovedQuestions.filter(
          q => q.competency_id === bp.competency_id && !usedIds.has(q.id)
        );
        const target = Math.min(bp.target_count, available.length);
        const shuffled = exam.randomize_questions ? shuffleArray(available) : available;
        const picked = shuffled.slice(0, target);
        picked.forEach(p => {
          selectedQuestions.push(p);
          usedIds.add(p.id);
        });
      }
    }

    // If target total_questions not reached, fill with remaining approved questions
    if (selectedQuestions.length < exam.total_questions) {
      const remaining = allApprovedQuestions.filter(q => !usedIds.has(q.id));
      const needed = exam.total_questions - selectedQuestions.length;
      const shuffledRemaining = exam.randomize_questions ? shuffleArray(remaining) : remaining;
      shuffledRemaining.slice(0, needed).forEach(p => {
        selectedQuestions.push(p);
        usedIds.add(p.id);
      });
    }

    // Final shuffle if randomize_questions is enabled
    if (exam.randomize_questions) {
      selectedQuestions = shuffleArray(selectedQuestions);
    }

    // Build question snapshots with randomized options
    const snapshots: AttemptQuestionSnapshot[] = selectedQuestions.map((q, index) => {
      const comp = competencies.find(c => c.id === q.competency_id);
      const originalOptions: Array<{ original_key: 'A' | 'B' | 'C' | 'D' | 'E'; text: string; weight: number }> = [
        { original_key: 'A', text: q.options.A.text, weight: q.options.A.weight },
        { original_key: 'B', text: q.options.B.text, weight: q.options.B.weight },
        { original_key: 'C', text: q.options.C.text, weight: q.options.C.weight },
        { original_key: 'D', text: q.options.D.text, weight: q.options.D.weight },
        { original_key: 'E', text: q.options.E.text, weight: q.options.E.weight }
      ];

      const optionPool = exam.randomize_options ? shuffleArray(originalOptions) : originalOptions;
      const displayKeys: Array<'A' | 'B' | 'C' | 'D' | 'E'> = ['A', 'B', 'C', 'D', 'E'];

      const optionsSnapshot = optionPool.map((opt, optIdx) => ({
        display_key: displayKeys[optIdx],
        original_key: opt.original_key,
        text: opt.text,
        weight: opt.weight
      }));

      return {
        question_id: q.id,
        order_index: index + 1,
        competency_id: q.competency_id,
        competency_name: comp?.name || q.competency_name || 'Kompetensi',
        question_text: q.question_text,
        difficulty: q.difficulty as Difficulty,
        options: optionsSnapshot
      };
    });

    // Save attempt and attempt_questions
    attempts.push(newAttempt);
    db.set('attempts', attempts);

    const attemptQuestionsMap = db.get('attempt_questions');
    attemptQuestionsMap[newAttemptId] = snapshots;
    db.set('attempt_questions', attemptQuestionsMap);

    const answersMap = db.get('answers');
    answersMap[newAttemptId] = {};
    db.set('answers', answersMap);

    db.logActivity({
      user_id: participant?.user_id,
      participant_id: participantId,
      user_name: participant?.name || 'Peserta',
      action_type: 'START_EXAM',
      description: `Peserta ${participant?.name} (${participant?.nisn}) memulai pengerjaan tes CBT.`,
      metadata: { attempt_id: newAttemptId, total_questions: snapshots.length }
    });

    return { attempt: newAttempt, questions: snapshots, isNew: true };
  }

  public static saveAnswer(
    attemptId: string,
    participantId: string,
    questionId: string,
    selectedDisplayKey: 'A' | 'B' | 'C' | 'D' | 'E' | null,
    isDoubtful = false
  ): { success: boolean; error?: string } {
    const attempts = db.get('attempts');
    const attempt = attempts.find(a => a.id === attemptId);

    if (!attempt) {
      return { success: false, error: 'Sesi ujian tidak ditemukan.' };
    }

    if (attempt.participant_id !== participantId) {
      return { success: false, error: 'Akses tidak sah terhadap sesi ujian ini.' };
    }

    if (attempt.status !== 'in_progress') {
      return { success: false, error: 'Ujian telah selesai. Jawaban tidak dapat diubah.' };
    }

    const now = new Date();
    // 15 seconds grace period for network latency
    const expiresAt = new Date(attempt.expires_at).getTime() + 15000;
    if (now.getTime() > expiresAt) {
      this.submitAttempt(attemptId, true);
      return { success: false, error: 'Waktu ujian telah berakhir.' };
    }

    const snapshots = db.get('attempt_questions')[attemptId] || [];
    const questionSnap = snapshots.find(s => s.question_id === questionId);

    if (!questionSnap) {
      return { success: false, error: 'Soal tidak ditemukan dalam sesi ujian ini.' };
    }

    let selectedOriginalKey: 'A' | 'B' | 'C' | 'D' | 'E' | null = null;
    let selectedWeight = 0;

    if (selectedDisplayKey) {
      const selectedOpt = questionSnap.options.find(o => o.display_key === selectedDisplayKey);
      if (selectedOpt) {
        selectedOriginalKey = selectedOpt.original_key;
        selectedWeight = selectedOpt.weight || 0;
      }
    }

    const answersMap = db.get('answers');
    if (!answersMap[attemptId]) {
      answersMap[attemptId] = {};
    }

    const existingAnswer = answersMap[attemptId][questionId];
    const timestamp = now.toISOString();

    const updatedAnswer: Answer = {
      id: existingAnswer ? existingAnswer.id : `ans_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      attempt_id: attemptId,
      question_id: questionId,
      selected_display_key: selectedDisplayKey,
      selected_original_key: selectedOriginalKey,
      selected_weight: selectedWeight,
      is_doubtful: isDoubtful,
      answered_at: existingAnswer ? existingAnswer.answered_at : timestamp,
      updated_at: timestamp
    };

    answersMap[attemptId][questionId] = updatedAnswer;
    db.set('answers', answersMap);

    return { success: true };
  }

  public static recordIntegrityEvent(
    attemptId: string,
    participantId: string,
    eventType: 'TAB_SWITCH' | 'FULLSCREEN_EXIT' | 'PAGE_REFRESH' | 'RECONNECT'
  ) {
    const attempts = db.get('attempts');
    const attempt = attempts.find(a => a.id === attemptId);

    if (!attempt || attempt.participant_id !== participantId) return;

    if (eventType === 'TAB_SWITCH') attempt.tab_switch_count += 1;
    if (eventType === 'FULLSCREEN_EXIT') attempt.fullscreen_exit_count += 1;
    if (eventType === 'PAGE_REFRESH') attempt.refresh_count += 1;
    if (eventType === 'RECONNECT') attempt.reconnect_count += 1;

    attempt.updated_at = new Date().toISOString();
    db.set('attempts', attempts);

    db.logActivity({
      participant_id: participantId,
      user_name: attempt.participant_name || 'Peserta',
      action_type: eventType,
      description: `Peringatan integritas ujian [${eventType}]: ${attempt.participant_name} (${attempt.participant_nisn})`,
      metadata: { attempt_id: attemptId }
    });
  }

  public static submitAttempt(attemptId: string, isAutoSubmit = false): { success: boolean; result?: AttemptResult; error?: string } {
    const attempts = db.get('attempts');
    const attempt = attempts.find(a => a.id === attemptId);

    if (!attempt) {
      return { success: false, error: 'Sesi ujian tidak ditemukan.' };
    }

    if (attempt.status === 'completed') {
      const result = this.getAttemptResult(attemptId);
      return { success: true, result: result || undefined };
    }

    const snapshots = db.get('attempt_questions')[attemptId] || [];
    const answers = db.get('answers')[attemptId] || {};
    const competencies = db.get('competencies');
    const positions = db.get('position_profiles');
    const exam = db.get('exams').find(e => e.id === attempt.exam_id) || db.get('exams')[0];

    let totalRawScore = 0;
    let answeredCount = 0;

    // Per-competency tracking: competency_id -> { raw: number, max: number }
    const compStats: Record<string, { raw: number; max: number }> = {};
    competencies.forEach(c => {
      compStats[c.id] = { raw: 0, max: 0 };
    });

    snapshots.forEach(qSnap => {
      const ans = answers[qSnap.question_id];
      const weight = ans ? ans.selected_weight : 0;
      if (ans && ans.selected_display_key) {
        answeredCount++;
      }
      totalRawScore += weight;

      if (!compStats[qSnap.competency_id]) {
        compStats[qSnap.competency_id] = { raw: 0, max: 0 };
      }
      compStats[qSnap.competency_id].raw += weight;
      compStats[qSnap.competency_id].max += 5; // Each question max weight is 5
    });

    const maxTotalScore = snapshots.length * 5;
    const finalScore = maxTotalScore > 0 ? Number(((totalRawScore / maxTotalScore) * 100).toFixed(2)) : 0;

    const finishedAt = new Date().toISOString();
    attempt.status = 'completed';
    attempt.finished_at = finishedAt;
    attempt.raw_score = totalRawScore;
    attempt.max_score = maxTotalScore;
    attempt.final_score = finalScore;
    attempt.updated_at = finishedAt;
    db.set('attempts', attempts);

    // Compute normalized competency scores
    const calculatedCompScores: CompetencyScore[] = competencies.map(c => {
      const stats = compStats[c.id] || { raw: 0, max: 0 };
      const normalized = stats.max > 0 ? Number(((stats.raw / stats.max) * 100).toFixed(2)) : 0;
      return {
        competency_id: c.id,
        competency_code: c.code,
        competency_name: c.name,
        raw_score: stats.raw,
        max_score: stats.max,
        normalized_score: normalized
      };
    });

    const compScoresMap = db.get('competency_scores');
    compScoresMap[attemptId] = calculatedCompScores;
    db.set('competency_scores', compScoresMap);

    // Compute Position Matching Scores based on priority blueprint
    const calculatedPositionScores: PositionScore[] = positions.map(pos => {
      let weightedSum = 0;
      let totalWeight = 0;

      Object.entries(pos.priority_weights).forEach(([compCode, weightPct]) => {
        const compScoreObj = calculatedCompScores.find(cs => cs.competency_code === compCode);
        const compScore = compScoreObj ? compScoreObj.normalized_score : 0;
        weightedSum += (compScore * weightPct);
        totalWeight += weightPct;
      });

      const matchPct = totalWeight > 0 ? Number((weightedSum / totalWeight).toFixed(2)) : 0;

      let fitCat: FitCategory = 'Perlu Pengembangan';
      if (matchPct >= (exam.thresholds?.sangat_sesuai || 85)) {
        fitCat = 'Sangat Sesuai';
      } else if (matchPct >= (exam.thresholds?.sesuai || 75)) {
        fitCat = 'Sesuai';
      }

      return {
        position_id: pos.id,
        position_name: pos.position_name,
        code: pos.code,
        match_percentage: matchPct,
        fit_category: fitCat
      };
    });

    // Sort positions by match_percentage descending
    calculatedPositionScores.sort((a, b) => b.match_percentage - a.match_percentage);

    const posScoresMap = db.get('position_scores');
    posScoresMap[attemptId] = calculatedPositionScores;
    db.set('position_scores', posScoresMap);

    const participant = db.get('participants').find(p => p.id === attempt.participant_id);

    db.logActivity({
      user_id: participant?.user_id,
      participant_id: attempt.participant_id,
      user_name: participant?.name || 'Peserta',
      action_type: isAutoSubmit ? 'AUTO_SUBMIT_EXAM' : 'FINAL_SUBMIT_EXAM',
      description: `Ujian selesai (${isAutoSubmit ? 'Auto-submit waktu habis' : 'Diserahkan oleh peserta'}). Nilai: ${finalScore}/100`,
      metadata: { attempt_id: attemptId, final_score: finalScore, answered_count: answeredCount }
    });

    const result = this.getAttemptResult(attemptId);
    return { success: true, result: result || undefined };
  }

  public static getAttemptResult(attemptId: string): AttemptResult | null {
    const attempt = db.get('attempts').find(a => a.id === attemptId);
    if (!attempt) return null;

    const participant = db.get('participants').find(p => p.id === attempt.participant_id);
    if (!participant) return null;

    const snapshots = db.get('attempt_questions')[attemptId] || [];
    const answers = db.get('answers')[attemptId] || {};
    const compScores = db.get('competency_scores')[attemptId] || [];
    const posScores = db.get('position_scores')[attemptId] || [];

    let answeredCount = 0;
    Object.values(answers).forEach(ans => {
      if (ans.selected_display_key) answeredCount++;
    });

    // Calculate ranking among all completed attempts
    const allCompleted = db.get('attempts')
      .filter(a => a.status === 'completed')
      .sort((a, b) => (b.final_score || 0) - (a.final_score || 0));

    const rankIndex = allCompleted.findIndex(a => a.id === attemptId);
    const rank = rankIndex >= 0 ? rankIndex + 1 : undefined;

    // Identify Strengths (Top 3 competencies) and Areas for development (Bottom 3)
    const sortedComps = [...compScores].sort((a, b) => b.normalized_score - a.normalized_score);
    const strengths = sortedComps.slice(0, 3);
    const areas_for_development = [...sortedComps].reverse().slice(0, 3);

    const adminNoteObj = db.get('admin_notes').find(n => n.participant_id === participant.id);

    return {
      attempt,
      participant,
      final_score: attempt.final_score || 0,
      raw_score: attempt.raw_score || 0,
      max_score: attempt.max_score || 0,
      total_questions: snapshots.length,
      answered_questions: answeredCount,
      rank,
      total_participants: allCompleted.length,
      competency_scores: compScores,
      position_scores: posScores,
      strengths,
      areas_for_development,
      top_recommended_position: posScores[0],
      recommended_positions: posScores.slice(0, 3),
      admin_note: adminNoteObj?.note_text
    };
  }

  public static extendTime(attemptId: string, additionalMinutes: number, adminUser: { id: string; full_name: string }): { success: boolean; newExpiresAt?: string; error?: string } {
    const attempts = db.get('attempts');
    const attempt = attempts.find(a => a.id === attemptId);

    if (!attempt) {
      return { success: false, error: 'Sesi ujian tidak ditemukan.' };
    }

    if (attempt.status !== 'in_progress') {
      return { success: false, error: 'Waktu hanya dapat diperpanjang untuk ujian yang sedang berlangsung.' };
    }

    const currentExpiry = new Date(attempt.expires_at).getTime();
    const now = Date.now();
    const baseTime = Math.max(currentExpiry, now);
    const newExpiresAt = new Date(baseTime + additionalMinutes * 60 * 1000).toISOString();

    attempt.expires_at = newExpiresAt;
    attempt.updated_at = new Date().toISOString();
    db.set('attempts', attempts);

    db.logActivity({
      user_id: adminUser.id,
      participant_id: attempt.participant_id,
      user_name: adminUser.full_name,
      action_type: 'EXTEND_TIME',
      description: `Admin menambahkan waktu +${additionalMinutes} menit untuk peserta ${attempt.participant_name} (${attempt.participant_nisn}).`,
      metadata: { attempt_id: attemptId, additional_minutes: additionalMinutes, new_expires_at: newExpiresAt }
    });

    return { success: true, newExpiresAt };
  }

  public static forceSubmitByAdmin(attemptId: string, adminUser: { id: string; full_name: string }): { success: boolean; result?: AttemptResult; error?: string } {
    const attempts = db.get('attempts');
    const attempt = attempts.find(a => a.id === attemptId);

    if (!attempt) {
      return { success: false, error: 'Sesi ujian tidak ditemukan.' };
    }

    const submitRes = this.submitAttempt(attemptId, true);
    if (!submitRes.success) {
      return submitRes;
    }

    db.logActivity({
      user_id: adminUser.id,
      participant_id: attempt.participant_id,
      user_name: adminUser.full_name,
      action_type: 'FORCE_SUBMIT_EXAM',
      description: `Admin (${adminUser.full_name}) menghentikan dan menyerahkan secara paksa ujian peserta ${attempt.participant_name} (${attempt.participant_nisn}).`,
      metadata: { attempt_id: attemptId }
    });

    return submitRes;
  }

  public static resetAttempt(attemptId: string, adminUser: { id: string; full_name: string }, reason: string): boolean {
    const attempts = db.get('attempts');
    const attempt = attempts.find(a => a.id === attemptId);

    if (!attempt) return false;

    attempt.status = 'reset';
    attempt.reset_reason = reason;
    attempt.reset_by = adminUser.full_name;
    attempt.reset_at = new Date().toISOString();
    attempt.updated_at = attempt.reset_at;

    db.set('attempts', attempts);

    db.logActivity({
      user_id: adminUser.id,
      participant_id: attempt.participant_id,
      user_name: adminUser.full_name,
      action_type: 'RESET_ATTEMPT',
      description: `Reset pengerjaan ujian peserta ${attempt.participant_name} (${attempt.participant_nisn}). Alasan: ${reason}`,
      metadata: { attempt_id: attemptId, reason }
    });

    return true;
  }
}
