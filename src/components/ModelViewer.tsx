import React, { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Stage,
  Center,
  Environment,
  ContactShadows,
  PerspectiveCamera,
  Line,
} from "@react-three/drei";
import { useLoader } from "../LoaderContext";

interface ModelProps {
  file: File;
  analysisData: any;
}

const Model: React.FC<ModelProps> = ({ file, analysisData }) => {
  const { occtLoader } = useLoader();
  const [scene, setScene] = useState<any>(null);

  useEffect(() => {
    if (!file) return;

    occtLoader.load(file, (shape: any, buildMesh: any) => {
      const group = new occtLoader.THREE.Group();

      // recursively add children
      const addChildren = (obj: any, parent: any) => {
        if (obj.meshes) {
          obj.meshes.forEach((meshData: any) => {
            const { mesh, edges } = buildMesh(meshData, true);
            parent.add(mesh);
            if (edges) parent.add(edges);
          });
        }
        if (obj.children) {
          obj.children.forEach((child: any) => {
            const childGroup = new occtLoader.THREE.Group();
            childGroup.name = child.name;
            parent.add(childGroup);
            addChildren(child, childGroup);
          });
        }
      };

      addChildren(shape, group);
      setScene(group);
    });
  }, [file, occtLoader]);

  return (
    <group>
      {scene && <primitive object={scene} castShadow receiveShadow />}
      {analysisData && scene && (
        <FeedbackHighlights analysisData={analysisData} />
      )}
    </group>
  );
};

const FeedbackHighlights: React.FC<{ analysisData: any }> = ({
  analysisData,
}) => {
  const { dfm_feedback, geometry_index } = analysisData;
  if (!dfm_feedback || !geometry_index) return null;

  const highlights: React.ReactNode[] = [];

  dfm_feedback.forEach((feedback: any, index: number) => {
    const color =
      feedback.severity === "high"
        ? "#ff0000"
        : feedback.severity === "medium"
          ? "#ffa500"
          : "#ffff00";

    feedback.geometric_references.forEach((ref: any) => {
      if (ref.type === "edge") {
        const edgeData = geometry_index.edges?.[ref.id];
        if (edgeData && edgeData.vertices) {
          const points: [number, number, number][] = edgeData.vertices
            .map((vid: string) => geometry_index.vertices?.[vid]?.point)
            .filter(Boolean);

          if (points.length >= 2) {
            highlights.push(
              <Line
                key={`highlight-${index}-${ref.id}`}
                points={points}
                color={color}
                lineWidth={3}
                dashed={false}
              />,
            );
          }
        }
      }
    });
  });

  return <group>{highlights}</group>;
};

interface ModelViewerProps {
  file: File | null;
  analysisData: any;
}

export const ModelViewer: React.FC<ModelViewerProps> = ({
  file,
  analysisData,
}) => {
  if (!file)
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#999",
          fontStyle: "italic",
        }}
      >
        No model loaded. Upload a STEP file to begin.
      </div>
    );

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: "500px",
        background: "#f5f5f7",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[120, 120, 120]} fov={50} />
        <color attach="background" args={["#f0f0f0"]} />

        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.5}>
            <Center>
              <Model file={file} analysisData={analysisData} />
            </Center>
          </Stage>

          <ContactShadows
            position={[0, -60, 0]}
            opacity={0.4}
            scale={400}
            blur={2}
            far={80}
          />
          <Environment preset="city" />
        </Suspense>

        <ambientLight intensity={0.2} />

        <OrbitControls
          makeDefault
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 1.75}
        />
      </Canvas>
    </div>
  );
};
