import re

def fix_paths(content):
    content = content.replace('../assets/', 'assets/')
    content = content.replace('../js/', 'js/')
    content = content.replace('../css/', 'css/')
    # Update page links to anchors
    content = content.replace('pages/servicios.html', '#apartamentos')
    content = content.replace('pages/resenas.html', '#resenas')
    content = content.replace('pages/sobre-nosotros.html', '#sobre-nosotros')
    content = content.replace('pages/sitios-de-interes.html', '#sitios-de-interes')
    return content

def extract_section_robust(file_path, start_pattern, end_pattern):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Use re to find start and end
    # Match pattern regardless of line endings
    start_match = re.search(start_pattern, content, re.IGNORECASE)
    if not start_match:
        print(f"Start pattern '{start_pattern}' not found in {file_path}")
        return ""
    
    start_idx = start_match.start()
    
    # Find end pattern after start
    end_match = re.search(end_pattern, content[start_idx:], re.IGNORECASE)
    if not end_match:
        print(f"End pattern '{end_pattern}' not found in {file_path}")
        # If end not found, we might want to fail or use fallback
        # But we really want to stop before footer.
        # Fallback to end of file if not found, but we know it's there.
        return content[start_idx:]
    
    end_idx = start_idx + end_match.start()
    return content[start_idx:end_idx]

# Patterns
footer_pattern = r'<!--\s*========\s*FOOTER NUEVO\s*========\s*-->'

# 1. Servicios
servicios_content = extract_section_robust('pages/servicios.html', r'<!--\s*========\s*SERVICES\s*========\s*-->', footer_pattern)
servicios_styles = extract_section_robust('pages/servicios.html', r'<!--\s*Inline styles for compact carousel\s*-->', r'<!--\s*========\s*SERVICES\s*========\s*-->')
# Overlay is brief, line 178-181
# It starts at <div id="img-overlay"> and ends before <!-- ======== SERVICES ======== -->
servicios_overlay = extract_section_robust('pages/servicios.html', r'<div id="img-overlay">', r'<!--\s*========\s*SERVICES\s*========\s*-->')

# 2. Resenas
resenas_content = extract_section_robust('pages/resenas.html', r'<!--\s*========\s*SCORE HIGHLIGHT\s*========\s*-->', footer_pattern)

# 3. Sobre Nosotros
sobre_content = extract_section_robust('pages/sobre-nosotros.html', r'<!--\s*========\s*ABOUT\s*========\s*-->', footer_pattern)

# 4. Sitios de Interes
sitios_content = extract_section_robust('pages/sitios-de-interes.html', r'<!--\s*========\s*MAP\s*========\s*-->', footer_pattern)
sitios_styles = extract_section_robust('pages/sitios-de-interes.html', r'<style>', r'<link\s+rel="stylesheet"\s+href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"\s*/>')

# Combine
combined = "<!-- ============================================================ -->\n"
combined += "<!-- CONSOLIDATED CONTENT START -->\n"
combined += "<!-- ============================================================ -->\n\n"

combined += "<!-- Styles for Servicios/Sitios -->\n"
combined += servicios_styles + "\n"
if "<style>" in sitios_styles:
    combined += sitios_styles + "\n"
else:
    # If <style> is in start_pattern, it's included in match.start()?
    # extract_section_robust includes from match.start() to end_match.start()
    combined += sitios_styles + "\n"

combined += "<!-- Overlay/Lightbox -->\n"
combined += servicios_overlay + "\n\n"

combined += "<!-- ======== APARTAMENTOS (Servicios) ======== -->\n"
fixed_servicios = servicios_content.replace('<section class="section">', '<section class="section" id="apartamentos">', 1)
fixed_servicios = fixed_servicios.replace('class="location-block reveal"', 'class="location-block reveal" id="apartamentos-centro"', 1)
fixed_servicios = fixed_servicios.replace('class="location-block reveal"', 'class="location-block reveal" id="apartamentos-soho"', 1)
combined += fixed_servicios + "\n\n"

combined += "<!-- ======== RESEÑAS ======== -->\n"
fixed_resenas = resenas_content.replace('<section class="section--sm"', '<section class="section--sm" id="resenas"', 1)
combined += fixed_resenas + "\n\n"

combined += "<!-- ======== SOBRE NOSOTROS ======== -->\n"
fixed_sobre = sobre_content.replace('<section class="section">', '<section class="section" id="sobre-nosotros">', 1)
combined += fixed_sobre + "\n\n"

combined += "<!-- ======== SITIOS DE INTERÉS ======== -->\n"
fixed_sitios = sitios_content.replace('<section class="section">', '<section class="section" id="sitios-de-interes">', 1)
combined += fixed_sitios + "\n"

# Fix paths
combined = fix_paths(combined)

with open('combined_content.html', 'w', encoding='utf-8') as f:
    f.write(combined)

print("Combined content generated successfully in combined_content.html")
f = open('combined_content.html', 'r', encoding='utf-8')
print(f"File size: {len(f.read())} characters")
f.close()
