"""Run with Blender 4.5: blender -b --python scripts/cleanup_jinwoo.py.

Non-destructive cleanup of the approved generated Jin-Woo intake assets.
The source GLBs remain untouched. Coordinates below are in metres, with Y up
and +Z forward; Blender imports this rig in centimetres with Z up.
"""

import hashlib
import argparse
import json
import math
from pathlib import Path

import bmesh
import bpy
import numpy as np
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'assets/incoming/jinwoo/generated'
REPORT = {'version':'v3', 'method':'local Blender mesh and weight repair',
          'blender':bpy.app.version_string, 'credits_consumed':0, 'files':[]}


def metric(co):
    return np.array([co.x, co.z, -co.y]) / 100


def blender(co):
    return Vector((co[0] * 100, -co[2] * 100, co[1] * 100))


def smoothstep(low, high, value):
    t = np.clip((value - low) / (high - low), 0, 1)
    return t * t * (3 - 2 * t)


def material_color(image, uv):
    width, height = image.size
    pixels = np.array(image.pixels[:], dtype=np.float32).reshape(height, width, 4)
    x = np.clip((uv[:, 0] * width).astype(int), 0, width - 1)
    y = np.clip((uv[:, 1] * height).astype(int), 0, height - 1)
    return pixels[y, x, :3]


def repair_face_openings(mesh):
    """Close the generated cheek/chin tears without closing the eye sockets."""
    bm = bmesh.new()
    bm.from_mesh(mesh)
    bm.verts.ensure_lookup_table()
    uv = bm.loops.layers.uv.active
    image = next(node.image for node in mesh.materials[0].node_tree.nodes if node.type == 'TEX_IMAGE')
    width, height = image.size
    pixels = np.array(image.pixels[:], dtype=np.float32).reshape(height, width, 4)

    def skin_sample(face):
        center_uv = sum((loop[uv].uv for loop in face.loops), Vector((0, 0))) / len(face.loops)
        col = pixels[min(height-1,max(0,int(center_uv.y*height))),
                     min(width-1,max(0,int(center_uv.x*width))), :3]
        return center_uv, col

    def on_face(vertex):
        px, py, pz = metric(vertex.co)
        return abs(px) < .075 and 1.575 < py < 1.638 and pz > .060

    candidates = {edge for edge in bm.edges if edge.is_boundary and all(on_face(v) for v in edge.verts)}
    before = len(candidates)
    parts = []
    while candidates:
        stack = [candidates.pop()]
        part = []
        while stack:
            edge = stack.pop()
            part.append(edge)
            neighbors = {other for vertex in edge.verts for other in vertex.link_edges if other in candidates}
            candidates.difference_update(neighbors)
            stack.extend(neighbors)
        parts.append(part)
    filled = 0
    collapsed = 0
    for part in parts:
        vertices = {vertex for edge in part for vertex in edge.verts}
        closed = all(sum(vertex in edge.verts for edge in part) == 2 for vertex in vertices)
        if closed and len(part) <= 8:
            # UVs are per face corner. Copy from the adjacent, outward-facing
            # skin surface so the fill retains the source skin texture.
            adjacent = {face for vertex in vertices for face in vertex.link_faces}
            samples = [(face, *skin_sample(face)) for face in adjacent if face.normal.y < 0]
            samples = [(face, sample_uv, color) for face, sample_uv, color in samples
                       if color[0] > .35 and color[0] > color[1] * 1.02 and color[1] > color[2] * 1.02]
            if not samples:
                raise ValueError('No matching skin texture beside a face repair')
            median = np.median([color for _, _, color in samples], axis=0)
            sample_uv = min(samples, key=lambda sample: np.linalg.norm(sample[2] - median))[1]
            center = np.mean([metric(vertex.co) for vertex in vertices], axis=0)
            faces = bmesh.ops.holes_fill(bm, edges=part, sides=8)['faces']
            for face in faces:
                face.smooth = True
                for loop in face.loops:
                    # Boundary UVs belong to different atlas islands. Sampling
                    # one matching, clean skin texel avoids crossing hair/cloth
                    # islands across the new patch.
                    delta = metric(loop.vert.co) - center
                    loop[uv].uv = sample_uv + Vector((delta[0], delta[1])) * .005
            bmesh.ops.triangulate(bm, faces=faces)
            filled += 1
        elif len(part) == 2 and len(vertices) == 3:
            # This pinched, sub-2 mm tear shares a third edge with overlapping
            # faces. Collapse the local sliver rather than add a fourth face.
            points = np.array([metric(vertex.co) for vertex in vertices])
            if np.linalg.norm(points.max(0) - points.min(0)) < .003:
                bmesh.ops.pointmerge(bm, verts=list(vertices), merge_co=blender(points.mean(0)))
                collapsed += 1
    bmesh.ops.dissolve_degenerate(bm, dist=.00001, edges=list(bm.edges))
    bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
    after = sum(edge.is_boundary and all(on_face(v) for v in edge.verts) for edge in bm.edges)
    bm.to_mesh(mesh)
    bm.free()
    validated = mesh.validate(clean_customdata=False)
    mesh.update()
    return {'boundary_edges_before':before, 'boundary_edges_after':after,
            'closed_surface_patches':filled, 'collapsed_slivers':collapsed,
            'new_patch_uvs':'matching adjacent skin sample', 'mesh_validation_repaired_data':validated}


