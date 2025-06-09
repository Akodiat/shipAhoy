import os

print(os.path.dirname(os.path.realpath(__file__)))

rootPaths = ["lib", "src", "resources"]

allFiles = []
for rootPath in rootPaths:
    for root, dirs, files in os.walk(rootPath):
        for file in files:
            allFiles.append(os.path.join(root,file))

cacheSrc = """
self.addEventListener("install", async event => {
    const cache = await caches.open("pwa-assets");
    // it stores all resources on first SW install
    cache.addAll([
        "/",
        "app.js",
        "style.css",
"""+",\n".join('        "'+f+'"' for f in allFiles)+"""
    ]);
});

self.addEventListener("fetch", event => {
   event.respondWith(
     fetch(event.request)
     .catch(error => {
       return caches.match(event.request) ;
     })
   );
});

"""

print(cacheSrc)

with open("src/sw.js", "w") as f:
  f.write(cacheSrc)
