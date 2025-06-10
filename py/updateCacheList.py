import os

# Run this file from the ./src directory
# e.g. "python ../py/updateCacheList.py"
# This will update ./src/sw.js

rootPaths = [".", "../lib", "../resources"]

allFiles = []
for rootPath in rootPaths:
    for root, dirs, files in os.walk(rootPath):
        for file in files:
            allFiles.append(os.path.join(root,file))

cacheSrc = """
self.addEventListener("install", async event => {
    const cache = await caches.open("pwa-assets");
    // Store all resources on first SW install
    cache.addAll([
        "../",
        "../manifest.json",
        "../favicon.ico",
        "../favicon.png",
        "../main.css"
    ]);
"""+"\n".join('    cache.add("'+f+'");' for f in allFiles)+"""
});

self.addEventListener("fetch", event => {
   event.respondWith(
     fetch(event.request)
     .catch(error => {
       return caches.match(event.request);
     })
   );
});

"""

print(cacheSrc)

with open("sw.js", "w") as f:
  f.write(cacheSrc)