def coat_component(mesh, coords):
    """Separate the outer coat from trousers using the disconnected lower mesh."""
    eligible = set(np.flatnonzero((coords[:, 1] > .25) & (coords[:, 1] < 1.095)))
    adjacency = [set() for _ in mesh.vertices]
    for edge in mesh.edges:
        a, b = edge.vertices
        adjacency[a].add(b)
        adjacency[b].add(a)
    components = []
    while eligible:
        stack = [eligible.pop()]
        part = []
        while stack:
            i = stack.pop()
            part.append(i)
            neighbors = adjacency[i] & eligible
            eligible.difference_update(neighbors)
            stack.extend(neighbors)
        components.append(part)
    outer = [part for part in components if np.ptp(coords[part, 0]) > .5
             and np.ptp(coords[part, 2]) > .3]
    if len(outer) != 1:
        raise ValueError(f'Expected one disconnected lower coat, found {len(outer)}')
    return {int(index) for index in outer[0]}


def add_finger_controls(obj, rig, coords):
    """Add two deforming phalanges per digit for restrained command gestures."""
    digits = {
        'Thumb': ((.670,1.378,.046), (.747,1.363,.062)),
        'Index': ((.720,1.392,.030), (.812,1.389,.027)),
        'Middle': ((.730,1.384,.008), (.817,1.382,.005)),
        'Ring': ((.724,1.377,-.015), (.808,1.373,-.013)),
        'Little': ((.710,1.369,-.034), (.788,1.363,-.036)),
    }
    bpy.ops.object.select_all(action='DESELECT')
    rig.select_set(True)
    bpy.context.view_layer.objects.active = rig
    bpy.ops.object.mode_set(mode='EDIT')
    lines = {}
    for side, sign in [('Left',1), ('Right',-1)]:
        for digit, (base, tip) in digits.items():
            base, tip = np.array(base), np.array(tip)
            base[0] *= sign
            tip[0] *= sign
            middle = base + (tip-base) * .52
            parent = rig.data.edit_bones[f'{side}Hand']
            for number, start, end in [(1,base,middle),(2,middle,tip)]:
                bone = rig.data.edit_bones.new(f'{side}{digit}{number}')
                bone.head, bone.tail = blender(start), blender(end)
                bone.parent = parent
                bone.use_connect = number == 2
                bone.align_roll(Vector((0,0,1)))
                parent = bone
            lines[(side,digit)] = (base,tip)
    bpy.ops.object.mode_set(mode='OBJECT')
    groups = {f'{side}{digit}{number}':obj.vertex_groups.new(name=f'{side}{digit}{number}')
              for side in ['Left','Right'] for digit in digits for number in [1,2]}
    affected = {'Left':0, 'Right':0}
    for side, sign in [('Left',1), ('Right',-1)]:
        ids = np.flatnonzero((coords[:,0]*sign > .64) & (coords[:,1] > 1.33) & (coords[:,1] < 1.45))
        for index in ids:
            i = int(index)
            point = coords[i]
            candidates = []
            for digit in digits:
                base, tip = lines[(side,digit)]
                direction = tip-base
                fraction = float(np.dot(point-base,direction)/np.dot(direction,direction))
                distance = np.linalg.norm(point-(base+direction*np.clip(fraction,0,1)))
                candidates.append((distance,digit,fraction))
            _, digit, fraction = min(candidates)
            blend = float(smoothstep(-.12,.20,fraction))
            if blend < .0001:
                continue
            distal = float(smoothstep(.35,.70,fraction))
            for existing in list(obj.data.vertices[i].groups):
                obj.vertex_groups[existing.group].remove([i])
            obj.vertex_groups[f'{side}Hand'].add([i],1-blend,'REPLACE')
            groups[f'{side}{digit}1'].add([i],blend*(1-distal),'REPLACE')
            groups[f'{side}{digit}2'].add([i],blend*distal,'REPLACE')
            affected[side] += 1
    return {'control_joints':list(groups), 'vertices_reweighted':affected,
            'purpose':'small independent finger curls; two phalanges per digit'}


