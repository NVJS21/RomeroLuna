import os
import glob

base = r"C:\Users\Navahas\Desktop\Bythelab\Romero Luna"
files = glob.glob(os.path.join(base, "pages", "*.html")) + [os.path.join(base, "index.html")]

for path in files:
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    original = content

    # Fix wrong filename: Hacia-dentroSoho -> Hacia-adentroSoho
    content = content.replace("Hacia-dentroSoho", "Hacia-adentroSoho")

    if content != original:
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        print("Fixed Soho filename in:", os.path.basename(path))
    else:
        print("No changes:", os.path.basename(path))
