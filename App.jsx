import { useState, useEffect, useCallback } from "react";
import SceneStage from "./SceneStage";

const API_BASE = "http://127.0.0.1:8000";

/**
 * App.jsx
 * --------
 * Vòng đời demo: danh sách 4 scene -> chọn 1 -> nhập trigger event ->
 * chơi -> ending -> quay lại danh sách để thử scene khác.
 * Đây là điểm khác biệt so với bản Three.js thuần trước đó: thay vì chỉ
 * chạy 1 scene, giờ có màn hình chọn để demo nhanh cả 4 chủ đề liên tiếp.
 */
export default function App() {
  const [scenes, setScenes] = useState([]);
  const [phase, setPhase] = useState("select"); // select | setup | playing | ended
  const [selectedScene, setSelectedScene] = useState(null);
  const [triggerEvent, setTriggerEvent] = useState("");

  const [sessionId, setSessionId] = useState(null);
  const [sceneConfig, setSceneConfig] = useState(null);
  const [anchorContents, setAnchorContents] = useState({});
  const [riskScore, setRiskScore] = useState(0);
  const [dialogue, setDialogue] = useState(null);
  const [ending, setEnding] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/scenes`)
      .then((r) => r.json())
      .then((data) => setScenes(data.scenes))
      .catch(() => alert("Không kết nối được backend. Kiểm tra server đã chạy chưa."));
  }, []);

  const pickScene = (scene) => {
    setSelectedScene(scene);
    setTriggerEvent(defaultTrigger(scene.primary_risk));
    setPhase("setup");
  };

  const startScene = async () => {
    const res = await fetch(`${API_BASE}/api/scenarios/initialize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scene_id: selectedScene.scene_id, trigger_event: triggerEvent }),
    });
    const data = await res.json();
    setSessionId(data.session_id);
    setSceneConfig(data.scene_config);
    setAnchorContents(data.anchor_contents);
    setRiskScore(0);
    setEnding(null);
    setPhase("playing");
  };

  const handleAction = useCallback(
    async (anchorId, actionId, freeText = null) => {
      const res = await fetch(`${API_BASE}/api/scenarios/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, anchor_id: anchorId, action_id: actionId, free_text: freeText }),
      });
      const data = await res.json();
      setRiskScore(data.risk_score);
      if (data.npc_reply) setDialogue(data.npc_reply);
      if (data.ending_triggered) {
        setEnding({ key: data.ending_triggered, message: data.ending_message });
        setPhase("ended");
      }
    },
    [sessionId]
  );

  const backToList = () => {
    setPhase("select");
    setSelectedScene(null);
  };

  return (
    <div style={{ width: "100vw", height: "100vh", fontFamily: "Inter, sans-serif" }}>
      {phase === "select" && <SceneSelect scenes={scenes} onPick={pickScene} />}

      {phase === "setup" && (
        <SetupScreen
          scene={selectedScene}
          triggerEvent={triggerEvent}
          onChangeTrigger={setTriggerEvent}
          onStart={startScene}
          onBack={backToList}
        />
      )}

      {phase === "playing" && sceneConfig && (
        <>
          <RiskHud score={riskScore} threshold={sceneConfig.risk_thresholds.high} color={sceneConfig.risk_color} />
          <SceneStage sceneConfig={sceneConfig} onAction={handleAction} dialogue={dialogue} ended={false} />
          <FreeTextPanel sceneConfig={sceneConfig} onSend={handleAction} />
        </>
      )}

      {phase === "ended" && ending && (
        <EndingScreen scene={selectedScene} ending={ending} onBack={backToList} />
      )}
    </div>
  );
}

function defaultTrigger(risk) {
  const defaults = {
    contact: "Một người chơi lạ đề nghị tặng vật phẩm miễn phí nếu kết bạn ngay.",
    content: "Học sinh tìm thông tin làm bài tập và gặp một bài viết tiêu đề giật gân.",
    conduct: "Một bạn gửi ảnh chế giễu bạn khác vào nhóm chat lớp.",
    commerce: "Một quảng cáo tặng vật phẩm hiếm nếu nhập thông tin thẻ ngân hàng.",
  };
  return defaults[risk] ?? "";
}

function SceneSelect({ scenes, onPick }) {
  return (
    <div style={styles.centerScreen}>
      <div style={styles.card}>
        <p style={styles.eyebrow}>Demo 4 phân cảnh</p>
        <h1 style={styles.h1}>Chọn tình huống để thử</h1>
        <div style={{ display: "grid", gap: 12, marginTop: 20 }}>
          {scenes.map((s) => (
            <button
              key={s.scene_id}
              onClick={() => onPick(s)}
              style={{ ...styles.button, background: s.risk_color, textAlign: "left" }}
            >
              {s.title} <span style={{ opacity: 0.7, fontSize: 12 }}>({s.primary_risk})</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SetupScreen({ scene, triggerEvent, onChangeTrigger, onStart, onBack }) {
  return (
    <div style={styles.centerScreen}>
      <div style={styles.card}>
        <p style={styles.eyebrow}>{scene.title}</p>
        <h1 style={styles.h1}>Thiết lập tình huống</h1>
        <label style={styles.label}>
          Tình huống khởi động
          <textarea
            rows={3}
            value={triggerEvent}
            onChange={(e) => onChangeTrigger(e.target.value)}
            style={styles.textarea}
          />
        </label>
        <button onClick={onStart} style={{ ...styles.button, background: scene.risk_color }}>
          Vào scene
        </button>
        <button onClick={onBack} style={styles.buttonSecondary}>
          Chọn scene khác
        </button>
      </div>
    </div>
  );
}

/**
 * Chỉ hiện ô nhập tự do nếu scene hiện tại có ít nhất 1 action loại free_text
 * (hiện chỉ Scene 1 - Gaming lobby có action này với NPC).
 */
function FreeTextPanel({ sceneConfig, onSend }) {
  const [text, setText] = useState("");
  const freeTextAnchor = sceneConfig.anchors.find((a) =>
    a.actions.some((act) => act.trigger === "free_text")
  );
  if (!freeTextAnchor) return null;

  const action = freeTextAnchor.actions.find((act) => act.trigger === "free_text");

  const send = () => {
    if (!text.trim()) return;
    onSend(freeTextAnchor.anchor_id, action.action_id, text.trim());
    setText("");
  };

  return (
    <div
      style={{
        position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
        display: "flex", gap: 10, background: "rgba(255,255,255,0.95)",
        padding: 10, borderRadius: 14, width: 420, zIndex: 20,
      }}
    >
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && send()}
        placeholder="Gõ tin nhắn trả lời NPC..."
        style={{ flex: 1, border: "none", outline: "none", padding: "8px 12px", borderRadius: 10, fontSize: 14 }}
      />
      <button onClick={send} style={{ ...styles.button, width: "auto", marginBottom: 0, padding: "8px 18px", fontSize: 14 }}>
        Gửi
      </button>
    </div>
  );
}

function RiskHud({ score, threshold, color }) {
  const percent = Math.min(100, (score / threshold) * 100);
  return (
    <div style={{ position: "fixed", top: 24, left: 24, zIndex: 20, width: 220 }}>
      <div style={{ background: "rgba(16,32,58,0.75)", padding: "10px 14px", borderRadius: 12 }}>
        <div style={{ fontSize: 12, color: "#ffd89a", marginBottom: 6 }}>Mức độ cảnh giác</div>
        <div style={{ width: "100%", height: 8, background: "rgba(255,255,255,0.15)", borderRadius: 6 }}>
          <div
            style={{
              width: `${percent}%`, height: "100%", borderRadius: 6,
              background: `linear-gradient(90deg, #4ade80, ${color}, #f87171)`,
              transition: "width 0.3s ease",
            }}
          />
        </div>
      </div>
    </div>
  );
}

