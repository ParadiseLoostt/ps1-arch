# PS1 Archer Girl - Expected Silhouettes

## Hood Design
The hood is now a single enveloping garment with three connected parts:
- **Skull wrap**: 6-sided open cylinder with ~110° missing sector at front (+Z), wrapping around the back and sides of the head
- **Hood point**: 6-sided cone seated on the skull wrap top, tilted ~12° backward
- **Collar skirt**: Full 6-sided ring extending from brow line down to shoulders

## Pose Silhouettes

### IDLE Pose
**Front view (+Z):**
- Hood frames the face with the opening at the front, eyes and mouth fully visible
- Bow held diagonally (~45°) across the front of the body
- Lower bow limb near left hip, upper limb pointing toward character's right at chest height
- Left arm slightly forward with elbow bent ~70°, hand at belt level
- Right arm relaxed at side
- Bowstring faces +Z (away from body)

**Side view (+X or -X):**
- Hood point visible extending backward from crown
- Skull wrap covers back and sides of head completely
- Bow visible as diagonal line from hip to chest
- Left elbow bent, forearm angled forward

**Back view (-Z):**
- Hood point clearly visible, tilted backward
- Skull wrap and collar skirt form continuous coverage
- No bare head-box surface visible above brow line
- Bow diagonal visible across the back

### AIM Pose
**Front view (+Z):**
- Hood frames face, eyes focused forward
- Bow VERTICAL in front of chest, tip up
- Left arm fully extended forward at shoulder height, gripping bow
- Right arm brought across body, hand at bowstring nock point
- Right elbow slightly below hand level
- Bowstring faces +Z (away from body)
- String unstretched or minimally stretched

**Side view (+X or -X):**
- Hood point extends backward
- Left arm horizontal, fully extended
- Right arm bent, hand at nock point near chest
- Bow vertical line in front of body
- Both hands visible at bow (left on grip, right at nock)

**Back view (-Z):**
- Hood point prominent, tilted back
- Arms extended forward (visible as foreshortened)
- Bow vertical line visible between arms

### DRAW Pose
**Front view (+Z):**
- Hood frames face, eyes focused on target
- Bow VERTICAL, fully extended forward
- Left arm fully extended forward, gripping bow
- Right arm pulled back to right cheek corner
- Bowstring stretched into a V shape
- Arrow nocked and visible along the bow
- Right elbow raised, pointing backward

**Side view (+X or -X):**
- Hood point extends backward
- Left arm horizontal, fully extended
- Right arm pulled back, elbow high
- Bowstring visible as stretched V
- Arrow shaft visible from nock to bow

**Back view (-Z):**
- Hood point prominent
- Left arm extended forward (foreshortened)
- Right arm pulled back, elbow visible
- String tension visible as V shape

## Runtime Self-Checks
The system validates four critical constraints on startup and every pose change:

1. **GRIP**: Bow grip anchor must be within 0.02 units of handLeft palm center
2. **HANDS**: Right hand must be within 0.03 units of bowstring nock in AIM/DRAW poses
3. **HOOD**: Hood geometry must properly envelop head:
   - Bottom reaches below skull (min.y <= head.min.y + 0.02)
   - Point extends above crown (max.y >= head.max.y + 0.15)
   - Centered on head in X and Z (within 0.01 units)
4. **FACE**: Eyes must protrude forward of hood front rim at eye height

All checks print PASS/FAIL to console with detailed measurements.
