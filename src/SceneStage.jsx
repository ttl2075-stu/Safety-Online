import { useRef, useState, useCallback, useEffect } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import * as THREE from "three";

/**
 * SceneStage - Nâng cấp UX:
 * 1. Kích thước vật thể lớn hơn, dễ nhắm click trúng hơn.
 * 2. Hiệu ứng Hover đổi màu/phóng to khi trỏ trúng vật thể tương tác.
 * 3. Crosshair (hồng tâm) chính giữa màn hình hỗ trợ nhắm chính xác.
 * 4. Bảng hướng dẫn phím WASD + ESC trực quan cho học sinh.
 */

const SHAPES = {
  // Nới rộng kích thước để dễ nhắm và click trúng hơn
  box: () => <boxGeometry args={[1.8, 1.4, 0.3]} />,
  sphere: () => <sphereGeometry args={[0.85, 32, 32]} />,
  cylinder: () => <cylinderGeometry args={[0.7, 0.7, 1.6, 24]} />,
};

export default function SceneStage({ sceneConfig, onAction, dialogue, ended }) {
  const [isHoveringObject, setIsHoveringObject] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", userSelect: "none" }}>
      <Canvas
        camera={{ position: sceneConfig.spawn_point, fov: 65 }}
        raycaster={{ params: { Line: { threshold: 0.5 }, Points: { threshold: 0.5 } } }}
      >
        <color attach="background" args={["#10203a"]} />
        <fog attach="fog" args={["#10203a", 8, 32]} />
        <ambientLight intensity={0.7} color="#94a3b8" />
        <pointLight position={[0, 5, 2]} intensity={1.5} color={sceneConfig.risk_color} />
        <directionalLight position={[5, 8, 5]} intensity={0.8} />

        <Room />

        {sceneConfig.objects.map((obj) => (
          <InteractiveObject
            key={obj.id}
            obj={obj}
            anchor={sceneConfig.anchors.find((a) => a.object_id === obj.id)}
            onAction={onAction}
            onHoverChange={setIsHoveringObject}
          />
        ))}

        {!ended && (
          <PointerLockControls
            onLock={() => setIsLocked(true)}
            onUnlock={() => setIsLocked(false)}
          />
        )}
        <PlayerMover enabled={!ended} />
      </Canvas>

      {/* Hồng tâm (Crosshair) chính giữa màn hình */}
      {!ended && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: isHoveringObject ? 20 : 8,
            height: isHoveringObject ? 20 : 8,
            borderRadius: "50%",
            border: isHoveringObject ? "3px solid #facc15" : "2px solid rgba(255, 255, 255, 0.7)",
            backgroundColor: isHoveringObject ? "rgba(250, 204, 21, 0.3)" : "transparent",
            pointerEvents: "none",
            transition: "all 0.15s ease",
            zIndex: 10,
          }}
        />
      )}

      {/* Thông báo trạng thái nhấp chuột */}
      {!isLocked && !ended && (
        <div
          style={{
            position: "absolute",
            top: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(16, 32, 58, 0.9)",
            color: "#facc15",
            padding: "8px 18px",
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 600,
            pointerEvents: "none",
            border: "1px solid rgba(250, 204, 21, 0.4)",
            zIndex: 15,
          }}
        >
          🖱️ Nhấp chuột vào không gian để điều khiển góc nhìn
        </div>
      )}

      {/* Hướng dẫn phím điều khiển góc dưới bên phải */}
      <div
        style={{
          position: "absolute",
          bottom: 24,
          right: 24,
          background: "rgba(16, 32, 58, 0.85)",
          color: "#e2e8f0",
          padding: "12px 16px",
          borderRadius: 14,
          fontSize: 12,
          lineHeight: 1.6,
          pointerEvents: "none",
          zIndex: 15,
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div style={{ fontWeight: 700, color: "#38bdf8", marginBottom: 4 }}>🕹️ Hướng dẫn điều khiển:</div>
        <div>• <b>W / A / S / D</b>: Di chuyển nhân vật</div>
        <div>• <b>Chuột</b>: Xoay góc nhìn</div>
        <div>• <b>Click vào khối sáng</b>: Tương tác / Báo cáo</div>
        <div>• <b>Phím ESC</b>: Nhả chuột để gõ tin nhắn</div>
      </div>

      {/* Hộp thoại hiển thị lời NPC */}
      {dialogue && <DialogueOverlay text={dialogue} />}
    </div>
  );
}

