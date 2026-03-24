import os, re

def update_footer(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Determine relative path
    depth = filepath.count(os.sep)
    if depth == 0:
        prefix = ''
    else:
        prefix = '../' * depth
        
    # Check if already updated (we use 'Aviso Legal' href to the actual page)
    if f'href="{prefix}aviso-legal.html"' in content or 'aviso-legal.html' in content:
        # Some already updated or not applicable
        if 'Aviso Legal y Condiciones de Uso' not in content: # except the generated ones
            print(f"Already updated {filepath}")
        return

    # Add the links after Booking.com
    # The booking link spans lines so we must match it carefully.
    booking_link_pattern = r'(<a href="https://www\.booking\.com.*?class="footer-new__link">Booking\.com</a>)'
    
    new_links = f'''\\1
            <a href="{prefix}aviso-legal.html" class="footer-new__link">Aviso Legal</a>
            <a href="{prefix}politica-privacidad.html" class="footer-new__link">Política de Privacidad</a>
            <a href="{prefix}politica-cookies.html" class="footer-new__link">Política de Cookies</a>'''

    new_content = re.sub(booking_link_pattern, new_links, content, flags=re.DOTALL)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")
    else:
        print(f"Could not find target in {filepath}")

for root, dirs, files in os.walk('.'):
    for str_file in files:
        if str_file.endswith('.html') and 'legal' not in root:
            update_footer(os.path.join(root, str_file).replace('./', '').replace('.\\', ''))
