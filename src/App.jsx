import { useState, useEffect, useCallback } from "react";
import SceneStage from "./SceneStage";

const API_BASE = "http://127.0.0.1:8000";

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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/scenes`)
      .then((r) => r.json())
      .then((data) => setScenes(data.scenes))
      .catch(() => {
        console.warn("Chưa kết nối được backend qua port 8000.");
      });
  }, []);

  const pickScene = (scene) => {
    setSelectedScene(scene);
    setTriggerEvent(defaultTrigger(scene.primary_risk));
    setPhase("setup");
  };

  const startScene = async () => {
    setIsLoading(true);
    try {
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

      // Nếu có opening_line từ NPC, hiển thị ngay
      const firstAnchorKey = Object.keys(data.anchor_contents || {})[0];
      if (firstAnchorKey && data.anchor_contents[firstAnchorKey]?.opening_line) {
        setDialogue(data.anchor_contents[firstAnchorKey].opening_line);
      } else {
        setDialogue(null);
      }

      setPhase("playing");
    } catch (err) {
      alert("Lỗi khởi tạo kịch bản. Hãy đảm bảo backend đang chạy tại http://127.0.0.1:8000");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = useCallback(
    async (anchorId, actionId, freeText = null) => {
      try {
        const res = await fetch(`${API_BASE}/api/scenarios/action`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionId,
            anchor_id: anchorId,
            action_id: actionId,
            free_text: freeText,
          }),
        });
        const data = await res.json();
        setRiskScore(data.risk_score);
        if (data.npc_reply) setDialogue(data.npc_reply);
        if (data.ending_triggered) {
          setEnding({ key: data.ending_triggered, message: data.ending_message });
          setPhase("ended");
        }
      } catch (err) {
        console.error("Lỗi gửi hành động:", err);
      }
    },
    [sessionId]
  );

  const backToList = () => {
    setPhase("select");
    setSelectedScene(null);
    setDialogue(null);
  };

  return (
    <div style={{ width: "100vw", height: "100vh", fontFamily: "'Inter', system-ui, sans-serif", overflow: "hidden", background: "#10203a" }}>
      {phase === "select" && <SceneSelect scenes={scenes} onPick={pickScene} />}

      {phase === "setup" && (
        <SetupScreen
          scene={selectedScene}
          triggerEvent={triggerEvent}
          onChangeTrigger={setTriggerEvent}
          onStart={startScene}
          onBack={backToList}
          loading={isLoading}
        />
      )}

      {phase === "playing" && sceneConfig && (
        <>
          <RiskHud
            score={riskScore}
            threshold={sceneConfig.risk_thresholds.high}
            color={sceneConfig.risk_color}
          />
          <SceneStage
            sceneConfig={sceneConfig}
            onAction={handleAction}
            dialogue={dialogue}
            ended={false}
          />
          <FreeTextPanel sceneConfig={sceneConfig} onSend={handleAction} />
          <QuitButton onQuit={backToList} />
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
  const riskLabels = {
    contact: "Tiếp xúc rủi ro (Contact)",
    content: "Nội dung độc hại (Content)",
    conduct: "Hành vi sai lệch (Conduct)",
    commerce: "Giao dịch/Lừa đảo (Commerce)",
  };

  return (
    <div style={styles.centerScreen}>
      <div style={styles.card}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 24 }}>🛡️</span>
          <p style={styles.eyebrow}>Mô Phỏng 3D An Toàn Mạng Cho Học Sinh</p>
        </div>
        <h1 style={styles.h1}>Chọn Tình Huống Trải Nghiệm</h1>
        <p style={{ color: "#64748b", fontSize: 14, marginTop: -10, marginBottom: 20 }}>
          Học sinh tự do di chuyển trong không gian 3D, đối diện với rủi ro thật và quan sát hệ quả từ chính hành vi của mình.
        </p>

        <div style={{ display: "grid", gap: 12 }}>
          {scenes.length > 0 ? (
            scenes.map((s) => (
              <button
                key={s.scene_id}
                onClick={() => onPick(s)}
                style={{
                  ...styles.sceneButton,
                  borderLeft: `6px solid ${s.risk_color}`,
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>{s.title}</div>
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
                  Chủ đề: <b>{riskLabels[s.primary_risk] || s.primary_risk}</b>
                </div>
              </button>
            ))
          ) : (
            <div style={{ padding: 20, textAlign: "center", color: "#64748b" }}>
              Đang tải danh sách cảnh từ server... Hãy chắc chắn backend đã bật tại cổng 8000.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SetupScreen({ scene, triggerEvent, onChangeTrigger, onStart, onBack, loading }) {
  return (
    <div style={styles.centerScreen}>
      <div style={styles.card}>
        <p style={styles.eyebrow}>Kịch bản: {scene.title}</p>
        <h1 style={styles.h1}>Thiết lập tình huống ban đầu</h1>
        <label style={styles.label}>
          Tình huống kích hoạt (Trigger Event):
          <textarea
            rows={3}
            value={triggerEvent}
            onChange={(e) => onChangeTrigger(e.target.value)}
            style={styles.textarea}
            placeholder="Ví dụ: Một người lạ tặng quà và yêu cầu kết bạn..."
          />
        </label>
        <button
          onClick={onStart}
          disabled={loading}
          style={{ ...styles.button, background: scene.risk_color, opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Đang chuẩn bị không gian 3D..." : "Vào Không Gian Mô Phỏng"}
        </button>
        <button onClick={onBack} style={styles.buttonSecondary}>
          ← Quay lại danh sách
        </button>
      </div>
    </div>
  );
}

function FreeTextPanel({ sceneConfig, onSend }) {
  const [text, setText] = useState("");
  const freeTextAnchor = sceneConfig?.anchors?.find((a) =>
    a.actions?.some((act) => act.trigger === "free_text")
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
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: 10,
        background: "rgba(16, 32, 58, 0.95)",
        padding: "10px 14px",
        borderRadius: 16,
        width: 460,
        maxWidth: "92vw",
        zIndex: 30,
        boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
        border: "1px solid rgba(255,255,255,0.15)",
      }}
    >
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && send()}
        placeholder="Gõ tin nhắn trả lời người đối diện... (Nhấn Enter để gửi)"
        style={{
          flex: 1,
          border: "none",
          outline: "none",
          padding: "10px 14px",
          borderRadius: 10,
          fontSize: 14,
          background: "rgba(255, 255, 255, 0.1)",
          color: "#ffffff",
        }}
      />
      <button
        onClick={send}
        style={{
          ...styles.button,
          width: "auto",
          marginBottom: 0,
          padding: "10px 20px",
          fontSize: 14,
          background: "#38bdf8",
          color: "#0f172a",
        }}
      >
        Gửi
      </button>
    </div>
  );
}

function RiskHud({ score, threshold, color }) {
  const percent = Math.min(100, (score / threshold) * 100);

  let stateLabel = "An toàn, cảnh giác tốt";
  let stateColor = "#4ade80";
  if (percent >= 75) {
    stateLabel = "NGUY HIỂM: Nguy cơ cao bị lừa đảo!";
    stateColor = "#f87171";
  } else if (percent >= 35) {
    stateLabel = "CẢNH BÁO: Hành vi đang có rủi ro";
    stateColor = "#facc15";
  }

  return (
    <div style={{ position: "fixed", top: 20, left: 20, zIndex: 30, width: 280 }}>
      <div
        style={{
          background: "rgba(16, 32, 58, 0.9)",
          padding: "12px 16px",
          borderRadius: 14,
          border: "1px solid rgba(255, 255, 255, 0.15)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>
            Thanh Nguy Cơ
          </span>
          <span style={{ fontSize: 13, fontWeight: 800, color: stateColor }}>
            {score.toFixed(1)} / {threshold}
          </span>
        </div>

        <div style={{ width: "100%", height: 10, background: "rgba(255,255,255,0.12)", borderRadius: 8, overflow: "hidden" }}>
          <div
            style={{
              width: `${percent}%`,
              height: "100%",
              background: `linear-gradient(90deg, #4ade80 0%, #facc15 50%, #f87171 100%)`,
              transition: "width 0.4s ease",
            }}
          />
        </div>

        <div style={{ fontSize: 11, color: stateColor, marginTop: 6, fontWeight: 600 }}>
          {stateLabel}
        </div>
      </div>
    </div>
  );
}