function Room() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[26, 26]} />
        <meshStandardMaterial color="#1c3357" roughness={0.8} />
      </mesh>
      {/* Tường trước */}
      <mesh position={[0, 2.5, -12]}>
        <boxGeometry args={[26, 5, 0.4]} />
        <meshStandardMaterial color="#24406b" />
      </mesh>
      {/* Tường sau */}
      <mesh position={[0, 2.5, 12]}>
        <boxGeometry args={[26, 5, 0.4]} />
        <meshStandardMaterial color="#24406b" />
      </mesh>
      {/* Tường trái */}
      <mesh position={[-13, 2.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[26, 5, 0.4]} />
        <meshStandardMaterial color="#1e3a5f" />
      </mesh>
      {/* Tường phải */}
      <mesh position={[13, 2.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[26, 5, 0.4]} />
        <meshStandardMaterial color="#1e3a5f" />
      </mesh>
    </>
  );
}

/**
 * Một vật thể tương tác: phản ứng với proximity và click
 */
function InteractiveObject({ obj, anchor, onAction, onHoverChange }) {
  const meshRef = useRef();
  const [triggeredProximity, setTriggeredProximity] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { camera } = useThree();

  const proximityAction = anchor?.actions?.find((a) => a.trigger === "proximity");
  const clickAction = anchor?.actions?.find((a) => a.trigger === "click");

  useFrame(() => {
    if (!proximityAction || triggeredProximity || !meshRef.current) return;
    const dist = camera.position.distanceTo(meshRef.current.position);
    // Bán kính tiếp cận mở rộng 2.5m
    if (dist < 2.5) {
      setTriggeredProximity(true);
      onAction(anchor.anchor_id, proximityAction.action_id);
    }
  });

  const handleClick = useCallback(
    (e) => {
      e.stopPropagation();
      if (clickAction) {
        onAction(anchor.anchor_id, clickAction.action_id);
      }
    },
    [anchor, clickAction, onAction]
  );

  const handlePointerOver = (e) => {
    e.stopPropagation();
    setIsHovered(true);
    onHoverChange(true);
    document.body.style.cursor = "pointer";
  };

  const handlePointerOut = () => {
    setIsHovered(false);
    onHoverChange(false);
    document.body.style.cursor = "default";
  };

  const ShapeGeom = SHAPES[obj.shape] || SHAPES.box;

  return (
    <mesh
      ref={meshRef}
      position={obj.position}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      scale={isHovered ? 1.08 : 1.0}
    >
      <ShapeGeom />
      <meshStandardMaterial
        color={isHovered ? "#facc15" : obj.color}
        emissive={isHovered ? "#facc15" : obj.color}
        emissiveIntensity={isHovered ? 0.45 : 0.15}
      />
    </mesh>
  );
}

/** Di chuyển WASD */
function PlayerMover({ enabled }) {
  const { camera } = useThree();
  const move = useRef({ f: false, b: false, l: false, r: false });

  useEffect(() => {
    const down = (e) => {
      if (["KeyW", "ArrowUp"].includes(e.code)) move.current.f = true;
      if (["KeyS", "ArrowDown"].includes(e.code)) move.current.b = true;
      if (["KeyA", "ArrowLeft"].includes(e.code)) move.current.l = true;
      if (["KeyD", "ArrowRight"].includes(e.code)) move.current.r = true;
    };
    const up = (e) => {
      if (["KeyW", "ArrowUp"].includes(e.code)) move.current.f = false;
      if (["KeyS", "ArrowDown"].includes(e.code)) move.current.b = false;
      if (["KeyA", "ArrowLeft"].includes(e.code)) move.current.l = false;
      if (["KeyD", "ArrowRight"].includes(e.code)) move.current.r = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useFrame((_, delta) => {
    if (!enabled) return;
    const speed = 4.0 * Math.min(delta, 0.1);
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    dir.y = 0;
    dir.normalize();
    const side = new THREE.Vector3().crossVectors(dir, camera.up);

    if (move.current.f) camera.position.addScaledVector(dir, speed);
    if (move.current.b) camera.position.addScaledVector(dir, -speed);
    if (move.current.l) camera.position.addScaledVector(side, -speed);
    if (move.current.r) camera.position.addScaledVector(side, speed);

    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -11, 11);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -11, 11);
    camera.position.y = 1.6;
  });

  return null;
}

function DialogueOverlay({ text }) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 90,
        left: "50%",
        transform: "translateX(-50%)",
        maxWidth: 500,
        width: "90%",
        background: "rgba(16, 32, 58, 0.95)",
        color: "#ffffff",
        padding: "16px 20px",
        borderRadius: 16,
        fontSize: 15,
        fontFamily: "Inter, sans-serif",
        lineHeight: 1.5,
        border: "1px solid rgba(255, 255, 255, 0.2)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
        zIndex: 25,
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 700, color: "#ffb347", marginBottom: 4, textTransform: "uppercase" }}>
        💬 Đối phương / Thông điệp:
      </div>
      <div>{text}</div>
    </div>
  );
}
