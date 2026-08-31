import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  User,
  Participant,
  Competency,
  PositionProfile,
  Question,
  ExamSettings,
  ExamBlueprint,
  Attempt,
  AttemptQuestionSnapshot,
  Answer,
  CompetencyScore,
  PositionScore,
  ActivityLog,
  AdminNote
} from '../src/types.js';
import { SEED_COMPETENCIES, SEED_POSITIONS, SEED_QUESTIONS } from './seedData.js';

export interface DatabaseSchema {
  users: User[];
  user_passwords: Record<string, string>; // user_id -> bcrypt hash
  participants: Participant[];
  categories: Array<{ id: string; name: string; description: string; created_at: string }>;
  competencies: Competency[];
  position_profiles: PositionProfile[];
  questions: Question[];
  exams: ExamSettings[];
  exam_blueprints: ExamBlueprint[];
  attempts: Attempt[];
  attempt_questions: Record<string, AttemptQuestionSnapshot[]>; // attempt_id -> questions
  answers: Record<string, Record<string, Answer>>; // attempt_id -> (question_id -> Answer)
  competency_scores: Record<string, CompetencyScore[]>; // attempt_id -> CompetencyScore[]
  position_scores: Record<string, PositionScore[]>; // attempt_id -> PositionScore[]
  activity_logs: ActivityLog[];
  settings: Record<string, any>;
  admin_notes: AdminNote[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');

class DatabaseEngine {
  private db: DatabaseSchema;
  private isSaving = false;
  private saveQueued = false;

  constructor() {
    this.ensureDirs();
    this.db = this.loadOrInitialize();
  }

  private ensureDirs() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
  }

  private loadOrInitialize(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return this.ensureStructure(parsed);
      } catch (err) {
        console.error('Error loading database, initializing fresh:', err);
      }
    }
    const fresh = this.createInitialData();
    this.saveDirect(fresh);
    return fresh;
  }

  private ensureStructure(data: Partial<DatabaseSchema>): DatabaseSchema {
    return {
      users: data.users || [],
      user_passwords: data.user_passwords || {},
      participants: data.participants || [],
      categories: data.categories || [],
      competencies: data.competencies || [],
      position_profiles: data.position_profiles || [],
      questions: data.questions || [],
      exams: data.exams || [],
      exam_blueprints: data.exam_blueprints || [],
      attempts: data.attempts || [],
      attempt_questions: data.attempt_questions || {},
      answers: data.answers || {},
      competency_scores: data.competency_scores || {},
      position_scores: data.position_scores || {},
      activity_logs: data.activity_logs || [],
      settings: data.settings || {},
      admin_notes: data.admin_notes || []
    };
  }

  private createInitialData(): DatabaseSchema {
    const now = new Date().toISOString();
    
    // 1. Create Default Admin User
    const adminId = 'usr_admin_01';
    const adminPasswordHash = bcrypt.hashSync('123456789', 10);
    const adminUser: User = {
      id: adminId,
      username: 'Pembina',
      role: 'admin',
      full_name: 'Pembina Ekstrakurikuler SENDRATASIK',
      created_at: now,
      updated_at: now
    };

    // 2. Create Competencies
    const competencies: Competency[] = SEED_COMPETENCIES.map((c, index) => ({
      id: `comp_${index + 1}`,
      code: c.code,
      name: c.name,
      weight: c.weight,
      description: c.description,
      indicators: c.indicators,
      created_at: now
    }));

    const compMap = new Map(competencies.map(c => [c.code, c.id]));

    // 3. Create Position Profiles
    const position_profiles: PositionProfile[] = SEED_POSITIONS.map((p, index) => ({
      id: `pos_${index + 1}`,
      code: p.code,
      position_name: p.position_name,
      description: p.description,
      priority_weights: p.priority_weights
    }));

    // 4. Create Questions
    const questions: Question[] = SEED_QUESTIONS.map((q, index) => {
      const compId = compMap.get(q.competency_code) || competencies[0].id;
      const comp = competencies.find(c => c.id === compId);
      return {
        id: `q_${index + 1}`,
        competency_id: compId,
        competency_code: q.competency_code,
        competency_name: comp?.name || 'Kompetensi',
        question_text: q.question_text,
        options: q.options,
        status: 'Approved',
        difficulty: q.difficulty,
        indicator: q.indicator,
        explanation: q.explanation,
        is_sample: true,
        created_by: 'Pembina',
        created_at: now,
        updated_at: now
      };
    });

    // 5. Default Exam Settings
    const defaultExam: ExamSettings = {
      id: 'exam_sendratasik_2026',
      title: 'Tes Kemampuan Organisasi Eksekutif SENDRATASIK MAN Purbalingga',
      duration_minutes: 60,
      total_questions: 60,
      randomize_questions: true,
      randomize_options: true,
      autosave_enabled: true,
      show_participant_score: true,
      show_participant_rank: false,
      show_competency_profile: true,
      show_position_recommendation: false,
      allow_view_answers: false,
      one_active_attempt: true,
      activity_monitoring_enabled: true,
      difficulty_distribution: {
        easy_percent: 20,
        medium_percent: 50,
        hard_percent: 30
      },
      thresholds: {
        sangat_sesuai: 85,
        sesuai: 75
      },
      is_active: true,
      updated_at: now
    };

    // 6. Exam Blueprints (Default 60 questions distribution)
    const blueprintDist: Record<string, number> = {
      KEPEMIMPINAN: 7,
      INTEGRITAS: 6,
      DISIPLIN: 6,
      KOMUNIKASI: 5,
      KERJA_SAMA: 6,
      PROBLEM_SOLVING: 6,
      PENGAMBILAN_KEPUTUSAN: 5,
      MANAJEMEN_KONFLIK: 4,
      MANAJEMEN_WAKTU: 4,
      KREATIVITAS: 3,
      ADAPTASI: 4,
      PROFESIONALISME: 4
    };

    const exam_blueprints: ExamBlueprint[] = Object.entries(blueprintDist).map(([code, count], idx) => ({
      id: `bp_${idx + 1}`,
      exam_id: defaultExam.id,
      competency_id: compMap.get(code) || competencies[0].id,
      target_count: count
    }));

    // 7. Initial Categories
    const categories = [
      { id: 'cat_1', name: 'Situasi Latihan & Rehearsal', description: 'Skenario dinamika latihan rutin dan gladi kotor', created_at: now },
      { id: 'cat_2', name: 'Situasi Pertunjukan & Panggung', description: 'Skenario kendala teknis dan darurat saat pementasan', created_at: now },
      { id: 'cat_3', name: 'Situasi Organisasi & Tim', description: 'Skenario manajemen divisi dan hubungan internal', created_at: now },
      { id: 'cat_4', name: 'Situasi Kepemimpinan & Kebijakan', description: 'Skenario pengambilan keputusan strategis dan arahan', created_at: now },
      { id: 'cat_5', name: 'Situasi Keuangan & Aset', description: 'Skenario transparansi dana kas dan pemeliharaan alat', created_at: now },
      { id: 'cat_6', name: 'Situasi Prestasi & Lomba', description: 'Skenario evaluasi, sportivitas, dan dedikasi lomba', created_at: now }
    ];

    // 8. Add 3 Seed Sample Participants for instant testing
    const sampleParticipantsData = [
      {
        nisn: '0071234561',
        name: 'Ahmad Faiz Al-Hafidz',
        class_grade: 'XI MIPA 1',
        major: 'MIPA',
        gender: 'Laki-laki' as const,
        phone: '081234567891',
        email: 'ahmad.faiz@madrasah.id',
        primary_choice: 'Ketua Umum Eksekutif SENDRATASIK',
        alternative_choice: 'Koordinator Divisi Seni Musik / Vokal',
        motivation: 'Bertekad membawa SENDRATASIK MAN Purbalingga berprestasi di tingkat provinsi dengan kepemimpinan yang berakhlak mulia dan inovatif.'
      },
      {
        nisn: '0071234562',
        name: 'Naila Rahmawati',
        class_grade: 'XI IPS 2',
        major: 'IPS',
        gender: 'Perempuan' as const,
        phone: '081234567892',
        email: 'naila.rahma@madrasah.id',
        primary_choice: 'Sekretaris Eksekutif',
        alternative_choice: 'Koordinator Hubungan Masyarakat & Publikasi',
        motivation: 'Tertarik mengoptimalkan arsip administrasi digital dan memperkuat publikasi kesenian madrasah di media sosial.'
      },
      {
        nisn: '0071234563',
        name: 'Rian Bagus Prasetyo',
        class_grade: 'X Keagamaan 1',
        major: 'Keagamaan',
        gender: 'Laki-laki' as const,
        phone: '081234567893',
        email: 'rian.bagus@madrasah.id',
        primary_choice: 'Koordinator Divisi Seni Tari & Koreografi',
        alternative_choice: 'Koordinator Sarana, Prasarana & Tata Panggung',
        motivation: 'Ingin melestarikan khazanah tari kreasi bernuansa Islami dan memperkuat kedisiplinan pentas anggota junior.'
      }
    ];

    const users: User[] = [adminUser];
    const user_passwords: Record<string, string> = {
      [adminId]: adminPasswordHash
    };
    const participants: Participant[] = [];

    sampleParticipantsData.forEach((sp, idx) => {
      const uId = `usr_part_${idx + 1}`;
      const pId = `part_${idx + 1}`;
      users.push({
        id: uId,
        username: sp.nisn,
        role: 'participant',
        full_name: sp.name,
        created_at: now,
        updated_at: now
      });
      user_passwords[uId] = bcrypt.hashSync(sp.nisn, 10);
      participants.push({
        id: pId,
        user_id: uId,
        nisn: sp.nisn,
        name: sp.name,
        class_grade: sp.class_grade,
        major: sp.major,
        gender: sp.gender,
        phone: sp.phone,
        email: sp.email,
        primary_choice: sp.primary_choice,
        alternative_choice: sp.alternative_choice,
        motivation: sp.motivation,
        created_at: now,
        updated_at: now
      });
    });

    const initialLogs: ActivityLog[] = [
      {
        id: 'log_init',
        user_id: adminId,
        user_name: 'Pembina',
        action_type: 'SYSTEM_INIT',
        description: 'Sistem CBT Seleksi Eksekutif SENDRATASIK berhasil diinisialisasi.',
        created_at: now
      }
    ];

    return {
      users,
      user_passwords,
      participants,
      categories,
      competencies,
      position_profiles,
      questions,
      exams: [defaultExam],
      exam_blueprints,
      attempts: [],
      attempt_questions: {},
      answers: {},
      competency_scores: {},
      position_scores: {},
      activity_logs: initialLogs,
      settings: {
        theme: 'light',
        school_name: 'MAN Purbalingga',
        organization_name: 'SENDRATASIK'
      },
      admin_notes: []
    };
  }

  private saveDirect(data: DatabaseSchema) {
    try {
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Error saving database to file:', err);
    }
  }

  public save() {
    if (this.isSaving) {
      this.saveQueued = true;
      return;
    }
    this.isSaving = true;
    try {
      this.saveDirect(this.db);
    } finally {
      this.isSaving = false;
      if (this.saveQueued) {
        this.saveQueued = false;
        this.save();
      }
    }
  }

  public get<K extends keyof DatabaseSchema>(table: K): DatabaseSchema[K] {
    return this.db[table];
  }

  public set<K extends keyof DatabaseSchema>(table: K, value: DatabaseSchema[K]) {
    this.db[table] = value;
    this.save();
  }

  public logActivity(log: Omit<ActivityLog, 'id' | 'created_at'>) {
    const newLog: ActivityLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      created_at: new Date().toISOString(),
      ...log
    };
    this.db.activity_logs.unshift(newLog);
    // Keep max 2000 logs
    if (this.db.activity_logs.length > 2000) {
      this.db.activity_logs = this.db.activity_logs.slice(0, 2000);
    }
    this.save();
  }

  public createBackup(): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup_sendratasik_${timestamp}.json`;
    const backupPath = path.join(BACKUP_DIR, filename);
    fs.writeFileSync(backupPath, JSON.stringify(this.db, null, 2), 'utf-8');
    return filename;
  }

  public restoreBackup(data: Partial<DatabaseSchema>): boolean {
    const validated = this.ensureStructure(data);
    this.db = validated;
    this.save();
    return true;
  }

  public getFullDump(): DatabaseSchema {
    return JSON.parse(JSON.stringify(this.db));
  }
}

export const db = new DatabaseEngine();
