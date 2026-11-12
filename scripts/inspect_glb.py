"""Inspect a local GLB's geometry, textures, skeleton, and animation metadata."""

import argparse
import hashlib
import json
import math
from pathlib import Path
import struct


def inspect(path):
    raw = Path(path).read_bytes()
    magic, version, length = struct.unpack_from("<4sII", raw)
    if magic != b"glTF" or version != 2 or length != len(raw):
        raise ValueError("Invalid GLB header or length")
    offset = 12
    document = None
    binary = b""
    while offset < length:
        size, kind = struct.unpack_from("<II", raw, offset)
        offset += 8
        if offset + size > length:
            raise ValueError("GLB chunk exceeds file length")
        chunk = raw[offset:offset + size]
        if kind == 0x4E4F534A:
            document = json.loads(chunk)
        elif kind == 0x004E4942:
            binary = chunk
        offset += size
    if document is None:
        raise ValueError("GLB has no JSON document")
    accessors = document.get("accessors", [])
    views = document.get("bufferViews", [])
    formats = {5120: "b", 5121: "B", 5122: "h", 5123: "H", 5125: "I", 5126: "f"}
    widths = {"SCALAR": 1, "VEC2": 2, "VEC3": 3, "VEC4": 4, "MAT4": 16}

    def values(index):
        accessor = accessors[index]
        if "sparse" in accessor:
            raise ValueError("Sparse accessors require an expanded inspection")
        view = views[accessor["bufferView"]]
        if view.get("buffer", 0) != 0:
            raise ValueError("External accessor buffer")
        fmt = "<" + formats[accessor["componentType"]] * widths[accessor["type"]]
        size = struct.calcsize(fmt)
        stride = view.get("byteStride", size)
        start = view.get("byteOffset", 0) + accessor.get("byteOffset", 0)
        count = accessor["count"]
        if count and start + (count - 1) * stride + size > len(binary):
            raise ValueError("Accessor exceeds binary chunk")
        return [struct.unpack_from(fmt, binary, start + i * stride) for i in range(count)]

    primitives = []
    total_triangles = 0
    for mesh_index, mesh in enumerate(document.get("meshes", [])):
        for primitive_index, primitive in enumerate(mesh.get("primitives", [])):
            attributes = primitive["attributes"]
            positions = values(attributes["POSITION"])
            if not positions or any(not math.isfinite(v) for p in positions for v in p):
                raise ValueError("Empty or non-finite geometry")
            indices = [v[0] for v in values(primitive["indices"])] if "indices" in primitive else list(range(len(positions)))
            if any(i < 0 or i >= len(positions) for i in indices):
                raise ValueError("Index exceeds vertex count")
            mode = primitive.get("mode", 4)
            triangles = len(indices) // 3 if mode == 4 else max(0, len(indices) - 2) if mode in (5, 6) else 0
            total_triangles += triangles
            entry = {
                "mesh_index": mesh_index, "primitive_index": primitive_index,
                "name": mesh.get("name"), "vertices": len(positions),
                "triangles": triangles, "mode": mode,
                "attributes": sorted(attributes), "material": primitive.get("material"),
                "local_bounds_min": [min(p[k] for p in positions) for k in range(3)],
                "local_bounds_max": [max(p[k] for p in positions) for k in range(3)],
                "morph_target_count": len(primitive.get("targets", [])),
            }
            if "WEIGHTS_0" in attributes:
                weights = values(attributes["WEIGHTS_0"])
                component = accessors[attributes["WEIGHTS_0"]]["componentType"]
                divisor = {5121: 255, 5123: 65535}.get(component, 1)
                sums = [sum(w) / divisor for w in weights]
                entry["weight_sum_range"] = [min(sums), max(sums)]
                entry["zero_weight_vertices"] = sum(s <= 0 for s in sums)
            primitives.append(entry)
    nodes = document.get("nodes", [])
    skins = [{"name": s.get("name"), "joint_count": len(s["joints"]),
              "joint_names": [nodes[i].get("name", str(i)) for i in s["joints"]],
              "inverse_bind_matrices": "inverseBindMatrices" in s}
             for s in document.get("skins", [])]
    animations = []
    for animation in document.get("animations", []):
        times = [v[0] for sampler in animation["samplers"] for v in values(sampler["input"])]
        animations.append({"name": animation.get("name"), "duration_seconds": max(times) - min(times),
                           "channels": len(animation["channels"]),
                           "animated_paths": sorted({c["target"]["path"] for c in animation["channels"]})})
    external = [item["uri"] for key in ("buffers", "images") for item in document.get(key, [])
                if "uri" in item and not item["uri"].startswith("data:")]
    return {
        "file": str(Path(path).resolve()), "file_size_bytes": len(raw),
        "sha256": hashlib.sha256(raw).hexdigest(), "glb_version": version,
        "asset": document.get("asset"), "extensions_required": document.get("extensionsRequired", []),
        "mesh_count": len(document.get("meshes", [])), "total_triangles": total_triangles,
        "primitives": primitives, "node_count": len(nodes), "skins": skins,
        "materials": document.get("materials", []),
        "images": document.get("images", []), "external_dependencies": external,
        "animations": animations,
        "note": "Structural inspection only; likeness and deformation require visual review.",
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("model")
    parser.add_argument("--output")
    args = parser.parse_args()
    report = inspect(args.model)
    encoded = json.dumps(report, indent=2) + "\n"
    if args.output:
        Path(args.output).write_text(encoded)
    print(encoded)
