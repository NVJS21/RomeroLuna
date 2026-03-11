import os
import glob

base = r"C:\Users\Navahas\Desktop\Bythelab\Romero Luna"
files = glob.glob(os.path.join(base, "pages", "*.html")) + [os.path.join(base, "index.html")]

POMPA_HTML = '''
  <!-- Fixed background pompas -->
  <div aria-hidden="true" style="
    position:fixed;inset:0;z-index:-1;pointer-events:none;overflow:hidden;
  ">
    <div style="position:absolute;width:340px;height:340px;border-radius:50%;
      background:radial-gradient(circle, rgba(39,174,96,0.22) 0%, transparent 70%);
      top:-60px;left:-80px;filter:blur(14px);"></div>
    <div style="position:absolute;width:260px;height:260px;border-radius:50%;
      background:radial-gradient(circle, rgba(21,101,192,0.18) 0%, transparent 70%);
      top:-40px;left:30%;filter:blur(12px);"></div>
    <div style="position:absolute;width:300px;height:300px;border-radius:50%;
      background:radial-gradient(circle, rgba(249,196,0,0.17) 0%, transparent 70%);
      top:-50px;right:10%;filter:blur(13px);"></div>
    <div style="position:absolute;width:240px;height:240px;border-radius:50%;
      background:radial-gradient(circle, rgba(229,57,53,0.16) 0%, transparent 70%);
      top:80px;right:-60px;filter:blur(12px);"></div>
    <div style="position:absolute;width:280px;height:280px;border-radius:50%;
      background:radial-gradient(circle, rgba(39,174,96,0.14) 0%, transparent 70%);
      bottom:5%;left:-60px;filter:blur(16px);"></div>
    <div style="position:absolute;width:220px;height:220px;border-radius:50%;
      background:radial-gradient(circle, rgba(249,196,0,0.14) 0%, transparent 70%);
      bottom:10%;left:40%;filter:blur(14px);"></div>
    <div style="position:absolute;width:260px;height:260px;border-radius:50%;
      background:radial-gradient(circle, rgba(21,101,192,0.13) 0%, transparent 70%);
      bottom:5%;right:-40px;filter:blur(15px);"></div>
  </div>
'''

for path in files:
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    original = content

    # Remove old pompa div if already inserted
    import re
    content = re.sub(r'\s*<!-- Fixed background pompas -->.*?</div>\s*</div>', '', content, flags=re.DOTALL)

    # Insert after <body>
    content = content.replace("<body>\n", "<body>\n" + POMPA_HTML, 1)

    if content != original:
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        print("Added pompas to:", os.path.basename(path))
    else:
        print("No changes:", os.path.basename(path))
