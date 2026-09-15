# PS1 Archer Girl - Hood & Bow Rebuild Summary

## Functions Deleted and Created

### Deleted:
- **createHead()** - Removed entire old hood build (skullWrap, hoodPoint, collarSkirt meshes and geometries)
- **createBow()** - Removed entire old bow build (old TubeGeometry curve, stringTop, stringBottom, grip meshes)
- **runSelfChecks()** - Removed old GRIP, HANDS, HOOD, FACE checks

### Created:
- **createHead()** - New minimal hood: cap cone (ConeGeometry) + back flap (BoxGeometry)
- **createBow()** - New bow with origin at wooden riser center, symmetric limbs, string offset in -Z
- **runSelfChecks()** - New 7-check validation system: HOOD_SIT, HOOD_COVER, HOOD_CENTER, FACE_OPEN, GRIP_WOOD, LEFT_HAND_STRING_CLEAR, STRING_BEHIND_WOOD

### Modified:
- **POSES table** - Updated arm/bow rotations for natural archer holds
- **updatePose()** - Added arrow visibility toggle (only visible in Draw pose)

---

## Expected Silhouette

### IDLE Pose
**Front view (+Z):**
- Hood: Pointed cap sits on head with base at brow line, back flap covers skull from brow to neck. Face fully visible below cap rim with eyes and mouth clear.
- Bow: Held diagonally (~45°) across front of body, lower limb near left hip, upper limb pointing toward character's right at chest height. Left hand grips wooden riser at hip height. Right arm relaxed at side. Bowstring faces +Z (away from body).

**Side view (+X or -X):**
- Hood: Cap point visible extending upward from crown, back flap visible covering rear of head.
- Bow: Diagonal line visible from hip to chest area, left arm slightly forward with bent elbow.

**Back view (-Z):**
- Hood: Cap point prominent, back flap fully covering skull rear from brow to neck.
- Bow: Diagonal shaft visible behind character at angle.

### AIM Pose
**Front view (+Z):**
- Hood: Same as IDLE - cap and back flap unchanged.
- Bow: VERTICAL in front of chest, tip up. Left arm fully extended forward at shoulder height gripping wooden riser. Right arm brought across body with hand at bowstring nock point (fingers on string, elbow slightly below hand). String unstretched or minimally stretched.

**Side view (+X or -X):**
- Hood: Cap point extends backward from crown.
- Bow: Vertical line in front of body, left arm horizontal and fully extended, right arm bent with hand at nock near chest.

**Back view (-Z):**
- Hood: Cap point prominent, back flap coverage unchanged.
- Bow: Vertical line visible between extended arms.

### DRAW Pose
**Front view (+Z):**
- Hood: Same as IDLE and AIM.
- Bow: VERTICAL, fully extended forward. Left arm fully extended forward gripping riser. Right arm pulled back to right cheek corner with hand at string. Bowstring stretched into V shape. Arrow nocked and visible along bow shaft.

**Side view (+X or -X):**
- Hood: Cap point extends backward.
- Bow: Left arm horizontal and fully extended, right arm pulled back with elbow high. String tension visible as V shape. Arrow shaft visible from nock to bow.

**Back view (-Z):**
- Hood: Cap point prominent, back flap coverage unchanged.
- Bow: Left arm extended forward (foreshortened), right arm pulled back with elbow visible. String V-shape visible.

---

## Runtime Self-Checks

The system validates 7 critical constraints on startup and every pose change:

1. **HOOD_SIT**: Cap base world Y must be inside [eyeWorldY, eyeWorldY + 0.06]
2. **HOOD_COVER**: Cap base world radius must be >= head half-diagonal * 1.05
3. **HOOD_CENTER**: Cap world X/Z must be within 0.005 of head world X/Z
4. **FACE_OPEN**: Eyes and mouth world Y must be strictly below cap base world Y, and no hood mesh bounding box can intersect the face front box
5. **GRIP_WOOD**: World distance from left palm center to bow group origin must be < 0.02 in all poses
6. **LEFT_HAND_STRING_CLEAR**: World distance from left palm center to bowstring mesh must be > 0.04 in IDLE and AIM (hand touches wood only)
7. **STRING_BEHIND_WOOD**: In bow local space, string z must be <= wood z - 0.02

All checks print PASS/FAIL to console with detailed measurements.

---

## User Instructions

**Open the browser console (F12) and paste back any FAIL line you see.**

The self-checks run automatically on startup and every pose change. If any check fails, the console will show:
- Check number and name (e.g., "1. HOOD_SIT: FAIL")
- Measured values
- Required thresholds
- Detailed breakdown of what failed

This will help identify exactly which geometry or positioning needs adjustment.

---

## PS1 Constraints Preserved

✓ Low internal resolution (0.25 scale) with pixelated CSS upscale  
✓ Vertex-snap shader patch (PS1 jitter effect)  
✓ flatShading: true on all materials  
✓ NearestFilter canvas textures (64x64, no mipmaps)  
✓ Fog matched to background color  
✓ Blob shadow (flat dark circle under feet)  
✓ Triangle cap maintained (~1000 triangles)  
✓ Live triangle counter in UI  
✓ All code, comments, and identifiers in English only
