```txt
npm install
npm run dev
```

```txt
npm run deploy
```



````
https://developers.cloudflare.com/cache/concepts/default-cache-behavior/
https://developers.cloudflare.com/cache/concepts/default-cache-behavior/#default-cached-file-extensions

# How To Use:

curl -I "https://staging.joaosilvagomes.com/custom-cache.jpeg?cacheControl=<CACHE_DIRECTIVE>"


# Eg.:

curl -I "https://staging.joaosilvagomes.com/custom-cache.jpeg?cacheControl=public,max-age=1800"

curl -I "https://staging.joaosilvagomes.com/custom-cache.jpeg?cacheControl=private,max-age=600"

curl -I "https://staging.joaosilvagomes.com/custom-cache.jpeg?cacheControl=no-cache"

````