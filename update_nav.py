import os
import glob

base = r"C:\Users\Navahas\Desktop\Bythelab\Romero Luna"
files = [os.path.join(base, "index.html")] + glob.glob(os.path.join(base, "pages", "*.html"))

for path in files:
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    
    original = content
    
    # Remove Fotos link from desktop nav (index.html pattern)
    content = content.replace('<li><a href="pages/fotos.html" class="navbar__link">Fotos</a></li>', "")
    # Remove Fotos link from subpages nav
    content = content.replace('<li><a href="fotos.html" class="navbar__link">Fotos</a></li>', "")
    # Remove Fotos from mobile drawer (index.html)
    content = content.replace('<a href="pages/fotos.html" class="navbar__link">Fotos</a>', "")
    # Remove Fotos from mobile drawer (subpages)
    content = content.replace('<a href="fotos.html" class="navbar__link">Fotos</a>', "")
    
    # Rename Servicios -> Instalaciones in nav links (index.html)
    content = content.replace(">Servicios<", ">Instalaciones<")
    
    # Rename page title
    content = content.replace("Romero Luna | Servicios", "Romero Luna | Instalaciones")
    
    if content != original:
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        print("Updated:", os.path.basename(path))
    else:
        print("No changes:", os.path.basename(path))
