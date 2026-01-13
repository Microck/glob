import { WebIO, Document, Primitive, Accessor } from "@gltf-transform/core";
import { KHRDracoMeshCompression } from "@gltf-transform/extensions";
import { draco, quantize, simplify, textureCompress, weld } from "@gltf-transform/functions";
import draco3d from "draco3d";
import { MeshoptDecoder, MeshoptEncoder, MeshoptSimplifier } from "meshoptimizer";

export type OptimizeOptions = {
  decimateRatio: number;
  dracoLevel: number;
  textureQuality?: number;
  weld?: boolean;
  quantize?: boolean;
  draco?: boolean;
};

export type OptimizeStats = {
  facesBefore: number;
  facesAfter: number;
  verticesBefore: number;
  verticesAfter: number;
};

let ioPromise: Promise<WebIO> | null = null;

async function getIO(): Promise<WebIO> {
  if (!ioPromise) {
    ioPromise = (async () => {
      await MeshoptDecoder.ready;
      await MeshoptEncoder.ready;
      await MeshoptSimplifier.ready;

      const decoder = await draco3d.createDecoderModule({});
      const encoder = await draco3d.createEncoderModule({});

      return new WebIO()
        .registerExtensions([KHRDracoMeshCompression])
        .registerDependencies({
          "draco3d.decoder": decoder,
          "draco3d.encoder": encoder,
          "meshopt.decoder": MeshoptDecoder,
          "meshopt.encoder": MeshoptEncoder,
        });
    })();
  }
  return ioPromise;
}

function countFaces(document: Document): number {
  let faces = 0;
  for (const mesh of document.getRoot().listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      if (prim.getMode() !== Primitive.Mode.TRIANGLES) continue;
      const indices = prim.getIndices();
      const position = prim.getAttribute("POSITION");
      const count = indices?.getCount() ?? position?.getCount() ?? 0;
      faces += Math.floor(count / 3);
    }
  }
  return faces;
}

function countVertices(document: Document): number {
  const accessors = new Set<Accessor>();
  for (const mesh of document.getRoot().listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      const position = prim.getAttribute("POSITION");
      if (position) accessors.add(position);
    }
  }
  let vertices = 0;
  for (const accessor of accessors) {
    vertices += accessor.getCount();
  }
  return vertices;
}

function dracoLevelToEncodeSpeed(dracoLevel: number): number {
  return Math.max(0, Math.min(10, 10 - Math.round(dracoLevel)));
}

self.onmessage = async (e: MessageEvent) => {
  const { id, file, options } = e.data;
  
  try {
    const io = await getIO();
    self.postMessage({ type: 'progress', id, progress: 5, message: 'READING FILE' });

    const arrayBuffer = await file.arrayBuffer();
    const document = await io.readBinary(new Uint8Array(arrayBuffer));

    self.postMessage({ type: 'progress', id, progress: 10, message: 'PARSED MODEL' });

    const facesBefore = countFaces(document);
    const verticesBefore = countVertices(document);

    if (options.weld !== false) {
      await document.transform(weld());
      self.postMessage({ type: 'progress', id, progress: 25, message: 'WELDED VERTICES' });
    }

    if (options.decimateRatio < 1) {
      await document.transform(
        simplify({
          simplifier: MeshoptSimplifier,
          ratio: options.decimateRatio,
          error: 0.001,
        })
      );
      self.postMessage({ type: 'progress', id, progress: 45, message: 'SIMPLIFIED MESH' });
    }

    const facesAfter = countFaces(document);
    const verticesAfter = countVertices(document);

    if (options.textureQuality) {
      await document.transform(
        textureCompress({
          resize: [options.textureQuality, options.textureQuality],
        })
      );
      self.postMessage({ type: 'progress', id, progress: 60, message: 'COMPRESSED TEXTURES' });
    }

    if (options.quantize !== false) {
      await document.transform(quantize());
      self.postMessage({ type: 'progress', id, progress: 70, message: 'QUANTIZED ATTRIBUTES' });
    }

    if (options.draco !== false) {
      await document.transform(
        draco({
          method: "edgebreaker",
          encodeSpeed: dracoLevelToEncodeSpeed(options.dracoLevel),
          decodeSpeed: 10,
        })
      );
      self.postMessage({ type: 'progress', id, progress: 80, message: 'DRACO ENCODED' });
    }

    const optimizedArrayBuffer = await io.writeBinary(document);
    self.postMessage({ type: 'progress', id, progress: 90, message: 'FINALIZING' });

    // Use explicit postMessage signature for Worker
    (self as unknown as Worker).postMessage({
      type: 'complete',
      id,
      result: optimizedArrayBuffer,
      stats: {
        facesBefore,
        facesAfter,
        verticesBefore,
        verticesAfter
      }
    }, [optimizedArrayBuffer.buffer]);

  } catch (error) {
    console.error("Worker error:", error);
    self.postMessage({ 
      type: 'error', 
      id, 
      error: error instanceof Error ? error.message : 'Unknown optimization error' 
    });
  }
};