def add_facial_controls(obj, coords):
    """Local blend shapes for a blink and the quiet, limited jaw performance."""
    obj.shape_key_add(name='Basis')
    counts = {}
    x, y, z = coords.T
    for side, cx in [('Left',.039), ('Right',-.039)]:
        ellipse = ((x-cx)/.024)**2 + ((y-1.661)/.016)**2
        amount = (1-smoothstep(.15,1,ellipse)) * ((z > .05) & (z < .095))
        key = obj.shape_key_add(name=f'Blink_{side}')
        selected = np.flatnonzero(amount > .001)
        for index in selected:
            i = int(index)
            point = coords[i].copy()
            point[1] += (1.658-point[1]) * amount[i] * .96
            key.data[i].co = blender(point)
        counts[key.name] = len(selected)
    amount = (smoothstep(1.545,1.563,y) * (1-smoothstep(1.590,1.608,y)) *
              smoothstep(.04,.07,z) * (1-smoothstep(.067,.085,np.abs(x))))
    key = obj.shape_key_add(name='Jaw_Open')
    selected = np.flatnonzero(amount > .001)
    for index in selected:
        i = int(index)
        point = coords[i].copy()
        angle = .105 * amount[i]
        dy, dz = point[1]-1.614, point[2]-.027
        point[1] = 1.614 + dy*math.cos(angle) - dz*math.sin(angle)
        point[2] = .027 + dy*math.sin(angle) + dz*math.cos(angle)
        key.data[i].co = blender(point)
    counts[key.name] = len(selected)
    amount = (1-smoothstep(.2,1,((x/.036)**2+((y-1.594)/.014)**2))) * (z > .06)
    key = obj.shape_key_add(name='Mouth_Narrow')
    selected = np.flatnonzero(amount > .001)
    for index in selected:
        i = int(index)
        point = coords[i].copy()
        point[0] *= 1-.18*amount[i]
        key.data[i].co = blender(point)
    counts[key.name] = len(selected)
    return {'blend_shapes':counts, 'maximum_jaw_angle_degrees':6.016,
            'purpose':'restrained blink and command blocking; no viseme or recorded lip-sync validation'}


def separate_eye_material(mesh, coords):
    uv_layer = mesh.uv_layers.active.data
    face_uv = np.array([np.mean([uv_layer[i].uv[:] for i in p.loop_indices],axis=0) for p in mesh.polygons])
    image = next(node.image for node in mesh.materials[0].node_tree.nodes if node.type == 'TEX_IMAGE')
    colors = material_color(image,face_uv)
    centers = np.array([coords[list(p.vertices)].mean(0) for p in mesh.polygons])
    x,y,z = centers.T
    pupil = (((np.abs(x)-.037)/.011)**2+((y-1.662)/.007)**2 < 1)
    pupil &= (z > .065) & (z < .095) & (colors.mean(1) < .38)
    pupil &= colors[:,0] >= colors[:,2]*.95
    ids = np.flatnonzero(pupil)
    if not len(ids):
        return {'material':None, 'triangles':0}
    material = mesh.materials[0].copy()
    material.name = 'JinWoo_Eyes'
    shader = next(node for node in material.node_tree.nodes if node.type == 'BSDF_PRINCIPLED')
    shader.inputs['Emission Color'].default_value = (.10,.16,.70,1)
    shader.inputs['Emission Strength'].default_value = .25
    mesh.materials.append(material)
    for index in ids:
        mesh.polygons[int(index)].material_index = len(mesh.materials)-1
    return {'material':material.name, 'triangles':len(ids),
            'default_emission_strength':.25, 'purpose':'separate blue-violet recognition light'}