function QuitButton({ onQuit }) {
  return (
    <button
      onClick={onQuit}
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 30,
        background: "rgba(16, 32, 58, 0.85)",
        color: "#ffffff",
        border: "1px solid rgba(255,255,255,0.2)",
        padding: "8px 16px",
        borderRadius: 10,
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 600,
      }}
    >
      ✕ Rời phân cảnh
    </button>
  );
}

function EndingScreen({ scene, ending, onBack }) {
  const endingTypes = {
    trapped: {
      badge: "🚨 Mắc bẫy rủi ro (Bốc đồng)",
      badgeColor: "#ef4444",
      explanation: "Bạn đã hành động quá nhanh mà không kiểm tra kỹ thông tin đối phương. Kẻ xấu có thể lợi dụng sự tin tưởng này.",
    },
    escaped_unaware: {
      badge: "⚠️ Thoát ra thụ động (Chưa cảnh giác)",
      badgeColor: "#f59e0b",
      explanation: "Tình huống tạm thời qua đi nhưng bạn chưa chủ động nhận diện dấu hiệu cảnh báo hoặc có biện pháp bảo vệ bản thân.",
    },
    safe_active: {
      badge: "⭐ Xử lý an toàn chủ động (Xuất sắc)",
      badgeColor: "#10b981",
      explanation: "Bạn đã rất tỉnh táo! Biết từ chối, đặt câu hỏi kiểm tra danh tính hoặc sử dụng tính năng Báo cáo để ngăn chặn kẻ xấu.",
    },
  };

  const currentEnding = endingTypes[ending.key] || {
    badge: "Kết quả mô phỏng",
    badgeColor: "#64748b",
    explanation: "",
  };

  return (
    <div style={styles.centerScreen}>
      <div style={{ ...styles.card, maxWidth: 520, borderTop: `8px solid ${currentEnding.badgeColor}` }}>
        <div
          style={{
            display: "inline-block",
            padding: "4px 12px",
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 700,
            color: "#ffffff",
            background: currentEnding.badgeColor,
            marginBottom: 12,
          }}
        >
          {currentEnding.badge}
        </div>

        <h1 style={{ ...styles.h1, fontSize: 22, lineHeight: 1.4 }}>{ending.message}</h1>

        <div
          style={{
            background: "#f1f5f9",
            padding: "14px 18px",
            borderRadius: 12,
            fontSize: 14,
            color: "#334155",
            lineHeight: 1.6,
            marginBottom: 24,
          }}
        >
          <b>Phân tích hành vi:</b> {currentEnding.explanation}
        </div>

        <button onClick={onBack} style={{ ...styles.button, background: scene?.risk_color || "#38bdf8" }}>
          Thử Thách Tình Huống Khác
        </button>
      </div>
    </div>
  );
}

