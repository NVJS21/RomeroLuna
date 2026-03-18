import os
import glob
from bs4 import BeautifulSoup, NavigableString
from deep_translator import GoogleTranslator

# Folders
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
EN_DIR = os.path.join(BASE_DIR, 'en')

def get_html_files():
    files = glob.glob(os.path.join(BASE_DIR, '*.html'))
    files.extend(glob.glob(os.path.join(BASE_DIR, 'pages', '*.html')))
    return files

def ensure_dir(file_path):
    directory = os.path.dirname(file_path)
    if not os.path.exists(directory):
        os.makedirs(directory)

def translate_text(text):
    if not text.strip():
        return text
    try:
        translator = GoogleTranslator(source='es', target='en')
        return translator.translate(text)
    except Exception as e:
        print(f"Error translating '{text}': {e}")
        return text

def fix_asset_paths(soup, is_in_pages):
    # Adjust paths for hrefs and srcs to point one level up if we are inside en/ pages vs en/
    # If the file is 'index.html', its in EN_DIR, so css/ is '../css/' relative to EN_DIR
    # Actually, if we mirror the structure, en/index.html is one level deeper than root.
    # en/pages/servicios.html is two levels deeper than root.

    prefix = '../' if not is_in_pages else '../../'

    for tag in soup.find_all(['link', 'script', 'img', 'a']):
        if tag.name == 'link' and tag.has_attr('href'):
            if not tag['href'].startswith('http') and not tag['href'].startswith('#'):
                # Some might already have ../ if they were in pages/
                clean_href = tag['href'].replace('../', '')
                tag['href'] = prefix + clean_href
        elif tag.name == 'script' and tag.has_attr('src'):
            if not tag['src'].startswith('http'):
                clean_src = tag['src'].replace('../', '')
                tag['src'] = prefix + clean_src
        elif tag.name == 'img' and tag.has_attr('src'):
            if not tag['src'].startswith('http'):
                clean_src = tag['src'].replace('../', '')
                tag['src'] = prefix + clean_src
        elif tag.name == 'a' and tag.has_attr('href'):
            if not tag['href'].startswith('http') and not tag['href'].startswith('mailto') and not tag['href'].startswith('tel') and not tag['href'].startswith('#'):
                clean_href = tag['href'].replace('../', '')
                # If it's a link to another page in the site, we keep it in the EN folder
                # 'index.html' -> 'index.html', 'pages/servicios.html' -> 'pages/servicios.html'
                # Notice we want links to stay within the 'en/' structure.
                # If we are in en/index.html and link points to 'pages/servicios.html', that works as is.
                # If link is 'index.html', it works as is.
                # If we are in en/pages/servicios.html and link points to '../index.html', that works as is.
                # So for <a> tags within our own site, the relative structure within en/ should mirror root perfectly.
                pass 

def process_file(file_path):
    print(f"Processing {file_path}")
    is_in_pages = 'pages' in os.path.normpath(file_path).split(os.sep)
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    soup = BeautifulSoup(content, 'html.parser')

    # Fix asset paths first
    fix_asset_paths(soup, is_in_pages)

    # Translate texts
    # Define tags we DO NOT want to translate
    ignore_tags = ['script', 'style', 'code', 'pre']
    
    for tag in soup.find_all(string=True):
        if tag.parent.name in ignore_tags:
            continue
        
        # Don't translate comments
        if isinstance(tag, NavigableString) and not isinstance(tag, str):
            # NavigableString vs Comment vs CData vs ...
            from bs4 import Comment
            if isinstance(tag, Comment):
                continue

        text = tag.string.strip()
        if text:
            # Avoid translating single characters unless they are alphanumeric, avoid just numbers
            if len(text) > 1 and any(c.isalpha() for c in text):
                # Basic protection for font-awesome solid icons names if they ended up being content? Mostly they are classes.
                translated = translate_text(text)
                tag.replace_with(translated)

    # Translate alt attributes and meta descriptions
    for img in soup.find_all('img', alt=True):
        if img['alt'].strip():
            img['alt'] = translate_text(img['alt'])
    
    for meta in soup.find_all('meta', attrs={'name': 'description'}):
        if meta.has_attr('content') and meta['content'].strip():
            meta['content'] = translate_text(meta['content'])
            
    # Translate title
    if soup.title and soup.title.string:
         soup.title.string = translate_text(soup.title.string.strip())

    # Write output
    rel_path = os.path.relpath(file_path, BASE_DIR)
    out_path = os.path.join(EN_DIR, rel_path)
    ensure_dir(out_path)
    
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(str(soup))
    print(f"Saved to {out_path}")

def main():
    if not os.path.exists(EN_DIR):
        os.makedirs(EN_DIR)
    
    files = get_html_files()
    for f in files:
        process_file(f)

if __name__ == '__main__':
    main()