def repair(kind, version='v3'):
    source = ASSETS / f'jinwoo-{kind}-v1.glb'
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(source))
    obj = next(o for o in bpy.context.scene.objects if o.type == 'MESH' and o.vertex_groups)
    rig = next(o for o in bpy.context.scene.objects if o.type == 'ARMATURE')
    mesh = obj.data
    obj.name = 'JinWoo'
    mesh.name = 'JinWoo_CleanedSurface'
    record = {'kind':kind, 'source':source.name,
              'source_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),
              'source_vertices':len(mesh.vertices), 'source_triangles':len(mesh.polygons)}

    # Weld geometry at UV splits while preserving per-loop UVs and deform data.
    bm = bmesh.new()
    bm.from_mesh(mesh)
    bmesh.ops.remove_doubles(bm, verts=list(bm.verts), dist=0.0005)
    bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
    bm.to_mesh(mesh)
    bm.free()
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    if mesh.has_custom_normals:
        bpy.ops.mesh.customdata_custom_splitnormals_clear()
    mesh.update()
    for polygon in mesh.polygons:
        polygon.use_smooth = True

    coords = np.array([metric(v.co) for v in mesh.vertices])
    adjacency = [set() for _ in mesh.vertices]
    for edge in mesh.edges:
        a, b = edge.vertices
        adjacency[a].add(b)
        adjacency[b].add(a)
    x, y, z = coords.T
    # Feather the boundary. Keep ears, hair, eyelids, lips and nose profile intact.
    influence = (smoothstep(1.477, 1.50, y) * (1 - smoothstep(1.633, 1.656, y)) *
                 smoothstep(.035, .057, z) * (1 - smoothstep(.075, .095, np.abs(x))))
    nose = np.exp(-((x / .018)**2 + ((y - 1.568) / .038)**2))
    lips = np.exp(-((x / .035)**2 + ((y - 1.525) / .014)**2))
    influence *= 1 - np.maximum(nose * .75, lips * .5)
    selected = np.flatnonzero(influence > .001)
    original = coords.copy()
    # Taubin pairs remove local spikes without collapsing the jaw volume.
    for _ in range(10):
        for factor in (.48, -.50):
            delta = np.zeros_like(coords)
            for i in selected:
                if adjacency[i]:
                    delta[i] = coords[list(adjacency[i])].mean(axis=0) - coords[i]
            coords += delta * influence[:, None] * factor
    for i in selected:
        mesh.vertices[int(i)].co = blender(coords[i])
    record['face_vertices_smoothed'] = len(selected)
    record['maximum_face_displacement_m'] = float(np.linalg.norm(coords - original, axis=1).max())
    mesh.update()

    record['face_surface_repair'] = repair_face_openings(mesh)
    coords = np.array([metric(vertex.co) for vertex in mesh.vertices])
    # Color alone included trouser vertices and missed coat atlas patches.
    # Below the waist these surfaces are disconnected, giving an exact mask.
    coat_ids = coat_component(mesh, coords)
    record['coat_selection_method'] = 'connected outer surface below the waist'

    rig.animation_data_clear() if kind == 'rigged' else None
    bpy.ops.object.select_all(action='DESELECT')
    rig.select_set(True)
    bpy.context.view_layer.objects.active = rig
    bpy.ops.object.mode_set(mode='EDIT')
    # The importer gives bone display tails centimetres twice. Shorten display
    # lengths along their existing axes, which preserves the bind transforms.
    for bone in rig.data.edit_bones:
        if bone.length > 100:
            bone.tail = bone.head + (bone.tail - bone.head) * .01
    angles = [.80, 1.72, 2.65, -2.65, -1.72, -.80]
    names = ['FrontLeft','SideLeft','BackLeft','BackRight','SideRight','FrontRight']
    for angle, name in zip(angles, names):
        radial_x, radial_z = .195 * math.sin(angle), .12 * math.cos(angle)
        parent = rig.data.edit_bones['Hips']
        for segment, top, bottom in [('Upper',1.045,.72), ('Lower',.72,.39)]:
            bone = rig.data.edit_bones.new(f'Coat_{name}_{segment}')
            bone.head = blender((radial_x, top, radial_z))
            bone.tail = blender((radial_x * 1.32, bottom, radial_z * 1.32))
            bone.parent = parent
            bone.use_connect = False
            parent = bone
    bpy.ops.object.mode_set(mode='OBJECT')
    groups = {f'Coat_{name}_{part}':obj.vertex_groups.new(name=f'Coat_{name}_{part}')
              for name in names for part in ['Upper','Lower']}
    hips = obj.vertex_groups['Hips']
    for i in sorted(coat_ids):
        px, py, pz = coords[i]
        angle = math.atan2(px / .195, pz / .12)
        distance = np.abs(np.angle(np.exp(1j * (angle - np.array(angles)))))
        nearest = np.argsort(distance)[:2]
        fraction = 1 - smoothstep(.68, .88, py)
        root_weight = float(smoothstep(1.00, 1.095, py))
        weights = {}
        # Max four influences (root at the top; lower influence only below it).
        for j in nearest:
            panel = 1 / max(float(distance[j]), .08)**2
            for part, blend in [('Upper',1-fraction),('Lower',fraction)]:
                if blend > .0001:
                    weights[f'Coat_{names[j]}_{part}'] = panel * blend
        total = sum(weights.values())
        for group in list(mesh.vertices[i].groups):
            obj.vertex_groups[group.group].remove([i])
        for name, weight in weights.items():
            groups[name].add([i], weight / total * (1-root_weight), 'REPLACE')
        if root_weight > .0001:
            hips.add([i], root_weight, 'REPLACE')
    record['coat_vertices_reweighted'] = len(coat_ids)
    record['coat_control_joints'] = list(groups)
    record['fingers'] = add_finger_controls(obj,rig,coords)
    record['face_controls'] = add_facial_controls(obj,coords)
    record['eyes'] = separate_eye_material(mesh,coords)

    # Keep provided body motion and add locally keyed, modest coat follow-through.
    if kind != 'rigged':
        action = rig.animation_data.action
        start, end = (int(v) for v in action.frame_range)
        for frame in range(start, end + 1):
            phase = 2 * math.pi * (frame - start) / max(1, end - start)
            for j, name in enumerate(names):
                for part in ['Upper','Lower']:
                    bone = rig.pose.bones[f'Coat_{name}_{part}']
                    bone.rotation_mode = 'XYZ'
                    lag = .45 if part == 'Lower' else 0
                    amplitude = (.045 if kind == 'walking' else .10) * (1.3 if part == 'Lower' else 1)
                    bone.rotation_euler.x = amplitude * math.sin(phase - lag + j * .13)
                    bone.keyframe_insert(data_path='rotation_euler', frame=frame, group=bone.name)
        bpy.context.scene.frame_set(start)

    # Surface normals were rebuilt before the blend shapes. Do not round-trip
    # through BMesh here: it can reorder vertices after shape keys are present.
    mesh.update()
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    rig.select_set(True)
    bpy.context.view_layer.objects.active = rig
    if mesh.validate(clean_customdata=False):
        raise ValueError('Mesh still required repair before export')
    destination = ASSETS / f'jinwoo-{kind}-{version}.glb'
    bpy.ops.export_scene.gltf(filepath=str(destination), export_format='GLB',
                              use_selection=True, export_animations=kind != 'rigged',
                              export_morph=True, export_force_sampling=True)
    if kind == 'rigged':
        # Save an editable, packed source, with no diagnostic custom-shape sphere.
        for other in list(bpy.data.objects):
            if other not in (obj, rig):
                bpy.data.objects.remove(other, do_unlink=True)
        bpy.ops.file.pack_all()
        bpy.ops.wm.save_as_mainfile(filepath=str(ASSETS / f'jinwoo-cleaned-{version}.blend'))
    record.update(output=destination.name, size_bytes=destination.stat().st_size,
                  sha256=hashlib.sha256(destination.read_bytes()).hexdigest(),
                  welded_vertices=len(mesh.vertices), triangles=len(mesh.polygons))
    REPORT['files'].append(record)


if __name__ == '__main__':
    import sys
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--version', default='v3', choices=['v3'])
    parser.add_argument('--kind', choices=['rigged','walking','running','all'], default='all')
    args = parser.parse_args(sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else [])
    for kind in ['rigged','walking','running'] if args.kind == 'all' else [args.kind]:
        repair(kind, args.version)
    REPORT['limitations'] = ['Facial controls cover restrained blocking; recorded lip sync is not validated.',
                            'Coat controls use keyed secondary motion, not cloth collision simulation.',
                            'Generated topology and texture still require close-up acceptance.']
    (ASSETS / f'jinwoo-cleanup-{args.version}.record.json').write_text(json.dumps(REPORT, indent=2) + '\n')
    print(json.dumps(REPORT, indent=2))
