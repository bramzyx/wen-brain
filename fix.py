import os

# 1. Overwrite netlify.toml with the new VIP lane
toml_content = """[build]
  command = "npm install && chmod +x node_modules/.bin/vite && ./node_modules/.bin/vite build"
  publish = "dist"

[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
"""
with open("netlify.toml", "w", encoding="utf-8") as f:
    f.write(toml_content)
print("✅ Updated netlify.toml")

# 2. Update the frontend fetch URL in useXAuth.js
hook_path = "src/hooks/useXAuth.js"
if os.path.exists(hook_path):
    with open(hook_path, "r", encoding="utf-8") as f:
        content = f.read()
    content = content.replace("'/.netlify/functions/auth'", "'/api/auth'")
    with open(hook_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("✅ Updated useXAuth.js")
else:
    print("❌ Could not find useXAuth.js")

# 3. Add the console.log tracker to the backend auth.js
func_path = "netlify/functions/auth.js"
if os.path.exists(func_path):
    with open(func_path, "r", encoding="utf-8") as f:
        content = f.read()
    if "=== BACKEND TRIGGERED ===" not in content:
        content = content.replace(
            "export const handler = async (event, context) => {",
            "export const handler = async (event, context) => {\n  console.log('=== BACKEND TRIGGERED ===', event.httpMethod)"
        )
        with open(func_path, "w", encoding="utf-8") as f:
            f.write(content)
        print("✅ Updated auth.js")
else:
    print("❌ Could not find auth.js")