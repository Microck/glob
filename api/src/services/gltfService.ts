import { NodeIO, Primitive, Accessor } from "@gltf-transform/core";
import type { Document, JSONDocument } from "@gltf-transform/core";
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

class InvalidModelError extends Error {
  statusCode = 400;
}

let ioPromise: Promise<NodeIO> | null = null;

async function getIO(): Promise<NodeIO> {
  if (!ioPromise) {
    ioPromise = (async () => {
      await MeshoptDecoder.ready;
      await MeshoptEncoder.ready;
      await MeshoptSimplifier.ready;

      const decoder = await draco3d.createDecoderModule({});
      const encoder = await draco3d.createEncoderModule({});

      return new NodeIO()
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

function decodeDataURI(uri: string): Uint8Array {
  const match = uri.match(/^data:.*?;base64,(.*)$/);
  if (!match) {
    throw new InvalidModelError("Only base64-encoded data URIs are supported in .gltf uploads.");
  }

  return Buffer.from(match[1], "base64");
}

async function readDocument(io: NodeIO, buffer: Buffer): Promise<Document> {
  const head = buffer.subarray(0, 64).toString("utf8").trimStart();

  if (!head.startsWith("{")) {
    return io.readBinary(buffer);
  }

  let json: JSONDocument["json"];
  try {
    json = JSON.parse(buffer.toString("utf8"));
  } catch {
    throw new InvalidModelError("Malformed .gltf JSON.");
  }

  const resources: JSONDocument["resources"] = {};

  for (const gltfBuffer of json.buffers ?? []) {
    const uri = gltfBuffer.uri;
    if (!uri) continue;

    if (uri.startsWith("data:")) {
      resources[uri] = decodeDataURI(uri);
    } else {
      throw new InvalidModelError(".gltf with external resources is not supported — please upload a .glb instead.");
    }
  }

  for (const image of json.images ?? []) {
    const uri = image.uri;
    if (!uri) continue;

    if (uri.startsWith("data:")) {
      resources[uri] = decodeDataURI(uri);
    } else {
      throw new InvalidModelError(".gltf with external resources is not supported — please upload a .glb instead.");
    }
  }

  return io.readJSON({ json, resources });
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

export async function processGlb(
  buffer: Buffer,
  options: OptimizeOptions,
  onProgress?: (progress: number, message?: string) => void,
): Promise<{ optimizedBuffer: Buffer; stats: OptimizeStats }> {
  const io = await getIO();

  const reportProgress = (progress: number, message?: string) => {
    if (!onProgress) return;
    onProgress(Math.max(0, Math.min(100, progress)), message);
  };

  let document: Document;
  try {
    document = await readDocument(io, buffer);
  } catch (err) {
    if (err instanceof InvalidModelError) throw err;
    throw new InvalidModelError("Malformed GLB/GLTF file.");
  }

  reportProgress(10, "parsed model");

  const facesBefore = countFaces(document);
  const verticesBefore = countVertices(document);

  try {
    if (options.weld !== false) {
      await document.transform(weld());
      reportProgress(25, "welded vertices");
    }

    if (options.decimateRatio < 1) {
      await document.transform(
        simplify({
          simplifier: MeshoptSimplifier,
          ratio: options.decimateRatio,
          error: 0.001,
        }),
      );
      reportProgress(45, "simplified mesh");
    }

    const facesAfter = countFaces(document);
    const verticesAfter = countVertices(document);

    if (options.textureQuality) {
      await document.transform(
        textureCompress({
          resize: [options.textureQuality, options.textureQuality],
        }),
      );
      reportProgress(60, "compressed textures");
    }

    if (options.quantize !== false) {
      await document.transform(quantize());
      reportProgress(70, "quantized attributes");
    }

    if (options.draco !== false) {
      await document.transform(
        draco({
          method: "edgebreaker",
          encodeSpeed: dracoLevelToEncodeSpeed(options.dracoLevel),
          decodeSpeed: 10,
        }),
      );
      reportProgress(80, "draco encoded");
    }

    const optimized = await io.writeBinary(document);
    reportProgress(90, "finalizing buffer");

    return {
      optimizedBuffer: Buffer.from(optimized),
      stats: {
        facesBefore,
        facesAfter,
        verticesBefore,
        verticesAfter,
      },
    };
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : "Failed to optimize model.");
  }
}
