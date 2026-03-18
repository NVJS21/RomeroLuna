with open('index.html', 'r', encoding='utf-8') as f:
    index_content = f.read()

with open('combined_content.html', 'r', encoding='utf-8') as f:
    combined_content = f.read()

# Marker to insert before
# <!-- ======== FOOTER NUEVO ======== -->
marker = '<!-- ======== FOOTER NUEVO ======== -->'

if marker not in index_content:
    print("Footer marker not found in index.html")
    exit(1)

parts = index_content.split(marker)

# We want to insert BEFORE the marker.
# index_content is now parts[0] + marker + parts[1]
# We insert between parts[0] and the marker.
# Specifically, find the end of the Hero section or just before footer.
# Hero ends at </section>
# There might be spacing.
# index_content previously showed:
# 122:   </section>
# 123:   
# 126:   <!-- ======== FOOTER NUEVO ======== -->

new_content = parts[0] + "\n\n" + combined_content + "\n\n" + marker + parts[1]

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Content inserted successfully in index.html")
f = open('index.html', 'r', encoding='utf-8')
print(f"New file size: {len(f.read())} characters")
f.close()
