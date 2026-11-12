"""Small dense-accessor GLB editor for reproducible local character repairs."""

import json
import struct
from pathlib import Path


class GLB:
    def __init__(self, path):
        self.path = Path(path)
        raw = self.path.read_bytes()
        magic, version, length = struct.unpack_from('<4sII', raw)
        if magic != b'glTF' or version != 2 or length != len(raw):
            raise ValueError('Invalid GLB')
        offset = 12
        while offset < length:
            size, kind = struct.unpack_from('<II', raw, offset)
            offset += 8
            data = raw[offset:offset + size]
            if kind == 0x4E4F534A:
                self.doc = json.loads(data)
            elif kind == 0x004E4942:
                self.binary = bytearray(data)
            offset += size

    def values(self, index):
        a = self.doc['accessors'][index]
        if 'sparse' in a:
            raise ValueError('Expand sparse accessors first')
        v = self.doc['bufferViews'][a['bufferView']]
        formats = {5121:'B', 5123:'H', 5125:'I', 5126:'f'}
        widths = {'SCALAR':1, 'VEC2':2, 'VEC3':3, 'VEC4':4, 'MAT4':16}
        fmt = '<' + formats[a['componentType']] * widths[a['type']]
        size = struct.calcsize(fmt)
        start = v.get('byteOffset', 0) + a.get('byteOffset', 0)
        stride = v.get('byteStride', size)
        return [struct.unpack_from(fmt, self.binary, start + i * stride) for i in range(a['count'])]

    def append_bytes(self, data, target=None):
        while len(self.binary) % 4:
            self.binary.append(0)
        view = {'buffer':0, 'byteOffset':len(self.binary), 'byteLength':len(data)}
        if target:
            view['target'] = target
        self.binary.extend(data)
        self.doc.setdefault('bufferViews', []).append(view)
        return len(self.doc['bufferViews']) - 1

    def accessor(self, rows, kind='VEC3', component=5126, target=34962, bounds=False):
        widths = {'SCALAR':1, 'VEC2':2, 'VEC3':3, 'VEC4':4, 'MAT4':16}
        fmt = '<' + {5121:'B', 5123:'H', 5125:'I', 5126:'f'}[component] * widths[kind]
        data = b''.join(struct.pack(fmt, *row) for row in rows)
        a = {'bufferView':self.append_bytes(data, target), 'componentType':component,
             'count':len(rows), 'type':kind}
        if bounds:
            a['min'] = [min(r[k] for r in rows) for k in range(widths[kind])]
            a['max'] = [max(r[k] for r in rows) for k in range(widths[kind])]
        self.doc.setdefault('accessors', []).append(a)
        return len(self.doc['accessors']) - 1

    def save(self, path):
        self.doc['buffers'] = [{'byteLength':len(self.binary)}]
        encoded = json.dumps(self.doc, separators=(',', ':')).encode()
        encoded += b' ' * (-len(encoded) % 4)
        self.binary.extend(b'\0' * (-len(self.binary) % 4))
        length = 12 + 8 + len(encoded) + 8 + len(self.binary)
        raw = (struct.pack('<4sII', b'glTF', 2, length) +
               struct.pack('<II', len(encoded), 0x4E4F534A) + encoded +
               struct.pack('<II', len(self.binary), 0x004E4942) + self.binary)
        Path(path).write_bytes(raw)
