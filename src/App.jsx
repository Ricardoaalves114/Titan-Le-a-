import React, { useState, useEffect, useMemo, useRef } from "react";
import { Plus, X, Trash2, Search, Dumbbell, Activity, User, ChevronRight, ChevronDown, Save, Calendar, TrendingUp, AlertCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// ---------- storage helpers ----------
const KEY = "titan-leca-data-v1";

async function loadData() {
  try {
    const res = await window.storage.get(KEY, true);
    if (res && res.value) return JSON.parse(res.value);
  } catch (e) {
    // key not found or error — start fresh
  }
  return { students: [] };
}

async function saveData(data) {
  try {
    await window.storage.set(KEY, JSON.stringify(data), true);
  } catch (e) {
    console.error("Erro ao guardar dados", e);
  }
}

// ---------- plate ring avatar ----------
const PLATE_COLORS = ["#C98A3E", "#5B8A72", "#5B6B73", "#B25146", "#8A6FA8"];
function colorForId(id) {
  let sum = 0;
  for (const c of String(id)) sum += c.charCodeAt(0);
  return PLATE_COLORS[sum % PLATE_COLORS.length];
}
function PlateRing({ name, id, size = 44 }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  const color = colorForId(id);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `repeating-conic-gradient(${color} 0deg 18deg, transparent 18deg 36deg)`,
        padding: 3,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          background: "#211E1A",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#EDE9E2",
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: size * 0.32,
          fontWeight: 600,
          letterSpacing: 0.5,
        }}
      >
        {initials || "?"}
      </div>
    </div>
  );
}

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

const emptyStudent = () => ({
  id: uid(),
  name: "",
  phone: "",
  email: "",
  joined: new Date().toISOString().slice(0, 10),
  goal: "",
  notes: "",
  plan: { days: [] },
  assessments: [],
});

// ---------- main app ----------
export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [tab, setTab] = useState("dados");
  const [query, setQuery] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const saveTimer = useRef(null);

  useEffect(() => {
    loadData().then((d) => {
      setData(d);
      setLoading(false);
      if (d.students.length) setSelectedId(d.students[0].id);
    });
  }, []);

  // debounce saves
  useEffect(() => {
    if (!data) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveData(data), 400);
    return () => clearTimeout(saveTimer.current);
  }, [data]);

  const students = data?.students || [];
  const filtered = useMemo(
    () =>
      students.filter((s) => s.name.toLowerCase().includes(query.toLowerCase())),
    [students, query]
  );
  const selected = students.find((s) => s.id === selectedId) || null;

  function updateStudent(id, patch) {
    setData((d) => ({
      ...d,
      students: d.students.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  }

  function addStudent(student) {
    setData((d) => ({ ...d, students: [...d.students, student] }));
    setSelectedId(student.id);
    setShowAdd(false);
    setTab("dados");
  }

  function deleteStudent(id) {
    setData((d) => ({ ...d, students: d.students.filter((s) => s.id !== id) }));
    if (selectedId === id) setSelectedId(null);
  }

  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#8A8478", fontSize: 13 }}>
          A carregar…
        </div>
      </div>
    );
  }

  return (
    <div style={styles.app}>
      <style>{fontImports}</style>
      <aside style={styles.sidebar}>
        <div style={styles.brand}>
          <div style={styles.brandMark}>TL</div>
          <div>
            <div style={styles.brandTitle}>TITAN LEÇA</div>
            <div style={styles.brandSub}>painel de coaches</div>
          </div>
        </div>

        <div style={styles.searchRow}>
          <Search size={14} color="#8A8478" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Procurar aluno…"
            style={styles.searchInput}
          />
        </div>

        <button style={styles.addBtn} onClick={() => setShowAdd(true)}>
          <Plus size={15} /> Novo aluno
        </button>

        <div style={styles.studentList}>
          {filtered.length === 0 && (
            <div style={styles.emptyHint}>
              {students.length === 0 ? "Ainda não há alunos registados." : "Sem resultados."}
            </div>
          )}
          {filtered.map((s) => (
            <div
              key={s.id}
              onClick={() => {
                setSelectedId(s.id);
                setTab("dados");
              }}
              style={{
                ...styles.studentRow,
                background: s.id === selectedId ? "#2A2621" : "transparent",
                borderLeft: s.id === selectedId ? "2px solid #C98A3E" : "2px solid transparent",
              }}
            >
              <PlateRing name={s.name || "?"} id={s.id} size={36} />
              <div style={{ minWidth: 0 }}>
                <div style={styles.studentName}>{s.name || "(sem nome)"}</div>
                <div style={styles.studentMeta}>{s.goal || "sem objetivo definido"}</div>
              </div>
              <ChevronRight size={14} color="#5B5650" style={{ marginLeft: "auto", flexShrink: 0 }} />
            </div>
          ))}
        </div>
      </aside>

      <main style={styles.main}>
        {!selected && (
          <div style={styles.noSelection}>
            <Dumbbell size={28} color="#3A362F" />
            <div style={{ color: "#8A8478", fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, marginTop: 10 }}>
              Seleciona um aluno, ou cria um novo, para veres os dados.
            </div>
          </div>
        )}

        {selected && (
          <StudentDetail
            student={selected}
            tab={tab}
            setTab={setTab}
            onUpdate={(patch) => updateStudent(selected.id, patch)}
            onDelete={() => deleteStudent(selected.id)}
          />
        )}
      </main>

      {showAdd && (
        <AddStudentModal onClose={() => setShowAdd(false)} onCreate={addStudent} />
      )}
    </div>
  );
}

