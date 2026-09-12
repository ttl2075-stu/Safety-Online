import { useRef, useState, useCallback } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import * as THREE from "three";

/**
 * SceneStage
 * -----------
 * Dựng KHÔNG GIAN 3D thuần bằng khối hình học cơ bản (box/sphere/cylinder),
 * đọc trực tiếp từ scene_config.objects trả về từ backend. Không dùng file
 * .glb - đây là lựa chọn có chủ đích để demo được cả 4 scene nhanh, đồng
 * thời giữ đúng nguyên tắc "AI không sinh cấu trúc 3D, chỉ điền text".
 *
 * Component này KHÔNG đổi giữa các scene - chỉ props (scene_config) đổi.
 */

const SHAPES = {
  box: () => <boxGeometry args={[1.4, 1.0, 0.15]} />,
  sphere: () => <sphereGeometry args={[0.6, 24, 24]} />,
  cylinder: () => <cylinderGeometry args={[0.5, 0.5, 1.4, 16]} />,
};

export default function SceneStage({ sceneConfig, onAction, dialogue, ended }) {
  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <Canvas camera={{ position: sceneConfig.spawn_point, fov: 70 }}>
        <color attach="background" args={["#10203a"]} />
        <fog attach="fog" args={["#10203a", 8, 30]} />
        <ambientLight intensity={0.6} color="#8899cc" />
        <pointLight position={[0, 4, 0]} intensity={1.2} color={sceneConfig.risk_color} />

        <Room />

        {sceneConfig.objects.map((obj) => (
          <InteractiveObject
            key={obj.id}
            obj={obj}
            anchor={sceneConfig.anchors.find((a) => a.object_id === obj.id)}
            onAction={onAction}
          />
        ))}

        {!ended && <PointerLockControls />}
        <PlayerMover enabled={!ended} />
      </Canvas>

      {dialogue && <DialogueOverlay text={dialogue} />}
    </div>
  );
}

function Room() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1c3357" />
      </mesh>
      <mesh position={[0, 2, -10]}>
        <boxGeometry args={[20, 4, 0.3]} />
        <meshStandardMaterial color="#24406b" />
      </mesh>
    </>
  );
}

/**
 * Một vật thể tương tác: hiện diện trong không gian, phản ứng với
 * proximity (tự động) và click (chủ động), gắn đúng action_id từ config.
 */
function InteractiveObject({ obj, anchor, onAction }) {
  const meshRef = useRef();
  const [triggeredProximity, setTriggeredProximity] = useState(false);
  const { camera } = useThree();

  const proximityAction = anchor?.actions.find((a) => a.trigger === "proximity");
  const clickAction = anchor?.actions.find((a) => a.trigger === "click");

  useFrame(() => {
    if (!proximityAction || triggeredProximity || !meshRef.current) return;
    const dist = camera.position.distanceTo(meshRef.current.position);
    if (dist < 2.2) {
      setTriggeredProximity(true);
      onAction(anchor.anchor_id, proximityAction.action_id);
    }
  });

  const handleClick = useCallback(() => {
    if (clickAction) onAction(anchor.anchor_id, clickAction.action_id);
  }, [anchor, clickAction, onAction]);

  const ShapeGeom = SHAPES[obj.shape];

  return (
    <mesh ref={meshRef} position={obj.position} onClick={handleClick}>
      <ShapeGeom />
      <meshStandardMaterial color={obj.color} emissive={obj.color} emissiveIntensity={0.15} />
    </mesh>
  );
}

/** Di chuyển WASD tối giản, không va chạm vật lý (chấp nhận cho demo). */
function PlayerMover({ enabled }) {
  const { camera } = useThree();
  const move = useRef({ f: false, b: false, l: false, r: false });

  useState(() => {
    const down = (e) => {
      if (e.code === "KeyW") move.current.f = true;
      if (e.code === "KeyS") move.current.b = true;
      if (e.code === "KeyA") move.current.l = true;
      if (e.code === "KeyD") move.current.r = true;
    };
    const up = (e) => {
      if (e.code === "KeyW") move.current.f = false;
      if (e.code === "KeyS") move.current.b = false;
      if (e.code === "KeyA") move.current.l = false;
      if (e.code === "KeyD") move.current.r = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  });

  useFrame((_, delta) => {
    if (!enabled) return;
    const speed = 3.5 * delta;
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    dir.y = 0;
    dir.normalize();
    const side = new THREE.Vector3().crossVectors(dir, camera.up);

    if (move.current.f) camera.position.addScaledVector(dir, speed);
    if (move.current.b) camera.position.addScaledVector(dir, -speed);
    if (move.current.l) camera.position.addScaledVector(side, -speed);
    if (move.current.r) camera.position.addScaledVector(side, speed);

    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -9, 9);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -9, 9);
    camera.position.y = 1.6;
  });

  return null;
}

function DialogueOverlay({ text }) {
  return (
    <div
      style={{
        position: "absolute", bottom: 20, left: 20, maxWidth: 380,
        background: "rgba(16,32,58,0.85)", color: "white", padding: "12px 16px",
        borderRadius: 12, fontSize: 14, fontFamily: "Inter, sans-serif",
      }}
    >
      {text}
    </div>
  );
}