function EndingScreen({ scene, ending, onBack }) {
  const labels = {
    trapped: "Rơi vào bẫy",
    escaped_unaware: "Thoát ra nhưng chưa cảnh giác",
    safe_active: "Xử lý an toàn, chủ động",
  };
  return (
    <div style={styles.centerScreen}>
      <div style={styles.card}>
        <p style={styles.eyebrow}>{labels[ending.key] ?? ending.key}</p>
        <h1 style={styles.h1}>{ending.message}</h1>
        <button onClick={onBack} style={{ ...styles.button, background: scene.risk_color }}>
          Thử scene khác
        </button>
      </div>
    </div>
  );
}

const styles = {
  centerScreen: {
    position: "fixed", inset: 0,
    background: "radial-gradient(circle at 30% 20%, #1c3357, #10203a 70%)",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  card: {
    background: "#f7f9fc", borderRadius: 20, padding: 40, maxWidth: 460, width: "90%",
    boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
  },
  eyebrow: { fontSize: 13, fontWeight: 600, color: "#ffb347", margin: "0 0 6px" },
  h1: { fontSize: 26, margin: "0 0 20px", color: "#10203a" },
  label: { display: "block", fontSize: 14, fontWeight: 600, color: "#64748b", marginBottom: 16 },
  textarea: {
    width: "100%", marginTop: 6, padding: "10px 12px", borderRadius: 10,
    border: "1.5px solid #e2e8f0", fontFamily: "Inter, sans-serif", fontSize: 14, resize: "vertical",
  },
  button: {
    width: "100%", border: "none", borderRadius: 14, padding: "14px 22px",
    fontWeight: 600, fontSize: 16, color: "#10203a", cursor: "pointer", marginBottom: 10,
  },
  buttonSecondary: {
    width: "100%", background: "transparent", border: "2px solid #1c3357", color: "#10203a",
    borderRadius: 14, padding: "12px 22px", fontWeight: 600, cursor: "pointer",
  },
};
