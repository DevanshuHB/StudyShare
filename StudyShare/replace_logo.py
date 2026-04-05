import os
import re

html_files = [f for f in os.listdir('.') if f.endswith('.html')]

pattern_navbar = re.compile(
    r'<div class="d-flex align-items-center justify-content-center bg-gradient-primary text-white[^>]*" style=".*?">\s*S\s*</div>',
    re.DOTALL
)

replace_navbar = r'<img src="images/logo.png" alt="StudyShare Logo" style="width: 40px; height: 40px;" class="rounded-3 shadow-sm object-fit-cover">'

# Specific pattern for the smaller sidebar logo
pattern_sidebar = re.compile(
    r'<div class="d-flex align-items-center justify-content-center bg-gradient-primary text-white rounded shadow-sm" style="width: 32px; height: 32px; font-weight: bold;">S</div>',
    re.DOTALL
)
replace_sidebar = r'<img src="images/logo.png" alt="StudyShare Logo" style="width: 32px; height: 32px;" class="rounded shadow-sm object-fit-cover">'

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = pattern_sidebar.sub(replace_sidebar, content)
    new_content = pattern_navbar.sub(replace_navbar, new_content)

    if new_content != content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {file}")