// ---------- Add student modal ----------
function AddStudentModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [goal, setGoal] = useState("");

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <div style={styles.modalTitle}>Novo aluno</div>
          <X size={18} color="#8A8478" style={{ cursor: "pointer" }} onClick={onClose} />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Nome</label>
          <input autoFocus style={styles.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do aluno" />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Telemóvel</label>
          <input style={styles.input} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9xx xxx xxx" />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Objetivo</label>
          <input style={styles.input} value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Ex: hipertrofia, perda de gordura…" />
        </div>
        <button
          style={styles.saveBtn}
          disabled={!name.trim()}
          onClick={() => {
            const s = emptyStudent();
            s.name = name.trim();
            s.phone = phone.trim();
            s.goal = goal.trim();
            onCreate(s);
          }}
        >
          <Save size={14} /> Criar aluno
        </button>
      </div>
    </div>
  );
}

// ---------- Student detail ----------
function StudentDetail({ student, tab, setTab, onUpdate, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const tabs = [
    { id: "dados", label: "Dados", icon: User },
    { id: "plano", label: "Plano de treino", icon: Dumbbell },
    { id: "avaliacao", label: "Avaliação física", icon: Activity },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={styles.detailHeader}>
        <PlateRing name={student.name || "?"} id={student.id} size={52} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={styles.detailName}>{student.name || "(sem nome)"}</div>
          <div style={styles.detailMeta}>
            {student.phone || "sem contacto"} · desde{" "}
            {new Date(student.joined).toLocaleDateString("pt-PT")}
          </div>
        </div>
        {!confirmDelete ? (
          <button style={styles.iconBtn} onClick={() => setConfirmDelete(true)} title="Remover aluno">
            <Trash2 size={15} color="#8A8478" />
          </button>
        ) : (
          <div style={styles.confirmRow}>
            <span style={{ fontSize: 12, color: "#B25146", fontFamily: "'IBM Plex Mono', monospace" }}>
              Remover aluno?
            </span>
            <button style={styles.confirmYes} onClick={onDelete}>
              Sim
            </button>
            <button style={styles.confirmNo} onClick={() => setConfirmDelete(false)}>
              Não
            </button>
          </div>
        )}
      </div>

      <div style={styles.tabRow}>
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                ...styles.tabBtn,
                color: active ? "#EDE9E2" : "#8A8478",
                borderBottom: active ? "2px solid #C98A3E" : "2px solid transparent",
              }}
            >
              <Icon size={14} /> {t.label}
            </button>
          );
        })}
      </div>

      <div style={styles.tabContent}>
        {tab === "dados" && <DadosTab student={student} onUpdate={onUpdate} />}
        {tab === "plano" && <PlanoTab student={student} onUpdate={onUpdate} />}
        {tab === "avaliacao" && <AvaliacaoTab student={student} onUpdate={onUpdate} />}
      </div>
    </div>
  );
}

// ---------- Dados tab ----------
function DadosTab({ student, onUpdate }) {
  return (
    <div style={styles.panel}>
      <div style={styles.fieldGrid}>
        <Field label="Nome" value={student.name} onChange={(v) => onUpdate({ name: v })} />
        <Field label="Telemóvel" value={student.phone} onChange={(v) => onUpdate({ phone: v })} />
        <Field label="Email" value={student.email} onChange={(v) => onUpdate({ email: v })} />
        <Field
          label="Data de início"
          type="date"
          value={student.joined}
          onChange={(v) => onUpdate({ joined: v })}
        />
        <Field label="Objetivo" value={student.goal} onChange={(v) => onUpdate({ goal: v })} full />
      </div>
      <label style={styles.label}>Notas</label>
      <textarea
        style={styles.textarea}
        value={student.notes}
        onChange={(e) => onUpdate({ notes: e.target.value })}
        placeholder="Lesões, restrições, preferências…"
        rows={5}
      />
    </div>
  );
}

