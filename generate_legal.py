import os, re

# Read index.html
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract head
head_match = re.search(r'(<!DOCTYPE html>.*?</head>)', content, re.DOTALL)
head = head_match.group(1) if head_match else ''
head = head.replace('<title>Romero Luna | Apartamentos en Málaga Centro</title>', '<title>Legal | Romero Luna</title>')

# Extract nav
nav_match = re.search(r'(<nav class="navbar".*?</div>\n  </nav>\n\n  <!-- Mobile drawer -->.*?</div>)', content, re.DOTALL)
nav = nav_match.group(1) if nav_match else ''

# Extract footer
footer_match = re.search(r'(<!-- ======== FOOTER NUEVO ======== -->\n  <footer class="footer-new".*?</footer>)', content, re.DOTALL)
footer = footer_match.group(1) if footer_match else ''

# Scripts
scripts = '<script src="js/main.js"></script>'

# Read texts
with open('legal/Romero Luna - Aviso Legal.txt', 'r', encoding='utf-8') as f:
    aviso_text = f.read()

with open('legal/Romero Luna - Politica de Privacidad.txt', 'r', encoding='utf-8') as f:
    privacidad_text = f.read()

with open('legal/Romero Luna - Politica de Cookies.txt', 'r', encoding='utf-8') as f:
    cookies_text = f.read()

def generate_html(filename, title, text):
    html_text = ''
    for p in text.split('\n\n'):
        if p.strip():
            if re.match(r'^\d\.', p.strip()):
                html_text += f'<h3 style="margin-top:24px; margin-bottom:12px; font-family:var(--font-heading); font-size: 1.5rem;">{p.strip()}</h3>\n'
            else:
                html_text += f'<p style="margin-bottom:16px; line-height:1.6; color:var(--color-ink);">{p.strip()}</p>\n'
                
    content_html = f'''
<body>
  {nav}
  <section class="section" style="padding-top: 140px; padding-bottom: 80px; min-height: 80vh;">
    <div class="container" style="max-width: 800px; margin: 0 auto; background: var(--color-surface); padding: 40px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid var(--color-border);">
      <h1 style="font-family: var(--font-heading); margin-bottom: 32px; font-size: 2.2rem; text-align: center;">{title}</h1>
      <div class="legal-content">
{html_text}
      </div>
    </div>
  </section>
  {footer}
  {scripts}
</body>
</html>
'''
    with open(filename, 'w', encoding='utf-8') as out:
        out.write(head + '\n' + content_html)

generate_html('aviso-legal.html', 'Aviso Legal y Condiciones de Uso', aviso_text)
generate_html('politica-privacidad.html', 'Política de Privacidad', privacidad_text)
generate_html('politica-cookies.html', 'Política de Cookies', cookies_text)
print("Generated 3 HTML files")
