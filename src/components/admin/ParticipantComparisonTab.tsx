import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api.js';
import {
  Layers,
  Award,
  Users,
  CheckCircle,
  AlertCircle,
  Loader2,
  X
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

const RADAR_COLORS = ['#f59e0b', '#38bdf8', '#a855f7', '#34d399', '#f43f5e'];

export const ParticipantComparisonTab: React.FC = () => {
  const [participants, setParticipants] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [comparedData, setComparedData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isComparing, setIsComparing] = useState<boolean>(false);

  useEffect(() => {
    const loadCompletedParticipants = async () => {
      setIsLoading(true);
      try {
        const parts = await apiRequest('/admin/participants');
        const completed = Array.isArray(parts) ? parts.filter((p: any) => p.status === 'completed') : [];
        setParticipants(completed);

        // Pre-select first 2 or 3 completed candidates
        if (completed.length > 0) {
          const initIds = completed.slice(0, Math.min(3, completed.length)).map((p: any) => p.id);
          setSelectedIds(initIds);
        }
      } catch (err) {
        console.error('Failed to load participants:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCompletedParticipants();
  }, []);

  useEffect(() => {
    if (selectedIds.length === 0) {
      setComparedData([]);
      return;
    }

    const runComparison = async () => {
      setIsComparing(true);
      try {
        const res = await apiRequest('/admin/compare', {
          method: 'POST',
          body: JSON.stringify({ participant_ids: selectedIds })
        });
        setComparedData(res || []);
      } catch (err) {
        console.error('Comparison error:', err);
      } finally {
        setIsComparing(false);
      }
    };

    runComparison();
  }, [selectedIds]);

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(item => item !== id));
    } else {
      if (selectedIds.length >= 5) {
        alert('Maksimal perbandingan adalah 5 peserta sekaligus.');
        return;
      }
      setSelectedIds(prev => [...prev, id]);
    }
  };

  // Build radar multi-series dataset across 12 competencies
  const competencyNames = comparedData[0]?.competency_scores?.map((cs: any) => ({
    id: cs.competency_id,
    code: cs.competency_code,
    name: cs.competency_name
  })) || [];

  const radarChartData = competencyNames.map((comp: any) => {
    const point: any = {
      subject: String(comp?.name || comp?.code || '').slice(0, 14),
      fullName: comp?.name || 'Kompetensi'
    };

    comparedData.forEach((cand: any, idx: number) => {
      const scoreObj = (cand?.competency_scores || []).find((cs: any) => cs.competency_id === comp.id);
      point[`cand_${idx}`] = scoreObj ? (scoreObj.normalized_score ?? 0) : 0;
    });

    return point;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <h2 className="text-lg sm:text-xl font-bold text-white flex items-center space-x-2">
          <Layers className="w-5 h-5 text-amber-400" />
          <span>Komparasi Profil Kompetensi Antar Kandidat</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Bandingkan hingga 5 calon eksekutif secara bersamaan dalam radar multidimensi dan matriks kesesuaian posisi.
        </p>

        {/* Candidate Selector Badges */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap gap-2">
          {participants.map(p => {
            const isSelected = selectedIds.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => toggleSelect(p.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all border ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-md font-bold'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <span>{p.name} ({p.final_score})</span>
                {isSelected && <CheckCircle className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {isComparing ? (
        <div className="p-12 text-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto mb-2" />
          <span className="text-xs">Menyiapkan analisis komparasi...</span>
        </div>
      ) : comparedData.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400">
          <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-300">Pilih minimal 1 peserta untuk melihat komparasi radar.</p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Overlaid Multi-Radar Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-2">
              Overlaid Radar Chart 12 Kompetensi
            </h3>
            
            <div className="h-80 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarChartData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} />
                  
                  {comparedData.map((cand, idx) => (
                    <Radar
                      key={cand.participant.id}
                      name={cand.participant.name}
                      dataKey={`cand_${idx}`}
                      stroke={RADAR_COLORS[idx % RADAR_COLORS.length]}
                      fill={RADAR_COLORS[idx % RADAR_COLORS.length]}
                      fillOpacity={0.25}
                    />
                  ))}
                  
                  <Legend />
                  <Tooltip
                    content={({ payload }) => {
                      if (payload && payload.length > 0) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs shadow-xl space-y-1">
                            <p className="font-bold text-amber-400">{d.fullName}</p>
                            {comparedData.map((cand, idx) => (
                              <p key={cand.participant.id} className="text-slate-300 flex justify-between space-x-3">
                                <span>{cand.participant.name}:</span>
                                <strong className="font-mono" style={{ color: RADAR_COLORS[idx % RADAR_COLORS.length] }}>
                                  {d[`cand_${idx}`]}%
                                </strong>
                              </p>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Side-by-Side Comparison Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-5 border-b border-slate-800 font-bold text-sm text-white">
              Matriks Skor Kompetensi & Kesesuaian Jabatan
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Aspek Penilaian</th>
                    {comparedData.map((cand, idx) => (
                      <th key={cand.participant.id} className="px-4 py-3.5 text-center">
                        <div className="font-bold text-white text-xs" style={{ color: RADAR_COLORS[idx % RADAR_COLORS.length] }}>
                          {cand.participant.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">NISN: {cand.participant.nisn}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {/* Final Score Row */}
                  <tr className="bg-slate-950/60 font-bold text-white">
                    <td className="px-5 py-3">NILAI AKHIR CBT</td>
                    {comparedData.map(cand => (
                      <td key={cand.participant.id} className="px-4 py-3 text-center font-mono text-base text-amber-400 font-black">
                        {cand.final_score}
                      </td>
                    ))}
                  </tr>

                  {/* Top Recommendation Row */}
                  <tr className="bg-slate-950/40 font-semibold">
                    <td className="px-5 py-3">Rekomendasi Utama</td>
                    {comparedData.map(cand => (
                      <td key={cand.participant.id} className="px-4 py-3 text-center text-xs">
                        <div className="text-white font-bold">{cand.top_recommended_position?.position_name}</div>
                        <div className="text-[10px] text-amber-400 font-mono">({cand.top_recommended_position?.match_percentage}%)</div>
                      </td>
                    ))}
                  </tr>

                  {/* 12 Competencies Breakdown */}
                  {competencyNames.map((comp: any) => (
                    <tr key={comp.id} className="hover:bg-slate-850/50">
                      <td className="px-5 py-2.5 text-slate-200 font-medium">{comp.name}</td>
                      {comparedData.map(cand => {
                        const scoreObj = cand.competency_scores.find((cs: any) => cs.competency_id === comp.id);
                        return (
                          <td key={cand.participant.id} className="px-4 py-2.5 text-center font-mono font-semibold text-slate-300">
                            {scoreObj ? `${scoreObj.normalized_score}%` : '0%'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
