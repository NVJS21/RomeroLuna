import os
import re

path = r"c:\Users\Navahas\Desktop\Bythelab\Romero Luna\css\style.css"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Global media rule (add at top after root or near reset)
if "img, video, iframe" not in content:
    content = content.replace("*,", "img, video, iframe, canvas, svg {\n  max-width: 100%;\n  height: auto;\n}\n\n*,", 1)

# 2. Fix grid min-widths (regex for flexibility)
content = re.sub(r"minmax\(\s*300px\s*,\s*1fr\s*\)", "minmax(250px, 1fr)", content)
content = re.sub(r"minmax\(\s*290px\s*,\s*1fr\s*\)", "minmax(250px, 1fr)", content)

# 3. Ensure no double miro-shapes (cleanup)
miro_block = r"""/\* ---------- Miro shape decorations — inline SVGs ---------- \*/
/\* Used as inline SVG elements placed in HTML for extra flair \*/
\.miro-shape \{
  position: absolute;
  pointer-events: none;
  z-index: 0;
  border-radius: 50%;
  opacity: 0.55;
\}"""

# Find all occurrences and keep only one if they are adjacent
matches = list(re.finditer(miro_block, content))
if len(matches) > 1:
    # This is a bit complex, let's just do a string replace for the specific duplicate I saw
    duplicate = """/* ---------- Miro shape decorations — inline SVGs ---------- */
/* Used as inline SVG elements placed in HTML for extra flair */
.miro-shape {
  position: absolute;
  pointer-events: none;
  z-index: 0;
  border-radius: 50%;
  opacity: 0.55;
}

/* ---------- Miro shape decorations — inline SVGs ---------- */
/* Used as inline SVG elements placed in HTML for extra flair */
.miro-shape {
  position: absolute;
  pointer-events: none;
  z-index: 0;
  border-radius: 50%;
  opacity: 0.55;
}"""
    content = content.replace(duplicate, duplicate.split("\n\n")[0])

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("Final CSS normalization completed.")
