import os

base_dir = r"C:\Users\Navahas\Desktop\Bythelab\Romero Luna"
index_path = os.path.join(base_dir, "index.html")

with open(index_path, "r", encoding="utf-8") as f:
    index_html = f.read()

# Extract Navbar
nav_start = index_html.find("  <!-- ======== NAVBAR ======== -->")
nav_end = index_html.find("  <!-- ======== HERO ======== -->")
nav_html = index_html[nav_start:nav_end].strip() + "\n\n"

# Extract Footer
footer_start = index_html.find("  <!-- ======== FOOTER NUEVO ======== -->")
footer_end = index_html.find("  <script src=\"js/main.js\"></script>")
footer_html = index_html[footer_start:footer_end].strip() + "\n\n"

# Adjust paths for pages/ (change relative paths)
nav_html = nav_html.replace("href=\"index.html\"", "href=\"../index.html\"")
nav_html = nav_html.replace("src=\"assets/", "src=\"../assets/")
nav_html = nav_html.replace("href=\"pages/", "href=\"") 

footer_html = footer_html.replace("href=\"index.html\"", "href=\"../index.html\"")
footer_html = footer_html.replace("src=\"assets/", "src=\"../assets/")
footer_html = footer_html.replace("href=\"pages/", "href=\"")

pages = ["fotos.html", "servicios.html", "resenas.html", "sobre-nosotros.html", "sitios-de-interes.html"]

for page in pages:
    page_path = os.path.join(base_dir, "pages", page)
    with open(page_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Replace Navbar
    old_nav_start = content.find("    <!-- ======== NAVBAR ======== -->")
    if old_nav_start == -1: old_nav_start = content.find("  <!-- ======== NAVBAR ======== -->")
    
    old_nav_end = content.find("    <!-- ======== PAGE HEADER ======== -->")
    
    if old_nav_end != -1 and old_nav_start != -1:
        content = content[:old_nav_start] + "    " + nav_html.replace("\n", "\n    ") + content[old_nav_end:]
    
    # Replace Contact Bar and Footer
    old_contact_start = content.find("    <!-- ======== CONTACT BAR ======== -->")
    if old_contact_start == -1: old_contact_start = content.find("  <!-- ======== FOOTER NUEVO ======== -->") # Just in case it was already copied

    old_script_start = content.find("    <script src=\"../js/main.js\"></script>")
    if old_contact_start != -1 and old_script_start != -1:
        content = content[:old_contact_start] + "    " + footer_html.replace("\n", "\n    ") + content[old_script_start:]
    
    with open(page_path, "w", encoding="utf-8") as f:
        f.write(content)
        
print("Sync completed successfully")
