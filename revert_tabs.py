with open("App.tsx", "r", encoding="utf-8") as f:
    lines = f.read().splitlines()

new_lines = []
for i, line in enumerate(lines):
    if '{activeTab === ' in line:
        continue
    # We need to remove the matching `)}` that I added at the end of each block.
    # Lines that just have `        )}` around these specific areas.
    if line.strip() == ")}":
        # Check if it's the `)}` that was closing the `activeTab` block.
        # It's at 560 (before history), 594 (before stats), 711 (at the very end before </main>).
        # We can check context:
        if i > 0 and '</div>' in lines[i-1] and i < len(lines)-1:
            if 'activeTab ==="history"' in lines[i+1].replace(" ", "") or 'activeTab==="history"' in lines[i+1].replace(" ", ""):
                continue
            if 'activeTab ==="stats"' in lines[i+1].replace(" ", "") or 'activeTab==="stats"' in lines[i+1].replace(" ", ""):
                continue
        if i > 0 and '</div>' in lines[i-1] and '</main>' in lines[i+1]:
            continue
    
    new_lines.append(line)

with open("App.tsx", "w", encoding="utf-8") as f:
    f.write("\n".join(new_lines))
