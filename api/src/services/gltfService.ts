import { NodeIO, Primitive } from "@gltf-transform/core";
import type { Document, JSONDocument } from "@gltf-transform/core";
import { KHRDracoMeshCompression } from "@gltf-transform/extensions";
import { draco, quantize, simplify, textureCompress, weld } from "@gltf-transform/functions";
import draco3d from "draco3d";
import { MeshoptDecoder, MeshoptEncoder, MeshoptSimplifier } from "meshoptimizer";

export type OptimizeOptions = {
  decimateRatio: number;
  dracoLevel: number;
  textureQuality?: number;
};

export type OptimizeStats = {
  facesBefore: number;
  facesAfter: number;
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

function dracoLevelToEncodeSpeed(dracoLevel: number): number {
  return Math.max(0, Math.min(10, 10 - Math.round(dracoLevel)));
}

export async function processGlb(
  buffer: Buffer,
  options: OptimizeOptions,
): Promise<{ optimizedBuffer: Buffer; stats: OptimizeStats }> {
  const io = await getIO();

  let document: Document;
  try {
    document = await readDocument(io, buffer);
  } catch (err) {
    if (err instanceof InvalidModelError) throw err;
    throw new InvalidModelError("Malformed GLB/GLTF file.");
  }

  const facesBefore = countFaces(document);

  try {
    await document.transform(weld());

    if (options.decimateRatio < 1) {
      await document.transform(
        simplify({
          simplifier: MeshoptSimplifier,
          ratio: options.decimateRatio,
          error: 0.001,
        }),
      );
    }

    const facesAfter = countFaces(document);

    if (options.textureQuality) {
      await document.transform(
        textureCompress({
          resize: [options.textureQuality, options.textureQuality],
        }),
      );
    }

    await document.transform(quantize());

    await document.transform(
      draco({
        method: "edgebreaker",
        encodeSpeed: dracoLevelToEncodeSpeed(options.dracoLevel),
        decodeSpeed: 10,
      }),
    );

    const optimized = await io.writeBinary(document);

    return {
      optimizedBuffer: Buffer.from(optimized),
      stats: {
        facesBefore,
        facesAfter,
      },
    };
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : "Failed to optimize model.");
  }
}
