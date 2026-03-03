import type * as THREE_TYPES from "three";

interface GeometryMesh {
  name: string;
  color?: [number, number, number];
  brep_faces: Array<{
    first: number;
    last: number;
    color: [number, number, number] | null;
  }>;
  attributes: {
    position: {
      array: Float32Array | number[];
    };
    normal?: {
      array: Float32Array | number[];
    };
  };
  index: {
    array: Uint16Array | Uint32Array | number[];
  };
}

interface OCCTModule {
  ReadStepFile(content: Uint8Array, params: any): any;
}

export class OCCTLoader {
  private THREE: typeof THREE_TYPES | null = null;
  private occt: OCCTModule | null = null;

  constructor() {}

  async ensureThreeLoaded(): Promise<void> {
    if (!this.THREE) {
      // @ts-ignore - dynamic import typing
      this.THREE = (await import("three")) as typeof THREE_TYPES;
    }
  }

  BuildMesh(
    geometryMesh: GeometryMesh,
    showEdges: boolean,
  ): {
    mesh: THREE_TYPES.Mesh;
    geometry: THREE_TYPES.BufferGeometry;
    edges: THREE_TYPES.Group | null;
  } {
    const THREE = this.THREE!;

    const geometry = new THREE.BufferGeometry();

    showEdges = false;

    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(
        geometryMesh.attributes.position.array,
        3,
      ),
    );

    if (geometryMesh.attributes.normal) {
      geometry.setAttribute(
        "normal",
        new THREE.Float32BufferAttribute(
          geometryMesh.attributes.normal.array,
          3,
        ),
      );
    } else {
      geometry.computeVertexNormals();
    }

    geometry.name = geometryMesh.name;

    const index = new Uint32Array(geometryMesh.index.array);
    geometry.setIndex(new THREE.BufferAttribute(index, 1));

    const outlineMaterial = new THREE.LineBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.4,
      depthTest: false,
    });

    const defaultMaterial = new THREE.MeshStandardMaterial({
      color: geometryMesh.color
        ? new THREE.Color(
            geometryMesh.color[0],
            geometryMesh.color[1],
            geometryMesh.color[2],
          )
        : 0xcccccc,
      roughness: 0.5,
      metalness: 0.2,
    });

    const materials: THREE_TYPES.Material[] = [defaultMaterial];

    // We use materials array for the mesh constructor because we use addGroup
    const mesh = new THREE.Mesh(geometry, materials);
    mesh.name = geometryMesh.name;

    const edges = showEdges ? new THREE.Group() : null;
    if (
      geometryMesh.brep_faces &&
      geometryMesh.brep_faces.some((f) => f.color)
    ) {
      for (let faceColor of geometryMesh.brep_faces) {
        const color = faceColor.color
          ? new THREE.Color(
              faceColor.color[0],
              faceColor.color[1],
              faceColor.color[2],
            )
          : defaultMaterial.color;
        materials.push(
          new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.5,
            metalness: 0.2,
          }),
        );
      }
      const triangleCount = geometryMesh.index.array.length / 3;
      let triangleIndex = 0;
      let faceColorGroupIndex = 0;
      while (triangleIndex < triangleCount) {
        const firstIndex = triangleIndex;
        let lastIndex: number;
        let materialIndex: number;

        const currentFace = geometryMesh.brep_faces[faceColorGroupIndex];

        if (!currentFace) {
          lastIndex = triangleCount;
          materialIndex = 0;
        } else if (triangleIndex < currentFace.first) {
          lastIndex = currentFace.first;
          materialIndex = 0;
        } else {
          lastIndex = currentFace.last + 1;
          materialIndex = faceColorGroupIndex + 1;
          faceColorGroupIndex++;
        }
        geometry.addGroup(
          firstIndex * 3,
          (lastIndex - firstIndex) * 3,
          materialIndex,
        );
        triangleIndex = lastIndex;

        if (edges) {
          const innerGeometry = new THREE.BufferGeometry();

          const posAttr = geometry.getAttribute("position");
          if (posAttr) {
            innerGeometry.setAttribute("position", posAttr);
          }

          if (geometryMesh.attributes.normal) {
            innerGeometry.setAttribute(
              "normal",
              new THREE.Float32BufferAttribute(
                geometryMesh.attributes.normal.array,
                3,
              ),
            );
          }
          innerGeometry.setIndex(
            new THREE.BufferAttribute(
              index.slice(firstIndex * 3, lastIndex * 3),
              1,
            ),
          );
          const innerEdgesGeometry = new THREE.EdgesGeometry(
            innerGeometry,
            180,
          );
          const edge = new THREE.LineSegments(
            innerEdgesGeometry,
            outlineMaterial,
          );
          edges.add(edge);
        }
      }
    }
    if (edges) {
      edges.renderOrder = mesh.renderOrder + 1;
    }

    return { mesh, geometry, edges };
  }

  async load(
    fileOrUrl: string | File | Blob,
    resultCallback: (
      occtShape: any,
      buildMesh: (geometryMesh: GeometryMesh, showEdges: boolean) => any,
    ) => void,
  ): Promise<void> {
    await this.ensureThreeLoaded();

    if (!this.occt) {
      // @ts-ignore
      const OCCT = (await import("occt-import-js")).default;
      this.occt = await OCCT({
        locateFile: (file: string) => {
          if (file.endsWith(".wasm")) {
            return "/occt-import-js.wasm";
          }
          return file;
        },
      });
    }

    try {
      let fileBuffer: Uint8Array;
      if (fileOrUrl instanceof Blob) {
        const buffer = await fileOrUrl.arrayBuffer();
        fileBuffer = new Uint8Array(buffer);
      } else {
        const response = await fetch(fileOrUrl);
        const buffer = await response.arrayBuffer();
        fileBuffer = new Uint8Array(buffer);
      }

      const occtShape = this.occt!.ReadStepFile(fileBuffer, null);

      resultCallback(occtShape, this.BuildMesh.bind(this));
    } catch (error) {
      console.error("Error loading STEP file:", error);
    }
  }
}
