import os, zipfile
import xml.etree.ElementTree as ET

ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}

for f in os.listdir('.'):
    if f.endswith('.docx'):
        try:
            docx = zipfile.ZipFile(f)
            xml_content = docx.read('word/document.xml')
            tree = ET.fromstring(xml_content)
            # Find all text nodes
            paragraphs = []
            for p in tree.findall('.//w:p', ns):
                texts = [t.text for t in p.findall('.//w:t', ns) if t.text]
                if texts:
                    paragraphs.append(''.join(texts))
            
            text = '\n\n'.join(paragraphs)
            out_name = f.replace('.docx', '.txt')
            with open(out_name, 'w', encoding='utf-8') as out:
                out.write(text)
            print(f"Extracted {f} to {out_name}")
        except Exception as e:
            print(f"Error extracting {f}: {e}")
