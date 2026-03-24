import os

def update_en_footer(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Determine relative path
    depth = filepath.count(os.sep)
    if 'en\\' in filepath or 'en/' in filepath: # it's inside en/
        prefix = '../' * depth
    else:
        prefix = '../' * depth # shouldn't happen for EN script
        
    if 'aviso-legal.html' in content:
        return

    # Add the links after Booking.com
    booking_str = '>Booking.com</a>'
    
    new_links = f'''>Booking.com</a>
            <a href="{prefix}aviso-legal.html" class="footer-new__link">Legal Notice</a>
            <a href="{prefix}politica-privacidad.html" class="footer-new__link">Privacy Policy</a>
            <a href="{prefix}politica-cookies.html" class="footer-new__link">Cookie Policy</a>'''

    if booking_str in content:
        content = content.replace(booking_str, new_links)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")
    else:
        print(f"Booking link not found in {filepath}")

for root, dirs, files in os.walk('en'):
    for str_file in files:
        if str_file.endswith('.html'):
            update_en_footer(os.path.join(root, str_file).replace('./', '').replace('.\\', ''))