const styles = {
  centerScreen: {
    position: "fixed",
    inset: 0,
    background: "radial-gradient(circle at 30% 20%, #1c3357, #0a1120 80%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    background: "#ffffff",
    borderRadius: 20,
    padding: 36,
    maxWidth: 480,
    width: "100%",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: 700,
    color: "#d97706",
    margin: 0,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  h1: {
    fontSize: 24,
    margin: "10px 0 20px",
    color: "#0f172a",
    fontWeight: 800,
  },
  label: {
    display: "block",
    fontSize: 14,
    fontWeight: 600,
    color: "#475569",
    marginBottom: 16,
  },
  textarea: {
    width: "100%",
    marginTop: 8,
    padding: "12px 14px",
    borderRadius: 12,
    border: "1.5px solid #cbd5e1",
    fontFamily: "inherit",
    fontSize: 14,
    resize: "vertical",
    boxSizing: "border-box",
    outline: "none",
  },
  button: {
    width: "100%",
    border: "none",
    borderRadius: 14,
    padding: "14px 22px",
    fontWeight: 700,
    fontSize: 15,
    color: "#0f172a",
    cursor: "pointer",
    marginBottom: 10,
    transition: "transform 0.1s ease, filter 0.2s ease",
  },
  buttonSecondary: {
    width: "100%",
    background: "transparent",
    border: "1.5px solid #cbd5e1",
    color: "#475569",
    borderRadius: 14,
    padding: "12px 22px",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 14,
  },
  sceneButton: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: "14px 18px",
    textAlign: "left",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
  },
};