function Field({ label, value, onChange, type = "text", full }) {
  return (
    <div style={{ gridColumn: full ? "1 / -1" : "auto" }}>
      <label style={styles.label}>{label}</label>
      <input style={styles.input} type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

// ---------- Plano tab ----------
function makeWeekDays() {
  return Array.from({ length: 7 }, (_, i) => ({ id: uid(), label: `Treino ${i + 1}`, exercises: [] }));
}

function getWeeks(plan) {
  if (plan?.weeks) return plan.weeks;
  if (plan?.months) return plan.months.flatMap((m) => m.weeks);
  if (plan?.days && plan.days.length) return [{ id: uid(), label: "Semana 1", days: plan.days }];
  return [];
}

function PlanoTab({ student, onUpdate }) {
  const weeks = getWeeks(student.plan);
  const [collapsedWeeks, setCollapsedWeeks] = useState(new Set());

  function setWeeks(newWeeks) {
    onUpdate({ plan: { weeks: newWeeks } });
  }

  function toggleWeek(id) {
    setCollapsedWeeks((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function addWeek() {
    setWeeks([...weeks, { id: uid(), label: `Semana ${weeks.length + 1}`, days: makeWeekDays() }]);
  }
  function removeWeek(weekId) {
    setWeeks(weeks.filter((w) => w.id !== weekId));
  }
  function updateWeek(weekId, patch) {
    setWeeks(weeks.map((w) => (w.id === weekId ? { ...w, ...patch } : w)));
  }

  function addDay(weekId) {
    setWeeks(
      weeks.map((w) =>
        w.id !== weekId ? w : { ...w, days: [...w.days, { id: uid(), label: `Treino ${w.days.length + 1}`, exercises: [] }] }
      )
    );
  }
  function removeDay(weekId, dayId) {
    setWeeks(weeks.map((w) => (w.id !== weekId ? w : { ...w, days: w.days.filter((d) => d.id !== dayId) })));
  }
  function updateDay(weekId, dayId, patch) {
    setWeeks(
      weeks.map((w) => (w.id !== weekId ? w : { ...w, days: w.days.map((d) => (d.id === dayId ? { ...d, ...patch } : d)) }))
    );
  }

  function findDay(weekId, dayId) {
    return weeks.find((w) => w.id === weekId)?.days.find((d) => d.id === dayId);
  }

  function addExercise(weekId, dayId) {
    const day = findDay(weekId, dayId);
    updateDay(weekId, dayId, { exercises: [...day.exercises, { id: uid(), name: "", sets: "4", reps: "", load: "", notes: "" }] });
  }
  function updateExercise(weekId, dayId, exId, patch) {
    const day = findDay(weekId, dayId);
    updateDay(weekId, dayId, { exercises: day.exercises.map((ex) => (ex.id === exId ? { ...ex, ...patch } : ex)) });
  }
  function removeExercise(weekId, dayId, exId) {
    const day = findDay(weekId, dayId);
    updateDay(weekId, dayId, { exercises: day.exercises.filter((ex) => ex.id !== exId) });
  }

  function addCardio(weekId, dayId) {
    const day = findDay(weekId, dayId);
    const cardio = day.cardio || [];
    updateDay(weekId, dayId, { cardio: [...cardio, { id: uid(), name: "", duration: "", notes: "" }] });
  }
  function updateCardio(weekId, dayId, cardioId, patch) {
    const day = findDay(weekId, dayId);
    const cardio = day.cardio || [];
    updateDay(weekId, dayId, { cardio: cardio.map((c) => (c.id === cardioId ? { ...c, ...patch } : c)) });
  }
  function removeCardio(weekId, dayId, cardioId) {
    const day = findDay(weekId, dayId);
    const cardio = day.cardio || [];
    updateDay(weekId, dayId, { cardio: cardio.filter((c) => c.id !== cardioId) });
  }

  return (
    <div style={styles.panel}>
      {weeks.length === 0 && (
        <div style={styles.emptyBlock}>
          <AlertCircle size={16} color="#5B5650" />
          <span>Ainda não há semanas de treino. Adiciona a primeira — vem com 7 treinos prontos a preencher.</span>
        </div>
      )}

      {weeks.map((week) => {
        const weekOpen = !collapsedWeeks.has(week.id);
        return (
          <div key={week.id} style={styles.monthCard}>
            <div style={styles.monthHeader}>
              {weekOpen ? (
                <ChevronDown size={15} color="#8A8478" style={{ cursor: "pointer" }} onClick={() => toggleWeek(week.id)} />
              ) : (
                <ChevronRight size={15} color="#8A8478" style={{ cursor: "pointer" }} onClick={() => toggleWeek(week.id)} />
              )}
              <input
                style={styles.monthTitleInput}
                value={week.label}
                onChange={(e) => updateWeek(week.id, { label: e.target.value })}
              />
              <span style={styles.weekCountBadge}>{week.days.length} treinos</span>
              <Trash2 size={14} color="#8A8478" style={{ cursor: "pointer" }} onClick={() => removeWeek(week.id)} />
            </div>

            {weekOpen && (
              <div style={styles.monthBody}>
                {week.days.map((day) => (
                  <div key={day.id} style={styles.dayCard}>
                    <div style={styles.dayHeader}>
                      <input
                        style={styles.dayTitleInput}
                        value={day.label}
                        onChange={(e) => updateDay(week.id, day.id, { label: e.target.value })}
                      />
                      <Trash2 size={14} color="#8A8478" style={{ cursor: "pointer" }} onClick={() => removeDay(week.id, day.id)} />
                    </div>

                    <div style={styles.cardioBlock}>
                      <div style={styles.cardioTitle}>Cardio inicial</div>
                      {(day.cardio || []).length > 0 && (
                        <div style={styles.cardioTableHead}>
                          <span style={{ flex: 3 }}>Exercício</span>
                          <span style={{ flex: 1 }}>Duração</span>
                          <span style={{ flex: 2 }}>Notas</span>
                          <span style={{ width: 20 }} />
                        </div>
                      )}
                      {(day.cardio || []).map((c) => (
                        <div key={c.id} style={styles.exerciseRow}>
                          <input
                            style={{ ...styles.cellInput, flex: 3 }}
                            value={c.name}
                            onChange={(e) => updateCardio(week.id, day.id, c.id, { name: e.target.value })}
                            placeholder="Ex: passadeira, bike…"
                          />
                          <input
                            style={{ ...styles.cellInput, flex: 1 }}
                            value={c.duration}
                            onChange={(e) => updateCardio(week.id, day.id, c.id, { duration: e.target.value })}
                            placeholder="10min"
                          />
                          <input
                            style={{ ...styles.cellInput, flex: 2 }}
                            value={c.notes}
                            onChange={(e) => updateCardio(week.id, day.id, c.id, { notes: e.target.value })}
                            placeholder="opcional"
                          />
                          <X
                            size={14}
                            color="#5B5650"
                            style={{ cursor: "pointer", width: 20 }}
                            onClick={() => removeCardio(week.id, day.id, c.id)}
                          />
                        </div>
                      ))}
                      <button style={styles.addExerciseBtn} onClick={() => addCardio(week.id, day.id)}>
                        <Plus size={13} /> Cardio
                      </button>
                    </div>

                    <div style={styles.cardioTitle}>Exercícios</div>
                    <div style={styles.exerciseTableHead}>
                      <span style={{ flex: 4 }}>Exercício</span>
                      <span style={{ flex: 1 }}>Séries</span>
                      <span style={{ flex: 1 }}>Reps</span>
                      <span style={{ flex: 1 }}>Carga</span>
                      <span style={{ flex: 2 }}>Notas</span>
                      <span style={{ width: 20 }} />
                    </div>

                    {day.exercises.map((ex) => (
                      <div key={ex.id} style={styles.exerciseRow}>
                        <input
                          style={{ ...styles.cellInput, flex: 4 }}
                          value={ex.name}
                          onChange={(e) => updateExercise(week.id, day.id, ex.id, { name: e.target.value })}
                          placeholder="Nome do exercício"
                        />
                        <input
                          style={{ ...styles.cellInput, flex: 1 }}
                          value={ex.sets}
                          onChange={(e) => updateExercise(week.id, day.id, ex.id, { sets: e.target.value })}
                          placeholder="3"
                        />
                        <input
                          style={{ ...styles.cellInput, flex: 1 }}
                          value={ex.reps}
                          onChange={(e) => updateExercise(week.id, day.id, ex.id, { reps: e.target.value })}
                          placeholder="10"
                        />
                        <input
                          style={{ ...styles.cellInput, flex: 1 }}
                          value={ex.load}
                          onChange={(e) => updateExercise(week.id, day.id, ex.id, { load: e.target.value })}
                          placeholder="kg"
                        />
                        <input
                          style={{ ...styles.cellInput, flex: 2 }}
                          value={ex.notes}
                          onChange={(e) => updateExercise(week.id, day.id, ex.id, { notes: e.target.value })}
                          placeholder="opcional"
                        />
                        <X
                          size={14}
                          color="#5B5650"
                          style={{ cursor: "pointer", width: 20 }}
                          onClick={() => removeExercise(week.id, day.id, ex.id)}
                        />
                      </div>
                    ))}

                    <button style={styles.addExerciseBtn} onClick={() => addExercise(week.id, day.id)}>
                      <Plus size={13} /> Exercício
                    </button>
                  </div>
                ))}

                <button style={styles.addWeekBtn} onClick={() => addDay(week.id)}>
                  <Plus size={13} /> Treino extra
                </button>
              </div>
            )}
          </div>
        );
      })}

      <button style={styles.addDayBtn} onClick={addWeek}>
        <Plus size={14} /> Adicionar semana (7 treinos)
      </button>
    </div>
  );
}


// ---------- Avaliação tab ----------
const ASSESS_SECTIONS = [
  {
    title: "Pressão arterial / FC",
    fields: [
      { key: "sistolica", label: "Sistólica" },
      { key: "diastolica", label: "Diastólica" },
      { key: "fcRepouso", label: "FC repouso" },
    ],
  },
  {
    title: "Composição corporal",
    fields: [
      { key: "altura", label: "Altura (cm)" },
      { key: "weight", label: "Peso (kg)" },
      { key: "idadeMetabolica", label: "Idade metabólica" },
      { key: "h2o", label: "% H2O" },
      { key: "gordVisceral", label: "% Gordura visceral" },
      { key: "massaOssea", label: "Peso massa óssea" },
      { key: "massaMuscular", label: "Peso massa musc." },
      { key: "bioimpedancia", label: "Bioimpedância %MG" },
    ],
  },
  {
    title: "Medidas",
    fields: [
      { key: "ombros", label: "Dist. entre ombros" },
      { key: "torax", label: "Tórax" },
      { key: "bicepDir", label: "Bícep dir." },
      { key: "bicepEsq", label: "Bícep esq." },
      { key: "cintura", label: "Cintura" },
      { key: "abdomen", label: "Abdómen" },
      { key: "quadril", label: "Quadril" },
      { key: "coxaDir", label: "Coxa dir." },
      { key: "coxaEsq", label: "Coxa esq." },
      { key: "coxaMediaDir", label: "Coxa média dir." },
      { key: "coxaMediaEsq", label: "Coxa média esq." },
      { key: "tornozeloDir", label: "Tornozelo dir." },
      { key: "tornozeloEsq", label: "Tornozelo esq." },
    ],
  },
  {
    title: "VO2 max / Teste de Cooper",
    fields: [
      { key: "fcFinal", label: "FC final" },
      { key: "metros", label: "Metros percorridos" },
      { key: "tempo", label: "Tempo" },
    ],
  },
  {
    title: "Análise postural",
    fields: [
      { key: "cifose", label: "Cifose" },
      { key: "lordose", label: "Lordose" },
      { key: "escoliose", label: "Escoliose" },
      { key: "alinhOmbros", label: "Alinh. ombros" },
      { key: "alinhAncas", label: "Alinh. ancas" },
      { key: "alinhJoelhos", label: "Alinh. joelhos" },
    ],
  },
  {
    title: "Datas de acompanhamento",
    fields: [
      { key: "primeiraAula", label: "1ª aula de grupo (2 dias)", type: "date" },
      { key: "verificacao30", label: "Verificação de resultados (30 dias)", type: "date" },
      { key: "proximaReavaliacao", label: "Próxima reavaliação física", type: "date" },
    ],
  },
];
const ASSESS_FIELD_KEYS = ASSESS_SECTIONS.flatMap((s) => s.fields.map((f) => f.key));

function emptyAssessForm() {
  return {
    date: new Date().toISOString().slice(0, 10),
    notes: "",
    ...Object.fromEntries(ASSESS_FIELD_KEYS.map((k) => [k, ""])),
  };
}

function AvaliacaoTab({ student, onUpdate }) {
  const assessments = student.assessments || [];
  const [form, setForm] = useState(emptyAssessForm());

  function addAssessment() {
    if (!ASSESS_FIELD_KEYS.some((k) => form[k])) return;
    const entry = { id: uid(), ...form };
    const updated = [...assessments, entry].sort((a, b) => a.date.localeCompare(b.date));
    onUpdate({ assessments: updated });
    setForm(emptyAssessForm());
  }

  function removeAssessment(id) {
    onUpdate({ assessments: assessments.filter((a) => a.id !== id) });
  }

  const chartData = assessments
    .filter((a) => a.weight)
    .map((a) => ({ date: a.date.slice(5), peso: parseFloat(a.weight) }));

  return (
    <div style={styles.panel}>
      {chartData.length >= 2 && (
        <div style={styles.chartCard}>
          <div style={styles.chartTitle}>
            <TrendingUp size={13} /> evolução do peso (kg)
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={chartData}>
              <CartesianGrid stroke="#2A2621" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fill: "#8A8478", fontSize: 11 }} axisLine={{ stroke: "#3A362F" }} />
              <YAxis tick={{ fill: "#8A8478", fontSize: 11 }} axisLine={{ stroke: "#3A362F" }} domain={["auto", "auto"]} />
              <Tooltip contentStyle={{ background: "#211E1A", border: "1px solid #3A362F", fontSize: 12 }} />
              <Line type="monotone" dataKey="peso" stroke="#C98A3E" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div style={styles.assessFormCard}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={styles.dayTitleInput}>Nova avaliação</div>
          <MiniField label="Data" type="date" value={form.date} onChange={(v) => setForm({ ...form, date: v })} />
        </div>

        {ASSESS_SECTIONS.map((section) => (
          <div key={section.title} style={styles.assessSection}>
            <div style={styles.assessSectionTitle}>{section.title}</div>
            <div style={styles.assessGrid}>
              {section.fields.map((f) => (
                <MiniField
                  key={f.key}
                  label={f.label}
                  type={f.type || "text"}
                  value={form[f.key]}
                  onChange={(v) => setForm({ ...form, [f.key]: v })}
                />
              ))}
            </div>
          </div>
        ))}

        <label style={styles.miniLabel}>Observações</label>
        <textarea
          style={{ ...styles.textarea, marginTop: 4 }}
          rows={2}
          placeholder="Observações da avaliação…"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
        <button style={styles.addExerciseBtn} onClick={addAssessment}>
          <Plus size={13} /> Guardar avaliação
        </button>
      </div>

      <div style={styles.historyList}>
        {assessments
          .slice()
          .reverse()
          .map((a) => (
            <div key={a.id} style={styles.historyRow}>
              <Calendar size={13} color="#8A8478" />
              <span style={styles.historyDate}>{new Date(a.date).toLocaleDateString("pt-PT")}</span>
              <span style={styles.historyStats}>
                {a.weight && `${a.weight}kg`} {a.bioimpedancia && `· ${a.bioimpedancia}% MG`}{" "}
                {a.cintura && `· cintura ${a.cintura}cm`}
              </span>
              <X size={13} color="#5B5650" style={{ cursor: "pointer", marginLeft: "auto" }} onClick={() => removeAssessment(a.id)} />
            </div>
          ))}
      </div>
    </div>
  );
}

function MiniField({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label style={styles.miniLabel}>{label}</label>
      <input style={styles.input} type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

// ---------- styles ----------
const fontImports = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
`;

const styles = {
  app: {
    display: "flex",
    height: "100vh",
    background: "#171512",
    color: "#EDE9E2",
    fontFamily: "'Inter', sans-serif",
  },
  loadingScreen: {
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#171512",
  },
  sidebar: {
    width: 280,
    borderRight: "1px solid #2A2621",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
  },
  brand: { display: "flex", alignItems: "center", gap: 10, padding: "18px 16px 14px" },
  brandMark: {
    width: 34,
    height: 34,
    borderRadius: 8,
    background: "#C98A3E",
    color: "#171512",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: 14,
  },
  brandTitle: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: 0.5 },
  brandSub: { fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#8A8478", marginTop: 1 },
  searchRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    margin: "0 16px 10px",
    padding: "7px 10px",
    background: "#1D1A16",
    border: "1px solid #2A2621",
    borderRadius: 7,
  },
  searchInput: {
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#EDE9E2",
    fontSize: 12.5,
    width: "100%",
    fontFamily: "'Inter', sans-serif",
  },
  addBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    margin: "0 16px 14px",
    padding: "8px 10px",
    background: "transparent",
    border: "1px dashed #3A362F",
    borderRadius: 7,
    color: "#C98A3E",
    fontSize: 12.5,
    fontFamily: "'IBM Plex Mono', monospace",
    cursor: "pointer",
  },
  studentList: { overflowY: "auto", flex: 1, padding: "0 8px 12px" },
  emptyHint: { color: "#5B5650", fontSize: 12, padding: "10px 12px", fontFamily: "'IBM Plex Mono', monospace" },
  studentRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "8px 8px",
    borderRadius: 7,
    cursor: "pointer",
    marginBottom: 2,
  },
  studentName: { fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  studentMeta: {
    fontSize: 10.5,
    color: "#8A8478",
    fontFamily: "'IBM Plex Mono', monospace",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  main: { flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" },
  noSelection: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  detailHeader: { display: "flex", alignItems: "center", gap: 14, padding: "20px 24px 16px", borderBottom: "1px solid #2A2621" },
  detailName: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 18 },
  detailMeta: { fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, color: "#8A8478", marginTop: 2 },
  iconBtn: { background: "transparent", border: "1px solid #2A2621", borderRadius: 6, padding: 7, cursor: "pointer" },
  confirmRow: { display: "flex", alignItems: "center", gap: 8 },
  confirmYes: {
    background: "#B25146",
    color: "#fff",
    border: "none",
    borderRadius: 5,
    padding: "5px 10px",
    fontSize: 11.5,
    cursor: "pointer",
  },
  confirmNo: {
    background: "transparent",
    color: "#8A8478",
    border: "1px solid #2A2621",
    borderRadius: 5,
    padding: "5px 10px",
    fontSize: 11.5,
    cursor: "pointer",
  },
  tabRow: { display: "flex", gap: 4, padding: "0 24px", borderBottom: "1px solid #2A2621" },
  tabBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "transparent",
    border: "none",
    padding: "12px 10px",
    fontSize: 12.5,
    fontFamily: "'IBM Plex Mono', monospace",
    cursor: "pointer",
  },
  tabContent: { flex: 1, overflowY: "auto", padding: "20px 24px 40px" },
  panel: { maxWidth: 720 },
  fieldGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 },
  label: { display: "block", fontSize: 11, color: "#8A8478", fontFamily: "'IBM Plex Mono', monospace", marginBottom: 5 },
  miniLabel: { display: "block", fontSize: 10, color: "#8A8478", fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4 },
  input: {
    width: "100%",
    background: "#1D1A16",
    border: "1px solid #2A2621",
    borderRadius: 6,
    padding: "8px 10px",
    color: "#EDE9E2",
    fontSize: 13,
    fontFamily: "'Inter', sans-serif",
    outline: "none",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    background: "#1D1A16",
    border: "1px solid #2A2621",
    borderRadius: 6,
    padding: "9px 10px",
    color: "#EDE9E2",
    fontSize: 13,
    fontFamily: "'Inter', sans-serif",
    outline: "none",
    resize: "vertical",
    boxSizing: "border-box",
  },
  emptyBlock: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "#8A8478",
    fontSize: 12.5,
    fontFamily: "'IBM Plex Mono', monospace",
    padding: "16px 0",
  },
  monthCard: {
    background: "#1A1713",
    border: "1px solid #2A2621",
    borderRadius: 10,
    padding: "12px 14px",
    marginBottom: 12,
  },
  weekCountBadge: {
    fontSize: 10.5,
    color: "#8A8478",
    fontFamily: "'IBM Plex Mono', monospace",
    background: "#211E1A",
    border: "1px solid #2A2621",
    borderRadius: 5,
    padding: "3px 7px",
    flexShrink: 0,
  },
  monthHeader: { display: "flex", alignItems: "center", gap: 8 },
  monthTitleInput: {
    flex: 1,
    background: "transparent",
    border: "none",
    color: "#EDE9E2",
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: 15,
    outline: "none",
  },
  monthBody: { marginTop: 10, paddingLeft: 14, borderLeft: "2px solid #2A2621" },
  emptyBlockSmall: {
    color: "#5B5650",
    fontSize: 11.5,
    fontFamily: "'IBM Plex Mono', monospace",
    padding: "4px 0 10px",
  },
  weekCard: {
    background: "#1D1A16",
    border: "1px solid #2A2621",
    borderRadius: 9,
    padding: "10px 12px",
    marginBottom: 10,
  },
  weekHeader: { display: "flex", alignItems: "center", gap: 8 },
  weekTitleInput: {
    flex: 1,
    background: "transparent",
    border: "none",
    color: "#EDE9E2",
    fontFamily: "'IBM Plex Mono', monospace",
    fontWeight: 600,
    fontSize: 12.5,
    outline: "none",
  },
  weekBody: { marginTop: 8, paddingLeft: 12, borderLeft: "2px solid #2A2621" },
  addWeekBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "transparent",
    border: "1px dashed #3A362F",
    borderRadius: 7,
    padding: "7px 12px",
    color: "#C98A3E",
    fontSize: 12,
    fontFamily: "'IBM Plex Mono', monospace",
    cursor: "pointer",
  },
  dayCard: { background: "#211E1A", border: "1px solid #2A2621", borderRadius: 9, padding: 14, marginBottom: 10 },
  dayHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  dayTitleInput: {
    background: "transparent",
    border: "none",
    color: "#EDE9E2",
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 600,
    fontSize: 14,
    outline: "none",
  },
  cardioBlock: {
    background: "#1A1713",
    border: "1px solid #2A2621",
    borderRadius: 7,
    padding: "10px 10px 6px",
    marginBottom: 12,
  },
  cardioTitle: {
    fontSize: 10.5,
    color: "#C98A3E",
    fontFamily: "'IBM Plex Mono', monospace",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  cardioTableHead: {
    display: "flex",
    gap: 8,
    fontSize: 10,
    color: "#5B5650",
    fontFamily: "'IBM Plex Mono', monospace",
    padding: "0 2px 6px",
    borderBottom: "1px solid #2A2621",
    marginBottom: 6,
  },
  exerciseTableHead: {
    display: "flex",
    gap: 8,
    fontSize: 10,
    color: "#5B5650",
    fontFamily: "'IBM Plex Mono', monospace",
    padding: "0 2px 6px",
    borderBottom: "1px solid #2A2621",
    marginBottom: 6,
  },
  exerciseRow: { display: "flex", gap: 8, alignItems: "center", marginBottom: 6 },
  cellInput: {
    background: "#171512",
    border: "1px solid #2A2621",
    borderRadius: 5,
    padding: "6px 8px",
    color: "#EDE9E2",
    fontSize: 12.5,
    fontFamily: "'Inter', sans-serif",
    outline: "none",
    minWidth: 0,
    boxSizing: "border-box",
  },
  addExerciseBtn: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    background: "transparent",
    border: "none",
    color: "#C98A3E",
    fontSize: 12,
    fontFamily: "'IBM Plex Mono', monospace",
    cursor: "pointer",
    padding: "4px 2px",
    marginTop: 4,
  },
  addDayBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "transparent",
    border: "1px dashed #3A362F",
    borderRadius: 8,
    padding: "10px 14px",
    color: "#C98A3E",
    fontSize: 12.5,
    fontFamily: "'IBM Plex Mono', monospace",
    cursor: "pointer",
  },
  chartCard: { background: "#1D1A16", border: "1px solid #2A2621", borderRadius: 9, padding: 14, marginBottom: 16 },
  chartTitle: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 11,
    color: "#8A8478",
    fontFamily: "'IBM Plex Mono', monospace",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  assessFormCard: { background: "#1D1A16", border: "1px solid #2A2621", borderRadius: 9, padding: 14, marginBottom: 16 },
  assessSection: { marginBottom: 14, paddingTop: 10, borderTop: "1px solid #2A2621" },
  assessSectionTitle: {
    fontSize: 10.5,
    color: "#C98A3E",
    fontFamily: "'IBM Plex Mono', monospace",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  assessGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 },
  historyList: { display: "flex", flexDirection: "column", gap: 6 },
  historyRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#1D1A16",
    border: "1px solid #2A2621",
    borderRadius: 7,
    padding: "8px 12px",
    fontSize: 12,
  },
  historyDate: { fontFamily: "'IBM Plex Mono', monospace", color: "#EDE9E2", width: 80 },
  historyStats: { color: "#8A8478" },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
  },
  modal: {
    background: "#1D1A16",
    border: "1px solid #2A2621",
    borderRadius: 12,
    padding: 22,
    width: 340,
  },
  modalHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  modalTitle: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 15 },
  formGroup: { marginBottom: 12 },
  saveBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    background: "#C98A3E",
    color: "#171512",
    border: "none",
    borderRadius: 7,
    padding: "10px 0",
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "'Inter', sans-serif",
    cursor: "pointer",
    marginTop: 6,
  },
};
