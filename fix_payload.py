with open("App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    "createdAt: session.createdAt",
    "createdAt: session.createdAt,\n          obsId: obs.id"
)

with open("App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
